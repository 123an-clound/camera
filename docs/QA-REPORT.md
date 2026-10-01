# Báo cáo chất lượng trước bàn giao — Camera Rent

Ngày: 2026-09-30 · Branch: `feat/optical-lab-redesign` (chưa merge, chưa deploy) · Người thực hiện: Claude Code

## Kết luận

**Bị chặn một phần — đủ điều kiện trong phạm vi đã kiểm chứng, chưa đủ để go-live** cho tới khi chủ dự án xử lý các mục ở "Blocker trước production" (push/deploy preview, domain chính thức, xác nhận quy tắc thuê, nội dung thật cho checklist pre-launch). Không còn P0 nào mở. Một P1 hiệu năng (TBT trang chủ trên máy yếu mô phỏng) được giảm nhưng chưa đạt ngưỡng — có công tắc tắt 3D trong admin.

Phạm vi nghiệp vụ thực tế: web bán + cho thuê máy ảnh **không có thanh toán online**. Khách gửi *yêu cầu* (mua/thuê), shop gọi lại xác nhận, cọc và lịch nhận máy. Không có tài khoản khách hàng hay trang tra cứu đơn.

## Bảng vấn đề

Ký hiệu nguồn gốc: **[cũ]** tồn tại trước đợt QA · **[hồi quy]** do thay đổi trong phiên làm việc này gây ra.

