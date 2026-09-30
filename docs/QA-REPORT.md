# Báo cáo chất lượng trước bàn giao — Camera Rent

Ngày: 2026-09-30 · Branch: `feat/optical-lab-redesign` (chưa merge, chưa deploy) · Người thực hiện: Claude Code

## Kết luận

**Bị chặn một phần — đủ điều kiện trong phạm vi đã kiểm chứng, chưa đủ để go-live** cho tới khi chủ dự án xử lý 3 mục ở phần "Blocker trước production" (domain chính thức, xác nhận quy tắc tính ngày thuê, kiểm tra admin sau đăng nhập). Không còn P0 nào mở. Một P1 hiệu năng (TBT trang chủ trên máy yếu mô phỏng) được giảm nhưng chưa đạt ngưỡng — có công tắc tắt 3D trong admin.

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

- Giao diện admin sau đăng nhập (8 tab cài đặt, dashboard, chi tiết đơn, CSV, thao tác nhanh sản phẩm): cần mật khẩu của chủ shop — **chưa chạy thử trên trình duyệt**.
- Luồng lưu cấu hình từ admin → hiển thị ngoài site: chưa ghi thử vào DB thật.
- Deploy preview/production trên Vercel: chưa deploy (không tự deploy). Fallback `VERCEL_PROJECT_PRODUCTION_URL` và `noindex` preview chỉ kiểm bằng code + tài liệu Vercel.
- Không có Search Console/CrUX → chưa có dữ liệu index/organic/field.
- Rich Results Test / Schema validator cần URL public.
- Rate limit là in-memory theo instance (đủ cho traffic nhỏ; nhiều instance cần Redis/Upstash).
- Không có hệ thống lịch trống/đặt trùng máy thuê — shop kiểm tra thủ công khi gọi xác nhận.

## Rủi ro còn lại

- **Trang chủ trên điện thoại yếu:** lab TBT ~3,4 s khi scene 3D khởi tạo (sau khi nội dung đã hiện). Máy rất yếu/Save-Data đã tự bỏ 3D; nếu số liệu thật xấu, tắt 3D trong **Admin → Cài đặt → Giao diện**.
- Project Supabase dùng chung với app khác: mọi thay đổi schema/policy cần cân nhắc cả hai app.

## Blocker trước production (cần chủ dự án)

1. **Domain chính thức** → đặt `NEXT_PUBLIC_SITE_URL` trên Vercel (Production). Nếu không đặt, site dùng domain production của project Vercel.
2. **Xác nhận quy tắc tính ngày thuê**: hiện tại = ngày trả − ngày nhận, tối thiểu 1 (30/9 → 1/10 = 1 ngày; nhận và trả cùng ngày = 1 ngày). Đây là cách khách đã được báo giá từ trước; đổi quy tắc phải sửa `lib/rental.ts` và `create_camera_order_v2` cùng lúc.
3. **Xác nhận chính sách tồn kho**: hiện chặn yêu cầu mua vượt tồn kho. Nếu shop nhận đặt trước khi hết hàng, cần bỏ điều kiện `OUT_OF_STOCK`.
4. Đăng nhập admin, thử từng tab cài đặt và các công cụ đơn hàng/sản phẩm.
5. Supabase Dashboard: bật **Leaked password protection**; cân nhắc tắt **Allow new users to sign up** nếu app nhà hàng không cần.
6. Merge branch → deploy preview → chạy lại Lighthouse/Rich Results trên URL preview → promote.
