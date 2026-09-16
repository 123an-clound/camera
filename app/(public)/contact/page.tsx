import type { Metadata } from "next";
import { getSiteSettings, settingText } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Liên hệ" };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phone = settingText(settings, "phone", "");
  const email = settingText(settings, "email", "");
  const address = settingText(settings, "address", "");
  const facebookUrl = settingText(settings, "facebook_url", "");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Liên hệ</h1>
      <div className="space-y-2 text-muted-foreground">
        {phone && (
          <p>
            Điện thoại: <a href={`tel:${phone}`} className="text-foreground hover:underline">{phone}</a>
          </p>
        )}
        {email && (
          <p>
            Email: <a href={`mailto:${email}`} className="text-foreground hover:underline">{email}</a>
          </p>
        )}
        {address && <p>Địa chỉ: {address}</p>}
        {facebookUrl && (
          <p>
            Facebook:{" "}
            <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-foreground hover:underline">
              {facebookUrl}
            </a>
          </p>
        )}
      </div>
      {address && (
        <iframe
          title="Bản đồ cửa hàng"
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="h-80 w-full rounded-xl border border-border/60"
          loading="lazy"
        />
      )}
    </div>
  );
}
