"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/nav-links";
import { useIsNavActive } from "@/lib/use-nav-active";

function NavLink({ href, label }: { href: string; label: string }) {
  const active = useIsNavActive(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative py-1 transition-colors hover:text-foreground"
    >
      <motion.span whileTap={{ scale: 0.94 }} className={`inline-block ${active ? "text-foreground" : ""}`}>
        {label}
      </motion.span>
      {active && (
        <motion.span
          layoutId="nav-active-underline"
          className="absolute inset-x-0 -bottom-2 h-0.5 rounded-full bg-foreground"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  );
}

export function NavLinks() {
  return (
    <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
      {NAV_LINKS.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} />
      ))}
    </nav>
  );
}
