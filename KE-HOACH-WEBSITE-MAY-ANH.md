# KẾ HOẠCH XÂY DỰNG WEBSITE BÁN & CHO THUÊ MÁY ẢNH

> File này là bản brief đầy đủ để đưa cho Claude Code thực thi. Đọc toàn bộ trước khi bắt đầu code. Làm theo đúng thứ tự ở mục **10. Roadmap thực thi**.

---

## 1. Tổng quan & phạm vi

Website thương mại cho một cửa hàng vừa **bán**, vừa **cho thuê** máy ảnh (và ống kính, phụ kiện). Trọng tâm trải nghiệm: giao diện đẹp, có model 3D xoay được ở trang chi tiết, chuyển trang mượt và độc đáo. Toàn bộ nội dung do **admin** tự điều chỉnh qua CMS; dữ liệu lưu trên **Supabase**.

**Phạm vi ĐÃ CHỐT (không làm ngoài phạm vi này):**
- ❌ **Không** tích hợp cổng thanh toán. Khách bấm "Mua"/"Thuê" → điền form yêu cầu → lưu vào Supabase → admin xem và liên hệ chốt.
- ❌ **Không** có tài khoản/đăng nhập cho khách. Trang public hoàn toàn ẩn danh.
- ✅ **Chỉ admin** có đăng nhập (Supabase Auth), truy cập `/admin`.
- ✅ 3D: model máy ảnh xoay được ở **trang chi tiết** (three.js). Các trang còn lại dùng hiệu ứng 3D/parallax + chuyển trang mượt (Framer Motion).

---

## 2. Stack công nghệ

| Lớp | Công nghệ | Lý do |
|-----|-----------|-------|
| Framework | **Next.js 15 (App Router) + TypeScript** | SEO tốt cho web bán hàng, image optimization sẵn, API routes tiện cho form/admin |
| CSS | **Tailwind CSS v4** | Nhất quán với dự án cũ (SMARTWEB), tốc độ dev cao |
| UI components | **shadcn/ui** | Dùng cho toàn bộ admin dashboard (bảng, form, dialog) |
| Animation | **Framer Motion** | Page transitions + parallax + micro-interaction |
| 3D | **React Three Fiber + @react-three/drei** | Wrapper React cho three.js, load model `.glb`, orbit controls, lighting |
| Backend/DB | **Supabase** | Postgres + Auth (admin) + Storage (ảnh & model 3D) + RLS |
| Form | **react-hook-form + zod** | Validate form thuê/mua và form admin |
| Data fetching | Supabase JS client (`@supabase/supabase-js`, `@supabase/ssr`) | Server components fetch trực tiếp, RLS bảo vệ |
| Deploy | Vercel (khuyến nghị) | Khớp Next.js, env vars dễ |

> **Giả định có thể chỉnh:** nếu muốn giữ Vite thay Next.js (như SMARTWEB), báo lại — nhưng Next.js là lựa chọn tối ưu hơn cho SEO thương mại. Phần còn lại của plan giữ nguyên, chỉ đổi cách routing/fetch.

---

## 3. Mô hình dữ liệu Supabase (schema)

Tạo bằng SQL migration. Bật RLS trên mọi bảng.

### 3.1. Bảng

**`categories`** — danh mục (Máy ảnh, Ống kính, Phụ kiện...)
```
id            uuid pk default gen_random_uuid()
name          text not null
slug          text unique not null
description   text
sort_order    int default 0
created_at    timestamptz default now()
```

**`products`** — sản phẩm (dùng chung cho bán & thuê)
```
id                uuid pk
category_id       uuid fk -> categories.id
name              text not null
slug              text unique not null
brand             text            -- Canon, Sony, Nikon, Fujifilm...
short_desc        text
description       text            -- mô tả dài, rich text
specs             jsonb           -- {"Cảm biến":"Full-frame", "Độ phân giải":"24MP", ...}
is_for_sale       boolean default true
is_for_rent       boolean default true
sale_price        numeric         -- giá bán (VND), null nếu không bán
rent_price_day    numeric         -- giá thuê / ngày (VND)
rent_deposit      numeric         -- tiền cọc gợi ý
stock             int default 0   -- số lượng tồn (bán)
rent_available    boolean default true
condition         text            -- "Mới 100%", "Like new 98%"...
model_3d_url      text            -- URL file .glb trên Storage (null = không có 3D)
is_featured       boolean default false
is_active         boolean default true
sort_order        int default 0
created_at        timestamptz default now()
updated_at        timestamptz default now()
```

