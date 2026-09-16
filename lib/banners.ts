import { createClient } from "@/lib/supabase/server";
import type { Banner } from "@/lib/types";

export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("camera_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