| # | Mức | Vấn đề & bằng chứng | Nguyên nhân | Cách sửa (vị trí) | Xác minh |
|---|---|---|---|---|---|
| 1 | P0 [cũ] | Mọi tài khoản đã đăng nhập vào project Supabase (dùng chung với app nhà hàng) ghi được toàn bộ bảng `camera_*` và 3 bucket ảnh | Policy RLS dùng `authenticated` | Bảng `camera_admins` + `camera_is_admin()`, đổi mọi policy ghi/đọc-admin; `getAdminClient()` chặn ở mọi server action; login đăng xuất ngay tài khoản không phải admin (`supabase/migrations/20260930_camera_admin_rls.sql`, `lib/admin-auth.ts`) | Giả lập vai trò trong transaction rollback: non-admin 0 dòng sửa/0 đơn thấy; admin OK; anon vẫn đọc sản phẩm |
| 2 | P1 [cũ] | Giỏ có nhiều máy thuê khác ngày → gộp 1 yêu cầu, dùng ngày của máy đầu tiên (shop nhận sai lịch) | Client gửi `groupItems[0].rentStart/End` cho cả nhóm | Gửi 1 yêu cầu cho mỗi khoảng ngày (`lib/cart-logic.ts#groupForSubmit`, `app/(public)/cart/page.tsx`) | `npm test` + test UI Playwright: 3 request (1 mua, 2 thuê với đúng ngày) |
| 3 | P1 [cũ] | Server nhận `rent_days` từ client, không đối chiếu ngày → tổng tiền có thể bị sửa | RPC tin tham số | `create_camera_order_v2` tự tính số ngày từ ngày nhận/trả; từ chối ngày quá khứ (giờ VN), ngày trả < nhận, > 365 ngày | SQL trong transaction rollback: client gửi 1 ngày cho khoảng 3 ngày → lưu 3 ngày, 1.050.000₫ |
| 4 | P1 [cũ] | Gửi lại sau lỗi một phần → yêu cầu mua bị tạo trùng; không idempotency | Không có khoá chống trùng | Cột `client_token` unique + token theo nhóm lưu `sessionStorage`; nhóm gửi thành công bị xoá khỏi giỏ | SQL: 2 lần cùng token → cùng 1 id. UI: lỗi giả lập ở nhóm 2 → retry dùng lại đúng token, không gửi lại nhóm mua |
| 5 | P1 [cũ] | Giỏ hiển thị giá lúc thêm vào (có thể đã đổi), giữ sản phẩm đã ẩn/ngày đã qua | Giỏ chỉ ở localStorage | Server action `getCartProducts` lấy giá hiện tại; dòng đổi giá hiện giá cũ gạch ngang; dòng lỗi bị đánh dấu và khoá nút gửi | UI test: giá lưu 1₫ → hiển thị giá thật + thông báo; ngày quá khứ → cảnh báo, khoá gửi |
| 6 | P1 [cũ] | Server không kiểm tra số lượng mua với tồn kho | Thiếu điều kiện | RPC: `OUT_OF_STOCK`; ô số lượng giới hạn theo tồn kho | curl: 3 cái khi tồn 2 → 409, không ghi DB |
| 7 | P1 [cũ] | Production thiếu `NEXT_PUBLIC_SITE_URL` → sitemap/robots trỏ `localhost` | Fallback cứng | `lib/site-url.ts`: fallback sang `VERCEL_PROJECT_PRODUCTION_URL`; preview/non-prod `noindex` + robots chặn toàn bộ | Vercel env (chỉ đọc tên) xác nhận thiếu biến; build local OK. Chưa kiểm trên deploy thật |
| 8 | P1 [cũ] | Không có canonical / `metadataBase` | — | Canonical từng trang; `/products?filter` canonical về `/products` | curl thấy `<link rel=canonical>` đúng |
| 9 | P1 [cũ] | JSON-LD Product ghi giá thuê/ngày như giá bán, mọi máy "UsedCondition", không escape | — | Offer chỉ khi có bán; condition suy ra từ trường "Tình trạng"; escape `<`; breadcrumb hiển thị + BreadcrumbList | Đọc HTML; chưa chạy Rich Results Test (cần URL public) |
| 10 | P1 [cũ] | Trang chủ TBT 6,4 s, LCP 6,1 s (lab) | three.js + dựng scene + biên dịch shader đồng bộ ngay khi tải | Mount 3D khi trình duyệt rảnh; `compileAsync`; tắt `checkShaderErrors` ở production; bỏ 3D trên Save-Data/máy ≤2 nhân hoặc ≤2 GB | TBT 6.366 → ~3.450 ms (còn cao — xem Rủi ro) |
| 11 | P1 [cũ] | 13–15 file font mỗi trang | Mono preload, 3 weight display | Mono không preload, display chỉ 600/700 | Số liệu Lighthouse bên dưới |
| 12 | P1 [cũ] | `/contact` tải Google Maps (~600 KB bên thứ ba) ngay | iframe trong viewport | Bấm "Hiện bản đồ" mới tải + link Google Maps | Perf 73 → 88, 1.057 → 405 KB |
| 13 | P1 [cũ] | A11y: 4 select lọc không có tên; 2 ô ngày không có label | — | `aria-label`, `htmlFor`/`id` | Lighthouse a11y 100 mọi trang |
| 14 | P2 [cũ] | "Hôm nay" tính theo UTC (sáng sớm ở VN thành hôm qua) | `toISOString()` | `todayInShop()` theo `Asia/Ho_Chi_Minh` | `npm test` |
| 15 | P2 [hồi quy] | Trang chi tiết đơn admin tính số ngày kiểu +1, lệch với cách tính tiền | Code viết trong đợt nâng cấp admin | Dùng chung `rentalDays()` | `npm test` |
| 16 | P2 [cũ] | Header `X-Powered-By`; thiếu Permissions-Policy | Mặc định Next | `poweredByHeader: false`, thêm header | curl |
| 17 | P2 [hồi quy] | Nút gọi nổi che nội dung cuối trang trên mobile | Thêm ở đợt CMS | Khoảng đệm cuối trang trên mobile | Ảnh chụp 390 px |
| 18 | P2 [cũ] | Lỗi RPC hiện chung chung "Không tạo được yêu cầu" | Route nuốt lỗi | Map mã lỗi → thông báo tiếng Việt (409); lỗi lạ chỉ log mã, không log dữ liệu khách | curl 7 trường hợp |

Không sửa (ghi nhận): `valid-source-maps` (cố ý tắt source map production); audit `meta-description` lúc đạt lúc không trên trang sản phẩm — **có từ baseline**, do Next 16 stream metadata cho UA trình duyệt thường; UA bot (Googlebot, Lighthouse) nhận metadata trong `<head>` (đã kiểm bằng curl).

## Hiệu năng (lab, không phải dữ liệu người dùng thật)

