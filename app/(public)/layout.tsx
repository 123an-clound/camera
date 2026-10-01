import type { CSSProperties, ReactNode } from "react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { PageTransition } from "@/components/motion/page-transition";
import { CursorSpotlight } from "@/components/public/cursor-spotlight";
import { AnnouncementBar } from "@/components/public/announcement-bar";
import { FloatingContact } from "@/components/public/floating-contact";
import { Analytics } from "@/components/public/analytics";
import { getSiteConfig } from "@/lib/site-config";
import { ACCENTS } from "@/lib/site-config-schema";
import { settingText } from "@/lib/site-settings";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { theme, contact, settings } = await getSiteConfig();
  const accent = ACCENTS[theme.accent];
  // Admin-chosen accent overrides the .theme-lab defaults (see globals.css).
  const accentVars = {
    "--primary": accent.primary,
    "--primary-foreground": accent.foreground,
    "--ring": accent.primary,
  } as CSSProperties;
  const main = <main className="flex-1">{children}</main>;

  return (
    <div
      className="theme-lab relative flex min-h-full flex-1 flex-col bg-background text-foreground"
      style={accentVars}
    >
      {theme.enable_spotlight && <CursorSpotlight />}
      {theme.announcement_enabled && theme.announcement_text && (
        <AnnouncementBar text={theme.announcement_text} href={theme.announcement_link} />
      )}
      <Navbar />
      {theme.enable_transition ? <PageTransition>{main}</PageTransition> : main}
      <Footer />
      <Analytics />
      {contact.floating_buttons && (
        <>
          {/* Room so the last content/footer can scroll clear of the floating buttons on phones. */}
          <div aria-hidden className="h-24 bg-secondary md:hidden" />
          <FloatingContact phone={settingText(settings, "phone", "")} zalo={contact.zalo} />
        </>
      )}
    </div>
  );
}
