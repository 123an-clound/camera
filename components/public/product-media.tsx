"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  // load/render until the user explicitly asks for it (mục 12.1).
  const [tab, setTab] = useState<"images" | "3d">("images");
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="space-y-3">
      {modelUrl && (
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "3d" ? "default" : "outline"} onClick={() => setTab("3d")}>
            Xem 3D
          </Button>
          <Button size="sm" variant={tab === "images" ? "default" : "outline"} onClick={() => setTab("images")}>
            Ảnh
          </Button>
        </div>
      )}

      {tab === "3d" && modelUrl ? (
        <ProductViewer3D modelUrl={modelUrl} />
      ) : (
        <div className="space-y-2">
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
                  <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
