"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/format";
import type { ProductWithImages } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithImages }) {
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 25 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
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
        className="overflow-hidden rounded-xl border border-border/60 bg-card"
      >
        <div className="relative aspect-square bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có ảnh</div>
          )}
          <div className="absolute left-2 top-2 flex gap-1.5">
            {product.is_for_sale && <Badge>Bán</Badge>}
            {product.is_for_rent && <Badge variant="secondary">Cho thuê</Badge>}
          </div>
        </div>
        <div className="space-y-1 p-3">
          {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
          <p className="line-clamp-1 font-medium">{product.name}</p>
          <div className="flex flex-wrap gap-x-3 text-sm">
            {product.is_for_sale && product.sale_price != null && (
              <span className="font-semibold">{formatVND(product.sale_price)}</span>
            )}
            {product.is_for_rent && product.rent_price_day != null && (
              <span className="text-muted-foreground">{formatVND(product.rent_price_day)}/ngày</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
