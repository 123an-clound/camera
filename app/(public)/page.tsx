import { Hero } from "@/components/public/hero";
import { ProductCard } from "@/components/public/product-card";
import { FadeIn } from "@/components/motion/fade-in";
import { getFeaturedProducts, listProducts } from "@/lib/products";
import type { ProductWithImages } from "@/lib/types";

function ProductSection({
  title,
  href,
  products,
  emptyText,
}: {
  title: string;
  href: string;
  products: ProductWithImages[];
  emptyText: string;
}) {
  return (
    <FadeIn className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <a href={href} className="text-sm text-muted-foreground hover:text-foreground">
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
        title="Sản phẩm nổi bật"
        href="/products"
        products={featured}
        emptyText="Chưa có sản phẩm nổi bật."
      />
      <ProductSection
        title="Máy ảnh bán"
        href="/products?mode=sale"
        products={forSale}
        emptyText="Chưa có sản phẩm đang bán."
      />
      <ProductSection
        title="Máy ảnh cho thuê"
        href="/products?mode=rent"
        products={forRent}
        emptyText="Chưa có sản phẩm cho thuê."
      />
    </div>
  );
}
