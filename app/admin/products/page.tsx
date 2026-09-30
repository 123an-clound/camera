import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductFilters, ProductQuickControls } from "@/components/admin/product-quick-controls";
import { formatVND } from "@/lib/format";
import { sanitizeSearch } from "@/lib/order-query";
import { deleteProduct } from "./actions";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sanitizeSearch(sp.q) : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  const supabase = await createClient();
  let query = supabase
    .from("camera_products")
    .select("*, camera_product_images(*), camera_categories(name)")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
  if (status === "active") query = query.eq("is_active", true);
  if (status === "hidden") query = query.eq("is_active", false);
  if (status === "featured") query = query.eq("is_featured", true);
  if (status === "sale") query = query.eq("is_for_sale", true);
  if (status === "rent") query = query.eq("is_for_rent", true);
  if (/^[0-9a-f-]{36}$/i.test(category)) query = query.eq("category_id", category);

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from("camera_categories").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sản phẩm ({(products ?? []).length})</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          Thêm sản phẩm
        </Link>
      </div>
      <ProductFilters categories={categories ?? []} />

      <div className="space-y-2">
        {(products ?? []).map((p) => {
          const image = p.camera_product_images.find((i: { is_primary: boolean }) => i.is_primary) ?? p.camera_product_images[0];
          return (
            <div key={p.id} className="rounded-lg border border-border/60 p-3 hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {image && <Image src={image.url} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.camera_categories?.name ?? "—"} · {p.brand ?? "—"} · tồn {p.stock}
                    </p>
                  </div>
                  <div className="text-sm">
                    {p.sale_price != null && <p>{formatVND(p.sale_price)}</p>}
                    {p.rent_price_day != null && <p className="text-muted-foreground">{formatVND(p.rent_price_day)}/ngày</p>}
                  </div>
                  {!p.is_active && <Badge variant="outline">Ẩn</Badge>}
                </Link>
                <DeleteButton action={deleteProduct.bind(null, p.id)} />
              </div>
              <div className="mt-2 border-t border-border/60 pt-2">
                <ProductQuickControls
                  id={p.id}
                  name={p.name}
                  isActive={p.is_active}
                  isFeatured={p.is_featured}
                  sortOrder={p.sort_order ?? 0}
                />
              </div>
            </div>
          );
        })}
        {(products ?? []).length === 0 && <p className="text-sm text-muted-foreground">Không có sản phẩm phù hợp.</p>}
      </div>
    </div>
  );
}
