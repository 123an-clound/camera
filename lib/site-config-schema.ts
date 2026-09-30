import { z } from "zod";

// Structured, admin-editable site configuration. Each group is stored as one jsonb row in
// camera_site_settings (key = CONFIG_KEYS[group]). Defaults mirror the shipped content, so a
// missing or invalid row never breaks the public site. Pure module (no server imports) so it
// can be self-checked with plain Node: node lib/site-config.check.mjs

const text = (max: number) => z.string().trim().max(max);

// Links rendered as <a href>: site-relative path or https only (blocks javascript:, data:, …).
const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^\/(?!\/)/.test(v) || /^https:\/\//i.test(v), "Link phải bắt đầu bằng / hoặc https://");
const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\//i.test(v), "Link phải bắt đầu bằng https://");

export const ACCENTS = {
  amber: { label: "Cam hổ phách", primary: "oklch(0.8 0.16 70)", foreground: "oklch(0.18 0.02 60)" },
  cyan: { label: "Xanh cyan", primary: "oklch(0.8 0.13 210)", foreground: "oklch(0.18 0.03 220)" },
  lime: { label: "Xanh chanh", primary: "oklch(0.86 0.18 130)", foreground: "oklch(0.2 0.04 130)" },
  rose: { label: "Hồng đỏ", primary: "oklch(0.72 0.17 12)", foreground: "oklch(0.98 0.01 12)" },
  violet: { label: "Tím", primary: "oklch(0.72 0.16 295)", foreground: "oklch(0.98 0.01 295)" },
} as const;
export type AccentName = keyof typeof ACCENTS;

export const HOME_SECTIONS = {
  story: "Story 3D (hero)",
  banners: "Banner",
  featured: "Sản phẩm nổi bật",
  sale: "Máy ảnh bán",
  rent: "Máy ảnh cho thuê",
  steps: "Quy trình thuê",
} as const;
export type HomeSectionId = keyof typeof HOME_SECTIONS;

const linkItem = z.object({ label: text(40).min(1, "Nhãn không được trống"), href: link.refine((v) => v !== "", "Link không được trống") });
const titledText = z.object({ title: text(80).min(1, "Tiêu đề không được trống"), body: text(400) });

export const schemas = {
  home: z.object({
    hero_kicker: text(80),
    cta_primary_label: text(40),
    cta_primary_href: link,
    cta_secondary_label: text(40),
    cta_secondary_href: link,
    sections: z
      .array(z.object({ id: z.enum(Object.keys(HOME_SECTIONS) as [HomeSectionId, ...HomeSectionId[]]), enabled: z.boolean() }))
      .length(Object.keys(HOME_SECTIONS).length)
      .refine((s) => new Set(s.map((x) => x.id)).size === s.length, "Section bị trùng"),
    featured_title: text(80),
    sale_title: text(80),
    rent_title: text(80),
    steps_kicker: text(60),
    steps_title: text(80),
    steps: z.array(titledText).min(1).max(6),
  }),
  story: z.object({
    hud: text(80),
    chapters: z
      .array(z.object({ kicker: text(40), title: text(80), body: text(300), spec: text(80) }))
      .length(4, "Story luôn có đúng 4 chương (khớp 4 cảnh tách linh kiện)"),
    outro: z.object({ kicker: text(40), title: text(80), body: text(300), cta_label: text(40), cta_href: link }),
  }),
  theme: z.object({
    accent: z.enum(Object.keys(ACCENTS) as [AccentName, ...AccentName[]]),
    enable_3d: z.boolean(),
    enable_spotlight: z.boolean(),
    enable_transition: z.boolean(),
    announcement_enabled: z.boolean(),
    announcement_text: text(160),
    announcement_link: link,
  }),
  nav: z.object({ links: z.array(linkItem).min(1).max(8) }),
  footer: z.object({ tagline: text(160), exif: text(80), links: z.array(linkItem).max(8) }),
  contact: z.object({
    zalo: z
      .string()
      .trim()
      .max(20)
      .refine((v) => v === "" || /^\d{8,15}$/.test(v), "Số Zalo chỉ gồm 8–15 chữ số"),
    instagram: httpsUrl,
    tiktok: httpsUrl,
    youtube: httpsUrl,
    opening_hours: text(300),
    map_query: text(200),
    floating_buttons: z.boolean(),
  }),
  seo: z.object({
    title: text(70),
    description: text(170),
    keywords: text(200),
    og_image: httpsUrl,
  }),
  about: z.object({
    highlights: z.array(titledText).max(6),
    faq: z.array(z.object({ q: text(200).min(1, "Câu hỏi không được trống"), a: text(1000) })).max(20),
  }),
};

export type ConfigGroup = keyof typeof schemas;
export type SiteConfigGroups = { [K in ConfigGroup]: z.infer<(typeof schemas)[K]> };