**`product_images`** — nhiều ảnh cho 1 sản phẩm
```
id           uuid pk
product_id   uuid fk -> products.id on delete cascade
url          text not null       -- URL trên Supabase Storage
alt          text
sort_order   int default 0
is_primary   boolean default false
```

**`orders`** — yêu cầu mua HOẶC thuê (gộp 1 bảng, phân biệt bằng `type`)
```
id              uuid pk
type            text not null check (type in ('sale','rent'))
customer_name   text not null
customer_phone  text not null
customer_email  text
note            text
rent_start      date            -- chỉ dùng khi type='rent'
rent_end        date            -- chỉ dùng khi type='rent'
status          text default 'new' check (status in ('new','contacted','confirmed','completed','cancelled'))
total_estimate  numeric         -- tạm tính (tự tính lúc submit)
created_at      timestamptz default now()
```

**`order_items`** — dòng sản phẩm trong 1 yêu cầu
```
id              uuid pk
order_id        uuid fk -> orders.id on delete cascade
product_id      uuid fk -> products.id
product_name    text            -- snapshot tên lúc đặt
quantity        int default 1
unit_price      numeric         -- giá bán hoặc giá thuê/ngày lúc đặt
rent_days       int             -- số ngày thuê (nếu rent)
```

**`site_settings`** — nội dung trang do admin sửa (key-value linh hoạt)
```
key           text pk          -- ví dụ: 'hero_title', 'hero_subtitle', 'hero_image', 'phone', 'address', 'about', 'facebook_url', 'logo_url'...
value         jsonb
updated_at    timestamptz default now()
```

**`banners`** — banner/slide trang chủ (admin thêm/xóa)
```
id           uuid pk
title        text
subtitle     text
image_url    text not null
link_url     text
sort_order   int default 0
is_active    boolean default true
```

### 3.2. RLS (Row Level Security)
- **`products`, `product_images`, `categories`, `banners`, `site_settings`**: cho phép `SELECT` với `is_active = true` (hoặc toàn bộ với settings/banners active) cho **anon**; `INSERT/UPDATE/DELETE` chỉ cho **authenticated** (admin).
- **`orders`, `order_items`**: cho phép **anon** `INSERT` (khách gửi yêu cầu); `SELECT/UPDATE/DELETE` chỉ **authenticated**.
- Bọc thao tác admin nhạy cảm qua API route dùng **service role key** (chỉ ở server) nếu cần bỏ qua RLS an toàn.

### 3.3. Storage buckets
- `product-images` (public read)
- `models-3d` (public read) — chứa file `.glb`
- `site-assets` (public read) — logo, hero, banner

---

## 4. Cấu trúc thư mục

```
/app
  /(public)
    layout.tsx           # layout + PageTransition wrapper + header/footer
    page.tsx             # Trang chủ
    /products
      page.tsx           # Danh sách + filter
      /[slug]/page.tsx   # Chi tiết + 3D viewer
    /rent/page.tsx       # Trang giới thiệu dịch vụ thuê (tùy chọn)
    /about/page.tsx
    /contact/page.tsx
    /cart/page.tsx       # "Giỏ yêu cầu" (mua/thuê) - lưu localStorage
  /admin
    layout.tsx           # kiểm tra auth, sidebar
    login/page.tsx
    page.tsx             # Dashboard tổng quan
    /products/...        # CRUD sản phẩm
    /categories/...
    /orders/...          # Xem & đổi trạng thái yêu cầu
    /banners/...
    /settings/page.tsx   # Sửa site_settings
  /api
    /orders/route.ts     # POST tạo yêu cầu
/components
  /ui                    # shadcn
  /public                # ProductCard, Hero, Navbar, Footer, ProductViewer3D...
  /admin                 # DataTable, ImageUploader, Model3DUploader...
  /motion                # PageTransition, FadeIn, Parallax, MagneticButton...
/lib
  supabase/client.ts     # browser client
  supabase/server.ts     # server client (SSR)
  supabase/admin.ts      # service role (server-only)
  cart.ts                # logic giỏ yêu cầu (localStorage + context)
  utils.ts
```

---

## 5. Tính năng trang public

### 5.1. Trang chủ
- Hero với hình/tiêu đề lấy từ `site_settings` + banner slider từ `banners`.
- Section "Sản phẩm nổi bật" (`is_featured = true`).
- Section "Cho thuê" vs "Bán" tách rõ.
- Parallax nền nhẹ khi cuộn.

