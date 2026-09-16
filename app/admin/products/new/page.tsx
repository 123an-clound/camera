import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("camera_categories").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Thêm sản phẩm</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
