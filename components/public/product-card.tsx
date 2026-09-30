"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { FadeImage } from "@/components/public/fade-image";
import { ViewfinderCorners } from "@/components/public/viewfinder";
import { formatVND } from "@/lib/format";
import type { ProductWithImages } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithImages }) {
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 25 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    // Pointer position drives the glowing border (a static light, so kept for reduced motion too).
    e.currentTarget.style.setProperty("--cx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--cy", `${e.clientY - rect.top}px`);
    if (reducedMotion) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const primaryImage =
    product.camera_product_images.find((img) => img.is_primary) ?? product.camera_product_images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 800 }}
        className="relative rounded-xl bg-border/70 p-px"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(260px circle at var(--cx) var(--cy), var(--primary), transparent 45%)" }}
        />
        <div className="relative overflow-hidden rounded-[11px] bg-card">
          <div className="relative aspect-square bg-muted">
            {primaryImage ? (
              <FadeImage
                src={primaryImage.url}
                alt={primaryImage.alt ?? product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có ảnh</div>
            )}
            <ViewfinderCorners className="inset-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" size="size-4" />
            <div className="absolute left-2 top-2 flex gap-1.5">
              {product.is_for_sale && <Badge>Bán</Badge>}
              {product.is_for_rent && <Badge variant="secondary">Cho thuê</Badge>}
            </div>
          </div>
          <div className="space-y-1 p-3">
            {product.brand && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.brand}</p>
            )}
            <p className="line-clamp-1 font-medium">{product.name}</p>
            <div className="flex flex-wrap gap-x-3 font-mono text-sm">
              {product.is_for_sale && product.sale_price != null && (
                <span className="font-semibold text-primary">{formatVND(product.sale_price)}</span>
              )}
              {product.is_for_rent && product.rent_price_day != null && (
                <span className="text-muted-foreground">{formatVND(product.rent_price_day)}/ngày</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
