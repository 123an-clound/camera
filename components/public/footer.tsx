import Link from "next/link";
import { getSiteSettings, settingText } from "@/lib/site-settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const phone = settingText(settings, "phone", "");
  const address = settingText(settings, "address", "");
  const facebookUrl = settingText(settings, "facebook_url", "");

  return (
    <footer className="relative border-t border-border/60 bg-card/40">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <p className="max-w-xl font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Mỗi khung hình đẹp bắt đầu từ một chiếc máy được chăm chút.
        </p>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">{storeName}</p>
          {address && <p>{address}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {phone && <a href={`tel:${phone}`}>{phone}</a>}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noreferrer">
              Facebook
            </a>
          )}
          <Link href="/about">Giới thiệu</Link>
          <Link href="/contact">Liên hệ</Link>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          © {new Date().getFullYear()} {storeName} · ISO 100 · 1/250s · ƒ/1.8 · AWB
        </p>
      </div>
    </footer>
  );
}
