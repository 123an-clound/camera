"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";
import { ACCENTS, HOME_SECTIONS, type AccentName, type SiteConfigGroups } from "@/lib/site-config-schema";
import type { SiteSettings } from "@/lib/site-settings-shared";
import { Card, ConfigForm, ListEditor, TextField, Toggle } from "./kit";

const TABS = [
  ["general", "Chung"],
  ["home", "Trang chủ"],
  ["story", "Story 3D"],
  ["theme", "Giao diện"],
  ["menu", "Menu & Footer"],
  ["contact", "Liên hệ & MXH"],
  ["seo", "SEO"],
  ["about", "Giới thiệu & FAQ"],
] as const;

const LINK_HINT = "Đường dẫn nội bộ bắt đầu bằng / (vd. /products) hoặc link ngoài https://";

function HomeTab({ initial }: { initial: SiteConfigGroups["home"] }) {
  return (
    <ConfigForm group="home" initial={initial}>
      {(v, set) => (
        <>
          <Card title="Hero" hint="Tiêu đề và phụ đề lớn sửa ở tab Chung.">
            <TextField label="Dòng nhỏ phía trên tiêu đề" value={v.hero_kicker} onChange={(hero_kicker) => set({ ...v, hero_kicker })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Nút chính — chữ" value={v.cta_primary_label} onChange={(cta_primary_label) => set({ ...v, cta_primary_label })} />
              <TextField label="Nút chính — link" value={v.cta_primary_href} hint={LINK_HINT} onChange={(cta_primary_href) => set({ ...v, cta_primary_href })} />
              <TextField label="Nút phụ — chữ" value={v.cta_secondary_label} onChange={(cta_secondary_label) => set({ ...v, cta_secondary_label })} />
              <TextField label="Nút phụ — link" value={v.cta_secondary_href} onChange={(cta_secondary_href) => set({ ...v, cta_secondary_href })} />
            </div>
          </Card>
          <Card title="Bố cục trang chủ" hint="Bật/tắt và kéo thứ tự các khối.">
            <ListEditor items={v.sections} onChange={(sections) => set({ ...v, sections })} fixed>
              {(s, update) => (
                <Toggle label={HOME_SECTIONS[s.id]} checked={s.enabled} onChange={(enabled) => update({ ...s, enabled })} />
              )}
            </ListEditor>
          </Card>
          <Card title="Tiêu đề các khối sản phẩm">
            <TextField label="Sản phẩm nổi bật" value={v.featured_title} onChange={(featured_title) => set({ ...v, featured_title })} />
            <TextField label="Máy ảnh bán" value={v.sale_title} onChange={(sale_title) => set({ ...v, sale_title })} />
            <TextField label="Máy ảnh cho thuê" value={v.rent_title} onChange={(rent_title) => set({ ...v, rent_title })} />
          </Card>
          <Card title="Quy trình thuê">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Nhãn nhỏ" value={v.steps_kicker} onChange={(steps_kicker) => set({ ...v, steps_kicker })} />
              <TextField label="Tiêu đề" value={v.steps_title} onChange={(steps_title) => set({ ...v, steps_title })} />
            </div>
            <ListEditor
              items={v.steps}
              onChange={(steps) => set({ ...v, steps })}
              newItem={() => ({ title: "Bước mới", body: "" })}
              max={6}
              addLabel="Thêm bước"
            >
              {(s, update) => (
                <>
                  <TextField label="Tên bước" value={s.title} onChange={(title) => update({ ...s, title })} />
                  <TextField label="Mô tả" value={s.body} multiline onChange={(body) => update({ ...s, body })} />
                </>
              )}
            </ListEditor>
          </Card>
        </>
      )}
    </ConfigForm>
  );
}

function StoryTab({ initial }: { initial: SiteConfigGroups["story"] }) {
  return (
    <ConfigForm group="story" initial={initial}>
      {(v, set) => (
        <>
          <Card title="Dòng thông số HUD" hint="Dòng chữ nhỏ trên cùng khung ngắm.">
            <TextField label="HUD" value={v.hud} onChange={(hud) => set({ ...v, hud })} />
          </Card>
          <Card title="4 chương tách linh kiện" hint="Thứ tự cố định theo cảnh 3D: Ống kính → Màn trập → Cảm biến → Phụ kiện.">
            {v.chapters.map((c, i) => {
              const update = (next: typeof c) => set({ ...v, chapters: v.chapters.map((x, k) => (k === i ? next : x)) });
              return (
                <div key={i} className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Chương {i + 1}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Nhãn" value={c.kicker} onChange={(kicker) => update({ ...c, kicker })} />
                    <TextField label="Tiêu đề" value={c.title} onChange={(title) => update({ ...c, title })} />
                  </div>
                  <TextField label="Mô tả" value={c.body} multiline onChange={(body) => update({ ...c, body })} />
                  <TextField label="Dòng thông số" value={c.spec} onChange={(spec) => update({ ...c, spec })} />
                </div>
              );
            })}
          </Card>
          <Card title="Kết thúc (outro)">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Nhãn" value={v.outro.kicker} onChange={(kicker) => set({ ...v, outro: { ...v.outro, kicker } })} />
              <TextField label="Tiêu đề" value={v.outro.title} onChange={(title) => set({ ...v, outro: { ...v.outro, title } })} />
            </div>
            <TextField label="Mô tả" value={v.outro.body} multiline onChange={(body) => set({ ...v, outro: { ...v.outro, body } })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Nút — chữ" value={v.outro.cta_label} onChange={(cta_label) => set({ ...v, outro: { ...v.outro, cta_label } })} />
              <TextField label="Nút — link" value={v.outro.cta_href} hint={LINK_HINT} onChange={(cta_href) => set({ ...v, outro: { ...v.outro, cta_href } })} />
            </div>
          </Card>
        </>
      )}
    </ConfigForm>
  );
}

function ThemeTab({ initial }: { initial: SiteConfigGroups["theme"] }) {
  return (
    <ConfigForm group="theme" initial={initial}>
      {(v, set) => (
        <>
          <Card title="Màu nhấn">
            <div role="radiogroup" aria-label="Màu nhấn" className="flex flex-wrap gap-3">
              {(Object.entries(ACCENTS) as [AccentName, (typeof ACCENTS)[AccentName]][]).map(([name, a]) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={v.accent === name}
                  onClick={() => set({ ...v, accent: name })}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    v.accent === name ? "border-foreground" : "border-border/60"
                  }`}
                >
                  <span className="size-5 rounded-full" style={{ background: a.primary }} />
                  {a.label}
                </button>
              ))}
            </div>
          </Card>
          <Card title="Hiệu ứng">
            <Toggle
              label="Máy ảnh 3D tách linh kiện"
              hint="Tắt để trang chủ hiện bản tĩnh nhẹ hơn (hình vẽ blueprint)."
              checked={v.enable_3d}
              onChange={(enable_3d) => set({ ...v, enable_3d })}
            />
            <Toggle label="Ánh sáng theo con trỏ chuột" checked={v.enable_spotlight} onChange={(enable_spotlight) => set({ ...v, enable_spotlight })} />
            <Toggle label="Hiệu ứng chuyển trang" checked={v.enable_transition} onChange={(enable_transition) => set({ ...v, enable_transition })} />
          </Card>
          <Card title="Thanh thông báo đầu trang">
            <Toggle label="Hiển thị" checked={v.announcement_enabled} onChange={(announcement_enabled) => set({ ...v, announcement_enabled })} />
            <TextField
              label="Nội dung"
              value={v.announcement_text}
              maxLength={160}
              placeholder="Giảm 20% thuê máy cuối tuần!"
              onChange={(announcement_text) => set({ ...v, announcement_text })}
            />
            <TextField label="Link (tuỳ chọn)" value={v.announcement_link} hint={LINK_HINT} onChange={(announcement_link) => set({ ...v, announcement_link })} />
          </Card>
        </>
      )}
    </ConfigForm>
  );
}

function LinkRows({
  items,
  onChange,
  max,
}: {
  items: { label: string; href: string }[];
  onChange: (items: { label: string; href: string }[]) => void;
  max: number;
}) {
  return (
    <ListEditor items={items} onChange={onChange} newItem={() => ({ label: "Mục mới", href: "/" })} max={max} addLabel="Thêm link">
      {(l, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Nhãn" value={l.label} onChange={(label) => update({ ...l, label })} />
          <TextField label="Link" value={l.href} onChange={(href) => update({ ...l, href })} />
        </div>
      )}
    </ListEditor>
  );
}

function MenuTab({ nav, footer }: { nav: SiteConfigGroups["nav"]; footer: SiteConfigGroups["footer"] }) {
  return (
    <div className="space-y-8">
      <ConfigForm group="nav" initial={nav}>
        {(v, set) => (
          <Card title="Menu điều hướng" hint={LINK_HINT}>
            <LinkRows items={v.links} onChange={(links) => set({ links })} max={8} />
          </Card>
        )}
      </ConfigForm>
      <ConfigForm group="footer" initial={footer}>
        {(v, set) => (
          <Card title="Footer">
            <TextField label="Câu slogan" value={v.tagline} multiline onChange={(tagline) => set({ ...v, tagline })} />
            <TextField label="Dòng thông số cuối trang" value={v.exif} onChange={(exif) => set({ ...v, exif })} />
            <LinkRows items={v.links} onChange={(links) => set({ ...v, links })} max={8} />
          </Card>
        )}
      </ConfigForm>
    </div>
  );
}

function ContactTab({ initial }: { initial: SiteConfigGroups["contact"] }) {
  return (
    <ConfigForm group="contact" initial={initial}>
      {(v, set) => (
        <>
          <Card title="Mạng xã hội" hint="SĐT, email, địa chỉ, Facebook sửa ở tab Chung.">
            <TextField label="Số Zalo" value={v.zalo} placeholder="0901234567" hint="Chỉ gồm chữ số." onChange={(zalo) => set({ ...v, zalo })} />
            <TextField label="Instagram" value={v.instagram} placeholder="https://instagram.com/..." onChange={(instagram) => set({ ...v, instagram })} />
            <TextField label="TikTok" value={v.tiktok} placeholder="https://tiktok.com/@..." onChange={(tiktok) => set({ ...v, tiktok })} />
            <TextField label="YouTube" value={v.youtube} placeholder="https://youtube.com/@..." onChange={(youtube) => set({ ...v, youtube })} />
          </Card>
          <Card title="Cửa hàng">
            <TextField
              label="Giờ mở cửa"
              value={v.opening_hours}
              multiline
              placeholder={"T2–T6: 8:00–20:00\nT7–CN: 9:00–18:00"}
              onChange={(opening_hours) => set({ ...v, opening_hours })}
            />
            <TextField
              label="Vị trí bản đồ"
              value={v.map_query}
              hint="Tên/địa chỉ để Google Maps tìm. Để trống sẽ dùng địa chỉ ở tab Chung."
              onChange={(map_query) => set({ ...v, map_query })}
            />
            <Toggle
              label="Nút gọi / Zalo nổi góc màn hình"
              checked={v.floating_buttons}
              onChange={(floating_buttons) => set({ ...v, floating_buttons })}
            />
          </Card>
        </>
      )}
    </ConfigForm>
  );
}

function SeoTab({ initial }: { initial: SiteConfigGroups["seo"] }) {
  return (
    <ConfigForm group="seo" initial={initial} multipart>
      {(v, set) => (
        <Card title="SEO toàn trang" hint="Để trống sẽ dùng tên cửa hàng và mô tả mặc định. SEO từng sản phẩm sửa trong trang sản phẩm.">
          <TextField label="Tiêu đề trang (≤ 60 ký tự)" value={v.title} maxLength={70} onChange={(title) => set({ ...v, title })} />
          <TextField
            label="Mô tả (≤ 160 ký tự)"
            value={v.description}
            multiline
            maxLength={170}
            onChange={(description) => set({ ...v, description })}
          />
          <TextField label="Từ khoá (phân cách bằng dấu phẩy)" value={v.keywords} onChange={(keywords) => set({ ...v, keywords })} />
          <div className="space-y-1">
            <Label htmlFor="og_image_file">Ảnh chia sẻ mạng xã hội (1200×630)</Label>
            {v.og_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.og_image} alt="Ảnh chia sẻ hiện tại" className="h-24 rounded-md border border-border/60 object-cover" />
            )}
            <Input id="og_image_file" name="og_image_file" type="file" accept="image/*" />
          </div>
        </Card>
      )}
    </ConfigForm>
  );
}

function AboutTab({ initial }: { initial: SiteConfigGroups["about"] }) {
  return (
    <ConfigForm group="about" initial={initial}>
      {(v, set) => (
        <>
          <Card title="Điểm nổi bật" hint="Hiện dạng thẻ trên trang Giới thiệu. Đoạn giới thiệu chính sửa ở tab Chung.">
            <ListEditor
              items={v.highlights}
              onChange={(highlights) => set({ ...v, highlights })}
              newItem={() => ({ title: "Điểm nổi bật", body: "" })}
              max={6}
              addLabel="Thêm điểm nổi bật"
            >
              {(h, update) => (
                <>
                  <TextField label="Tiêu đề" value={h.title} onChange={(title) => update({ ...h, title })} />
                  <TextField label="Mô tả" value={h.body} multiline onChange={(body) => update({ ...h, body })} />
                </>
              )}
            </ListEditor>
          </Card>
          <Card title="Câu hỏi thường gặp (FAQ)">
            <ListEditor
              items={v.faq}
              onChange={(faq) => set({ ...v, faq })}
              newItem={() => ({ q: "Câu hỏi mới?", a: "" })}
              max={20}
              addLabel="Thêm câu hỏi"
            >
              {(f, update) => (
                <>
                  <TextField label="Câu hỏi" value={f.q} onChange={(q) => update({ ...f, q })} />
                  <TextField label="Trả lời" value={f.a} multiline onChange={(a) => update({ ...f, a })} />
                </>
              )}
            </ListEditor>
          </Card>
        </>
      )}
    </ConfigForm>
  );
}

export function SettingsTabs({ settings, config }: { settings: SiteSettings; config: SiteConfigGroups }) {
  return (
    <Tabs defaultValue="general">
      <TabsList className="h-auto flex-wrap">
        {TABS.map(([value, label]) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="general" className="pt-4">
        <SettingsForm settings={settings} />
      </TabsContent>
      <TabsContent value="home" className="pt-4">
        <HomeTab initial={config.home} />
      </TabsContent>
      <TabsContent value="story" className="pt-4">
        <StoryTab initial={config.story} />
      </TabsContent>
      <TabsContent value="theme" className="pt-4">
        <ThemeTab initial={config.theme} />
      </TabsContent>
      <TabsContent value="menu" className="pt-4">
        <MenuTab nav={config.nav} footer={config.footer} />
      </TabsContent>
      <TabsContent value="contact" className="pt-4">
        <ContactTab initial={config.contact} />
      </TabsContent>
      <TabsContent value="seo" className="pt-4">
        <SeoTab initial={config.seo} />
      </TabsContent>
      <TabsContent value="about" className="pt-4">
        <AboutTab initial={config.about} />
      </TabsContent>
    </Tabs>
  );
}
