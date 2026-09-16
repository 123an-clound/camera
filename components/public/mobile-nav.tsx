"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/nav-links";
import { useIsNavActive } from "@/lib/use-nav-active";

function MobileNavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  const active = useIsNavActive(href);

  return (
    <Link href={href} onClick={onNavigate}>
      <motion.span
        whileTap={{ scale: 0.97 }}
        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {label}
      </motion.span>
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-16 z-40 flex flex-col gap-1 border-b border-border/60 bg-background p-4 shadow-sm">
          {NAV_LINKS.map((link) => (
            <MobileNavLink key={link.href} href={link.href} label={link.label} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
      )}
    </div>
  );
}