Điều kiện: Lighthouse 12.8.2, cấu hình mobile mặc định (Moto G Power, throttling mô phỏng 4G + CPU ×4), Chrome headless, bản `next build` + `next start` local (Windows), mỗi trang 3 lần, lấy trung vị. Không có dữ liệu CrUX/field → **không tuyên bố đạt Core Web Vitals thực tế**. TBT không phải là INP.

| Trang | Perf trước → sau | LCP (ms) | TBT (ms) | CLS | Dung lượng (KB) |
|---|---|---|---|---|---|
| `/` | 39 → 41–47 | 6.084 → 4.733–6.750 | 6.366 → 3.424–3.481 | 0 | 834 → 807 |
| `/products` | 81 → 80–81 | 4.544 → ~4.870 | 66 → 45–69 | 0 | 612 → 601 |
| Chi tiết SP | 85 → 83 | 4.255 → ~4.460 | 19 → 23–31 | 0 | 552 → 546 |
| `/cart` | 82 → 78–83 | 4.674 → 4.519–4.834 | 81 → 92–157 | 0 | 558 → 540 |
| `/about` | 88 → 89–90 | 3.786 → 3.583–3.624 | 39 → 34–45 | 0 | 424 → 403 |
| `/contact` | 73 → 88 | 5.056 → 3.731–3.788 | 35 → 26–39 | 0 | 1.057 → 405 |

Hai lượt "sau" cho khoảng giá trị; LCP trang chủ dao động mạnh giữa các lần chạy. Trên Chrome desktop thật (profile CDP), phần khởi tạo 3D tổng vài trăm ms.

## Kết quả kiểm tra

