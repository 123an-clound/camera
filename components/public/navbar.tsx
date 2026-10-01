import Image from "next/image";
import Link from "next/link";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";
import { CartBadge } from "@/components/public/cart-badge";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavLinks } from "@/components/public/nav-links";

export async function Navbar() {
  const { settings, nav } = await getSiteConfig();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const logoUrl = settingText(settings, "logo_url", "");

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-border bg-card/85 pl-3 pr-2 shadow-[0_8px_24px_-16px_rgb(59_42_47/0.35)] backdrop-blur-xl md:pl-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          <Image src={logoUrl || "/icon.png"} alt="" width={32} height={32} className="rounded-full object-contain" />
          {storeName}
        </Link>
        <NavLinks links={nav.links} />
        <div className="flex items-center gap-1">
          <CartBadge />
          <MobileNav links={nav.links} />
        </div>
      </div>
    </header>
  );
}
