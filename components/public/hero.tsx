import { getActiveBanners } from "@/lib/banners";
import { getSiteSettings, settingText } from "@/lib/site-settings";
import { BannerSlider } from "@/components/public/banner-slider";

export async function Hero() {
  const [banners, settings] = await Promise.all([getActiveBanners(), getSiteSettings()]);
  const title = settingText(settings, "hero_title", "Bán & Cho thuê máy ảnh");
  const subtitle = settingText(
    settings,
    "hero_subtitle",
    "Canon, Sony, Fujifilm chính hãng — thuê theo ngày, giá tốt."
  );
  const heroImage = settingText(settings, "hero_image", "");

  const slides =
    banners.length > 0
      ? banners
      : heroImage
        ? [{ title, subtitle, image_url: heroImage, link_url: null }]
        : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      {slides.length > 0 ? (
        <BannerSlider slides={slides} />
      ) : (
        <div className="flex h-[50vh] min-h-80 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 px-6 text-center text-white">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-lg text-white/85 md:text-lg">{subtitle}</p>
        </div>
      )}
    </div>
  );
}
