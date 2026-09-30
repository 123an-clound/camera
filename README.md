# Camera Rent — hướng dẫn vận hành

Website bán và cho thuê máy ảnh. Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage) + Vercel.
Khách gửi **yêu cầu** mua/thuê (không thanh toán online); shop xác nhận qua điện thoại.
Báo cáo chất lượng trước bàn giao: [`docs/QA-REPORT.md`](docs/QA-REPORT.md).

> Dự án dùng Next.js 16: API khác bản cũ — đọc `node_modules/next/dist/docs/` trước khi sửa code (xem `AGENTS.md`).

## Cài đặt & chạy

Yêu cầu Node ≥ 22.6 (script kiểm thử dùng type-stripping của Node; đã chạy trên Node 24).

```bash
npm install
cp .env.example .env.local   # hoặc tạo tay theo bảng bên dưới
npm run dev                  # http://localhost:3000
```

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Build và chạy bản production local |
| `npm run lint` | ESLint (gồm quy tắc React Compiler) |
| `npm run typecheck` | TypeScript |
| `npm test` | Kiểm thử hồi quy: quy tắc thuê, giỏ hàng, cấu hình site, timeline 3D |

## Biến môi trường

| Tên | Bắt buộc | Mục đích |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Có | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Khoá public (anon) — quyền do RLS quyết định |
| `SUPABASE_SERVICE_ROLE_KEY` | Có | Chỉ dùng phía server; **không bao giờ** đưa ra client |
| `NEXT_PUBLIC_GA_ID` | Không | Google Analytics 4 (`G-XXXXXXX`). Để trống = tắt analytics |
| `NEXT_PUBLIC_SITE_URL` | Nên có | Domain chính thức (`https://...`) cho sitemap, robots, canonical, Open Graph. Nếu trống trên Vercel sẽ dùng domain production của project |

Vercel tự cấp `VERCEL_ENV` / `VERCEL_PROJECT_PRODUCTION_URL`: bản preview tự `noindex` và robots chặn toàn bộ.

## Deploy

1. Push branch → Vercel tạo **preview**. Kiểm tra: trang chủ, `/products`, chi tiết, giỏ hàng (không gửi đơn thật), `/admin/login`.
2. Chạy Lighthouse / Rich Results Test trên URL preview.
3. Merge vào `main` → Vercel deploy production (region `icn1`, gần Supabase Seoul).
4. Sau deploy: mở `/robots.txt`, `/sitemap.xml` (phải là domain thật, không phải localhost), gửi 1 yêu cầu thử rồi xoá trong admin.

**Rollback:** Vercel → Deployments → chọn bản trước → *Promote to Production* (hoặc *Instant Rollback*). Migration DB trong `supabase/migrations/` đều không phá dữ liệu và tương thích ngược (hàm `create_camera_order` cũ vẫn giữ), nên rollback code không cần rollback DB.

## Database (Supabase)

- Project dùng **chung** với một app khác (nhà hàng). Chỉ đụng tới bảng `camera_*`, hàm `camera_*`/`create_camera_order*`, và bucket `product-images`, `models-3d`, `site-assets`.
- Migration theo thứ tự trong `supabase/migrations/`. Áp bằng Supabase SQL Editor hoặc CLI; không sửa trực tiếp policy trên dashboard.
- **Quyền admin:** chỉ user có trong bảng `camera_admins`. Thêm admin mới:
  ```sql
  insert into public.camera_admins (user_id)
  select id from auth.users where email = 'email-cua-admin@...';
  ```
  (Tạo user trước trong Auth → Users.)
- **Backup/restore:** Supabase Dashboard → Database → Backups (bản daily theo gói). Trước migration lớn: tải backup hoặc `pg_dump` các bảng `camera_*`.

## Quản trị (`/admin`)

- **Sản phẩm:** thêm/sửa/xoá, ảnh, model 3D (.glb), SEO riêng; ngay trên danh sách có bật/tắt hiển thị, nổi bật, thứ tự, nhân bản, tìm/lọc.
- **Yêu cầu:** lọc theo trạng thái, tìm tên/SĐT/email, chi tiết từng yêu cầu, ghi chú nội bộ, đổi trạng thái, xuất CSV (Excel).
- **Danh mục, Banner.**
- **Cài đặt** (8 tab): thông tin chung, trang chủ (bố cục, nút), story 3D, giao diện (màu nhấn, bật/tắt 3D/hiệu ứng, thanh thông báo), menu & footer, liên hệ & MXH, SEO, giới thiệu & FAQ. Lưu xong site cập nhật ngay.

## Quy tắc nghiệp vụ đang áp dụng

- Giá, số ngày thuê, tồn kho được **tính lại ở database** (`create_camera_order_v2`); client chỉ gửi sản phẩm và ngày.
- Số ngày thuê = ngày trả − ngày nhận, tối thiểu 1 (`lib/rental.ts`). Ngày nhận không được ở quá khứ theo giờ Việt Nam; tối đa 365 ngày.
- Mỗi khoảng ngày thuê là một yêu cầu riêng; yêu cầu mua không vượt tồn kho.
- Mỗi lần gửi có mã chống trùng (`client_token`): bấm lại/mất mạng không tạo yêu cầu trùng.

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| Sitemap chứa `localhost` | Chưa đặt `NEXT_PUBLIC_SITE_URL` và không chạy trên Vercel |
| Đăng nhập admin báo "không có quyền" | Tài khoản chưa có trong `camera_admins` |
| Khách báo "Ngày nhận máy đã qua" | Giỏ cũ; chọn lại ngày trên trang sản phẩm |
| Trang chủ chậm trên máy yếu | Admin → Cài đặt → Giao diện → tắt "Máy ảnh 3D" |
| Bị giới hạn "gửi quá nhanh" | Rate limit 10 yêu cầu/10 phút/IP (in-memory, mỗi instance) |

## Cần khách hàng cung cấp/xác nhận trước production

Domain chính thức; xác nhận quy tắc tính ngày thuê và chính sách tồn kho; nội dung thật (địa chỉ, giờ mở cửa, FAQ, ảnh sản phẩm); bật Leaked password protection trong Supabase Auth. Chi tiết: `docs/QA-REPORT.md` → "Blocker trước production".
