# Frontend — Quản Lý Thư Viện

Nuxt 4 (SPA) · Vue 3.5 · TypeScript · Tailwind v4 · TanStack Query · Reka UI · Pinia

Chạy cùng cả hệ thống bằng `docker compose up -d` ở thư mục cha. Xem `../README.md`.

## Hai khu vực

Đúng theo đặc tả đồ án, giao diện chia làm hai khu vực với hai layout riêng:

| Khu vực | Layout | Vai trò | Trang |
|---|---|---|---|
| Client Site | `client` | Sinh viên | Tra cứu sách, chi tiết sách, thẻ thư viện, mượn trả của tôi, thông báo |
| Admin Dashboard | `admin` | Thủ thư + Admin | Tổng quan, quầy mượn trả, sách, tác giả, thể loại, báo cáo |
| | | Chỉ Admin | Tài khoản & thẻ, tham số hệ thống, sao lưu & dữ liệu, nhật ký hệ thống |

## Cấu trúc

```
app/
├── components/
│   ├── ui/          Nút, ô nhập, thẻ, bảng, hộp thoại… (Reka UI + Tailwind)
│   ├── common/      PageHeader, StatCard, EmptyState, QueryState
│   ├── app/         Shell, UserMenu, ThemeToggle
│   ├── book/ borrow/ catalog/ counter/    Component theo domain
├── composables/     Mỗi domain một file: useBooks, useBorrows, useStudents…
├── lib/             http, api-error, format, query-keys, nav, variants
├── middleware/      auth.global.ts — chặn theo đăng nhập và vai trò
├── pages/           Định tuyến theo file
├── plugins/         api.ts ($fetch), vue-query.ts
└── stores/auth.ts   Pinia
```

## Bốn quyết định thiết kế

**1. SPA thay vì SSR.** Mọi trang đều nằm sau đăng nhập và token giữ ở `localStorage`, nên SSR không render trước được gì có ích mà lại buộc phải chuyển token sang cookie và tách base URL theo phía server/client. Đặt `ssr: false` vẫn giữ trọn file-based routing, layouts, middleware và auto-import của Nuxt.

**2. TanStack Query thay vì `useAsyncData`.** Gần như toàn bộ trạng thái ở đây là dữ liệu máy chủ, và điểm khó nằm ở chỗ *làm mới đúng thứ cần làm mới*. Lập một phiếu mượn làm đổi cùng lúc: tồn kho sách, hai view thống kê, và số sách đang mượn của sinh viên đó. Query key gom hết vào `lib/query-keys.ts` để mỗi mutation invalidate đúng nhánh, thay vì gọi `refreshNuxtData` rải rác.

**3. Giữ nguyên tên field PascalCase tiếng Việt.** API trả `MaSach`, `SoLuongTon`, `TrangThaiThe` và giao diện dùng thẳng như vậy. Thêm một tầng ánh xạ sang camelCase là thêm một chỗ có thể sai, trong khi khi bảo vệ đồ án lại cần đối chiếu trực tiếp với tên cột trong database.

**4. Stored Procedure là nguồn chân lý duy nhất.** Giao diện có kiểm tra trước (thẻ khoá, vượt hạn mức, hết tồn kho) nhưng chỉ để phản hồi sớm — nút gửi không bị khoá vì lý do nghiệp vụ, và thông báo lỗi hiển thị **nguyên văn** chuỗi tiếng Việt do `SIGNAL` trong SP ném ra. Tiền phạt hiển thị ở màn trả sách là *dự kiến*, tính theo đúng công thức của `fn_CalculateFine`; con số chính thức do database quyết định.

## Xử lý lỗi

Một chỗ duy nhất, không component nào tự bắt lỗi:

- `plugins/api.ts` gắn Bearer token, gặp `401` thì xoá phiên và đưa về trang đăng nhập.
- `plugins/vue-query.ts` có `mutationCache.onError` bắn toast cho mọi mutation thất bại.
- `lib/api-error.ts` chuẩn hoá cả hai dạng body của NestJS: `message` là chuỗi với lỗi nghiệp vụ, là mảng chuỗi với lỗi `ValidationPipe`.
- `components/common/QueryState.vue` gom ba trạng thái đang tải / lỗi / rỗng để mọi màn hình hành xử giống nhau.

## Đổi tông màu

Toàn bộ màu nằm trong `app/assets/css/main.css` dưới dạng CSS variable, có sẵn bản sáng và tối. Các token `success` / `warning` / `danger` gắn với trạng thái nghiệp vụ: đang mượn bình thường, sắp đến hạn, quá hạn hoặc thẻ bị khoá.

## Lệnh

```bash
docker compose exec web npx nuxt typecheck   # kiểm tra kiểu
docker compose exec web npx eslint .          # kiểm tra lint
docker compose exec web npx nuxt build        # build production
```
