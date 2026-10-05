USE QuanLyThuVien;

-- ========================================================
-- 1. Bảng CauHinh (10 dòng)
-- ========================================================
INSERT INTO CauHinh (TenCauHinh, GiaTri, MoTa) VALUES
('SO_SACH_TOI_DA', '3', 'Số lượng sách tối đa một sinh viên được mượn cùng lúc'),
('TIEN_PHAT_MOT_NGAY', '5000', 'Số tiền phạt cho mỗi ngày trễ hạn (VNĐ)'),
('NGUONG_KHOA_THE', '30', 'Số ngày quá hạn tối đa trước khi tự động khóa thẻ'),
('SO_NGAY_NHAC_TRUOC', '2', 'Số ngày trước hạn trả để tự động gửi thông báo'),
('SO_NGAY_MUON_TOI_DA', '14', 'Thời gian mượn tối đa cho một cuốn sách (ngày)'),
('PHI_LAM_THE_MOI', '50000', 'Phí cấp lại thẻ thư viện'),
('GIO_MO_CUA', '07:30', 'Giờ bắt đầu làm việc'),
('GIO_DONG_CUA', '17:30', 'Giờ kết thúc làm việc'),
('EMAIL_LIEN_HE', 'thuvien@daihoc.edu.vn', 'Email hỗ trợ thư viện'),
('PHI_DAT_COC_TAI_LIEU', '100000', 'Tiền đặt cọc mượn tài liệu đặc biệt');

-- ========================================================
-- 2. Bảng VaiTro (Chỉ giữ lại Admin, Thủ thư, Sinh viên)
-- ========================================================
INSERT INTO VaiTro (MaVaiTro, TenVaiTro) VALUES
(1, 'Admin'),
(2, 'Thủ thư'),
(3, 'Sinh viên');

