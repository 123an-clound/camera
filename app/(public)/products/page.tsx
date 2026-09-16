import type { Metadata } from "next";
import { ProductCard } from "@/components/public/product-card";
import { ProductFilters } from "@/components/public/product-filters";
import { getBrands, getCategories, listProducts, type ProductFilters as Filters } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Danh sách máy ảnh, ống kính, phụ kiện bán và cho thuê.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

function parseFilters(sp: SearchParams): Filters {
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);
  const num = (key: string) => {
    const v = str(key);
    return v ? Number(v) : undefined;
  };
  return {
    category: str("category"),
    brand: str("brand"),
    mode: str("mode") as Filters["mode"],
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    q: str("q"),
    sort: (str("sort") as Filters["sort"]) ?? "newest",
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [products, categories, brands] = await Promise.all([listProducts(filters), getCategories(), getBrands()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Sản phẩm</h1>
      <ProductFilters categories={categories} brands={brands} />

      {products.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
