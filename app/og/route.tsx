import { ImageResponse } from "next/og";
import { getSiteSettings, settingText } from "@/lib/site-settings";

// Default 1200×630 social-share image, used when admin hasn't uploaded one (Settings → SEO).
// ASCII-only decorative text: the built-in OG font has no Vietnamese glyphs.
export async function GET() {
  const settings = await getSiteSettings();
  const store = settingText(settings, "store_name", "Camera Rent");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0f0d0b",
          color: "#f6f1ea",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#f5a524", fontSize: 28, letterSpacing: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#f5a524" }} />
          OPTICAL LAB
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>{store}</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#b8b2aa", letterSpacing: 4 }}>ISO 125 · 1/250 · f/2.8</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
