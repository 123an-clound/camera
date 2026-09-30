import type { Metadata } from "next";
import { Chakra_Petch, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import { getSiteConfig } from "@/lib/site-config";
import { settingText } from "@/lib/site-settings";
import { IS_INDEXABLE, SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
});

// Mono is only used for small HUD/spec labels: don't let it compete with LCP text for bandwidth.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
  preload: false,
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"], // headings use semibold/bold only
});

// Site-wide SEO is admin-editable (Settings → SEO); empty fields fall back to these defaults.
export async function generateMetadata(): Promise<Metadata> {
  const { settings, seo } = await getSiteConfig();
  const store = settingText(settings, "store_name", "Camera Rent");
  const title = seo.title || `${store} — Bán & Cho thuê máy ảnh`;
  const description = seo.description || "Bán và cho thuê máy ảnh, ống kính, phụ kiện chính hãng.";
  return {
    metadataBase: new URL(SITE_URL),
    // Vercel previews / non-production builds must never be indexed.
    robots: IS_INDEXABLE ? undefined : { index: false, follow: false },
    title: { default: title, template: `%s | ${store}` },
    description,
    keywords: seo.keywords ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: store,
      title,
      description,
      images: seo.og_image ? [{ url: seo.og_image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: seo.og_image ? "summary_large_image" : "summary", title, description },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${chakraPetch.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
