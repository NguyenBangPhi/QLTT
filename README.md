# Website Quản Lý Thư Viện

Đồ án môn Quản lý thông tin. Toàn bộ nghiệp vụ (tính tiền phạt, kiểm tra hạn mức, đồng bộ tồn kho, ghi nhật ký) nằm trong Stored Procedure, Trigger và Function của MySQL — Backend chỉ gọi và bọc lỗi, Frontend chỉ hiển thị.

```
DoAn/
├── BE_QLTT/          NestJS + MySQL (repo riêng)
├── FE_QLTT/          Nuxt 4 SPA (repo riêng)
└── docker-compose.yml
```

## Chạy dự án

Chỉ cần Docker, không phải cài Node hay MySQL lên máy.

```bash
cp .env.example .env     # sửa mật khẩu và JWT_SECRET nếu muốn
docker compose up -d
```

Lần đầu chạy sẽ mất vài phút để tải image và cài dependency.

| Dịch vụ | Địa chỉ | Ghi chú |
|---|---|---|
| Giao diện | http://localhost:3001 | Nuxt, có hot-reload |
| API | http://localhost:3000 | NestJS, có hot-reload |
| Swagger | http://localhost:3000/api/docs | |
| Adminer | http://localhost:8080 | server `mysql`, user `root` |
| MySQL | localhost:3307 | |

## Tài khoản thử nghiệm

Mật khẩu chung: `123456`

| Tài khoản | Vai trò | Vào khu vực |
|---|---|---|
| `admin01` | Admin | Admin Dashboard, đầy đủ quyền |
| `thuthu01` | Thủ thư | Admin Dashboard, trừ tài khoản/tham số/nhật ký |
| `sv001` … `sv008` | Sinh viên | Client Site |

Dữ liệu mẫu được dựng sẵn để demo: `SV001` đang giữ một cuốn **quá hạn 35 ngày**, `SV006` có **thẻ bị khoá**, `SV002` có sách sắp đến hạn.

## Nạp lại dữ liệu mẫu

Ba file SQL chỉ chạy **một lần duy nhất** lúc volume còn rỗng. Muốn dựng lại từ đầu:

```bash
docker compose down -v
docker compose up -d
```

## Vài điểm cần biết

- **Thứ tự nạp SQL.** Entrypoint của MySQL chạy file init theo thứ tự alphabet, nên compose đổi tên lúc mount thành `01-schema` → `02-crud` → `03-data`. Không đổi tên file gốc trong `BE_QLTT/docs/`.
- **Tiếng Việt.** `DA-CRUD.sql` và `DA-DATA.sql` thiếu `SET NAMES utf8mb4;`, nếu nạp bằng client mặc định latin1 thì dữ liệu bị mã hoá hai lần. Image MySQL ở `docker/mysql/` được build riêng chỉ để ép charset — xem chú thích trong Dockerfile ở đó.
- **Múi giờ.** MySQL chạy `+07:00`. Không có tham số này thì `CURDATE()` lệch sang UTC và tiền phạt tính sai ngày.
- **Không dùng CORS.** Nuxt proxy `/api` sang container `api`, trình duyệt chỉ làm việc với một origin.

Đặc tả Backend đầy đủ: `BE_QLTT/docs/BACKEND-SPEC-NestJS.md`.
Kiến trúc Frontend: `FE_QLTT/README.md`.
