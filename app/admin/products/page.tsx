import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatVND } from "@/lib/format";
import { deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("camera_products")
    .select("*, camera_product_images(*), camera_categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sản phẩm</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          Thêm sản phẩm
        </Link>
      </div>

      <div className="space-y-2">
        {(products ?? []).map((p) => {
          const image = p.camera_product_images.find((i: { is_primary: boolean }) => i.is_primary) ?? p.camera_product_images[0];
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3 hover:bg-muted/50">
              <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image && <Image src={image.url} alt="" fill sizes="48px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.camera_categories?.name ?? "—"} · {p.brand ?? "—"}
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
          );
        })}
        {(products ?? []).length === 0 && <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào.</p>}
      </div>
    </div>
  );
}
