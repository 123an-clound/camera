"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

export function MagneticButton({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof motion.button> & { children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 300, damping: 20, mass: 0.5 });
  const y = useSpring(0, { stiffness: 300, damping: 20, mass: 0.5 });

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      className={className}
      style={reducedMotion ? undefined : { x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}
