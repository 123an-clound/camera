"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { uploadToBucket } from "@/lib/storage";
import { slugify } from "@/lib/slug";

export type ActionState = { error?: string; ok?: boolean };

const productSchema = z.object({
  name: z.string().trim().min(1, "Tên bắt buộc").max(200),
  slug: z.string().trim().min(1).max(220),
  brand: z.string().trim().max(100).optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  short_desc: z.string().trim().max(300).optional(),
  description: z.string().trim().max(5000).optional(),
  specs: z.string().optional(),
  is_for_sale: z.boolean(),
  is_for_rent: z.boolean(),
  sale_price: z.number().min(0).optional(),
  rent_price_day: z.number().min(0).optional(),
  rent_deposit: z.number().min(0).optional(),
  stock: z.number().int().min(0),
  rent_available: z.boolean(),
  condition: z.string().trim().max(100).optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
});

function num(formData: FormData, key: string) {
  const v = formData.get(key);
  if (!v || v === "") return undefined;
  return Number(v);
}

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  return productSchema.safeParse({
    name,
    slug: slugify(String(formData.get("slug") || name)),
    brand: String(formData.get("brand") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    short_desc: String(formData.get("short_desc") ?? ""),
    description: String(formData.get("description") ?? ""),
    specs: String(formData.get("specs") ?? "[]"),
    is_for_sale: formData.get("is_for_sale") === "on",
    is_for_rent: formData.get("is_for_rent") === "on",
    sale_price: num(formData, "sale_price"),
    rent_price_day: num(formData, "rent_price_day"),
    rent_deposit: num(formData, "rent_deposit"),
    stock: num(formData, "stock") ?? 0,
    rent_available: formData.get("rent_available") === "on",
    condition: String(formData.get("condition") ?? ""),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
    sort_order: num(formData, "sort_order") ?? 0,
  });
}

function specsToObject(raw: string | undefined): Record<string, string> {
  try {
    const rows = JSON.parse(raw ?? "[]") as { key: string; value: string }[];
    return Object.fromEntries(rows.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]));
  } catch {
    return {};
  }
}

async function uploadImages(supabase: Awaited<ReturnType<typeof createClient>>, productId: string, formData: FormData, startOrder: number) {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  let order = startOrder;
  for (const file of files) {
    const uploaded = await uploadToBucket(supabase, "product-images", file);
    if ("error" in uploaded) continue;
    await supabase.from("camera_product_images").insert({
      product_id: productId,
      url: uploaded.url,
      sort_order: order,
      is_primary: order === 0,
    });
    order += 1;
  }
}

export async function createProduct(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const d = parsed.data;

  const model3dFile = formData.get("model3d") as File | null;
  let model3dUrl: string | null = null;
  if (model3dFile && model3dFile.size > 0) {
    const uploaded = await uploadToBucket(supabase, "models-3d", model3dFile);
    if ("error" in uploaded) return uploaded;
    model3dUrl = uploaded.url;
  }

  const { data: product, error } = await supabase
    .from("camera_products")
    .insert({
      name: d.name,
      slug: d.slug,
      brand: d.brand || null,
      category_id: d.category_id || null,
      short_desc: d.short_desc || null,
      description: d.description || null,
      specs: specsToObject(d.specs),
      is_for_sale: d.is_for_sale,
      is_for_rent: d.is_for_rent,
      sale_price: d.sale_price ?? null,
      rent_price_day: d.rent_price_day ?? null,
      rent_deposit: d.rent_deposit ?? null,
      stock: d.stock,
      rent_available: d.rent_available,
      condition: d.condition || null,
      model_3d_url: model3dUrl,
      is_featured: d.is_featured,
      is_active: d.is_active,
      sort_order: d.sort_order,
    })
    .select("id")
    .single();

  if (error || !product) return { error: error?.code === "23505" ? "Slug đã tồn tại" : (error?.message ?? "Lỗi") };

  await uploadImages(supabase, product.id, formData, 0);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Thiếu ID sản phẩm" };

  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const d = parsed.data;

  const update: Record<string, unknown> = {
    name: d.name,
    slug: d.slug,
    brand: d.brand || null,
    category_id: d.category_id || null,
    short_desc: d.short_desc || null,
    description: d.description || null,
    specs: specsToObject(d.specs),
    is_for_sale: d.is_for_sale,
    is_for_rent: d.is_for_rent,
    sale_price: d.sale_price ?? null,
    rent_price_day: d.rent_price_day ?? null,
    rent_deposit: d.rent_deposit ?? null,
    stock: d.stock,
    rent_available: d.rent_available,
    condition: d.condition || null,
    is_featured: d.is_featured,
    is_active: d.is_active,
    sort_order: d.sort_order,
    updated_at: new Date().toISOString(),
  };

  const model3dFile = formData.get("model3d") as File | null;
  if (model3dFile && model3dFile.size > 0) {
    const uploaded = await uploadToBucket(supabase, "models-3d", model3dFile);
    if ("error" in uploaded) return uploaded;
    update.model_3d_url = uploaded.url;
  }

  const { error } = await supabase.from("camera_products").update(update).eq("id", id);
  if (error) return { error: error.code === "23505" ? "Slug đã tồn tại" : error.message };

  const { count } = await supabase
    .from("camera_product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);
  await uploadImages(supabase, id, formData, count ?? 0);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  revalidatePath(`/products/${d.slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("camera_products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProductImage(imageId: string) {
  const supabase = await createClient();
  const { data: image } = await supabase.from("camera_product_images").select("product_id").eq("id", imageId).single();
  const { error } = await supabase.from("camera_product_images").delete().eq("id", imageId);
  if (error) return { error: error.message };

  if (image) revalidatePath(`/admin/products/${image.product_id}`);
  revalidatePath("/products");
  return { ok: true };
}

export async function setPrimaryImage(productId: string, imageId: string) {
  const supabase = await createClient();
  await supabase.from("camera_product_images").update({ is_primary: false }).eq("product_id", productId);
  const { error } = await supabase.from("camera_product_images").update({ is_primary: true }).eq("id", imageId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  return { ok: true };
}
