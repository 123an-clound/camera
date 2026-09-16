import Image from "next/image";
import Link from "next/link";
import { getSiteSettings, settingText } from "@/lib/site-settings";
import { CartBadge } from "@/components/public/cart-badge";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavLinks } from "@/components/public/nav-links";

export async function Navbar() {
  const settings = await getSiteSettings();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const logoUrl = settingText(settings, "logo_url", "");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {logoUrl && <Image src={logoUrl} alt={storeName} width={32} height={32} className="rounded object-contain" />}
          {storeName}
        </Link>
        <NavLinks />
        <div className="flex items-center gap-1">
          <CartBadge />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
