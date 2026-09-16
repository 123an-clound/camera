import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/site-settings-shared";

export type { SiteSettings } from "@/lib/site-settings-shared";
export { settingText } from "@/lib/site-settings-shared";

// Reads the key-value site_settings table admin controls (mục 7 / mục 3.1).
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("camera_site_settings").select("key, value");
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}
