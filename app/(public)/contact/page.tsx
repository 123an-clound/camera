import type { Metadata } from "next";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Liên hệ" };

export default async function ContactPage() {
  const { settings, contact } = await getSiteConfig();
  const phone = settingText(settings, "phone", "");
  const email = settingText(settings, "email", "");
  const address = settingText(settings, "address", "");
  const facebookUrl = settingText(settings, "facebook_url", "");
  const mapQuery = contact.map_query || address;
  const socials = [
    { label: "Facebook", href: facebookUrl },
    { label: "Zalo", href: contact.zalo ? `https://zalo.me/${contact.zalo}` : "" },
    { label: "Instagram", href: contact.instagram },
    { label: "TikTok", href: contact.tiktok },
    { label: "YouTube", href: contact.youtube },
  ].filter((s) => s.href);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Liên hệ</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 text-muted-foreground">
          {phone && (
            <p>
              Điện thoại: <a href={`tel:${phone}`} className="text-foreground hover:underline">{phone}</a>
            </p>
          )}
          {email && (
            <p>
              Email: <a href={`mailto:${email}`} className="text-foreground hover:underline">{email}</a>
            </p>
          )}
          {address && <p>Địa chỉ: {address}</p>}
          {socials.length > 0 && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="text-foreground hover:text-primary">
                  {s.label}
                </a>
              ))}
            </p>
          )}
        </div>
        {contact.opening_hours && (
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Giờ mở cửa</h2>
            <p className="mt-2 whitespace-pre-line text-foreground">{contact.opening_hours}</p>
          </div>
        )}
      </div>
      {mapQuery && (
        <iframe
          title="Bản đồ cửa hàng"
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
          className="h-80 w-full rounded-xl border border-border/60"
          loading="lazy"
        />
      )}
    </div>
  );
}
