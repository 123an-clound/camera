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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={32} height={32} className="rounded object-contain" />
          ) : (
            <span aria-hidden className="relative flex size-7 items-center justify-center rounded-full border border-primary/60">
              <span className="size-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
            </span>
          )}
          {storeName}
          <span aria-hidden className="hidden items-center gap-1 font-mono text-[9px] font-normal tracking-[0.25em] text-red-400 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </span>
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
