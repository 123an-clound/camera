"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadToBucket } from "@/lib/storage";
import type { ActionState } from "@/app/admin/products/actions";

const TEXT_KEYS = ["store_name", "hero_title", "hero_subtitle", "phone", "address", "email", "facebook_url", "about"];
const IMAGE_KEYS = ["hero_image", "logo_url"];

export async function updateSettings(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const rows: { key: string; value: string; updated_at: string }[] = [];
  const now = new Date().toISOString();

  for (const key of TEXT_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    rows.push({ key, value, updated_at: now });
  }

  for (const key of IMAGE_KEYS) {
    const file = formData.get(key) as File | null;
    if (file && file.size > 0) {
      const uploaded = await uploadToBucket(supabase, "site-assets", file);
      if ("error" in uploaded) return uploaded;
      rows.push({ key, value: uploaded.url, updated_at: now });
    }
  }

  const { error } = await supabase.from("camera_site_settings").upsert(rows, { onConflict: "key" });
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
