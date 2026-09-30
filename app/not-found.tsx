import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

// Site-wide 404 in the public theme (unmatched URLs and notFound() calls).
export default function NotFound() {
  return (
    <div className="dark theme-lab relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <Navbar />
      <main className="bg-blueprint flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-lg text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">404 · Mất nét</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Không tìm thấy trang</h1>
          <p className="mt-4 text-muted-foreground">
            Trang bạn tìm có thể đã được đổi tên hoặc không còn. Xem kho máy hoặc quay về trang chủ.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Xem sản phẩm
            </Link>
            <Link href="/" className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
