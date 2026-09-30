// Canonical site origin for sitemap, robots, canonical links and Open Graph.
// Priority: explicit NEXT_PUBLIC_SITE_URL (set this to the official domain) → the project's
// production domain that Vercel exposes on every deployment → localhost for local dev.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

// Only the production deployment may be indexed; Vercel previews and local builds must not.
export const IS_INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
