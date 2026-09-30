import { getActiveBanners } from "@/lib/banners";
import { getSiteSettings, settingText } from "@/lib/site-settings";
import { BannerSlider } from "@/components/public/banner-slider";
import { Viewfinder } from "@/components/public/viewfinder";
import { CameraStory } from "@/components/public/camera-story/camera-story";

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
    <>
      <CameraStory title={title} subtitle={subtitle} />
      {slides.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-16">
          <Viewfinder label="Ưu đãi · Live">
            <BannerSlider slides={slides} />
          </Viewfinder>
        </div>
      )}
    </>
  );
}
