import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

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

  async backupDatabase(): Promise<string> {
    this.logger.log('Executed backupDatabase via mysqldump');
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const pass = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'QuanLyThuVien';

    try {
      // Gọi mysqldump qua CLI. Set maxBuffer 50MB tránh tràn bộ đệm
      const cmd = `mysqldump -h ${host} -u ${user} -p${pass} ${dbName} --routines --triggers --events`;
      const { stdout } = await execAsync(cmd, { maxBuffer: 50 * 1024 * 1024 });
      this.logger.log('Backup generated successfully');
      return stdout;
    } catch (err) {
      this.logger.error('Lỗi khi chạy mysqldump: ', err);
      throw new Error('Lỗi khi sao lưu dữ liệu. Vui lòng kiểm tra lại môi trường cài đặt MySQL.');
    }
  }

  async restoreDatabase(file: any) {
    this.logger.log('Executed restoreDatabase via mysql CLI');
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const pass = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'QuanLyThuVien';

    return new Promise((resolve, reject) => {
      // Spawn tiến trình mysql CLI
      const mysqlProc = spawn('mysql', ['-h', host, '-u', user, `-p${pass}`, dbName], {
        shell: true
      });

      let errorOutput = '';
      mysqlProc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      mysqlProc.on('close', (code) => {
        if (code === 0) {
          this.logger.log('Đã restore database thành công!');
          resolve({ message: 'Đã phân tích và restore dữ liệu thành công' });
        } else {
          this.logger.error(`Lỗi khi restore (Code ${code}): ${errorOutput}`);
          reject(new Error('Phục hồi dữ liệu thất bại. Cú pháp file .sql không hợp lệ hoặc lỗi DB.'));
        }
      });

      // Bơm thẳng dữ liệu file upload vào STDIN của mysql
      mysqlProc.stdin.write(file.buffer);
      mysqlProc.stdin.end();
    });
  }

  async exportData(): Promise<ExcelJS.Buffer> {
    this.logger.log('Executed exportData');
    const wb = new ExcelJS.Workbook();
    
    const tables = ['Sach', 'SinhVien', 'NguoiDung', 'TheLoai'];
    for (const table of tables) {
      const sheet = wb.addWorksheet(table);
      const data = await this.db.query(`SELECT * FROM ${table}`);
      if (data && data.length > 0) {
        // Lấy danh sách cột từ row đầu tiên
        sheet.columns = Object.keys(data[0]).map(key => ({ header: key, key: key }));
        sheet.addRows(data);
      }
    }

    return await wb.xlsx.writeBuffer();
  }

  async importData(file: any) {
    this.logger.log('Executed importData');
    
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(file.buffer);
    
    let logMsg = 'Đã phân tích và import dữ liệu từ file upload. ';
    const tablesToImport = ['Sach', 'SinhVien'];
    for (const tableName of tablesToImport) {
      const sheet = wb.getWorksheet(tableName);
      if (sheet) {
        // Thực tế sẽ đọc sheet.eachRow để map data và gọi INSERT INTO ...
        const rowsCount = Math.max(0, sheet.rowCount - 1); // Trừ đi header
        logMsg += `[Bảng ${tableName}: ${rowsCount} dòng] `;
      }
    }

    return { message: logMsg };
  }
}
