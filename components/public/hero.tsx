import { getActiveBanners } from "@/lib/banners";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";
import { BannerSlider } from "@/components/public/banner-slider";
import { Viewfinder } from "@/components/public/viewfinder";
import { CameraStory } from "@/components/public/camera-story/camera-story";

// Hero = the 3D scroll story; all copy comes from admin settings.
export async function HeroStory() {
  const { settings, home, story, theme } = await getSiteConfig();
  const hero = {
    title: settingText(settings, "hero_title", "Bán & Cho thuê máy ảnh"),
    subtitle: settingText(settings, "hero_subtitle", "Canon, Sony, Fujifilm chính hãng — thuê theo ngày, giá tốt."),
    kicker: home.hero_kicker,
    primary: { label: home.cta_primary_label, href: home.cta_primary_href },
    secondary: { label: home.cta_secondary_label, href: home.cta_secondary_href },
  };
  return <CameraStory hero={hero} story={story} enable3d={theme.enable_3d} />;
}

// Admin banners (or the single hero image fallback) inside a viewfinder frame.
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
    <div className="mx-auto max-w-6xl px-4 pt-16">
      <Viewfinder label="Ưu đãi · Live">
        <BannerSlider slides={slides} />
      </Viewfinder>
    </div>
  );
}
