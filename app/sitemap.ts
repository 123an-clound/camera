import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("camera_products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/products", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));

  return [...staticRoutes, ...productRoutes];
}
