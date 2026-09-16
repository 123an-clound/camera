import type { Metadata } from "next";
import { getSiteSettings, settingText } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Giới thiệu" };

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const about = settingText(settings, "about", "Đang cập nhật nội dung giới thiệu.");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Giới thiệu {storeName}</h1>
      <p className="mt-4 whitespace-pre-line text-muted-foreground">{about}</p>
    </div>
  );
}
