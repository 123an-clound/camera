import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithImages } from "@/lib/types";

const PRODUCT_SELECT = "*, camera_product_images(*), camera_categories(id, name, slug)";

export type ProductFilters = {
  category?: string;
  brand?: string;
  mode?: "sale" | "rent";
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

function priceColumn(mode?: ProductFilters["mode"]) {
  return mode === "rent" ? "rent_price_day" : "sale_price";
}

export async function listProducts(filters: ProductFilters = {}): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  let query = supabase.from("camera_products").select(PRODUCT_SELECT).eq("is_active", true);

  if (filters.category) {
    const { data: category } = await supabase
      .from("camera_categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    query = query.eq("category_id", category?.id ?? "00000000-0000-0000-0000-000000000000");
  }
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.mode === "sale") query = query.eq("is_for_sale", true);
  if (filters.mode === "rent") query = query.eq("is_for_rent", true);
  if (filters.minPrice != null) query = query.gte(priceColumn(filters.mode), filters.minPrice);
  if (filters.maxPrice != null) query = query.lte(priceColumn(filters.mode), filters.maxPrice);
  if (filters.q) query = query.ilike("name", `%${filters.q}%`);

  switch (filters.sort) {
    case "price_asc":
      query = query.order(priceColumn(filters.mode), { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order(priceColumn(filters.mode), { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductWithImages[];
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("camera_products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithImages[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("camera_products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as ProductWithImages | null;
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4): Promise<ProductWithImages[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("camera_products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithImages[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("camera_categories").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getBrands(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("camera_products")
    .select("brand")
    .eq("is_active", true)
    .not("brand", "is", null);
  if (error) throw error;
  return [...new Set((data ?? []).map((r) => r.brand as string))].sort();
}
