"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Curtain wipe: a solid panel sweeps down to fully cover the viewport, the
// new route's content swaps in underneath while hidden, then the panel
// continues sweeping off the bottom to reveal it (mục 6 — "curtain/overlay
// quét qua" instead of a plain fade).
const COVER_DURATION = 0.22;
const REVEAL_DURATION = 0.32;
const EASE_IN = [0.65, 0, 0.35, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const [shown, setShown] = useState(children);
  const childrenRef = useRef(children);
  const isFirstRender = useRef(true);

  useEffect(() => {
    childrenRef.current = children;
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setShown(childrenRef.current);
      return;
    }
    if (reducedMotion) {
      setShown(childrenRef.current);
      return;
    }

    let cancelled = false;
    async function sweep() {
      await controls.start({ y: "0%", transition: { duration: COVER_DURATION, ease: EASE_IN } });
      if (cancelled) return;
      setShown(childrenRef.current);
      await controls.start({ y: "100%", transition: { duration: REVEAL_DURATION, ease: EASE_OUT } });
      if (cancelled) return;
      controls.set({ y: "-100%" });
    }
    sweep();
    return () => {
      cancelled = true;
    };
  }, [pathname, reducedMotion, controls]);

  return (
    <>
      {shown}
      {!reducedMotion && (
        <motion.div
          aria-hidden
          initial={{ y: "-100%" }}
          animate={controls}
          className="pointer-events-none fixed inset-0 z-[60] bg-neutral-900"
        />
      )}
    </>
  );
}