-- ========================================================
-- 3. Bảng NguoiDung (14 người dùng, giữ nguyên MatKhau)
-- ========================================================
INSERT INTO NguoiDung (MaNguoiDung, TenDangNhap, MatKhau, HoTen, Email, MaVaiTro, TrangThai) VALUES
(1,  'admin01',  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Nguyễn Văn Quản Trị', 'admin01@daihoc.edu.vn', 1, 1),
(2,  'thuthu01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Lê Ngọc Thu',        'thuthu01@daihoc.edu.vn', 2, 1),
(3,  'thuthu02', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Trần Thư Quán',     'thuthu02@daihoc.edu.vn', 2, 1),
(4,  'sv001',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Đinh Hữu Phước',     'sv001@daihoc.edu.vn',    3, 1),
(5,  'sv002',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Lý Tấn Đạt',          'sv002@daihoc.edu.vn',    3, 1),
(6,  'sv003',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Bùi Thị Lan',         'sv003@daihoc.edu.vn',    3, 1),
(7,  'sv004',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Nguyễn Hữu Trí',      'sv004@daihoc.edu.vn',    3, 1),
(8,  'sv005',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Trần Văn Thái',      'sv005@daihoc.edu.vn',    3, 1),
(9,  'sv006',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Lê Thị Ái',          'sv006@daihoc.edu.vn',    3, 0),
(10, 'sv007',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Phạm Quốc Bảo',      'sv007@daihoc.edu.vn',    3, 1),
(11, 'sv008',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Hoàng Minh Đức',     'sv008@daihoc.edu.vn',    3, 1),
(12, 'sv009',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Vũ Quỳnh Nga',        'sv009@daihoc.edu.vn',    3, 1),
(13, 'sv010',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Phan Thanh Hải',     'sv010@daihoc.edu.vn',    3, 1),
(14, 'sv011',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Đỗ Mai Phương',       'sv011@daihoc.edu.vn',    3, 1);

-- ========================================================
-- 4. Bảng SinhVien (11 dòng)
-- ========================================================
INSERT INTO SinhVien (MaSV, MaNguoiDung, Lop, Khoa, NgayCapThe, NgayHetHanThe, TrangThaiThe) VALUES
('SV001', 4,  'CNTT1', 'CNTT',     '2024-09-01', '2028-09-01', 1),
('SV002', 5,  'CNTT2', 'CNTT',     '2024-09-01', '2028-09-01', 1),
('SV003', 6,  'KTDN1', 'Kinh Tế',  '2024-09-01', '2028-09-01', 1),
('SV004', 7,  'KTDN2', 'Kinh Tế',  '2024-09-01', '2028-09-01', 1),
('SV005', 8,  'NNA1',  'Ngoại Ngữ','2024-09-01', '2028-09-01', 1),
('SV006', 9,  'NNA2',  'Ngoại Ngữ','2024-09-01', '2028-09-01', 0),
('SV007', 10, 'DTVT1', 'Điện Tử',  '2024-09-01', '2028-09-01', 1),
('SV008', 11, 'DTVT2', 'Điện Tử',  '2024-09-01', '2028-09-01', 1),
('SV009', 12, 'CNTT3', 'CNTT',     '2024-09-01', '2028-09-01', 1),
('SV010', 13, 'QTKD1', 'Kinh Tế',  '2024-09-01', '2028-09-01', 1),
('SV011', 14, 'NNA3',  'Ngoại Ngữ','2024-09-01', '2028-09-01', 1);

-- ========================================================
-- 5. Bảng TacGia (11 dòng)
-- ========================================================
INSERT INTO TacGia (MaTacGia, TenTacGia) VALUES
(1,  'Nam Cao'),
(2,  'Nguyễn Nhật Ánh'),
(3,  'J.K. Rowling'),
(4,  'Phạm Hữu Khang'),
(5,  'Nguyễn Văn Tiến'),
(6,  'George R.R. Martin'),
(7,  'Haruki Murakami'),
(8,  'Keigo Higashino'),
(9,  'Dan Brown'),
(10, 'Dale Carnegie'),
(11, 'Robert C. Martin');

-- ========================================================
-- 6. Bảng TheLoai (10 dòng)
-- ========================================================
INSERT INTO TheLoai (MaTheLoai, TenTheLoai) VALUES
(1,  'Văn học'),
(2,  'Tiểu thuyết'),
(3,  'Công nghệ thông tin'),
(4,  'Kinh tế'),
(5,  'Khoa học viễn tưởng'),
(6,  'Trinh thám'),
(7,  'Lịch sử'),
(8,  'Tâm lý học'),
(9,  'Kỹ năng sống'),
(10, 'Khoa học cơ bản');

-- ========================================================
-- 7. Bảng Sach (11 dòng)
-- ========================================================
INSERT INTO Sach (MaSach, ISBN, TenSach, MaTacGia, MaTheLoai, NhaXuatBan, NamXuatBan, SoLuongTong, SoLuongTon) VALUES
(1,  '978-1',  'Chí Phèo',                  1,  1, 'NXB Văn Học',    2010, 10, 10),
(2,  '978-2',  'Mắt Biếc',                   2,  2, 'NXB Trẻ',        2015, 20, 20),
(3,  '978-3',  'Harry Potter',              3,  2, 'NXB Trẻ',        2000, 30, 30),
(4,  '978-4',  'Lập trình C++',             4,  3, 'NXB Giáo Dục',   2020, 15, 15),
(5,  '978-5',  'Kinh Tế Vĩ Mô',             5,  4, 'NXB Kinh Tế',    2019, 10, 10),
(6,  '978-6',  'Trò Chơi Vương Quyền',       6,  2, 'NXB Tổng Hợp',   2016, 8,  8),
(7,  '978-7',  'Rừng Na Uy',                7,  2, 'NXB Hội Nhà Văn',2018, 12, 12),
(8,  '978-8',  'Phía Sau Nghi Can X',       8,  6, 'NXB Nhã Nam',    2019, 15, 15),
(9,  '978-9',  'Mật Mã Da Vinci',           9,  6, 'NXB Thời Đại',   2008, 10, 10),
(10, '978-10', 'Đắc Nhân Tâm',              10, 9, 'NXB Trẻ',        2021, 25, 25),
(11, '978-11', 'Clean Code',                11, 3, 'NXB Thông Tin',  2022, 18, 18);

-- ========================================================
-- 8. Bảng PhieuMuon (10 dòng)
-- ========================================================
INSERT INTO PhieuMuon (MaPhieuMuon, MaSV, MaThuThu, NgayMuon, GhiChu) VALUES
(1,  'SV001', 2, DATE_SUB(CURDATE(), INTERVAL 40 DAY), 'Mượn tài liệu học tập'),
(2,  'SV002', 2, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'Mượn đọc kỳ thi'),
(3,  'SV003', 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY),  NULL),
(4,  'SV004', 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY),  NULL),
(5,  'SV005', 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Nghiên cứu chuyên đề'),
(6,  'SV007', 2, CURDATE(),                            NULL),
(7,  'SV008', 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY),  NULL),
(8,  'SV009', 3, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Mượn giáo trình lập trình'),
(9,  'SV010', 3, DATE_SUB(CURDATE(), INTERVAL 8 DAY),  NULL),
(10, 'SV011', 3, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  'Mượn sách kỹ năng');

-- ========================================================
-- 9. Bảng ChiTietPhieuMuon (12 dòng)
-- ========================================================
INSERT INTO ChiTietPhieuMuon (MaCTPM, MaPhieuMuon, MaSach, NgayHenTra, NgayTraThucTe, TienPhat, TrangThai) VALUES
(1,  1,  1,  DATE_SUB(CURDATE(), INTERVAL 35 DAY), NULL,                                 175000, 1),
(2,  2,  2,  DATE_ADD(CURDATE(), INTERVAL 1 DAY),  NULL,                                 0,      1),
(3,  2,  3,  DATE_ADD(CURDATE(), INTERVAL 1 DAY),  DATE_SUB(CURDATE(), INTERVAL 1 DAY),  0,      0),
(4,  3,  4,  DATE_ADD(CURDATE(), INTERVAL 9 DAY),  NULL,                                 0,      1),
(5,  3,  5,  DATE_ADD(CURDATE(), INTERVAL 9 DAY),  DATE_SUB(CURDATE(), INTERVAL 1 DAY),  0,      0),
(6,  4,  6,  DATE_ADD(CURDATE(), INTERVAL 12 DAY), NULL,                                 0,      1),
(7,  5,  7,  DATE_ADD(CURDATE(), INTERVAL 4 DAY),  NULL,                                 0,      1),
(8,  6,  8,  DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL,                                 0,      1),
(9,  7,  9,  DATE_ADD(CURDATE(), INTERVAL 13 DAY), NULL,                                 0,      1),
(10, 8,  11, DATE_SUB(CURDATE(), INTERVAL 6 DAY),  NULL,                                 30000,  1),
(11, 9,  10, DATE_ADD(CURDATE(), INTERVAL 6 DAY),  DATE_SUB(CURDATE(), INTERVAL 2 DAY),  0,      0),
(12, 10, 10, DATE_ADD(CURDATE(), INTERVAL 11 DAY), NULL,                                 0,      1);

-- ========================================================
-- 10. Bảng ThongBao (10 dòng)
-- ========================================================
INSERT INTO ThongBao (MaThongBao, MaSV, MaCTPM, NoiDung, DaDoc) VALUES
(1,  'SV001', 1,    'CẢNH BÁO: Sách "Chí Phèo" đã quá hạn 35 ngày. Thẻ của bạn sẽ bị khóa tự động.', 0),
(2,  'SV003', 5,    'Cảm ơn bạn đã hoàn trả cuốn "Kinh Tế Vĩ Mô" đúng thời hạn.', 1),
(3,  'SV002', 2,    'Sách "Mắt Biếc" của bạn sẽ đến hạn trả vào ngày mai. Vui lòng sắp xếp thời gian trả sách.', 0),
(4,  'SV008', NULL, 'Chào mừng bạn đến với Thư viện Đại học. Vui lòng đổi mật khẩu để bảo mật tài khoản.', 1),
(5,  'SV009', 10,   'CẢNH BÁO: Sách "Clean Code" đã quá hạn 6 ngày. Phí phạt hiện tại là 30.000 VNĐ.', 0),
(6,  'SV010', 11,   'Bạn đã hoàn trả cuốn sách "Đắc Nhân Tâm" thành công.', 1),
(7,  'SV004', 6,    'Nhắc nhở: Cuốn "Trò Chơi Vương Quyền" có hạn trả còn 12 ngày.', 1),
(8,  'SV005', 7,    'Sách "Rừng Na Uy" của bạn sắp đến hạn trả.', 0),
(9,  'SV007', 8,    'Mượn sách thành công: "Phía Sau Nghi Can X". Hạn trả là 14 ngày tới.', 1),
(10, 'SV011', 12,   'Mượn sách thành công: "Đắc Nhân Tâm". Vui lòng giữ gìn tài liệu cẩn thận.', 0);

-- ========================================================
-- 11. Bảng Log_HeThong (10 dòng)
-- ========================================================
INSERT INTO Log_HeThong (MaLog, TenBang, HanhDong, MaBanGhi, NguoiThucHien, GiaTriCu, GiaTriMoi) VALUES
(1,  'Sach',      0, 2,  'admin01',  '{"ISBN": "978-2", "TenSach": "Mắt Biếc Cũ"}', '{"ISBN": "978-2", "TenSach": "Mắt Biếc"}'),
(2,  'Sach',      1, 99, 'thuthu01', '{"ISBN": "978-99", "TenSach": "Sách Hỏng Cần Hủy"}', NULL),
(3,  'CauHinh',   0, 0,  'admin01',  '{"TenCauHinh": "SO_SACH_TOI_DA", "GiaTri": "2"}', '{"TenCauHinh": "SO_SACH_TOI_DA", "GiaTri": "3"}'),
(4,  'SinhVien',  0, 6,  'admin01',  '{"MaSV": "SV006", "TrangThaiThe": 1}', '{"MaSV": "SV006", "TrangThaiThe": 0}'),
(5,  'Sach',      0, 10, 'thuthu02', '{"TenSach": "Dac Nhan Tam"}', '{"TenSach": "Đắc Nhân Tâm"}'),
(6,  'TacGia',    0, 10, 'thuthu01', '{"TenTacGia": "D. Carnegie"}', '{"TenTacGia": "Dale Carnegie"}'),
(7,  'TheLoai',   0, 9,  'admin01',  '{"TenTheLoai": "Ky nang"}', '{"TenTheLoai": "Kỹ năng sống"}'),
(8,  'SinhVien',  0, 1,  'thuthu01', '{"TrangThaiThe": 1}', '{"TrangThaiThe": 0}'),
(9,  'NguoiDung', 0, 9,  'admin01',  '{"TrangThai": 1}', '{"TrangThai": 0}'),
(10, 'Sach',      0, 11, 'thuthu02', '{"SoLuongTong": 15}', '{"SoLuongTong": 18}');

-- ========================================================
-- 12. ĐỒNG BỘ TỒN KHO THỰC TẾ TRONG BẢNG SÁCH
-- ========================================================
SET SQL_SAFE_UPDATES = 0;

UPDATE Sach s 
SET SoLuongTon = SoLuongTong - (
    SELECT COUNT(*) 
    FROM ChiTietPhieuMuon ct 
    WHERE ct.MaSach = s.MaSach AND ct.TrangThai = 1
);

SET SQL_SAFE_UPDATES = 1;