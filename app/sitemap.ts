import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("camera_products")
    .select("slug, updated_at")
    .eq("is_active", true);

  // Static pages carry no lastmod: we don't track when their content changes, and a
  // lastmod of "now" on every request would be misleading.
  const staticRoutes: MetadataRoute.Sitemap = ["", "/products", "/about", "/contact", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));

  return [...staticRoutes, ...productRoutes];
}
