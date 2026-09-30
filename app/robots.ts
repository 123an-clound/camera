import type { MetadataRoute } from "next";
import { IS_INDEXABLE, SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Crawl hygiene only — access control is enforced by auth/RLS, not robots.txt.
      disallow: ["/admin", "/api", "/cart"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
