import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Sticker } from "@/components/public/sticker";

// Site-wide 404 in the public theme (unmatched URLs and notFound() calls).
export default function NotFound() {
  return (
    <div className="theme-lab relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <Navbar />
      <main className="bg-dots flex flex-1 overflow-hidden items-center justify-center px-4 py-24">
        <div className="relative max-w-lg text-center">
          <Sticker name="sparkle" color="var(--c-butter)" className="absolute -left-6 -top-8 size-10" />
          <Sticker name="heart" color="var(--c-pink)" className="absolute -right-4 top-0 size-10 rotate-12" />
          <p className="font-script text-2xl text-primary">404 · ảnh bị mờ mất rồi~</p>
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
            <Link href="/" className="inline-flex h-11 items-center rounded-full border-2 border-foreground/80 bg-card px-6 text-sm font-semibold">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
