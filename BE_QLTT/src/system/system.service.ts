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

/** Lỗi của từng dòng import phải đọc được, không để nguyên câu tiếng Anh của MySQL */
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

  /**
   * Client MariaDB (gói trong image Alpine) mặc định xác minh chứng chỉ máy chủ, trong khi
   * MySQL 8.4 dùng chứng chỉ tự ký nên kết nối bị từ chối. Client của chính MySQL lại không
   * có cờ này và sẽ báo lỗi tham số, nên phải dò xem đang dùng client nào.
   */
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
    // Mật khẩu đi qua MYSQL_PWD thay vì -p: không lộ trong danh sách tiến trình và không
    // phải lo thoát ký tự đặc biệt. execFile không qua shell nên cũng không có injection.
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

      // Thiếu binary thì spawn không ném lỗi đồng bộ, chỉ phát sự kiện 'error'
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

      // Tiến trình chết sớm làm stdin văng EPIPE, đã báo lỗi ở 'close' rồi
      proc.stdin.on('error', () => undefined);
      proc.stdin.end(file.buffer);
    });
  }

  /** Cột tuyệt đối không được xuất ra file: hash mật khẩu của toàn bộ người dùng */
  private static readonly EXPORT_BLOCKLIST: Record<string, string[]> = {
    NguoiDung: ['MatKhau'],
  };

  async exportData(): Promise<ExcelJS.Buffer> {
    const wb = new ExcelJS.Workbook();

    for (const table of ['Sach', 'SinhVien', 'NguoiDung', 'TheLoai']) {
      const sheet = wb.addWorksheet(table);
      const rows = await this.db.query<any[]>(`SELECT * FROM ${table}`);
      if (!rows.length) continue;

      const blocked = SystemService.EXPORT_BLOCKLIST[table] ?? [];
      sheet.columns = Object.keys(rows[0])
        .filter((key) => !blocked.includes(key))
        .map((key) => ({ header: key, key }));
      sheet.addRows(rows);
    }

    return wb.xlsx.writeBuffer();
  }

  /**
   * Chỉ nhập sheet "Sach", qua sp_AddBook để giữ nguyên nghiệp vụ ở tầng DB (chặn ISBN
   * trùng, đồng bộ tồn kho). Các sheet khác bị bỏ qua: thêm sinh viên còn kéo theo việc
   * tạo tài khoản NguoiDung kèm mật khẩu, không suy ra được từ file Excel.
   */
  async importData(file: Express.Multer.File) {
    const wb = new ExcelJS.Workbook();
    // exceljs nhận ArrayBuffer, Buffer của Node là Uint8Array nên không khớp kiểu
    const data = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength,
    ) as ArrayBuffer;

    try {
      await wb.xlsx.load(data);
    } catch {
      throw new BadRequestException('Không đọc được file Excel. Kiểm tra lại định dạng .xlsx.');
    }

    const sheet = wb.getWorksheet('Sach');
    if (!sheet) {
      throw new BadRequestException(
        'File không có sheet tên "Sach". Hãy dùng file tải về từ chức năng Xuất dữ liệu.',
      );
    }

    const columnOf = new Map<string, number>();
    sheet.getRow(1).eachCell((cell, col) => columnOf.set(String(cell.value ?? '').trim(), col));

    const required = ['ISBN', 'TenSach', 'MaTacGia', 'MaTheLoai', 'SoLuongTong'];
    const missing = required.filter((name) => !columnOf.has(name));
    if (missing.length) {
      throw new BadRequestException(`Sheet "Sach" thiếu cột: ${missing.join(', ')}`);
    }

    const errors: string[] = [];
    let imported = 0;

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const valueOf = (name: string) => {
        const col = columnOf.get(name);
        const value = col ? row.getCell(col).value : null;
        return value === null || value === undefined || value === '' ? null : value;
      };

      const isbn = valueOf('ISBN');
      if (!isbn) continue;

      const maTacGia = Number(valueOf('MaTacGia'));
      const maTheLoai = Number(valueOf('MaTheLoai'));
      const soLuong = Number(valueOf('SoLuongTong') ?? 0);
      if (
        !Number.isInteger(maTacGia) ||
        !Number.isInteger(maTheLoai) ||
        !Number.isInteger(soLuong) ||
        soLuong < 0
      ) {
        errors.push(
          `Dòng ${r} (ISBN ${isbn}): MaTacGia, MaTheLoai, SoLuongTong phải là số nguyên không âm.`,
        );
        continue;
      }

      try {
        await this.db.callProcedure('sp_AddBook', [
          String(isbn),
          String(valueOf('TenSach') ?? ''),
          maTacGia,
          maTheLoai,
          valueOf('NhaXuatBan') === null ? null : String(valueOf('NhaXuatBan')),
          valueOf('NamXuatBan') === null ? null : Number(valueOf('NamXuatBan')),
          soLuong,
        ]);
        imported++;
      } catch (err: any) {
        errors.push(`Dòng ${r} (ISBN ${isbn}): ${importRowMessage(err)}`);
      }
    }

    this.logger.log(`Import: thêm ${imported} sách, ${errors.length} dòng lỗi`);
    return {
      message: `Đã nhập ${imported} sách${errors.length ? `, bỏ qua ${errors.length} dòng lỗi` : ''}.`,
      imported,
      skipped: errors.length,
      errors: errors.slice(0, 20),
    };
  }
}
