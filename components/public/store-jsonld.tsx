import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";
import { SITE_URL } from "@/lib/site-url";

// Store (a LocalBusiness subtype) built only from data the owner entered in admin. Fields
// that aren't set — structured opening hours, geo coordinates, ratings — are omitted, never guessed.
export async function StoreJsonLd() {
  const { settings, contact } = await getSiteConfig();
  const name = settingText(settings, "store_name", "Camera Rent");
  const phone = settingText(settings, "phone", "");
  const email = settingText(settings, "email", "");
  const address = settingText(settings, "address", "");
  const logo = settingText(settings, "logo_url", "");
  const sameAs = [
    settingText(settings, "facebook_url", ""),
    contact.instagram,
    contact.tiktok,
    contact.youtube,
    contact.zalo ? `https://zalo.me/${contact.zalo}` : "",
  ].filter(Boolean);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Store",
    name,
    url: SITE_URL,
    ...(logo ? { logo, image: logo } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address, addressCountry: "VN" } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
  );
}
