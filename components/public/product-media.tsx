"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Rotate3d, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeImage } from "@/components/public/fade-image";
import type { ProductImage } from "@/lib/types";

const ProductViewer3D = dynamic(() => import("@/components/public/product-viewer-3d"), {
  ssr: false,
  loading: () => <Skeleton className="aspect-square rounded-xl" />,
});

export function ProductMedia({
  images,
  modelUrl,
  name,
}: {
  images: ProductImage[];
  modelUrl: string | null;
  name: string;
}) {
  // Default to images: the 3D viewer pulls in three.js + WebGL and shouldn't
  // load/render until the user explicitly asks for it (mục 12.1). A prominent
  // overlay CTA (not a plain small button) keeps it discoverable.
  const [tab, setTab] = useState<"images" | "3d">("images");
  const [activeImage, setActiveImage] = useState(0);
  const reducedMotion = useReducedMotion();

  if (tab === "3d" && modelUrl) {
    return (
      <div className="space-y-3">
        <ProductViewer3D modelUrl={modelUrl} />
        <button
          onClick={() => setTab("images")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ImageIcon className="size-4" />
          Xem ảnh thường
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {images[activeImage] ? (
          <Image
            src={images[activeImage].url}
            alt={images[activeImage].alt ?? name}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có ảnh</div>
        )}

        {modelUrl && (
          <button
            onClick={() => setTab("3d")}
            className="group absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-5 pt-10 text-white"
          >
            <motion.span
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm group-hover:bg-white/25"
            >
              <Rotate3d className="size-5" />
            </motion.span>
            <span className="font-medium">Xem mô hình 3D xoay 360°</span>
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === activeImage ? "border-primary" : "border-transparent"
              }`}
            >
              <FadeImage src={img.url} alt={img.alt ?? name} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
