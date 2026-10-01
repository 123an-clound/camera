"use client";

import { useEffect, useRef } from "react";

// Soft accent-tinted light that follows the pointer across public pages.
// Mouse/pen only, and off for reduced motion — touch users get the static page.
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    function onMove(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el!.style.setProperty("--mx", `${e.clientX}px`);
        el!.style.setProperty("--my", `${e.clientY}px`);
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div ref={ref} aria-hidden className="spotlight pointer-events-none fixed inset-0 z-30" />;
}
