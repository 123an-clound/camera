"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function useIsNavActive(href: string): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [path, query] = href.split("?");

  if (path !== pathname) return false;

  const mode = searchParams.get("mode");
  if (query) return new URLSearchParams(query).get("mode") === mode;
  return !mode;
}
