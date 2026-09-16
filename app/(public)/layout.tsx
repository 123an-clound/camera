import type { ReactNode } from "react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { PageTransition } from "@/components/motion/page-transition";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
    </>
  );
}
