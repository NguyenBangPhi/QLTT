USE QuanLyThuVien;

-- ========================================================
-- 1. DỌN DẸP (CLEANUP)
-- Chạy trước để tránh lỗi nếu thực thi file nhiều lần
-- ========================================================
DROP USER IF EXISTS 'admin01'@'%';
DROP USER IF EXISTS 'thuthu01'@'%';
DROP USER IF EXISTS 'sv001'@'%';

DROP ROLE IF EXISTS 'role_admin', 'role_thuthu', 'role_sinhvien';

-- ========================================================
-- 2. TẠO CÁC ROLE (VAI TRÒ)
-- ========================================================
CREATE ROLE 'role_admin', 'role_thuthu', 'role_sinhvien';

-- ========================================================
-- 3. PHÂN QUYỀN CHO ROLE ADMIN
-- Có toàn quyền trên database QuanLyThuVien
-- ========================================================
GRANT ALL PRIVILEGES ON QuanLyThuVien.* TO 'role_admin';

-- ========================================================
-- 4. PHÂN QUYỀN CHO ROLE THỦ THƯ
-- ========================================================
-- Quyền thao tác trên Bảng (Tables) & View
GRANT SELECT, INSERT, UPDATE, DELETE ON QuanLyThuVien.Sach TO 'role_thuthu';
GRANT SELECT, INSERT, UPDATE, DELETE ON QuanLyThuVien.TacGia TO 'role_thuthu';
GRANT SELECT, INSERT, UPDATE, DELETE ON QuanLyThuVien.TheLoai TO 'role_thuthu';
GRANT SELECT, INSERT, UPDATE, DELETE ON QuanLyThuVien.SinhVien TO 'role_thuthu';
GRANT SELECT, INSERT, UPDATE ON QuanLyThuVien.PhieuMuon TO 'role_thuthu';
GRANT SELECT, INSERT, UPDATE ON QuanLyThuVien.ChiTietPhieuMuon TO 'role_thuthu';
GRANT SELECT, INSERT, UPDATE ON QuanLyThuVien.ThongBao TO 'role_thuthu';
GRANT SELECT ON QuanLyThuVien.NguoiDung TO 'role_thuthu';
GRANT SELECT ON QuanLyThuVien.CauHinh TO 'role_thuthu';
GRANT SELECT ON QuanLyThuVien.vw_SachDangMuon TO 'role_thuthu';
GRANT SELECT ON QuanLyThuVien.vw_SachQuaHan TO 'role_thuthu';

-- Quyền thực thi các Stored Procedures
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_AddBook TO 'role_thuthu';
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_SearchBooks TO 'role_thuthu';
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_BorrowBook TO 'role_thuthu';
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_ReturnBook TO 'role_thuthu';
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_LockOverdueAccounts TO 'role_thuthu';
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_SendReminder TO 'role_thuthu';

-- ========================================================
-- 5. PHÂN QUYỀN CHO ROLE SINH VIÊN
-- ========================================================
-- Quyền thao tác trên Bảng (Tables) - Chỉ được phép đọc
GRANT SELECT ON QuanLyThuVien.Sach TO 'role_sinhvien';
GRANT SELECT ON QuanLyThuVien.TacGia TO 'role_sinhvien';
GRANT SELECT ON QuanLyThuVien.TheLoai TO 'role_sinhvien';

-- Quyền thực thi các Stored Procedures
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_SearchBooks TO 'role_sinhvien';
GRANT EXECUTE ON PROCEDURE QuanLyThuVien.sp_GetBorrowHistory TO 'role_sinhvien';

-- ========================================================
-- 6. TẠO DATABASE USERS MẪU
-- Mật khẩu ở đây để "123456" cho dễ test cục bộ
--
-- Host dùng '%' vì Docker cấp IP động cho từng container, không cố định
-- được host để kết nối từ api và adminer. Bù lại, docker-compose.yml chỉ
-- publish cổng MySQL ở 127.0.0.1 nên máy ngoài mạng không chạm tới được.
-- ========================================================
CREATE USER 'admin01'@'%' IDENTIFIED BY '123456';
CREATE USER 'thuthu01'@'%' IDENTIFIED BY '123456';
CREATE USER 'sv001'@'%' IDENTIFIED BY '123456';

-- ========================================================
-- 7. GÁN ROLE CHO TỪNG USER
-- ========================================================
GRANT 'role_admin' TO 'admin01'@'%';
GRANT 'role_thuthu' TO 'thuthu01'@'%';
GRANT 'role_sinhvien' TO 'sv001'@'%';

-- ========================================================
-- 8. KÍCH HOẠT ROLE MẶC ĐỊNH
-- (Bắt buộc trong MySQL 8.0+ để Role có hiệu lực khi Login)
-- ========================================================
SET DEFAULT ROLE 'role_admin' TO 'admin01'@'%';
SET DEFAULT ROLE 'role_thuthu' TO 'thuthu01'@'%';
SET DEFAULT ROLE 'role_sinhvien' TO 'sv001'@'%';

-- ========================================================
-- 9. LÀM MỚI QUYỀN TRÊN DBMS
-- ========================================================
FLUSH PRIVILEGES;