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

// Accent presets for the light "Soft Film" public theme. Each primary keeps ≥4.5:1 contrast
// with white text and with the cream background (#FFF7F0), so it is safe for buttons and links.
export const ACCENTS = {
  strawberry: { label: "Hồng dâu", primary: "#cc2f63", foreground: "#ffffff" },
  lilac: { label: "Tím lilac", primary: "#7a55d6", foreground: "#ffffff" },
  peach: { label: "Cam đào", primary: "#b8482a", foreground: "#ffffff" },
  mint: { label: "Xanh mint", primary: "#1a7f65", foreground: "#ffffff" },
  honey: { label: "Vàng mật ong", primary: "#8f6300", foreground: "#ffffff" },
} as const;
export type AccentName = keyof typeof ACCENTS;

export const HOME_SECTIONS = {
  hero: "Hero (collage ảnh)",
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
  theme: z.object({
    accent: z.enum(Object.keys(ACCENTS) as [AccentName, ...AccentName[]]),
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
    response_time: text(120),
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
  theme: "cfg_theme",
  nav: "cfg_nav",
  footer: "cfg_footer",
  contact: "cfg_contact",
  seo: "cfg_seo",
  about: "cfg_about",
};

export const DEFAULTS: SiteConfigGroups = {
  home: {
    hero_kicker: "✦ Cho thuê & bán máy ảnh xinh",
    cta_primary_label: "Thuê máy ngay",
    cta_primary_href: "/products?mode=rent",
    cta_secondary_label: "Mua máy",
    cta_secondary_href: "/products?mode=sale",
    sections: (Object.keys(HOME_SECTIONS) as HomeSectionId[]).map((id) => ({ id, enabled: true })),
    featured_title: "Sản phẩm nổi bật",
    sale_title: "Máy ảnh bán",
    rent_title: "Máy ảnh cho thuê",
    steps_kicker: "Quy trình thuê",
    steps_title: "Ba bước là có máy xinh",
    steps: [
      { title: "Chọn máy", body: "Lọc theo hãng, ngàm và ngân sách. Mỗi máy ghi rõ tình trạng và shutter count." },
      { title: "Đặt lịch", body: "Chọn ngày nhận và trả, gửi yêu cầu. Shop xác nhận qua điện thoại trong ngày." },
      { title: "Nhận máy & bấm", body: "Nhận máy đã vệ sinh, sạc đầy pin, đủ phụ kiện. Trả máy đúng hẹn là xong." },
    ],
  },
  theme: {
    accent: "strawberry",
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
    exif: "Chụp thật xinh, sống thật vui ♡",
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
    response_time: "",
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
