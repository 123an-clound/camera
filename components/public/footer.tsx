import Link from "next/link";
import { getSiteSettings, settingText } from "@/lib/site-settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const phone = settingText(settings, "phone", "");
  const address = settingText(settings, "address", "");
  const facebookUrl = settingText(settings, "facebook_url", "");

  return (
    <footer className="border-t border-border/60 bg-muted/30">
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
    </footer>
  );
}
