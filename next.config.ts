import type { NextConfig } from "next";

const SUPABASE_HOST = "jtizooyjnllostamffpp.supabase.co";
// GA4 hosts are allowed only when analytics is configured (components/public/analytics.tsx).
const GA = process.env.NEXT_PUBLIC_GA_ID
  ? { script: " https://www.googletagmanager.com", connect: " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com", img: " https://*.google-analytics.com https://www.googletagmanager.com" }
  : { script: "", connect: "", img: "" };

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `img-src 'self' data: blob: https://*.supabase.co${GA.img}`,
      "media-src 'self' https://*.supabase.co",
      // blob: + www.gstatic.com: three.js/drei GLTFLoader reads embedded textures via
      // blob: URLs, and drei's Draco decoder (for compressed .glb, mục 12.1) loads from gstatic.
      `connect-src 'self' blob: https://*.supabase.co https://www.gstatic.com${GA.connect}`,
      `script-src 'self' 'unsafe-inline' https://www.gstatic.com${GA.script}${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
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
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
