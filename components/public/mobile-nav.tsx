"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/products?mode=rent", label: "Cho thuê" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/contact", label: "Liên hệ" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-16 z-40 flex flex-col gap-1 border-b border-border/60 bg-background p-4 shadow-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
