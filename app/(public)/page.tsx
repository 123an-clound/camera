import { Hero } from "@/components/public/hero";
import { ProductCard } from "@/components/public/product-card";
import { FadeIn } from "@/components/motion/fade-in";
import { RentalSteps } from "@/components/public/rental-steps";
import { getFeaturedProducts, listProducts } from "@/lib/products";
import type { ProductWithImages } from "@/lib/types";

function ProductSection({
  index,
  title,
  href,
  products,
  emptyText,
}: {
  index: number;
  title: string;
  href: string;
  products: ProductWithImages[];
  emptyText: string;
}) {
  return (
    <FadeIn className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
            {String(index).padStart(2, "0")} / Bộ sưu tập
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        </div>
        <a
          href={href}
          className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
        >
          Xem tất cả →
        </a>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </FadeIn>
  );
}

export default async function Home() {
  const [featured, forSale, forRent] = await Promise.all([
    getFeaturedProducts(8),
    listProducts({ mode: "sale", sort: "newest" }).then((p) => p.slice(0, 4)),
    listProducts({ mode: "rent", sort: "newest" }).then((p) => p.slice(0, 4)),
  ]);

  return (
    <div>
      <Hero />
      <ProductSection
        index={1}
        title="Sản phẩm nổi bật"
        href="/products"
        products={featured}
        emptyText="Chưa có sản phẩm nổi bật."
      />
      <ProductSection
        index={2}
        title="Máy ảnh bán"
        href="/products?mode=sale"
        products={forSale}
        emptyText="Chưa có sản phẩm đang bán."
      />
      <ProductSection
        index={3}
        title="Máy ảnh cho thuê"
        href="/products?mode=rent"
        products={forRent}
        emptyText="Chưa có sản phẩm cho thuê."
      />
      <RentalSteps />
    </div>
  );
}
