"use client";

import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { deleteProductImage, setPrimaryImage } from "@/app/admin/products/actions";
import type { ProductImage } from "@/lib/types";

export function ProductImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [pending, startTransition] = useTransition();

  function handleDelete(imageId: string) {
    startTransition(async () => {
      const result = await deleteProductImage(imageId);
      if (result?.error) toast.error(result.error);
    });
  }

  function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      const result = await setPrimaryImage(productId, imageId);
      if (result?.error) toast.error(result.error);
    });
  }

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {images.map((img) => (
        <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border/60">
          <Image src={img.url} alt={img.alt ?? ""} fill sizes="(min-width: 640px) 16vw, 25vw" className="object-cover" />
          {img.is_primary && (
            <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[10px] text-primary-foreground">Chính</span>
          )}
          <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-black/40 group-hover:flex">
            {!img.is_primary && (
              <Button type="button" size="icon-sm" variant="secondary" disabled={pending} onClick={() => handleSetPrimary(img.id)}>
                <Star className="size-3.5" />
              </Button>
            )}
            <Button type="button" size="icon-sm" variant="destructive" disabled={pending} onClick={() => handleDelete(img.id)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
