import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface ConfigRule {
  pattern: RegExp;
  message: string;
}

const SO_NGUYEN: ConfigRule = {
  pattern: /^\d+$/,
  message: 'phải là số nguyên không âm',
};

const GIO: ConfigRule = {
  pattern: /^([01]\d|2[0-3]):[0-5]\d$/,
  message: 'phải có định dạng HH:mm',
};

const EMAIL: ConfigRule = {
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'phải là địa chỉ email hợp lệ',
};

const CONFIG_RULES: Record<string, ConfigRule> = {
  SO_SACH_TOI_DA: SO_NGUYEN,
  TIEN_PHAT_MOT_NGAY: SO_NGUYEN,
  NGUONG_KHOA_THE: SO_NGUYEN,
  SO_NGAY_NHAC_TRUOC: SO_NGUYEN,
  SO_NGAY_MUON_TOI_DA: SO_NGUYEN,
  PHI_LAM_THE_MOI: SO_NGUYEN,
  GIO_MO_CUA: GIO,
  GIO_DONG_CUA: GIO,
  EMAIL_LIEN_HE: EMAIL,
};

const CONFIG_RULES_DEFAULT = SO_NGUYEN;

@Injectable()
export class StatsService {
  constructor(private readonly db: DatabaseService) {}

  async getBorrowing() {
    return this.db.query('SELECT * FROM vw_SachDangMuon');
  }

  async getOverdue() {
    return this.db.query('SELECT * FROM vw_SachQuaHan');
  }

  async getConfigs() {
    return this.db.query('SELECT * FROM CauHinh');
  }

  async updateConfig(key: string, value: string) {
    const trimmed = value.trim();
    const rule = CONFIG_RULES[key] ?? CONFIG_RULES_DEFAULT;
    if (!rule.pattern.test(trimmed)) {
      throw new BadRequestException(`${key}: ${rule.message}`);
    }

    const result = await this.db.query(
      'UPDATE CauHinh SET GiaTri = ? WHERE TenCauHinh = ?',
      [trimmed, key]
    );
    if ((result as any).affectedRows === 0) throw new NotFoundException('Cấu hình không tồn tại');
    return { message: 'Cập nhật cấu hình thành công' };
  }
}