export const CONFIG_KEYS: Record<ConfigGroup, string> = {
  home: "cfg_home",
  story: "cfg_story",
  theme: "cfg_theme",
  nav: "cfg_nav",
  footer: "cfg_footer",
  contact: "cfg_contact",
  seo: "cfg_seo",
  about: "cfg_about",
};

export const DEFAULTS: SiteConfigGroups = {
  home: {
    hero_kicker: "● Optical Lab · Bán & cho thuê",
    cta_primary_label: "Thuê máy ngay",
    cta_primary_href: "/products?mode=rent",
    cta_secondary_label: "Mua máy",
    cta_secondary_href: "/products?mode=sale",
    sections: (Object.keys(HOME_SECTIONS) as HomeSectionId[]).map((id) => ({ id, enabled: true })),
    featured_title: "Sản phẩm nổi bật",
    sale_title: "Máy ảnh bán",
    rent_title: "Máy ảnh cho thuê",
    steps_kicker: "Quy trình thuê",
    steps_title: "Ba bước, một khung hình",
    steps: [
      { title: "Chọn máy", body: "Lọc theo hãng, ngàm và ngân sách. Mỗi máy ghi rõ tình trạng và shutter count." },
      { title: "Đặt lịch", body: "Chọn ngày nhận và trả, gửi yêu cầu. Shop xác nhận qua điện thoại trong ngày." },
      { title: "Nhận máy & bấm", body: "Nhận máy đã vệ sinh, sạc đầy pin, đủ phụ kiện. Trả máy đúng hẹn là xong." },
    ],
  },
  story: {
    hud: "FUJIFILM X-T5 · ISO 125 · 1/250 · ƒ/2.8",
    chapters: [
      {
        kicker: "Ống kính",
        title: "Soi từng thấu kính",
        body: "Mỗi ống kính được kiểm tra nấm mốc, bụi và hiệu chỉnh lấy nét trước và sau mỗi lượt thuê.",
        spec: "XF18-55mm · 14 thấu kính · 7 lá khẩu",
      },
      {
        kicker: "Màn trập",
        title: "Shutter count minh bạch",
        body: "Số lần chụp được ghi rõ trên từng máy, bạn biết chính xác thiết bị mình nhận.",
        spec: "1/8000s cơ · 1/180000s điện tử",
      },
      {
        kicker: "Cảm biến",
        title: "Cảm biến sạch như mới",
        body: "Vệ sinh cảm biến định kỳ, không một hạt bụi nào lọt vào khung hình của bạn.",
        spec: "X-Trans CMOS 5 HR · 40.2MP · IBIS 7 stop",
      },
      {
        kicker: "Phụ kiện",
        title: "Đủ bộ, sẵn sàng bấm máy",
        body: "Mỗi lượt thuê kèm 2 pin NP-W235 sạc đầy, sạc, thẻ nhớ 128GB và túi chống sốc.",
        spec: "2× NP-W235 · 128GB · túi",
      },
    ],
    outro: {
      kicker: "Sẵn sàng",
      title: "Khung hình tiếp theo là của bạn",
      body: "Hàng chục thân máy và ống kính đã được kiểm tra, sẵn sàng giao trong ngày.",
      cta_label: "Khám phá kho máy",
      cta_href: "/products",
    },
  },
  theme: {
    accent: "amber",
    enable_3d: true,
    enable_spotlight: true,
    enable_transition: true,
    announcement_enabled: false,
    announcement_text: "",
    announcement_link: "",
  },
  nav: {
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Sản phẩm", href: "/products" },
      { label: "Cho thuê", href: "/products?mode=rent" },
      { label: "Giới thiệu", href: "/about" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
  footer: {
    tagline: "Mỗi khung hình đẹp bắt đầu từ một chiếc máy được chăm chút.",
    exif: "ISO 100 · 1/250s · ƒ/1.8 · AWB",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
  contact: {
    zalo: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    opening_hours: "",
    map_query: "",
    floating_buttons: true,
  },
  seo: { title: "", description: "", keywords: "", og_image: "" },
  about: { highlights: [], faq: [] },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Fail-safe read: merge the stored object over the defaults and validate; anything invalid
// falls back to defaults so a bad row can never take the public site down.
export function parseGroup<K extends ConfigGroup>(group: K, raw: unknown): SiteConfigGroups[K] {
  const merged = isObject(raw) ? { ...DEFAULTS[group], ...raw } : DEFAULTS[group];
  const result = schemas[group].safeParse(merged);
  return (result.success ? result.data : DEFAULTS[group]) as SiteConfigGroups[K];
}

// Strict write: used by the admin save action, returns the first human-readable issue.
export function validateGroup<K extends ConfigGroup>(
  group: K,
  input: unknown
): { data: SiteConfigGroups[K] } | { error: string } {
  const result = schemas[group].safeParse(input);
  if (result.success) return { data: result.data as SiteConfigGroups[K] };
  const issue = result.error.issues[0];
  return { error: `${issue.path.join(".") || group}: ${issue.message}` };
}
