# Admin CMS upgrade — design

Date: 2026-09-30 · Status: approved in chat (user picked every option + "Sửa ngay" for security)

## Audit findings (before)
- **Critical — broken access control.** The Supabase project is shared with a restaurant app.
  Every `camera_*` write policy and the camera storage-bucket policies allowed *any*
  `authenticated` user. With sign-ups enabled, anyone could create an account with the public
  anon key and edit/delete shop data. App code only checked "is logged in".
- Warn: `auth_leaked_password_protection` disabled (dashboard setting, user action).
- `create_camera_order` is SECURITY DEFINER + anon-executable — intended (public order form).
- Much public copy (3D story, rental steps, footer, nav, section titles) is hard-coded, which
  violates the plan's rule "every public text/image must be editable from admin".

## Security fix
- `camera_admins(user_id)` allowlist + `camera_is_admin()` (SECURITY DEFINER, execute revoked
  from anon). Existing single admin account inserted.
- All camera write policies, admin-only reads (orders, order items, hidden products/banners) and
  the three camera bucket write policies now require `camera_is_admin()`. Anon read policies are
  split out so anon never evaluates the function.
- App: `requireAdmin()` guard at the top of every admin server action and the CSV route; the
  login API signs non-admins straight back out.

## Site configuration
- Keep `camera_site_settings` (key → jsonb). Existing flat keys stay. New structured groups are
  stored one key each: `cfg_home`, `cfg_story`, `cfg_theme`, `cfg_nav`, `cfg_footer`,
  `cfg_contact`, `cfg_seo`, `cfg_about`.
- `lib/site-config-schema.ts` (zod) defines every group with defaults equal to today's content;
  parsing is fail-safe (invalid/missing → defaults). URLs must be `https://` or site-relative.
- Admin Settings page → tabs: Chung · Trang chủ · Story 3D · Giao diện · Menu & Footer ·
  Liên hệ & MXH · SEO · Giới thiệu & FAQ. Repeating items use a small list editor.

## Public wiring
Theme accent preset → CSS vars on the theme wrapper; toggles for 3D story, cursor light, page
transition; announcement bar; floating call/Zalo buttons; nav + footer from config; home section
order/visibility and all copy; about FAQ; contact hours/socials/map; site + per-product SEO
(`seo_title`, `seo_description` columns) and OG image.

## Operations
Dashboard stats (30-day requests, estimated revenue, status breakdown, daily chart, top
products); order detail page with internal note (`admin_note` column), search, CSV export;
products list search/filter, inline active/featured toggles, duplicate, sort order.
