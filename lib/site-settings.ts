import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/site-settings-shared";

export type { SiteSettings } from "@/lib/site-settings-shared";
export { settingText } from "@/lib/site-settings-shared";

// Reads the key-value site_settings table admin controls (mục 7 / mục 3.1).
// cache(): navbar, footer, hero and metadata all read settings in the same request —
// one query instead of one per component.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createClient();
  const { data } = await supabase.from("camera_site_settings").select("key, value");
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
});
