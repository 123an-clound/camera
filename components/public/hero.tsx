import Image from "next/image";
import Link from "next/link";
import { getActiveBanners } from "@/lib/banners";
import { getFeaturedProducts, listProducts } from "@/lib/products";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";
import { BannerSlider } from "@/components/public/banner-slider";
import { Sticker, filmDate, type StickerName } from "@/components/public/sticker";

// Where each polaroid sits in the collage (percent of the collage box). The last two are
// desktop-only so the phone collage stays readable.
const SLOTS = [
  { left: "2%", top: "8%", width: "46%", rotate: "-6deg", tape: "var(--c-pink)", extra: "" },
  { left: "52%", top: "0%", width: "42%", rotate: "5deg", tape: "var(--c-mint)", extra: "" },
  { left: "27%", top: "38%", width: "46%", rotate: "-2deg", tape: "var(--c-butter)", extra: "z-10" },
  { left: "0%", top: "60%", width: "34%", rotate: "8deg", tape: "var(--c-lilac)", extra: "hidden lg:block" },
  { left: "64%", top: "54%", width: "34%", rotate: "-7deg", tape: "var(--c-peach)", extra: "hidden lg:block" },
];

const STICKERS: { name: StickerName; color: string; className: string }[] = [
  { name: "sparkle", color: "var(--c-butter)", className: "left-[44%] top-[2%] size-9" },
  { name: "heart", color: "var(--c-pink)", className: "right-[2%] top-[40%] size-10 rotate-12" },
  { name: "star", color: "var(--c-lilac)", className: "left-[1%] top-[44%] size-8 -rotate-12" },
  { name: "flower", color: "var(--c-pink)", className: "bottom-[2%] left-[40%] size-10" },
  { name: "smiley", color: "var(--c-butter)", className: "right-[30%] top-[30%] size-8 hidden lg:block" },
];

// Hero = copy from admin settings + a polaroid collage of real product photos.
export async function HeroCollage() {
  const { settings, home } = await getSiteConfig();
  const title = settingText(settings, "hero_title", "Bán & Cho thuê máy ảnh");
  const subtitle = settingText(settings, "hero_subtitle", "Canon, Sony, Fujifilm chính hãng — thuê theo ngày, giá tốt.");

  let products = (await getFeaturedProducts(8)).filter((p) => p.camera_product_images.length > 0);
  if (products.length < SLOTS.length) {
    const more = (await listProducts({ sort: "newest" })).filter(
      (p) => p.camera_product_images.length > 0 && !products.some((f) => f.id === p.id)
    );
    products = [...products, ...more];
  }
  const shots = products.slice(0, SLOTS.length);
  const stamp = filmDate();

  return (
    <section className="bg-dots relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 md:pt-16 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative">
          {home.hero_kicker && (
            <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-primary shadow-sm">
              {home.hero_kicker}
            </p>
          )}
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-balance md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-md text-lg text-muted-foreground">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {home.cta_primary_label && home.cta_primary_href && (
              <Link
                href={home.cta_primary_href}
                className="inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_var(--glow)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {home.cta_primary_label} ♡
              </Link>
            )}
            {home.cta_secondary_label && home.cta_secondary_href && (
              <Link
                href={home.cta_secondary_href}
                className="inline-flex h-12 items-center rounded-full border-2 border-foreground/80 bg-card px-7 font-semibold transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {home.cta_secondary_label}
              </Link>
            )}
          </div>
          <p className="mt-6 font-script text-2xl text-primary" aria-hidden>
            say cheese~
          </p>
        </div>

        <div className="relative mx-auto aspect-[1/0.95] w-full max-w-md lg:aspect-[1/1.05] lg:max-w-none">
          {SLOTS.map((slot, i) => {
            const p = shots[i];
            const img = p && (p.camera_product_images.find((x) => x.is_primary) ?? p.camera_product_images[0]);
            const style = { left: slot.left, top: slot.top, width: slot.width, rotate: slot.rotate } as React.CSSProperties;
            const body = (
              <>
                <span className="washi -top-3 left-1/2 -translate-x-1/2 -rotate-3" style={{ "--tape": slot.tape } as React.CSSProperties} />
                <span className="relative block aspect-square overflow-hidden rounded-sm bg-muted">
                  {img && (
                    <Image
                      src={img.url}
                      alt={img.alt ?? p.name}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 260px, 45vw"
                      className="object-cover"
                    />
                  )}
                  <span className="date-stamp absolute bottom-1.5 right-2 text-[10px] md:text-xs">{stamp}</span>
                </span>
                <span className="absolute inset-x-2 bottom-2 line-clamp-1 text-center font-script text-base md:text-lg">
                  {p ? p.name : "say cheese ♡"}
                </span>
              </>
            );
            const cls = `polaroid animate-float-soft absolute block ${slot.extra}`;
            return p ? (
              <Link
                key={i}
                href={`/products/${p.slug}`}
                className={`${cls} transition-transform hover:z-20 hover:scale-105 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`}
                style={{ ...style, animationDelay: `${i * -1.2}s` }}
              >
                {body}
              </Link>
            ) : (
              <div key={i} aria-hidden className={cls} style={{ ...style, animationDelay: `${i * -1.2}s` }}>
                {body}
              </div>
            );
          })}
          {STICKERS.map((s) => (
            <Sticker key={s.name} name={s.name} color={s.color} className={`absolute z-20 ${s.className}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Admin banners (or the single hero image fallback) taped onto the page like a printed photo.
export async function HomeBanners() {
  const [banners, { settings }] = await Promise.all([getActiveBanners(), getSiteConfig()]);
  const heroImage = settingText(settings, "hero_image", "");
  const slides =
    banners.length > 0
      ? banners
      : heroImage
        ? [{ title: null, subtitle: null, image_url: heroImage, link_url: null }]
        : [];
  if (slides.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12">
      <div className="relative rounded-3xl bg-card p-2 shadow-[0_12px_32px_-16px_rgb(59_42_47/0.3)] md:p-3">
        <span className="washi -top-3 left-8 z-10 -rotate-6" style={{ "--tape": "var(--c-mint)" } as React.CSSProperties} />
        <span className="washi -top-3 right-8 z-10 rotate-6" style={{ "--tape": "var(--c-pink)" } as React.CSSProperties} />
        <div className="overflow-hidden rounded-2xl">
          <BannerSlider slides={slides} />
        </div>
      </div>
    </div>
  );
}
