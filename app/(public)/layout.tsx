import type { ReactNode } from "react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { PageTransition } from "@/components/motion/page-transition";
import { CursorSpotlight } from "@/components/public/cursor-spotlight";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark theme-lab relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <CursorSpotlight />
      <Navbar />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
    </div>
  );
}
