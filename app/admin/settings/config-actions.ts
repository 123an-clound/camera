"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/admin-auth";
import { uploadToBucket } from "@/lib/storage";
import { CONFIG_KEYS, validateGroup, type ConfigGroup } from "@/lib/site-config-schema";
import type { ActionState } from "@/app/admin/products/actions";

// Saves one structured config group (sent as a JSON `payload` field). `group` is bound on
// the client, so it is re-validated here like any other input.
export async function saveConfigGroup(group: ConfigGroup, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!Object.hasOwn(CONFIG_KEYS, group)) return { error: "Nhóm cấu hình không hợp lệ" };

  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  let input: unknown;
  try {
    input = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Dữ liệu gửi lên không hợp lệ" };
  }

  // SEO: optional social-share image upload replaces the stored URL.
  const ogFile = formData.get("og_image_file");
  if (group === "seo" && ogFile instanceof File && ogFile.size > 0) {
    const uploaded = await uploadToBucket(supabase, "site-assets", ogFile);
    if ("error" in uploaded) return uploaded;
    input = { ...(input as Record<string, unknown>), og_image: uploaded.url };
  }

  const validated = validateGroup(group, input);
  if ("error" in validated) return validated;

  const { error } = await supabase
    .from("camera_site_settings")
    .upsert({ key: CONFIG_KEYS[group], value: validated.data, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
