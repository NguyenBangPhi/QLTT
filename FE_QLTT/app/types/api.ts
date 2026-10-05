/**
 * Tên field giữ nguyên PascalCase tiếng Việt đúng như Backend trả về, không đổi sang
 * camelCase. Lý do: thêm một tầng ánh xạ là thêm một chỗ có thể sai, và khi bảo vệ đồ án
 * cần đối chiếu trực tiếp với tên cột trong database.
 *
 * Các cột BOOLEAN của MySQL về tới đây là số 0 hoặc 1, không phải true/false.
 * Các cột DATE về dạng chuỗi 'YYYY-MM-DD' (Backend bật dateStrings).
 */

export type TenVaiTro = 'Admin' | 'Thủ thư' | 'Sinh viên'

export interface CurrentUser {
  MaNguoiDung: number
  TenDangNhap: string
  HoTen: string
  Email: string | null
  TrangThai: number
  NgayTao: string
  TenVaiTro: TenVaiTro
  MaSV: string | null
  Lop: string | null
  Khoa: string | null
  NgayCapThe: string | null
  NgayHetHanThe: string | null
  TrangThaiThe: number | null
}

export interface Book {
  MaSach: number
  ISBN: string
  TenSach: string
  MaTacGia: number
  MaTheLoai: number
  NhaXuatBan: string | null
  NamXuatBan: number | null
  SoLuongTong: number
  SoLuongTon: number
  NgayTao: string
  NgayCapNhat: string
  TenTacGia: string
  TenTheLoai: string
}

export interface Author {
  MaTacGia: number
  TenTacGia: string
}

export interface Genre {
  MaTheLoai: number
  TenTheLoai: string
}

export interface Student {
  MaSV: string
  MaNguoiDung: number
  TenDangNhap: string
  HoTen: string
  Email: string | null
  TrangThai: number
  Lop: string | null
  Khoa: string | null
  NgayCapThe: string
  NgayHetHanThe: string
  TrangThaiThe: number
  SoSachDangMuon: number
}

export interface User {
  MaNguoiDung: number
  TenDangNhap: string
  HoTen: string
  Email: string | null
  TrangThai: number
  NgayTao: string
  TenVaiTro: string
}

/** Một dòng của ChiTietPhieuMuon đã JOIN đủ thông tin — từ GET /api/borrow */
export interface BorrowDetail {
  MaCTPM: number
  MaPhieuMuon: number
  MaSach: number
  NgayHenTra: string
  NgayTraThucTe: string | null
  TienPhat: number
  TrangThai: number
  MaSV: string
  NgayMuon: string
  GhiChu: string | null
  MaThuThu: number
  ISBN: string
  TenSach: string
  TenSinhVien: string
  TenThuThu: string
  SoNgayQuaHan: number
}

/** Từ sp_GetBorrowHistory — lưu ý stored procedure này KHÔNG trả về MaCTPM */
export interface BorrowHistoryItem {
  MaPhieuMuon: number
  NgayMuon: string
  TenSach: string
  NgayHenTra: string
  NgayTraThucTe: string | null
  TienPhat: number
  TrangThai: number
}

/** Từ view vw_SachDangMuon và vw_SachQuaHan */
export interface BorrowingRow {
  MaCTPM: number
  MaPhieuMuon: number
  MaSV: string
  TenSinhVien: string
  MaSach: number
  ISBN: string
  TenSach: string
  NgayMuon: string
  NgayHenTra: string
  SoNgayQuaHan: number
}

export interface Config {
  TenCauHinh: string
  GiaTri: string
  MoTa: string | null
}

export interface SystemLog {
  MaLog: number
  TenBang: string
  /** 0: UPDATE, 1: DELETE */
  HanhDong: number
  MaBanGhi: number
  NguoiThucHien: string | null
  ThoiGian: string
  GiaTriCu: Record<string, unknown> | null
  GiaTriMoi: Record<string, unknown> | null
}

export interface Notification {
  MaThongBao: number
  MaSV: string
  MaCTPM: number | null
  NoiDung: string
  NgayTao: string
  DaDoc: number
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface LoginResponse {
  access_token: string
}

export interface MessageResponse {
  message: string
}
