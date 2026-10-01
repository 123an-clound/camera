import Link from "next/link";
import { FadeImage } from "@/components/public/fade-image";
import { filmDate } from "@/components/public/sticker";
import { formatVND } from "@/lib/format";
import type { ProductWithImages } from "@/lib/types";

// Polaroid-style product card. `priority` for cards in the first viewport (their image is
// usually the LCP element).
export function ProductCard({ product, priority = false }: { product: ProductWithImages; priority?: boolean }) {
  const primaryImage =
    product.camera_product_images.find((img) => img.is_primary) ?? product.camera_product_images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-xl bg-card p-2 pb-3 shadow-[0_1px_2px_rgb(59_42_47/0.08),0_10px_24px_-14px_rgb(59_42_47/0.3)] ring-1 ring-border/70 transition-[rotate,translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_-14px_rgb(59_42_47/0.35)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:even:hover:rotate-1 motion-safe:odd:hover:-rotate-1"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {primaryImage ? (
          <FadeImage
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có ảnh</div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {product.is_for_rent && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Cho thuê</span>
          )}
          {product.is_for_sale && (
            <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-foreground">Bán</span>
          )}
        </div>
        <span aria-hidden className="date-stamp absolute bottom-1.5 right-2 text-[10px]">
          {filmDate(product.created_at)}
        </span>
      </div>
      <div className="space-y-0.5 px-1 pt-2.5">
        {product.brand && <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>}
        <p className="line-clamp-1 font-display text-base font-bold">{product.name}</p>
        <div className="flex flex-wrap gap-x-3 text-sm">
          {product.is_for_rent && product.rent_price_day != null && (
            <span className="font-semibold text-primary">{formatVND(product.rent_price_day)}/ngày</span>
          )}
          {product.is_for_sale && product.sale_price != null && (
            <span className="text-muted-foreground">{formatVND(product.sale_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