- `npm run build` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` ✅ (4 bộ self-check: quy tắc thuê, giỏ hàng, cấu hình site, timeline 3D)
- API đặt hàng (curl, bản production local): 400 cho dữ liệu sai; 409 kèm thông báo tiếng Việt cho ngày quá khứ, thiếu ngày, vượt tồn, sản phẩm chỉ cho thuê. Không phát sinh đơn trong DB (đã đếm lại).
- RPC (Supabase, vai trò `anon`, transaction **rollback**): tính ngày/tổng tiền, idempotency, hàm cũ 8 tham số vẫn chạy (bản production đang deploy vẫn gọi hàm này).
- Luồng giỏ hàng (Playwright, `/api/orders` được mock — không tạo đơn thật): cập nhật giá, cảnh báo dòng lỗi, tách nhóm theo ngày, lỗi một phần giữ nguyên form, retry dùng lại token, màn hình xác nhận.
- Giao diện: ảnh chụp 390 px và 1440 px các trang sản phẩm, chi tiết, liên hệ; không tràn ngang.
- Bảo mật: `npm audit --omit=dev` 0 lỗ hổng; header CSP/HSTS/X-Frame-Options/nosniff/Referrer-Policy/Permissions-Policy; không có `.env` trong git; service-role key chỉ dùng phía server.
- SEO: robots, sitemap, canonical, noindex cho cart/admin/preview; JSON-LD Product/Breadcrumb/FAQ.

## Chưa kiểm chứng / giới hạn

- Admin: đã kiểm bằng tài khoản QA tạm (đã xoá sau test). Chưa bấm thử: lưu ghi chú/đổi trạng thái trên đơn thật, bật/tắt hiển thị sản phẩm đang bán (sẽ ảnh hưởng site production đang chạy), upload ảnh/model.
- Deploy preview/production trên Vercel: chưa deploy (không tự deploy). Fallback `VERCEL_PROJECT_PRODUCTION_URL` và `noindex` preview chỉ kiểm bằng code + tài liệu Vercel.
- Không có Search Console/CrUX → chưa có dữ liệu index/organic/field.
- Rich Results Test / Schema validator cần URL public.
- Rate limit là in-memory theo instance (đủ cho traffic nhỏ; nhiều instance cần Redis/Upstash).
- Không có hệ thống lịch trống/đặt trùng máy thuê — shop kiểm tra thủ công khi gọi xác nhận.

## Kiểm thử admin (bản production local, tài khoản QA tạm)

Tạo user tạm qua Supabase Admin API + thêm vào `camera_admins`, đăng nhập bằng Playwright, rồi xoá user và mọi dữ liệu test (DB kiểm lại: 1 user, 1 admin, 6 sản phẩm, 0 hàng `cfg_*`). Mật khẩu tạm có xuất hiện trong log công cụ phiên làm việc; tài khoản đã bị xoá.

- Dashboard, Yêu cầu, Chi tiết yêu cầu, Sản phẩm, Cài đặt (8 tab) hiển thị đúng.
- Xuất CSV: 200, `text/csv`, có BOM UTF-8 (Excel đọc tiếng Việt), 1 dòng dữ liệu (file tải về đã xoá).
- Lưu cấu hình: đổi màu nhấn sang cyan + bật thanh thông báo → site công khai đổi `--primary` và hiện thông báo ngay.
- Link `javascript:alert(1)` trong menu → bị từ chối "Link phải bắt đầu bằng / hoặc https://".
- Nhân bản sản phẩm → mở trang sửa bản sao (ẩn, "(bản sao)"); đã xoá bản sao.

## Checklist pre-launch (20 mục)

| # | Mục | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | 404 riêng | ✅ | `app/not-found.tsx`, trả 404, có menu + CTA |
| 2 | CTA trên màn đầu | ✅ | "Thuê máy ngay" / "Mua máy" ở hero |
| 3 | Liên kết nội bộ | ✅ | Menu, footer, breadcrumb, sản phẩm liên quan |
| 4 | Trang cảm ơn | ✅ | Màn hình "Đã gửi yêu cầu" + mã yêu cầu |
| 5 | Breadcrumb | ✅ | Sản phẩm, chi tiết, giới thiệu, liên hệ, chính sách + BreadcrumbList |
| 6 | Case study | ❌ | Cần nội dung thật từ shop |
| 7 | FAQ ≥ 5 câu | ❌ | Đã có CMS + FAQPage JSON-LD; hiện 0 câu — shop nhập ở Cài đặt → Giới thiệu & FAQ |
| 8 | Cam kết thời gian phản hồi | ⚠️ | Đã có trường "Cam kết thời gian phản hồi" (hiện ở giỏ + liên hệ); cần shop điền |
| 9 | CTA dính trên mobile | ✅ | Nút gọi/Zalo nổi |
| 10 | robots.txt | ✅ | Có sitemap; preview chặn toàn bộ |
| 11 | Title riêng từng trang | ✅ | curl với UA Googlebot |
| 12 | Meta description riêng | ✅ | Trang chủ dùng mô tả site (sửa ở Cài đặt → SEO) |
| 13 | Ảnh chia sẻ | ✅ | `/og` sinh tự động 1200×630 khi chưa upload; sản phẩm dùng ảnh sản phẩm |
| 14 | Bản đồ + chỉ đường | ✅ | Bấm để tải bản đồ + link Google Maps |
| 15 | Đánh giá thật | ❌ | Cần review thật (Google Business Profile) — không tự tạo |
| 16 | Alt ảnh | ✅ | Lighthouse image-alt đạt; ảnh trang trí `alt=""` |
| 17 | LocalBusiness schema | ⚠️ | `Store` với tên, điện thoại, email, địa chỉ, MXH. Thiếu giờ mở cửa dạng chuẩn và toạ độ — cần shop cung cấp |
| 18 | Chính sách bảo mật | ⚠️ | `/privacy` + link footer + dòng đồng ý ở form. Nội dung mặc định chỉ mô tả dữ liệu thu thập — cần shop thay bằng bản đã rà soát pháp lý (NĐ 13/2023) |
| 19 | Analytics | ❌ | Đã tích hợp GA4 (chỉ bật khi có `NEXT_PUBLIC_GA_ID`); cần shop cung cấp Measurement ID. Có thể cần banner đồng ý cookie |
| 20 | Ảnh đội ngũ | ❌ | Cần ảnh thật |

Kết quả: ✅ 13/20 · ⚠️ 3 · ❌ 4 (đều cần nội dung/ID từ shop).

## Rủi ro còn lại

- **Trang chủ trên điện thoại yếu:** lab TBT ~3,4 s khi scene 3D khởi tạo (sau khi nội dung đã hiện). Máy rất yếu/Save-Data đã tự bỏ 3D; nếu số liệu thật xấu, tắt 3D trong **Admin → Cài đặt → Giao diện**.
- Project Supabase dùng chung với app khác: mọi thay đổi schema/policy cần cân nhắc cả hai app.

## Blocker trước production (cần chủ dự án)

1. **Domain chính thức** → đặt `NEXT_PUBLIC_SITE_URL` trên Vercel (Production). Nếu không đặt, site dùng domain production của project Vercel.
2. **Xác nhận quy tắc tính ngày thuê**: hiện tại = ngày trả − ngày nhận, tối thiểu 1 (30/9 → 1/10 = 1 ngày; nhận và trả cùng ngày = 1 ngày). Đây là cách khách đã được báo giá từ trước; đổi quy tắc phải sửa `lib/rental.ts` và `create_camera_order_v2` cùng lúc.
3. **Xác nhận chính sách tồn kho**: hiện chặn yêu cầu mua vượt tồn kho. Nếu shop nhận đặt trước khi hết hàng, cần bỏ điều kiện `OUT_OF_STOCK`.
4. Đăng nhập admin, thử từng tab cài đặt và các công cụ đơn hàng/sản phẩm.
5. Supabase Dashboard: bật **Leaked password protection**; cân nhắc tắt **Allow new users to sign up** nếu app nhà hàng không cần.
6. **Push branch** `feat/optical-lab-redesign` (lệnh push bị chặn bởi quyền của trợ lý — cần chủ dự án tự push) → Vercel tạo preview → chạy lại Lighthouse/Rich Results trên URL preview → merge → promote.
7. Nội dung/ID cho checklist pre-launch: FAQ, case study, đánh giá thật, ảnh đội ngũ, thời gian phản hồi, GA4 ID, chính sách bảo mật đã rà soát, giờ mở cửa + toạ độ.

## Cập nhật 2026-10-01 — giao diện "Soft Film Y2K"

Đổi giao diện public sang phong cách sáng, pastel cho khách nữ Gen Z (admin giữ nguyên).

- Nền kem `#FFF7F0`, chữ nâu cacao `#3B2A2F`; 5 màu nhấn trong admin (Hồng dâu mặc định, Tím lilac, Cam đào, Xanh mint, Vàng mật ong) — tất cả đạt tương phản AA với chữ trắng và với nền kem.
- Font tiêu đề Baloo 2, chữ viết tay Dancing Script (đều có tiếng Việt); grain film, chấm bi, sticker SVG, băng dính washi, dấu ngày kiểu máy digicam.
- Hero mới: collage polaroid từ ảnh sản phẩm thật (không bịa nội dung). Card sản phẩm kiểu polaroid. Navbar dạng viên thuốc, footer hồng.
- Bỏ hẳn story 3D (component, tab admin "Story 3D", công tắc 3D, self-check timeline). Viewer 3D trên trang chi tiết sản phẩm giữ nguyên.
- Sửa banner trang chủ bị trống: `AnimatePresence` kẹt ở pha exit (opacity 0) → thay bằng crossfade CSS.

Kiểm chứng: `typecheck` ✅ · `lint` ✅ · `npm test` ✅ (3 bộ) · `build` ✅ · Playwright 390px/1440px (home, products, chi tiết, cart, 404 — không tràn ngang, không lỗi console).

Lighthouse mobile (lab, median 3 lượt, `next start`):

| Trang | Perf trước → sau | TBT trước → sau | A11y |
|---|---|---|---|
| `/` | 41 → 80 | 3.481 → 110 ms | 100 |
| `/products` | 80 → 79 | 69 → 88 ms | 100 |
| chi tiết SP | 83 → 82 | 31 → 74 ms | 100 |
| `/cart` | 78 → 82 | 157 → 151 ms | 100 |
| `/about` | 89 → 87 | 45 → 109 ms | 100 |
| `/contact` | 88 → 88 | 39 → 56 ms | 100 |

Rủi ro mục "Trang chủ trên điện thoại yếu" ở trên đã hết hiệu lực (không còn 3D trên trang chủ).
