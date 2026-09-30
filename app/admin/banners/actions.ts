"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminClient } from "@/lib/admin-auth";
import type { ActionState } from "@/app/admin/products/actions";
import { uploadToBucket } from "@/lib/storage";

const bannerSchema = z.object({
  title: z.string().trim().max(200).optional(),
  subtitle: z.string().trim().max(300).optional(),
  // Site-relative path or https URL only (blocks javascript: and other schemes in links).
  link_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^\/(?!\/)/.test(v) || /^https:\/\//i.test(v), "Link phải bắt đầu bằng / hoặc https://")
    .optional(),
  sort_order: z.number().int(),
  is_active: z.boolean(),
});

function parseForm(formData: FormData) {
  return bannerSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    link_url: String(formData.get("link_url") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0),
    is_active: formData.get("is_active") === "on",
  });
}

export async function createBanner(formData: FormData): Promise<ActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Vui lòng chọn ảnh banner" };

  const uploaded = await uploadToBucket(supabase, "site-assets", file);
  if ("error" in uploaded) return uploaded;

  const { error } = await supabase.from("camera_banners").insert({
    title: parsed.data.title || null,
    subtitle: parsed.data.subtitle || null,
    link_url: parsed.data.link_url || null,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active,
    image_url: uploaded.url,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function updateBanner(id: string, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const update: Record<string, unknown> = {
    title: parsed.data.title || null,
    subtitle: parsed.data.subtitle || null,
    link_url: parsed.data.link_url || null,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const uploaded = await uploadToBucket(supabase, "site-assets", file);
    if ("error" in uploaded) return uploaded;
    update.image_url = uploaded.url;
  }

  const { error } = await supabase.from("camera_banners").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<ActionState> {
  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("camera_banners").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}
