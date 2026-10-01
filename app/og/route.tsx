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
          background: "#fff7f0",
          color: "#3b2a2f",
          backgroundImage: "radial-gradient(rgba(204,47,99,0.14) 2px, transparent 2.5px)",
          backgroundSize: "36px 36px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#cc2f63", fontSize: 30, letterSpacing: 4 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#ffd6e3", border: "3px solid #cc2f63" }} />
          CAMERA RENTAL
        </div>
        <div style={{ fontSize: 100, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>{store}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
          {["#ffd6e3", "#e4d9ff", "#fff0b3", "#d3f2e6", "#ffdccb"].map((c) => (
            <div key={c} style={{ width: 64, height: 64, borderRadius: 16, background: c, border: "3px solid #3b2a2f" }} />
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
