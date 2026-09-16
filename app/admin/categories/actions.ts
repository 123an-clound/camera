"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Tên bắt buộc").max(100),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  sort_order: z.number().int(),
});

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const rawSlug = String(formData.get("slug") ?? "");
  return categorySchema.safeParse({
    name,
    slug: slugify(rawSlug || name),
    description: String(formData.get("description") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
}

export async function createCategory(formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("camera_categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    sort_order: parsed.data.sort_order,
  });
  if (error) return { error: error.code === "23505" ? "Slug đã tồn tại" : error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { ok: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("camera_categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", id);
  if (error) return { error: error.code === "23505" ? "Slug đã tồn tại" : error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("camera_categories").delete().eq("id", id);
  if (error) return { error: "Không xóa được (có thể còn sản phẩm thuộc danh mục này)." };

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { ok: true };
}
