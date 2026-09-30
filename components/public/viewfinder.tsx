import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Four viewfinder corner brackets drawn around the parent. The parent must be `relative`.
export function ViewfinderCorners({ className, size = "size-5" }: { className?: string; size?: string }) {
  const base = cn("pointer-events-none absolute border-primary", size);
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(base, "left-0 top-0 border-l-2 border-t-2")} />
      <span className={cn(base, "right-0 top-0 border-r-2 border-t-2")} />
      <span className={cn(base, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={cn(base, "bottom-0 right-0 border-b-2 border-r-2")} />
    </span>
  );
}

// Content framed like a camera viewfinder, with an optional mono HUD label.
export function Viewfinder({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <div className={cn("relative p-3", className)}>
      {children}
      <ViewfinderCorners />
      {label && (
        <span
          aria-hidden
          className="absolute -top-2.5 left-8 bg-background px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary"
        >
          {label}
        </span>
      )}
    </div>
  );
}