### 5.2. Danh sách sản phẩm `/products`
- Lọc theo: danh mục, hãng, hình thức (Bán/Thuê), khoảng giá, tìm kiếm theo tên.
- Sort: mới nhất / giá tăng / giá giảm.
- `ProductCard`: ảnh chính, tên, hãng, badge "Bán"/"Cho thuê", giá bán và/hoặc giá thuê/ngày, hover có hiệu ứng nghiêng 3D nhẹ (tilt).

### 5.3. Chi tiết sản phẩm `/products/[slug]`
- **Cột trái:** gallery ảnh + **3D viewer** (React Three Fiber) nếu `model_3d_url` có; nếu không thì fallback về gallery ảnh. Có nút chuyển "Ảnh / 3D".
  - 3D viewer: OrbitControls (xoay/zoom), auto-rotate nhẹ, môi trường ánh sáng (`Environment` từ drei), loading skeleton khi tải `.glb`.
- **Cột phải:** tên, hãng, tình trạng, bảng thông số (`specs`), mô tả.
  - Nếu bán: giá bán + nút "Thêm vào giỏ (Mua)".
  - Nếu thuê: giá thuê/ngày + tiền cọc + chọn ngày bắt đầu/kết thúc → tự tính tạm tính → nút "Thêm vào giỏ (Thuê)".
- Sản phẩm liên quan cùng danh mục.

### 5.4. Giỏ yêu cầu `/cart`
- Lưu ở **localStorage** (không cần login). Tách 2 nhóm: mục Mua và mục Thuê.
- Form gửi: họ tên, SĐT (bắt buộc), email, ghi chú.
- Submit → `POST /api/orders` → tạo `orders` + `order_items` → hiện thông báo "Đã gửi yêu cầu, cửa hàng sẽ liên hệ".

### 5.5. About / Contact
- Nội dung từ `site_settings`. Contact hiển thị SĐT, địa chỉ, Facebook, bản đồ (embed đơn giản).

---

## 6. Hiệu ứng & chuyển trang (điểm nhấn)

- **Page transition:** dùng Framer Motion (`AnimatePresence` + template/layout động của App Router). Hiệu ứng đề xuất: nội dung cũ mờ + trượt nhẹ lên, nội dung mới trượt vào kèm một lớp phủ (curtain/overlay) quét qua — tạo cảm giác "chuyển cảnh" độc đáo thay vì fade thường. Đảm bảo không giật, tôn trọng `prefers-reduced-motion`.
- **Reveal on scroll:** các section fade/slide vào khi lọt viewport.
- **Parallax:** lớp nền hero và ảnh sản phẩm dịch chuyển nhẹ theo cuộn/chuột.
- **Card tilt 3D:** ProductCard nghiêng theo con trỏ (giới hạn góc nhỏ, mượt).
- **Magnetic button / hover glow** cho các CTA chính.
- Giữ hiệu năng: lazy-load 3D và ảnh, giới hạn số animation chạy đồng thời.

---

## 7. Trang Admin (CMS) — "điều chỉnh mọi thứ"

Truy cập `/admin`, bảo vệ bằng Supabase Auth (email/password admin tạo sẵn). Sidebar + shadcn UI.

- **Dashboard:** số yêu cầu mới, số sản phẩm, yêu cầu gần đây.
- **Sản phẩm:** bảng danh sách (tìm, lọc, phân trang) + form thêm/sửa đầy đủ mọi field ở mục 3.1, gồm:
  - Upload nhiều ảnh (kéo-thả, đặt ảnh chính, sắp xếp).
  - Upload file `.glb` cho 3D.
  - Bật/tắt bán, bật/tắt thuê, đặt giá, tồn kho, nổi bật, ẩn/hiện.
  - Editor cho mô tả + editor bảng thông số (`specs` dạng cặp key-value thêm/xóa động).
- **Danh mục:** CRUD + sắp xếp thứ tự.
- **Yêu cầu (orders):** xem chi tiết (khách, sản phẩm, ngày thuê, tạm tính), đổi trạng thái (new → contacted → confirmed → completed/cancelled), tìm theo SĐT.
- **Banner:** thêm/xóa/sắp xếp slide trang chủ, upload ảnh.
- **Cài đặt trang (settings):** sửa hero (tiêu đề, phụ đề, ảnh), logo, SĐT, địa chỉ, email, link Facebook, nội dung About — toàn bộ ghi vào `site_settings`.

