import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import * as ExcelJS from 'exceljs';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface SheetResult {
  sheet: string;
  imported: number;
  skipped: number;
  errors: string[];
}

function sheetReader(sheet: ExcelJS.Worksheet) {
  const columnOf = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, col) => columnOf.set(String(cell.value ?? '').trim(), col));

  return {
    has: (name: string) => columnOf.has(name),
    valueAt(row: ExcelJS.Row, name: string) {
      const col = columnOf.get(name);
      const value = col ? row.getCell(col).value : null;
      return value === null || value === undefined || value === '' ? null : value;
    },
  };
}

function importRowMessage(err: any): string {
  if (err?.sqlState === '45000') return err.sqlMessage;
  if (err?.code === 'ER_DUP_ENTRY') return 'ISBN đã tồn tại trong hệ thống.';
  if (err?.code === 'ER_NO_REFERENCED_ROW_2' || err?.code === 'ER_NO_REFERENCED_ROW') {
    return 'Mã tác giả hoặc mã thể loại không tồn tại.';
  }
  return err?.sqlMessage ?? err?.message ?? 'Lỗi không xác định.';
}

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(private readonly db: DatabaseService) {}

  async getLogs(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const countRows = await this.db.query<any[]>('SELECT COUNT(*) AS total FROM Log_HeThong');
    const data = await this.db.query(
      'SELECT * FROM Log_HeThong ORDER BY ThoiGian DESC, MaLog DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return { data, total: Number(countRows[0].total), page, limit };
  }

  async getNotifications(maSV: string) {
    return this.db.query(
      'SELECT * FROM ThongBao WHERE MaSV = ? ORDER BY NgayTao DESC',
      [maSV]
    );
  }

  async markNotificationRead(id: number, maSV: string) {
    await this.db.query(
      'UPDATE ThongBao SET DaDoc = 1 WHERE MaThongBao = ? AND MaSV = ?',
      [id, maSV]
    );
    return { message: 'Đã đánh dấu đọc thông báo' };
  }

  async lockOverdueAccounts() {
    await this.db.callProcedure('sp_LockOverdueAccounts');
    this.logger.log('Executed sp_LockOverdueAccounts');
    return { message: 'Đã khóa tài khoản quá hạn thành công' };
  }

  async sendReminders() {
    await this.db.callProcedure('sp_SendReminder');
    this.logger.log('Executed sp_SendReminder');
    return { message: 'Đã gửi thông báo nhắc nhở thành công' };
  }

  @Cron(process.env.LOCK_OVERDUE_CRON || CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronLockOverdue() {
    this.logger.log('Cronjob: Running lock overdue accounts...');
    try {
      await this.lockOverdueAccounts();
    } catch (err) {
      this.logger.error('Error in lock overdue cronjob', err);
    }
  }

  @Cron(process.env.SEND_REMINDER_CRON || '0 30 7 * * *') // Default 07:30 AM
  async handleCronSendReminders() {
    this.logger.log('Cronjob: Running send reminders...');
    try {
      await this.sendReminders();
    } catch (err) {
      this.logger.error('Error in send reminders cronjob', err);
    }
  }

  private dbConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'QuanLyThuVien',
    };
  }

  private cliSslArgs: string[] | null = null;

  private async clientSslArgs(): Promise<string[]> {
    if (this.cliSslArgs) return this.cliSslArgs;
    try {
      const { stdout } = await execFileAsync('mysqldump', ['--version']);
      this.cliSslArgs = /mariadb/i.test(stdout) ? ['--ssl-verify-server-cert=0'] : [];
    } catch {
      this.cliSslArgs = [];
    }
    return this.cliSslArgs;
  }

  async backupDatabase(): Promise<string> {
    const { host, user, password, database } = this.dbConfig();
    const args = [
      '-h', host,
      '-u', user,
      ...(await this.clientSslArgs()),
      database,
      '--routines',
      '--triggers',
      '--events',
    ];

    try {
      const { stdout } = await execFileAsync('mysqldump', args, {
        env: { ...process.env, MYSQL_PWD: password },
        maxBuffer: 50 * 1024 * 1024,
      });
      this.logger.log(`Backup created (${stdout.length} bytes)`);
      return stdout;
    } catch (err: any) {
      this.logger.error(`mysqldump thất bại: ${err?.stderr || err?.message}`);
      throw new InternalServerErrorException(
        err?.code === 'ENOENT'
          ? 'Máy chủ không có sẵn mysqldump nên không sao lưu được.'
          : 'Sao lưu dữ liệu thất bại. Xem log máy chủ để biết chi tiết.',
      );
    }
  }

  async restoreDatabase(file: Express.Multer.File) {
    const { host, user, password, database } = this.dbConfig();
    const args = ['-h', host, '-u', user, ...(await this.clientSslArgs()), database];

    return new Promise<{ message: string }>((resolve, reject) => {
      const proc = spawn('mysql', args, { env: { ...process.env, MYSQL_PWD: password } });

      let stderr = '';
      proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));

      proc.on('error', (err) => {
        this.logger.error(`Không chạy được mysql CLI: ${err.message}`);
        reject(
          new InternalServerErrorException('Máy chủ không có sẵn mysql nên không phục hồi được.'),
        );
      });

      proc.on('close', (code) => {
        if (code === 0) {
          this.logger.log('Restore thành công');
          resolve({ message: 'Phục hồi dữ liệu thành công' });
        } else {
          this.logger.error(`Restore lỗi (exit ${code}): ${stderr}`);
          reject(
            new BadRequestException(
              'Phục hồi thất bại: file .sql không hợp lệ hoặc gây lỗi khi thực thi.',
            ),
          );
        }
      });

      proc.stdin.on('error', () => undefined);
      proc.stdin.end(file.buffer);
    });
  }

  private addSheet(wb: ExcelJS.Workbook, name: string, rows: any[]) {
    const sheet = wb.addWorksheet(name);
    if (!rows.length) return;
    sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
    sheet.addRows(rows);
  }

  async exportData(): Promise<ExcelJS.Buffer> {
    const wb = new ExcelJS.Workbook();

    this.addSheet(wb, 'TheLoai', await this.db.query<any[]>('SELECT * FROM TheLoai'));
    this.addSheet(
      wb,
      'Sach',
      await this.db.query<any[]>(
        `SELECT s.*, t.TenTacGia, tl.TenTheLoai
         FROM Sach s
         JOIN TacGia t ON t.MaTacGia = s.MaTacGia
         JOIN TheLoai tl ON tl.MaTheLoai = s.MaTheLoai`,
      ),
    );

    return wb.xlsx.writeBuffer();
  }

  private async genreIdByName(name: string): Promise<number | null> {
    const rows = await this.db.query<any[]>(
      'SELECT MaTheLoai FROM TheLoai WHERE TenTheLoai = ? LIMIT 1',
      [name],
    );
    return rows.length ? Number(rows[0].MaTheLoai) : null;
  }

  private async authorIdByName(name: string): Promise<number | null> {
    const rows = await this.db.query<any[]>(
      'SELECT MaTacGia FROM TacGia WHERE TenTacGia = ? LIMIT 1',
      [name],
    );
    return rows.length ? Number(rows[0].MaTacGia) : null;
  }

  private async importGenreSheet(sheet: ExcelJS.Worksheet): Promise<SheetResult> {
    const reader = sheetReader(sheet);
    if (!reader.has('TenTheLoai')) {
      throw new BadRequestException('Sheet "TheLoai" thiếu cột: TenTheLoai');
    }

    const result: SheetResult = { sheet: 'TheLoai', imported: 0, skipped: 0, errors: [] };

    for (let r = 2; r <= sheet.rowCount; r++) {
      const raw = reader.valueAt(sheet.getRow(r), 'TenTheLoai');
      if (!raw) continue;
      const name = String(raw).trim();

      try {
        if ((await this.genreIdByName(name)) !== null) {
          result.skipped++;
          result.errors.push(`Dòng ${r}: thể loại "${name}" đã có, bỏ qua.`);
          continue;
        }
        await this.db.query('INSERT INTO TheLoai (TenTheLoai) VALUES (?)', [name]);
        result.imported++;
      } catch (err: any) {
        result.skipped++;
        result.errors.push(`Dòng ${r} ("${name}"): ${importRowMessage(err)}`);
      }
    }

    result.errors = result.errors.slice(0, 20);
    return result;
  }

  private async importBookSheet(sheet: ExcelJS.Worksheet): Promise<SheetResult> {
    const reader = sheetReader(sheet);

    const missing = ['ISBN', 'TenSach', 'SoLuongTong'].filter((name) => !reader.has(name));
    if (!reader.has('TenTacGia') && !reader.has('MaTacGia')) missing.push('TenTacGia hoặc MaTacGia');
    if (!reader.has('TenTheLoai') && !reader.has('MaTheLoai'))
      missing.push('TenTheLoai hoặc MaTheLoai');
    if (missing.length) {
      throw new BadRequestException(`Sheet "Sach" thiếu cột: ${missing.join(', ')}`);
    }

    const result: SheetResult = { sheet: 'Sach', imported: 0, skipped: 0, errors: [] };

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const valueOf = (name: string) => reader.valueAt(row, name);

      const isbn = valueOf('ISBN');
      if (!isbn) continue;

      try {
        const tenTheLoai = valueOf('TenTheLoai');
        let maTheLoai: number;
        if (tenTheLoai) {
          const name = String(tenTheLoai).trim();
          const found = await this.genreIdByName(name);
          if (found !== null) {
            maTheLoai = found;
          } else {
            const inserted = await this.db.query(
              'INSERT INTO TheLoai (TenTheLoai) VALUES (?)',
              [name],
            );
            maTheLoai = Number((inserted as any).insertId);
          }
        } else {
          maTheLoai = Number(valueOf('MaTheLoai'));
        }

        const tenTacGia = valueOf('TenTacGia');
        let maTacGia: number;
        if (tenTacGia) {
          const name = String(tenTacGia).trim();
          const found = await this.authorIdByName(name);
          if (found === null) {
            result.skipped++;
            result.errors.push(
              `Dòng ${r} (ISBN ${isbn}): tác giả "${name}" chưa có trong hệ thống.`,
            );
            continue;
          }
          maTacGia = found;
        } else {
          maTacGia = Number(valueOf('MaTacGia'));
        }

        const soLuong = Number(valueOf('SoLuongTong') ?? 0);
        if (
          !Number.isInteger(maTacGia) ||
          !Number.isInteger(maTheLoai) ||
          !Number.isInteger(soLuong) ||
          soLuong < 0
        ) {
          result.skipped++;
          result.errors.push(
            `Dòng ${r} (ISBN ${isbn}): mã tác giả, mã thể loại và số lượng phải là số nguyên không âm.`,
          );
          continue;
        }

        await this.db.callProcedure('sp_AddBook', [
          String(isbn),
          String(valueOf('TenSach') ?? ''),
          maTacGia,
          maTheLoai,
          valueOf('NhaXuatBan') === null ? null : String(valueOf('NhaXuatBan')),
          valueOf('NamXuatBan') === null ? null : Number(valueOf('NamXuatBan')),
          soLuong,
        ]);
        result.imported++;
      } catch (err: any) {
        result.skipped++;
        result.errors.push(`Dòng ${r} (ISBN ${isbn}): ${importRowMessage(err)}`);
      }
    }

    result.errors = result.errors.slice(0, 20);
    return result;
  }

  async importData(file: Express.Multer.File) {
    const wb = new ExcelJS.Workbook();
    const data = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength,
    ) as ArrayBuffer;

    try {
      await wb.xlsx.load(data);
    } catch {
      throw new BadRequestException('Không đọc được file Excel. Kiểm tra lại định dạng .xlsx.');
    }

    const genreSheet = wb.getWorksheet('TheLoai');
    const bookSheet = wb.getWorksheet('Sach');
    if (!genreSheet && !bookSheet) {
      throw new BadRequestException(
        'File không có sheet "TheLoai" hay "Sach". Hãy dùng file tải về từ chức năng Xuất dữ liệu.',
      );
    }

    const sheets: SheetResult[] = [];
    if (genreSheet) sheets.push(await this.importGenreSheet(genreSheet));
    if (bookSheet) sheets.push(await this.importBookSheet(bookSheet));

    const imported = sheets.reduce((sum, s) => sum + s.imported, 0);
    const skipped = sheets.reduce((sum, s) => sum + s.skipped, 0);
    this.logger.log(`Import: thêm ${imported} bản ghi, bỏ qua ${skipped} dòng`);

    return {
      message: `Đã nhập ${imported} bản ghi${skipped ? `, bỏ qua ${skipped} dòng` : ''}.`,
      sheets,
    };
  }
}
