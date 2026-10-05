DROP DATABASE IF EXISTS QuanLyThuVien;
CREATE DATABASE QuanLyThuVien
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE QuanLyThuVien;

SET NAMES utf8mb4;

CREATE TABLE CauHinh (
    TenCauHinh VARCHAR(50)  NOT NULL,
    GiaTri     VARCHAR(100) NOT NULL,
    MoTa       VARCHAR(255) NULL,
    PRIMARY KEY (TenCauHinh)
);

CREATE TABLE VaiTro (
    MaVaiTro  INT         NOT NULL AUTO_INCREMENT,
    TenVaiTro VARCHAR(50) NOT NULL,
    PRIMARY KEY (MaVaiTro),
    UNIQUE KEY uq_vaitro_ten (TenVaiTro)
);

CREATE TABLE NguoiDung (
    MaNguoiDung INT          NOT NULL AUTO_INCREMENT,
    TenDangNhap VARCHAR(50)  NOT NULL,
    MatKhau     CHAR(64)     NOT NULL,
    HoTen       VARCHAR(100) NOT NULL,
    Email       VARCHAR(100) NULL,
    MaVaiTro    INT          NOT NULL,
    TrangThai   BOOLEAN      NOT NULL DEFAULT 1 COMMENT '1: Hoáº¡t Ä‘á»™ng, 0: KhÃ³a',
    NgayTao     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (MaNguoiDung),
    UNIQUE KEY uq_nguoidung_tendangnhap (TenDangNhap),
    UNIQUE KEY uq_nguoidung_email (Email),
    CONSTRAINT fk_nguoidung_vaitro FOREIGN KEY (MaVaiTro) REFERENCES VaiTro (MaVaiTro)
);

CREATE TABLE SinhVien (
    MaSV          VARCHAR(10)  NOT NULL,
    MaNguoiDung   INT          NOT NULL,
    Lop           VARCHAR(20)  NULL,
    Khoa          VARCHAR(100) NULL,
    NgayCapThe    DATE         NOT NULL,
    NgayHetHanThe DATE         NOT NULL,
    TrangThaiThe  BOOLEAN      NOT NULL DEFAULT 1 COMMENT '1: ACTIVE, 0: LOCKED',
    PRIMARY KEY (MaSV),
    UNIQUE KEY uq_sinhvien_nguoidung (MaNguoiDung),
    CONSTRAINT fk_sinhvien_nguoidung FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung (MaNguoiDung)
);

CREATE TABLE TacGia (
    MaTacGia  INT          NOT NULL AUTO_INCREMENT,
    TenTacGia VARCHAR(100) NOT NULL,
    PRIMARY KEY (MaTacGia)
);

CREATE TABLE TheLoai (
    MaTheLoai  INT          NOT NULL AUTO_INCREMENT,
    TenTheLoai VARCHAR(100) NOT NULL,
    PRIMARY KEY (MaTheLoai),
    UNIQUE KEY uq_theloai_ten (TenTheLoai)
);

CREATE TABLE Sach (
    MaSach       INT          NOT NULL AUTO_INCREMENT,
    ISBN         VARCHAR(20)  NOT NULL,
    TenSach      VARCHAR(255) NOT NULL,
    MaTacGia     INT          NOT NULL,
    MaTheLoai    INT          NOT NULL,
    NhaXuatBan   VARCHAR(100) NULL,
    NamXuatBan   INT          NULL,
    SoLuongTong  INT          NOT NULL DEFAULT 0,
    SoLuongTon   INT          NOT NULL DEFAULT 0,
    NgayTao      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (MaSach),
    UNIQUE KEY uq_sach_isbn (ISBN),
    CONSTRAINT fk_sach_tacgia  FOREIGN KEY (MaTacGia)  REFERENCES TacGia (MaTacGia),
    CONSTRAINT fk_sach_theloai FOREIGN KEY (MaTheLoai) REFERENCES TheLoai (MaTheLoai)
);

CREATE TABLE PhieuMuon (
    MaPhieuMuon INT          NOT NULL AUTO_INCREMENT,
    MaSV        VARCHAR(10)  NOT NULL,
    MaThuThu    INT          NOT NULL,
    NgayMuon    DATE         NOT NULL,
    GhiChu      VARCHAR(255) NULL,
    PRIMARY KEY (MaPhieuMuon),
    CONSTRAINT fk_phieumuon_sv     FOREIGN KEY (MaSV)     REFERENCES SinhVien (MaSV),
    CONSTRAINT fk_phieumuon_thuthu FOREIGN KEY (MaThuThu) REFERENCES NguoiDung (MaNguoiDung)
);

CREATE TABLE ChiTietPhieuMuon (
    MaCTPM        INT          NOT NULL AUTO_INCREMENT,
    MaPhieuMuon   INT          NOT NULL,
    MaSach        INT          NOT NULL,
    NgayHenTra    DATE         NOT NULL,
    NgayTraThucTe DATE         NULL,
    TienPhat      INT          NOT NULL DEFAULT 0,
    TrangThai     BOOLEAN      NOT NULL DEFAULT 1 COMMENT '1: Äang mÆ°á»£n, 0: ÄÃ£ tráº£',
    PRIMARY KEY (MaCTPM),
    CONSTRAINT fk_ctpm_phieumuon FOREIGN KEY (MaPhieuMuon) REFERENCES PhieuMuon (MaPhieuMuon),
    CONSTRAINT fk_ctpm_sach      FOREIGN KEY (MaSach)      REFERENCES Sach (MaSach)
);

