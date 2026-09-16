import type { NextConfig } from "next";

const SUPABASE_HOST = "jtizooyjnllostamffpp.supabase.co";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "media-src 'self' https://*.supabase.co",
      // blob: + www.gstatic.com: three.js/drei GLTFLoader reads embedded textures via
      // blob: URLs, and drei's Draco decoder (for compressed .glb, mục 12.1) loads from gstatic.
      "connect-src 'self' blob: https://*.supabase.co https://www.gstatic.com",
      `script-src 'self' 'unsafe-inline' https://www.gstatic.com${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-src https://www.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/public/**" }],
  },
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
