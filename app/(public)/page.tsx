import { HeroStory, HomeBanners } from "@/components/public/hero";
import { ProductCard } from "@/components/public/product-card";
import { FadeIn } from "@/components/motion/fade-in";
import { RentalSteps } from "@/components/public/rental-steps";
import { getFeaturedProducts, listProducts } from "@/lib/products";
import type { ProductWithImages } from "@/lib/types";
import { getSiteConfig } from "@/lib/site-config";
import type { HomeSectionId } from "@/lib/site-config-schema";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

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
  const { home } = await getSiteConfig();
  const enabled = home.sections.filter((sec) => sec.enabled).map((sec) => sec.id);
  const has = (id: HomeSectionId) => enabled.includes(id);

  // Only query the product lists that are actually shown.
  const [featured, forSale, forRent] = await Promise.all([
    has("featured") ? getFeaturedProducts(8) : [],
    has("sale") ? listProducts({ mode: "sale", sort: "newest" }).then((p) => p.slice(0, 4)) : [],
    has("rent") ? listProducts({ mode: "rent", sort: "newest" }).then((p) => p.slice(0, 4)) : [],
  ]);

  // Running "01 / 02 / …" numbers across the visible content sections.
  let n = 0;
  const render: Record<HomeSectionId, () => React.ReactNode> = {
    story: () => <HeroStory key="story" />,
    banners: () => <HomeBanners key="banners" />,
    featured: () => (
      <ProductSection key="featured" index={++n} title={home.featured_title} href="/products" products={featured} emptyText="Chưa có sản phẩm nổi bật." />
    ),
    sale: () => (
      <ProductSection key="sale" index={++n} title={home.sale_title} href="/products?mode=sale" products={forSale} emptyText="Chưa có sản phẩm đang bán." />
    ),
    rent: () => (
      <ProductSection key="rent" index={++n} title={home.rent_title} href="/products?mode=rent" products={forRent} emptyText="Chưa có sản phẩm cho thuê." />
    ),
    steps: () => <RentalSteps key="steps" index={++n} kicker={home.steps_kicker} title={home.steps_title} steps={home.steps} />,
  };

  return <div>{enabled.map((id) => render[id]())}</div>;
}