CREATE TABLE Log_HeThong (
    MaLog         BIGINT       NOT NULL AUTO_INCREMENT,
    TenBang       VARCHAR(50)  NOT NULL,
    HanhDong      BOOLEAN      NOT NULL COMMENT '0: UPDATE, 1: DELETE',
    MaBanGhi      INT          NOT NULL,
    NguoiThucHien VARCHAR(100) NULL,
    ThoiGian      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    GiaTriCu      JSON         NULL,
    GiaTriMoi     JSON         NULL,
    PRIMARY KEY (MaLog)
);

CREATE TABLE ThongBao (
    MaThongBao INT          NOT NULL AUTO_INCREMENT,
    MaSV       VARCHAR(10)  NOT NULL,
    MaCTPM     INT          NULL,
    NoiDung    VARCHAR(500) NOT NULL,
    NgayTao    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DaDoc      BOOLEAN      NOT NULL DEFAULT 0 COMMENT '1: ÄÃ£ Ä‘á»c, 0: ChÆ°a Ä‘á»c',
    PRIMARY KEY (MaThongBao),
    CONSTRAINT fk_thongbao_sv   FOREIGN KEY (MaSV)   REFERENCES SinhVien (MaSV),
    CONSTRAINT fk_thongbao_ctpm FOREIGN KEY (MaCTPM) REFERENCES ChiTietPhieuMuon (MaCTPM)
);

CREATE VIEW vw_SachDangMuon AS
SELECT ct.MaCTPM,
       pm.MaPhieuMuon,
       sv.MaSV,
       nd.HoTen        AS TenSinhVien,
       s.MaSach,
       s.ISBN,
       s.TenSach,
       pm.NgayMuon,
       ct.NgayHenTra,
       GREATEST(DATEDIFF(CURDATE(), ct.NgayHenTra), 0) AS SoNgayQuaHan
FROM ChiTietPhieuMuon ct
JOIN PhieuMuon pm ON pm.MaPhieuMuon = ct.MaPhieuMuon
JOIN SinhVien  sv ON sv.MaSV        = pm.MaSV
JOIN NguoiDung nd ON nd.MaNguoiDung = sv.MaNguoiDung
JOIN Sach      s  ON s.MaSach       = ct.MaSach
WHERE ct.TrangThai = 1;

CREATE VIEW vw_SachQuaHan AS
SELECT *
FROM vw_SachDangMuon
WHERE SoNgayQuaHan > 0;
USE QuanLyThuVien;

-- ========================================================
-- 1. Báº£ng CauHinh (10 dÃ²ng)
-- ========================================================
INSERT INTO CauHinh (TenCauHinh, GiaTri, MoTa) VALUES
('SO_SACH_TOI_DA', '3', 'Sá»‘ lÆ°á»£ng sÃ¡ch tá»‘i Ä‘a má»™t sinh viÃªn Ä‘Æ°á»£c mÆ°á»£n cÃ¹ng lÃºc'),
('TIEN_PHAT_MOT_NGAY', '5000', 'Sá»‘ tiá»n pháº¡t cho má»—i ngÃ y trá»… háº¡n (VNÄ)'),
('NGUONG_KHOA_THE', '30', 'Sá»‘ ngÃ y quÃ¡ háº¡n tá»‘i Ä‘a trÆ°á»›c khi tá»± Ä‘á»™ng khÃ³a tháº»'),
('SO_NGAY_NHAC_TRUOC', '2', 'Sá»‘ ngÃ y trÆ°á»›c háº¡n tráº£ Ä‘á»ƒ tá»± Ä‘á»™ng gá»­i thÃ´ng bÃ¡o'),
('SO_NGAY_MUON_TOI_DA', '14', 'Thá»i gian mÆ°á»£n tá»‘i Ä‘a cho má»™t cuá»‘n sÃ¡ch (ngÃ y)'),
('PHI_LAM_THE_MOI', '50000', 'PhÃ­ cáº¥p láº¡i tháº» thÆ° viá»‡n'),
('GIO_MO_CUA', '07:30', 'Giá» báº¯t Ä‘áº§u lÃ m viá»‡c'),
('GIO_DONG_CUA', '17:30', 'Giá» káº¿t thÃºc lÃ m viá»‡c'),
('EMAIL_LIEN_HE', 'thuvien@daihoc.edu.vn', 'Email há»— trá»£ thÆ° viá»‡n'),
('PHI_DAT_COC_TAI_LIEU', '100000', 'Tiá»n Ä‘áº·t cá»c mÆ°á»£n tÃ i liá»‡u Ä‘áº·c biá»‡t');

-- ========================================================
-- 2. Báº£ng VaiTro (Chá»‰ giá»¯ láº¡i Admin, Thá»§ thÆ°, Sinh viÃªn)
-- ========================================================
INSERT INTO VaiTro (MaVaiTro, TenVaiTro) VALUES
(1, 'Admin'),
(2, 'Thá»§ thÆ°'),
(3, 'Sinh viÃªn');