> Nguyên tắc: bất cứ text/ảnh/giá nào hiển thị trên trang public đều phải sửa được từ admin, không hard-code.

---

## 8. Biến môi trường (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # chỉ dùng phía server, tuyệt đối không expose client
```

---

## 9. Yêu cầu kỹ thuật & chất lượng

- TypeScript strict, không `any` bừa.
- Server Components fetch dữ liệu mặc định; Client Components chỉ khi cần tương tác (3D, form, animation).
- Responsive mobile-first; test kỹ trang chi tiết + 3D trên mobile (3D có thể chỉ auto-rotate, ẩn zoom nặng nếu máy yếu).
- SEO: metadata động theo sản phẩm, sitemap, ảnh có alt.
- Accessibility cơ bản + `prefers-reduced-motion`.
- Xử lý loading/empty/error state cho mọi danh sách.
- Seed sẵn: 2 danh mục, 4–6 sản phẩm mẫu (có 1–2 sản phẩm kèm model `.glb` mẫu) để demo ngay.

---

## 10. Roadmap thực thi (làm đúng thứ tự)

1. **Khởi tạo:** `create-next-app` (TS, Tailwind v4, App Router). Cài shadcn/ui, framer-motion, @react-three/fiber, @react-three/drei, three, supabase-js, @supabase/ssr, react-hook-form, zod.
2. **Supabase:** tạo project, chạy SQL migration (mục 3), tạo buckets, bật RLS + policies, tạo 1 tài khoản admin.
3. **Kết nối:** 3 supabase client (`client/server/admin`), test đọc bảng.
4. **Layout public + hệ thống motion:** Navbar, Footer, `PageTransition`, các component motion tái sử dụng.
5. **Trang chủ + danh sách + ProductCard** (đọc dữ liệu thật).
6. **Trang chi tiết + 3D viewer** (fallback ảnh khi không có model).
7. **Giỏ yêu cầu + API `/api/orders`** (mua/thuê, tính tạm tính).
8. **Admin auth + layout + dashboard.**
9. **Admin CRUD:** sản phẩm (kèm upload ảnh + `.glb`), danh mục, banner, orders, settings.
10. **Seed dữ liệu mẫu**, kiểm thử toàn luồng, tối ưu hiệu năng animation/3D, responsive, deploy Vercel.

---

## 11. Giả định (báo lại nếu muốn đổi)

- Tiền tệ: VND, format `1.234.000₫`.
- Giao diện tiếng Việt (i18n để mở rộng sau nếu cần).
- 1 tài khoản admin duy nhất, tạo thủ công trong Supabase (chưa cần trang quản lý nhiều admin).
- Model 3D dạng `.glb`; nếu chưa có model thật thì dùng file mẫu, trang vẫn chạy bình thường bằng ảnh.
- Chưa làm: thanh toán, tài khoản khách, đánh giá/bình luận, mã giảm giá (có thể bổ sung sau).

---

## 12. Tối ưu toàn diện & Bảo mật (BẮT BUỘC)

Mục tiêu: mọi mặt (frontend, backend, UX, logic, độ mượt, bảo mật) đạt chuẩn tối đa. Chạy Lighthouse mọi hạng mục **≥ 90** trước khi coi là xong.

### 12.1. Hiệu năng & độ mượt (Core Web Vitals)
- Mục tiêu: **LCP < 2.5s, INP < 200ms, CLS < 0.1**.
- `next/image` cho mọi ảnh (định cỡ sẵn, `sizes`, lazy, AVIF/WebP). `next/font` cho font (self-host, tránh FOUT).
- `dynamic()` (SSR off) cho 3D viewer và các block Framer Motion nặng → không chặn tải trang.
- **Nén model `.glb` bằng Draco/meshopt**, giới hạn poly, texture ≤ 2K; hiện skeleton khi tải.
- Animation chỉ dùng `transform`/`opacity` (GPU), tránh animate layout → không gây CLS.
- Route-level code splitting; prefetch link trong viewport; cache dữ liệu Supabase hợp lý (revalidate).
- Tôn trọng `prefers-reduced-motion` (tắt bớt hiệu ứng).

### 12.2. SEO kỹ thuật
- **Metadata API** động: title/description riêng từng sản phẩm & trang.
- **Structured data JSON-LD**: `Product` + `Offer` (giá, tình trạng), `BreadcrumbList`, `Organization`.
- **Open Graph + Twitter Card** cho mọi trang (ảnh sản phẩm làm OG image).
- `sitemap.xml` động (gồm mọi sản phẩm active) + `robots.txt`.
- Canonical URL, slug sạch, heading đúng cấp, ảnh có `alt`.
- Trang public render **SSR/SSG** (không phụ thuộc JS để index).

### 12.3. Accessibility (a11y) — WCAG 2.1 AA
- HTML semantic, landmark, `alt` đầy đủ, label cho mọi input.
- Điều hướng bàn phím + focus ring rõ; tương phản màu đạt AA.
- ARIA cho component tương tác (dialog, tab ảnh/3D, menu admin).
- Kiểm thử bằng **Pa11y** + axe + Lighthouse a11y trước khi giao.

### 12.4. Backend & logic (không tin client)
- Validate **2 lớp**: client (zod + react-hook-form) và **lặp lại ở server** trong `/api/orders` (không bao giờ tin dữ liệu gửi lên).
- **Tính `total_estimate` ở server** dựa trên giá đọc từ DB, không dùng giá client gửi.
- Tạo `orders` + `order_items` trong **1 transaction** (RPC/Postgres function) để đảm bảo toàn vẹn.
- Index DB: `products(slug, category_id, is_active, is_featured)`, `orders(status, created_at)`.
- Chống double-submit form (disable nút + idempotency), phản hồi lỗi rõ ràng.

### 12.5. Bảo mật — OWASP Top 10
- **A01 Access Control:** RLS chặt trên mọi bảng; **middleware bảo vệ `/admin/*`** + kiểm tra session trong admin layout; anon chỉ được `SELECT` dữ liệu active và `INSERT` order.
- **A02 Crypto:** HTTPS bắt buộc; **service role key chỉ ở server**, không bao giờ ra client; secret trong env.
- **A03 Injection/XSS:** query Supabase tham số hóa; **sanitize rich text bằng DOMPurify** trước khi render mô tả sản phẩm; escape mọi output.
- **A04/A05 Design & Misconfig:** least privilege; **security headers** qua `next.config`/middleware: CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`; tắt source map ở production.
- **A07 Auth:** dùng Supabase Auth, session cookie `httpOnly`; chống brute-force đăng nhập admin (rate limit).
- **A08 Data integrity:** kiểm tra upload — whitelist MIME (`image/*`, `model/gltf-binary`), giới hạn dung lượng (ảnh ≤ 5MB, `.glb` ≤ 20MB), đổi tên file an toàn.
- **A09 Logging:** log lỗi server và hành động admin quan trọng.
- **A10 SSRF/CSRF:** không fetch URL tùy ý do người dùng nhập; form admin bảo vệ bằng session; CORS chặt.
- **Rate limit `/api/orders`** (chống spam gửi yêu cầu).

### 12.6. UX
- Mọi danh sách/hành động có trạng thái **loading / empty / error**; toast phản hồi rõ.
- **Xác nhận trước hành động phá hủy** (xóa sản phẩm/đơn) bằng dialog.
- Optimistic UI ở admin nơi hợp lý; giữ vị trí cuộn khi chuyển trang.
- Mobile: 3D điều khiển bằng cảm ứng, tự giảm chất lượng/tắt zoom nếu máy yếu.

### 12.7. Chất lượng code
- **Code súc tích, KHÔNG dài dòng:** ưu tiên giải pháp ngắn gọn và rõ ràng; **DRY** (không lặp code), tránh trừu tượng/lớp bọc thừa; mỗi hàm/component chỉ làm một việc; đặt tên tự giải thích, comment chỉ khi thật cần. Ưu tiên tận dụng tính năng sẵn có của framework thay vì tự viết lại.
- **TypeScript strict**, ESLint + Prettier; không `any` tùy tiện.
- **Validate biến môi trường bằng zod** lúc khởi động (fail sớm nếu thiếu).
- Tách logic ra `lib/`, `hooks/`; component tái sử dụng; đặt tên rõ ràng.
- **Error Boundary** cho khu vực 3D và toàn app; xử lý fetch fail gọn gàng.
- (Tùy chọn) Sentry để theo dõi lỗi production.

> **Cổng chất lượng trước khi bàn giao:** Lighthouse (Perf/SEO/A11y/Best Practices) ≥ 90, Pa11y không lỗi nghiêm trọng, không lỗi TypeScript/ESLint, đã set security headers, đã test luồng mua/thuê + toàn bộ CRUD admin.
