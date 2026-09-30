import Link from "next/link";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";

export async function Footer() {
  const { settings, footer, contact } = await getSiteConfig();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const phone = settingText(settings, "phone", "");
  const address = settingText(settings, "address", "");
  const facebookUrl = settingText(settings, "facebook_url", "");
  const socials = [
    { label: "Facebook", href: facebookUrl },
    { label: "Instagram", href: contact.instagram },
    { label: "TikTok", href: contact.tiktok },
    { label: "YouTube", href: contact.youtube },
    { label: "Zalo", href: contact.zalo ? `https://zalo.me/${contact.zalo}` : "" },
  ].filter((s) => s.href);

  return (
    <footer className="relative border-t border-border/60 bg-card/40">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      {footer.tagline && (
        <div className="mx-auto max-w-6xl px-4 pt-12">
          <p className="max-w-xl font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{footer.tagline}</p>
        </div>
      )}
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">{storeName}</p>
          {address && <p>{address}</p>}
          {contact.opening_hours && <p className="mt-1 whitespace-pre-line">{contact.opening_hours}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {phone && <a href={`tel:${phone}`}>{phone}</a>}
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:text-foreground">
              {s.label}
            </a>
          ))}
          {footer.links.map((l) => (
            <Link key={`${l.label}${l.href}`} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          © {new Date().getFullYear()} {storeName}
          {footer.exif && ` · ${footer.exif}`}
        </p>
      </div>
    </footer>
  );
}