-- ========================================================
-- 3. Báº£ng NguoiDung (14 ngÆ°á»i dÃ¹ng, giá»¯ nguyÃªn MatKhau)
-- ========================================================
INSERT INTO NguoiDung (MaNguoiDung, TenDangNhap, MatKhau, HoTen, Email, MaVaiTro, TrangThai) VALUES
(1,  'admin01',  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Nguyá»…n VÄƒn Quáº£n Trá»‹', 'admin01@daihoc.edu.vn', 1, 1),
(2,  'thuthu01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'LÃª Ngá»c Thu',        'thuthu01@daihoc.edu.vn', 2, 1),
(3,  'thuthu02', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Tráº§n ThÆ° QuÃ¡n',     'thuthu02@daihoc.edu.vn', 2, 1),
(4,  'sv001',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Äinh Há»¯u PhÆ°á»›c',     'sv001@daihoc.edu.vn',    3, 1),
(5,  'sv002',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'LÃ½ Táº¥n Äáº¡t',          'sv002@daihoc.edu.vn',    3, 1),
(6,  'sv003',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BÃ¹i Thá»‹ Lan',         'sv003@daihoc.edu.vn',    3, 1),
(7,  'sv004',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Nguyá»…n Há»¯u TrÃ­',      'sv004@daihoc.edu.vn',    3, 1),
(8,  'sv005',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Tráº§n VÄƒn ThÃ¡i',      'sv005@daihoc.edu.vn',    3, 1),
(9,  'sv006',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'LÃª Thá»‹ Ãi',          'sv006@daihoc.edu.vn',    3, 0),
(10, 'sv007',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Pháº¡m Quá»‘c Báº£o',      'sv007@daihoc.edu.vn',    3, 1),
(11, 'sv008',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'HoÃ ng Minh Äá»©c',     'sv008@daihoc.edu.vn',    3, 1),
(12, 'sv009',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'VÅ© Quá»³nh Nga',        'sv009@daihoc.edu.vn',    3, 1),
(13, 'sv010',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Phan Thanh Háº£i',     'sv010@daihoc.edu.vn',    3, 1),
(14, 'sv011',    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Äá»— Mai PhÆ°Æ¡ng',       'sv011@daihoc.edu.vn',    3, 1);

-- ========================================================
-- 4. Báº£ng SinhVien (11 dÃ²ng)
-- ========================================================
INSERT INTO SinhVien (MaSV, MaNguoiDung, Lop, Khoa, NgayCapThe, NgayHetHanThe, TrangThaiThe) VALUES
('SV001', 4,  'CNTT1', 'CNTT',     '2024-09-01', '2028-09-01', 1),
('SV002', 5,  'CNTT2', 'CNTT',     '2024-09-01', '2028-09-01', 1),
('SV003', 6,  'KTDN1', 'Kinh Táº¿',  '2024-09-01', '2028-09-01', 1),
('SV004', 7,  'KTDN2', 'Kinh Táº¿',  '2024-09-01', '2028-09-01', 1),
('SV005', 8,  'NNA1',  'Ngoáº¡i Ngá»¯','2024-09-01', '2028-09-01', 1),
('SV006', 9,  'NNA2',  'Ngoáº¡i Ngá»¯','2024-09-01', '2028-09-01', 0),
('SV007', 10, 'DTVT1', 'Äiá»‡n Tá»­',  '2024-09-01', '2028-09-01', 1),
('SV008', 11, 'DTVT2', 'Äiá»‡n Tá»­',  '2024-09-01', '2028-09-01', 1),
('SV009', 12, 'CNTT3', 'CNTT',     '2024-09-01', '2028-09-01', 1),
('SV010', 13, 'QTKD1', 'Kinh Táº¿',  '2024-09-01', '2028-09-01', 1),
('SV011', 14, 'NNA3',  'Ngoáº¡i Ngá»¯','2024-09-01', '2028-09-01', 1);

-- ========================================================
-- 5. Báº£ng TacGia (11 dÃ²ng)
-- ========================================================
INSERT INTO TacGia (MaTacGia, TenTacGia) VALUES
(1,  'Nam Cao'),
(2,  'Nguyá»…n Nháº­t Ãnh'),
(3,  'J.K. Rowling'),
(4,  'Pháº¡m Há»¯u Khang'),
(5,  'Nguyá»…n VÄƒn Tiáº¿n'),
(6,  'George R.R. Martin'),
(7,  'Haruki Murakami'),
(8,  'Keigo Higashino'),
(9,  'Dan Brown'),
(10, 'Dale Carnegie'),
(11, 'Robert C. Martin');

-- ========================================================
-- 6. Báº£ng TheLoai (10 dÃ²ng)
-- ========================================================
INSERT INTO TheLoai (MaTheLoai, TenTheLoai) VALUES
(1,  'VÄƒn há»c'),
(2,  'Tiá»ƒu thuyáº¿t'),
(3,  'CÃ´ng nghá»‡ thÃ´ng tin'),
(4,  'Kinh táº¿'),
(5,  'Khoa há»c viá»…n tÆ°á»Ÿng'),
(6,  'Trinh thÃ¡m'),
(7,  'Lá»‹ch sá»­'),
(8,  'TÃ¢m lÃ½ há»c'),
(9,  'Ká»¹ nÄƒng sá»‘ng'),
(10, 'Khoa há»c cÆ¡ báº£n');

-- ========================================================
-- 7. Báº£ng Sach (11 dÃ²ng)
-- ========================================================
INSERT INTO Sach (MaSach, ISBN, TenSach, MaTacGia, MaTheLoai, NhaXuatBan, NamXuatBan, SoLuongTong, SoLuongTon) VALUES
(1,  '978-1',  'ChÃ­ PhÃ¨o',                  1,  1, 'NXB VÄƒn Há»c',    2010, 10, 10),
(2,  '978-2',  'Máº¯t Biáº¿c',                   2,  2, 'NXB Tráº»',        2015, 20, 20),
(3,  '978-3',  'Harry Potter',              3,  2, 'NXB Tráº»',        2000, 30, 30),
(4,  '978-4',  'Láº­p trÃ¬nh C++',             4,  3, 'NXB GiÃ¡o Dá»¥c',   2020, 15, 15),
(5,  '978-5',  'Kinh Táº¿ VÄ© MÃ´',             5,  4, 'NXB Kinh Táº¿',    2019, 10, 10),
(6,  '978-6',  'TrÃ² ChÆ¡i VÆ°Æ¡ng Quyá»n',       6,  2, 'NXB Tá»•ng Há»£p',   2016, 8,  8),
(7,  '978-7',  'Rá»«ng Na Uy',                7,  2, 'NXB Há»™i NhÃ  VÄƒn',2018, 12, 12),
(8,  '978-8',  'PhÃ­a Sau Nghi Can X',       8,  6, 'NXB NhÃ£ Nam',    2019, 15, 15),
(9,  '978-9',  'Máº­t MÃ£ Da Vinci',           9,  6, 'NXB Thá»i Äáº¡i',   2008, 10, 10),
(10, '978-10', 'Äáº¯c NhÃ¢n TÃ¢m',              10, 9, 'NXB Tráº»',        2021, 25, 25),
(11, '978-11', 'Clean Code',                11, 3, 'NXB ThÃ´ng Tin',  2022, 18, 18);

-- ========================================================
-- 8. Báº£ng PhieuMuon (10 dÃ²ng)
-- ========================================================
INSERT INTO PhieuMuon (MaPhieuMuon, MaSV, MaThuThu, NgayMuon, GhiChu) VALUES
(1,  'SV001', 2, DATE_SUB(CURDATE(), INTERVAL 40 DAY), 'MÆ°á»£n tÃ i liá»‡u há»c táº­p'),
(2,  'SV002', 2, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'MÆ°á»£n Ä‘á»c ká»³ thi'),
(3,  'SV003', 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY),  NULL),
(4,  'SV004', 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY),  NULL),
(5,  'SV005', 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'NghiÃªn cá»©u chuyÃªn Ä‘á»'),
(6,  'SV007', 2, CURDATE(),                            NULL),
(7,  'SV008', 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY),  NULL),
(8,  'SV009', 3, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'MÆ°á»£n giÃ¡o trÃ¬nh láº­p trÃ¬nh'),
(9,  'SV010', 3, DATE_SUB(CURDATE(), INTERVAL 8 DAY),  NULL),
(10, 'SV011', 3, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  'MÆ°á»£n sÃ¡ch ká»¹ nÄƒng');

-- ========================================================
-- 9. Báº£ng ChiTietPhieuMuon (12 dÃ²ng)
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
-- 10. Báº£ng ThongBao (10 dÃ²ng)
-- ========================================================
INSERT INTO ThongBao (MaThongBao, MaSV, MaCTPM, NoiDung, DaDoc) VALUES
(1,  'SV001', 1,    'Cáº¢NH BÃO: SÃ¡ch "ChÃ­ PhÃ¨o" Ä‘Ã£ quÃ¡ háº¡n 35 ngÃ y. Tháº» cá»§a báº¡n sáº½ bá»‹ khÃ³a tá»± Ä‘á»™ng.', 0),
(2,  'SV003', 5,    'Cáº£m Æ¡n báº¡n Ä‘Ã£ hoÃ n tráº£ cuá»‘n "Kinh Táº¿ VÄ© MÃ´" Ä‘Ãºng thá»i háº¡n.', 1),
(3,  'SV002', 2,    'SÃ¡ch "Máº¯t Biáº¿c" cá»§a báº¡n sáº½ Ä‘áº¿n háº¡n tráº£ vÃ o ngÃ y mai. Vui lÃ²ng sáº¯p xáº¿p thá»i gian tráº£ sÃ¡ch.', 0),
(4,  'SV008', NULL, 'ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i ThÆ° viá»‡n Äáº¡i há»c. Vui lÃ²ng Ä‘á»•i máº­t kháº©u Ä‘á»ƒ báº£o máº­t tÃ i khoáº£n.', 1),
(5,  'SV009', 10,   'Cáº¢NH BÃO: SÃ¡ch "Clean Code" Ä‘Ã£ quÃ¡ háº¡n 6 ngÃ y. PhÃ­ pháº¡t hiá»‡n táº¡i lÃ  30.000 VNÄ.', 0),
(6,  'SV010', 11,   'Báº¡n Ä‘Ã£ hoÃ n tráº£ cuá»‘n sÃ¡ch "Äáº¯c NhÃ¢n TÃ¢m" thÃ nh cÃ´ng.', 1),
(7,  'SV004', 6,    'Nháº¯c nhá»Ÿ: Cuá»‘n "TrÃ² ChÆ¡i VÆ°Æ¡ng Quyá»n" cÃ³ háº¡n tráº£ cÃ²n 12 ngÃ y.', 1),
(8,  'SV005', 7,    'SÃ¡ch "Rá»«ng Na Uy" cá»§a báº¡n sáº¯p Ä‘áº¿n háº¡n tráº£.', 0),
(9,  'SV007', 8,    'MÆ°á»£n sÃ¡ch thÃ nh cÃ´ng: "PhÃ­a Sau Nghi Can X". Háº¡n tráº£ lÃ  14 ngÃ y tá»›i.', 1),
(10, 'SV011', 12,   'MÆ°á»£n sÃ¡ch thÃ nh cÃ´ng: "Äáº¯c NhÃ¢n TÃ¢m". Vui lÃ²ng giá»¯ gÃ¬n tÃ i liá»‡u cáº©n tháº­n.', 0);

-- ========================================================
-- 11. Báº£ng Log_HeThong (10 dÃ²ng)
-- ========================================================
INSERT INTO Log_HeThong (MaLog, TenBang, HanhDong, MaBanGhi, NguoiThucHien, GiaTriCu, GiaTriMoi) VALUES
(1,  'Sach',      0, 2,  'admin01',  '{"ISBN": "978-2", "TenSach": "Máº¯t Biáº¿c CÅ©"}', '{"ISBN": "978-2", "TenSach": "Máº¯t Biáº¿c"}'),
(2,  'Sach',      1, 99, 'thuthu01', '{"ISBN": "978-99", "TenSach": "SÃ¡ch Há»ng Cáº§n Há»§y"}', NULL),
(3,  'CauHinh',   0, 0,  'admin01',  '{"TenCauHinh": "SO_SACH_TOI_DA", "GiaTri": "2"}', '{"TenCauHinh": "SO_SACH_TOI_DA", "GiaTri": "3"}'),
(4,  'SinhVien',  0, 6,  'admin01',  '{"MaSV": "SV006", "TrangThaiThe": 1}', '{"MaSV": "SV006", "TrangThaiThe": 0}'),
(5,  'Sach',      0, 10, 'thuthu02', '{"TenSach": "Dac Nhan Tam"}', '{"TenSach": "Äáº¯c NhÃ¢n TÃ¢m"}'),
(6,  'TacGia',    0, 10, 'thuthu01', '{"TenTacGia": "D. Carnegie"}', '{"TenTacGia": "Dale Carnegie"}'),
(7,  'TheLoai',   0, 9,  'admin01',  '{"TenTheLoai": "Ky nang"}', '{"TenTheLoai": "Ká»¹ nÄƒng sá»‘ng"}'),
(8,  'SinhVien',  0, 1,  'thuthu01', '{"TrangThaiThe": 1}', '{"TrangThaiThe": 0}'),
(9,  'NguoiDung', 0, 9,  'admin01',  '{"TrangThai": 1}', '{"TrangThai": 0}'),
(10, 'Sach',      0, 11, 'thuthu02', '{"SoLuongTong": 15}', '{"SoLuongTong": 18}');

-- ========================================================
-- 12. Äá»’NG Bá»˜ Tá»’N KHO THá»°C Táº¾ TRONG Báº¢NG SÃCH
-- ========================================================
SET SQL_SAFE_UPDATES = 0;

UPDATE Sach s 
SET SoLuongTon = SoLuongTong - (
    SELECT COUNT(*) 
    FROM ChiTietPhieuMuon ct 
    WHERE ct.MaSach = s.MaSach AND ct.TrangThai = 1
);

SET SQL_SAFE_UPDATES = 1;
USE QuanLyThuVien;

-- Dá»n dáº¹p Functions cÅ©
DROP FUNCTION IF EXISTS fn_CountBorrowedBooks;
DROP FUNCTION IF EXISTS fn_CalculateFine;
DROP FUNCTION IF EXISTS fn_CheckCardStatus;

-- Dá»n dáº¹p Triggers cÅ©
DROP TRIGGER IF EXISTS trg_CheckBookQuantity_Insert;
DROP TRIGGER IF EXISTS trg_AutoSyncStock;
DROP TRIGGER IF EXISTS trg_UpdateStock_AfterBorrow;
DROP TRIGGER IF EXISTS trg_UpdateStock_AfterReturn;
DROP TRIGGER IF EXISTS trg_AuditBook_Update;
DROP TRIGGER IF EXISTS trg_AuditBook_Delete;
DROP TRIGGER IF EXISTS trg_PreventDuplicateReturn;
DROP TRIGGER IF EXISTS trg_PreventDeleteBorrowedBook;

-- Dá»n dáº¹p Stored Procedures cÅ©
DROP PROCEDURE IF EXISTS sp_Login;
DROP PROCEDURE IF EXISTS sp_AddBook;
DROP PROCEDURE IF EXISTS sp_SearchBooks;
DROP PROCEDURE IF EXISTS sp_BorrowBook;
DROP PROCEDURE IF EXISTS sp_ReturnBook;
DROP PROCEDURE IF EXISTS sp_GetBorrowHistory;
DROP PROCEDURE IF EXISTS sp_LockOverdueAccounts;
DROP PROCEDURE IF EXISTS sp_SendReminder;

DELIMITER //

-- ==============================================
-- 1. FUNCTIONS
-- ==============================================

CREATE FUNCTION fn_CountBorrowedBooks(p_MaSV VARCHAR(10)) 
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(ct.MaCTPM) INTO v_count
    FROM ChiTietPhieuMuon ct
    JOIN PhieuMuon pm ON ct.MaPhieuMuon = pm.MaPhieuMuon
    WHERE pm.MaSV = p_MaSV AND ct.TrangThai = 1;
    RETURN v_count;
END //

CREATE FUNCTION fn_CalculateFine(p_MaCTPM INT) 
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_TienPhat INT DEFAULT 0;
    DECLARE v_NgayHenTra DATE;
    DECLARE v_DonGia INT;
    
    SELECT NgayHenTra INTO v_NgayHenTra FROM ChiTietPhieuMuon WHERE MaCTPM = p_MaCTPM;
    SELECT CAST(GiaTri AS UNSIGNED) INTO v_DonGia FROM CauHinh WHERE TenCauHinh = 'TIEN_PHAT_MOT_NGAY';
    
    IF CURDATE() > v_NgayHenTra THEN
        SET v_TienPhat = DATEDIFF(CURDATE(), v_NgayHenTra) * v_DonGia;
    END IF;
    
    RETURN v_TienPhat;
END //

CREATE FUNCTION fn_CheckCardStatus(p_MaSV VARCHAR(10)) 
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_HopLe BOOLEAN DEFAULT 0;
    SELECT CASE 
        WHEN TrangThaiThe = 1 AND NgayHetHanThe >= CURDATE() THEN 1 
        ELSE 0 
    END INTO v_HopLe
    FROM SinhVien WHERE MaSV = p_MaSV;
    RETURN v_HopLe;
END //

-- ==============================================
-- 2. TRIGGERS
-- ==============================================

CREATE TRIGGER trg_CheckBookQuantity_Insert
BEFORE INSERT ON Sach
FOR EACH ROW
BEGIN
    IF NEW.SoLuongTong < 0 OR NEW.SoLuongTon < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sá»‘ lÆ°á»£ng sÃ¡ch khÃ´ng Ä‘Æ°á»£c phÃ©p Ã¢m.';
    END IF;
END //

CREATE TRIGGER trg_AutoSyncStock
BEFORE UPDATE ON Sach
FOR EACH ROW
BEGIN
    IF NEW.SoLuongTong != OLD.SoLuongTong THEN
        SET NEW.SoLuongTon = OLD.SoLuongTon + (NEW.SoLuongTong - OLD.SoLuongTong);
    END IF;
    IF NEW.SoLuongTong < 0 OR NEW.SoLuongTon < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sá»‘ lÆ°á»£ng sÃ¡ch khÃ´ng Ä‘Æ°á»£c phÃ©p Ã¢m.';
    END IF;
END //

CREATE TRIGGER trg_UpdateStock_AfterBorrow
AFTER INSERT ON ChiTietPhieuMuon
FOR EACH ROW
BEGIN
    UPDATE Sach SET SoLuongTon = SoLuongTon - 1 WHERE MaSach = NEW.MaSach;
END //

CREATE TRIGGER trg_UpdateStock_AfterReturn
AFTER UPDATE ON ChiTietPhieuMuon
FOR EACH ROW
BEGIN
    IF OLD.TrangThai = 1 AND NEW.TrangThai = 0 THEN
        UPDATE Sach SET SoLuongTon = SoLuongTon + 1 WHERE MaSach = NEW.MaSach;
    END IF;
END //

CREATE TRIGGER trg_AuditBook_Update
AFTER UPDATE ON Sach
FOR EACH ROW
BEGIN
    IF OLD.ISBN != NEW.ISBN OR OLD.TenSach != NEW.TenSach OR OLD.MaTacGia != NEW.MaTacGia OR OLD.MaTheLoai != NEW.MaTheLoai THEN
        INSERT INTO Log_HeThong (TenBang, HanhDong, MaBanGhi, NguoiThucHien, GiaTriCu, GiaTriMoi)
        VALUES ('Sach', 0, NEW.MaSach, IFNULL(@app_user, USER()), JSON_OBJECT('ISBN', OLD.ISBN, 'TenSach', OLD.TenSach), JSON_OBJECT('ISBN', NEW.ISBN, 'TenSach', NEW.TenSach));
    END IF;
END //

CREATE TRIGGER trg_AuditBook_Delete
AFTER DELETE ON Sach
FOR EACH ROW
BEGIN
    INSERT INTO Log_HeThong (TenBang, HanhDong, MaBanGhi, NguoiThucHien, GiaTriCu, GiaTriMoi)
    VALUES ('Sach', 1, OLD.MaSach, IFNULL(@app_user, USER()), JSON_OBJECT('ISBN', OLD.ISBN, 'TenSach', OLD.TenSach), NULL);
END //

CREATE TRIGGER trg_PreventDuplicateReturn
BEFORE UPDATE ON ChiTietPhieuMuon
FOR EACH ROW
BEGIN
    -- Sá»­ dá»¥ng toÃ¡n tá»­ <=> (NULL-safe equal) Ä‘á»ƒ so sÃ¡nh an toÃ n ká»ƒ cáº£ khi ngÃ y tráº£ thá»±c táº¿ lÃ  NULL
    IF OLD.TrangThai = 0 AND (NEW.TrangThai <> 0 OR OLD.MaSach <> NEW.MaSach OR NOT (OLD.NgayTraThucTe <=> NEW.NgayTraThucTe)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lá»—i: KhÃ´ng Ä‘Æ°á»£c phÃ©p chá»‰nh sá»­a tráº¡ng thÃ¡i, mÃ£ sÃ¡ch hoáº·c ngÃ y tráº£ cá»§a phiáº¿u Ä‘Ã£ hoÃ n táº¥t (chá»‰ Ä‘Æ°á»£c cáº­p nháº­t Tiá»n pháº¡t).';
    END IF;
END //

CREATE TRIGGER trg_PreventDeleteBorrowedBook
BEFORE DELETE ON Sach
FOR EACH ROW
BEGIN
    DECLARE v_DangMuon INT;
    SELECT COUNT(*) INTO v_DangMuon FROM ChiTietPhieuMuon WHERE MaSach = OLD.MaSach AND TrangThai = 1;
    IF v_DangMuon > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'KhÃ´ng thá»ƒ xÃ³a: SÃ¡ch nÃ y hiá»‡n Ä‘ang cÃ³ sinh viÃªn mÆ°á»£n.';
    END IF;
END //

-- ==============================================
-- 3. STORED PROCEDURES
-- ==============================================

CREATE PROCEDURE sp_Login(IN p_Username VARCHAR(50), IN p_Password CHAR(64))
BEGIN
    SELECT n.MaNguoiDung, n.TenDangNhap, n.HoTen, v.TenVaiTro, n.TrangThai, sv.MaSV
    FROM NguoiDung n
    JOIN VaiTro v ON n.MaVaiTro = v.MaVaiTro
    LEFT JOIN SinhVien sv ON n.MaNguoiDung = sv.MaNguoiDung
    WHERE n.TenDangNhap = p_Username AND n.MatKhau = p_Password AND n.TrangThai = 1;
END //

CREATE PROCEDURE sp_AddBook(
    IN p_ISBN VARCHAR(20), IN p_TenSach VARCHAR(255), 
    IN p_MaTacGia INT, IN p_MaTheLoai INT, 
    IN p_NhaXuatBan VARCHAR(100), IN p_NamXuatBan INT, IN p_SoLuong INT
)
BEGIN
    IF EXISTS (SELECT 1 FROM Sach WHERE ISBN = p_ISBN) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ISBN Ä‘Ã£ tá»“n táº¡i trong há»‡ thá»‘ng.';
    ELSE
        INSERT INTO Sach (ISBN, TenSach, MaTacGia, MaTheLoai, NhaXuatBan, NamXuatBan, SoLuongTong, SoLuongTon)
        VALUES (p_ISBN, p_TenSach, p_MaTacGia, p_MaTheLoai, p_NhaXuatBan, p_NamXuatBan, p_SoLuong, p_SoLuong);
    END IF;
END //

CREATE PROCEDURE sp_SearchBooks(IN p_Keyword VARCHAR(255), IN p_MaTacGia INT, IN p_MaTheLoai INT)
BEGIN
    SET @sql = 'SELECT s.*, t.TenTacGia, tl.TenTheLoai FROM Sach s 
                JOIN TacGia t ON s.MaTacGia = t.MaTacGia 
                JOIN TheLoai tl ON s.MaTheLoai = tl.MaTheLoai WHERE 1=1';
                
    IF p_Keyword IS NOT NULL AND p_Keyword != '' THEN
        SET @sql = CONCAT(@sql, ' AND (s.TenSach LIKE ', QUOTE(CONCAT('%', p_Keyword, '%')), 
                          ' OR s.ISBN LIKE ', QUOTE(CONCAT('%', p_Keyword, '%')),
                          ' OR t.TenTacGia LIKE ', QUOTE(CONCAT('%', p_Keyword, '%')), ')');
    END IF;
    IF p_MaTacGia IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND s.MaTacGia = ', p_MaTacGia);
    END IF;
    IF p_MaTheLoai IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND s.MaTheLoai = ', p_MaTheLoai);
    END IF;

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

CREATE PROCEDURE sp_BorrowBook(
    IN p_MaSV VARCHAR(10), IN p_MaThuThu INT, 
    IN p_JsonSach JSON, IN p_NgayHenTra DATE
)
BEGIN
    DECLARE v_MaPhieuMuon INT;
    DECLARE v_VaiTro INT;
    DECLARE v_SachHet INT DEFAULT 0;
    DECLARE v_MaxBooks INT;
    DECLARE v_CurrentBooks INT;
    DECLARE v_NewBooks INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN ROLLBACK; RESIGNAL; END;

    SELECT MaVaiTro INTO v_VaiTro FROM NguoiDung WHERE MaNguoiDung = p_MaThuThu;
    IF v_VaiTro NOT IN (1, 2) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NgÆ°á»i dÃ¹ng khÃ´ng cÃ³ quyá»n táº¡o phiáº¿u mÆ°á»£n.';
    END IF;

    IF fn_CheckCardStatus(p_MaSV) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tháº» sinh viÃªn bá»‹ khÃ³a hoáº·c Ä‘Ã£ háº¿t háº¡n.';
    END IF;

    SELECT CAST(GiaTri AS UNSIGNED) INTO v_MaxBooks FROM CauHinh WHERE TenCauHinh = 'SO_SACH_TOI_DA';
    SET v_CurrentBooks = fn_CountBorrowedBooks(p_MaSV);
    SET v_NewBooks = JSON_LENGTH(p_JsonSach);
    IF (v_CurrentBooks + v_NewBooks) > v_MaxBooks THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sinh viÃªn Ä‘Ã£ mÆ°á»£n vÆ°á»£t quÃ¡ sá»‘ lÆ°á»£ng sÃ¡ch tá»‘i Ä‘a cho phÃ©p.';
    END IF;

    START TRANSACTION;
    
    -- Sá»­a lá»—i ERROR 3569: Chá»‰ Ã¡p dá»¥ng FOR UPDATE lÃªn báº£ng Sach (alias 's'), khÃ´ng khÃ³a báº£ng áº£o JSON_TABLE
    SELECT COUNT(*) INTO v_SachHet FROM Sach s
    JOIN JSON_TABLE(p_JsonSach, '$[*]' COLUMNS(MaSach INT PATH '$')) AS jt ON s.MaSach = jt.MaSach
    WHERE s.SoLuongTon < 1 FOR UPDATE OF s;
    
    IF v_SachHet > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Má»™t hoáº·c nhiá»u sÃ¡ch trong danh sÃ¡ch Ä‘Ã£ háº¿t tá»“n kho.';
    END IF;

    INSERT INTO PhieuMuon (MaSV, MaThuThu, NgayMuon) VALUES (p_MaSV, p_MaThuThu, CURDATE());
    SET v_MaPhieuMuon = LAST_INSERT_ID();

    INSERT INTO ChiTietPhieuMuon (MaPhieuMuon, MaSach, NgayHenTra)
    SELECT v_MaPhieuMuon, jt.MaSach, p_NgayHenTra
    FROM JSON_TABLE(p_JsonSach, '$[*]' COLUMNS(MaSach INT PATH '$')) AS jt;

    COMMIT;
END //

CREATE PROCEDURE sp_ReturnBook(IN p_MaCTPM INT)
BEGIN
    DECLARE v_TienPhat INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN ROLLBACK; RESIGNAL; END;
    
    SET v_TienPhat = fn_CalculateFine(p_MaCTPM);
    
    START TRANSACTION;
    UPDATE ChiTietPhieuMuon 
    SET NgayTraThucTe = CURDATE(), TienPhat = v_TienPhat, TrangThai = 0 
    WHERE MaCTPM = p_MaCTPM AND TrangThai = 1;
    
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Thao tÃ¡c tháº¥t báº¡i: Phiáº¿u khÃ´ng tá»“n táº¡i hoáº·c sÃ¡ch nÃ y Ä‘Ã£ Ä‘Æ°á»£c tráº£.';
    END IF;
    
    COMMIT;
END //

CREATE PROCEDURE sp_GetBorrowHistory(IN p_MaSV VARCHAR(10))
BEGIN
    SELECT pm.MaPhieuMuon, pm.NgayMuon, s.TenSach, ct.NgayHenTra, ct.NgayTraThucTe, ct.TienPhat, ct.TrangThai
    FROM PhieuMuon pm
    JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
    JOIN Sach s ON ct.MaSach = s.MaSach
    WHERE pm.MaSV = p_MaSV
    ORDER BY pm.NgayMuon DESC;
END //

-- ==============================================
-- 4. CURSORS (Bá»c trong Stored Procedures)
-- ==============================================

CREATE PROCEDURE sp_LockOverdueAccounts()
BEGIN
    DECLARE v_MaSV VARCHAR(10);
    DECLARE v_NguongKhoa INT;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE cur_LockOverdueAccounts CURSOR FOR 
        SELECT DISTINCT pm.MaSV 
        FROM ChiTietPhieuMuon ct
        JOIN PhieuMuon pm ON ct.MaPhieuMuon = pm.MaPhieuMuon
        WHERE ct.TrangThai = 1 AND DATEDIFF(CURDATE(), ct.NgayHenTra) > v_NguongKhoa;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    SELECT CAST(GiaTri AS UNSIGNED) INTO v_NguongKhoa FROM CauHinh WHERE TenCauHinh = 'NGUONG_KHOA_THE';
    
    OPEN cur_LockOverdueAccounts;
    read_loop: LOOP
        FETCH cur_LockOverdueAccounts INTO v_MaSV;
        IF done THEN LEAVE read_loop; END IF;
        
        UPDATE SinhVien SET TrangThaiThe = 0 WHERE MaSV = v_MaSV;
    END LOOP;
    CLOSE cur_LockOverdueAccounts;
END //

CREATE PROCEDURE sp_SendReminder()
BEGIN
    DECLARE v_MaSV VARCHAR(10);
    DECLARE v_MaCTPM INT;
    DECLARE v_TenSach VARCHAR(255);
    DECLARE v_NgayHenTra DATE;
    DECLARE v_SoNgayNhac INT;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE cur_SendReminder CURSOR FOR 
        SELECT pm.MaSV, ct.MaCTPM, s.TenSach, ct.NgayHenTra
        FROM ChiTietPhieuMuon ct
        JOIN PhieuMuon pm ON ct.MaPhieuMuon = pm.MaPhieuMuon
        JOIN Sach s ON ct.MaSach = s.MaSach
        LEFT JOIN ThongBao tb ON tb.MaCTPM = ct.MaCTPM
        WHERE ct.TrangThai = 1 
          AND DATEDIFF(ct.NgayHenTra, CURDATE()) <= v_SoNgayNhac
          AND DATEDIFF(ct.NgayHenTra, CURDATE()) >= 0
          AND tb.MaThongBao IS NULL;
          
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    SELECT CAST(GiaTri AS UNSIGNED) INTO v_SoNgayNhac FROM CauHinh WHERE TenCauHinh = 'SO_NGAY_NHAC_TRUOC';

    OPEN cur_SendReminder;
    read_loop: LOOP
        FETCH cur_SendReminder INTO v_MaSV, v_MaCTPM, v_TenSach, v_NgayHenTra;
        IF done THEN LEAVE read_loop; END IF;
        
        INSERT INTO ThongBao (MaSV, MaCTPM, NoiDung)
        VALUES (v_MaSV, v_MaCTPM, CONCAT('SÃ¡ch "', v_TenSach, '" sáº½ Ä‘áº¿n háº¡n tráº£ vÃ o ngÃ y ', DATE_FORMAT(v_NgayHenTra, '%d/%m/%Y')));
    END LOOP;
    CLOSE cur_SendReminder;
END //

DELIMITER ;
