import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMedia } from "@/components/public/product-media";
import { AddToCart } from "@/components/public/add-to-cart";
import { ProductCard } from "@/components/public/product-card";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site-url";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.camera_product_images[0]?.url;
  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_desc || product.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id);
  const images = [...product.camera_product_images].sort((a, b) => a.sort_order - b.sort_order);
  const primaryImageUrl = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
  const specs = product.specs ?? {};

  // Structured data must match what's shown: a sale Offer only when the item is actually
  // for sale (a daily rental rate is not a sale price), and a condition only when stated.
  const condition = product.condition?.toLowerCase() ?? "";
  const itemCondition = !condition
    ? undefined
    : /mới 100|new|chưa qua sử dụng/.test(condition)
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_desc ?? product.description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: images.map((i) => i.url),
    offers:
      product.is_for_sale && product.sale_price != null
        ? {
            "@type": "Offer",
            priceCurrency: "VND",
            price: product.sale_price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition,
          }
        : undefined,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Sản phẩm", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };
  // Escape "<" so admin-entered text can never close the script element.
  const ld = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(jsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(breadcrumbLd)} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/products" className="hover:text-foreground">
              Sản phẩm
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="line-clamp-1 text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductMedia images={images} modelUrl={product.model_3d_url} name={product.name} />

        <div className="space-y-5">
          <div>
            {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <div className="mt-2 flex gap-2">
              {product.condition && <Badge variant="outline">{product.condition}</Badge>}
              {product.is_for_sale && <Badge>Bán</Badge>}
              {product.is_for_rent && <Badge variant="secondary">Cho thuê</Badge>}
            </div>
          </div>

          <AddToCart product={product} imageUrl={primaryImageUrl} />

          {product.short_desc && <p className="text-muted-foreground">{product.short_desc}</p>}

          {Object.keys(specs).length > 0 && (
            <div className="rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([key, value]) => (
                    <tr key={key} className="border-b border-border/60 last:border-0">
                      <td className="w-2/5 px-3 py-2 text-muted-foreground">{key}</td>
                      <td className="px-3 py-2">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.description && (
            <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground">{product.description}</div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-xl font-semibold tracking-tight">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
