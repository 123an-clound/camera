import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductWithImages } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("camera_products")
      .select("*, camera_product_images(*), camera_categories(id, name, slug)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("camera_categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa sản phẩm</h1>
      <ProductForm key={product.updated_at} product={product as ProductWithImages} categories={categories ?? []} />
    </div>
  );
}
