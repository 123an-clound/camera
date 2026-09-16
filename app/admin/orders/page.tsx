import { createClient } from "@/lib/supabase/server";
import { OrderFilters } from "@/components/admin/order-filters";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatVND } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const phone = typeof sp.phone === "string" ? sp.phone : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("camera_orders")
    .select("*, camera_order_items(*)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (phone) query = query.ilike("customer_phone", `%${phone}%`);

  const { data: orders } = await query;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Yêu cầu</h1>
      <OrderFilters />

      <div className="space-y-3">
        {(orders ?? []).map((order) => (
          <div key={order.id} className="rounded-lg border border-border/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {order.customer_name} · {order.customer_phone}
                </p>
                {order.customer_email && <p className="text-sm text-muted-foreground">{order.customer_email}</p>}
                <p className="text-sm text-muted-foreground">
                  {order.type === "sale" ? "Mua" : "Thuê"}
                  {order.rent_start && order.rent_end && ` · ${order.rent_start} → ${order.rent_end}`}
                  {" · "}
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </p>
                {order.note && <p className="text-sm italic text-muted-foreground">Ghi chú: {order.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{formatVND(order.total_estimate ?? 0)}</p>
                <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
              {order.camera_order_items.map((item: { id: string; product_name: string | null; quantity: number; unit_price: number | null; rent_days: number | null }) => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span>
                    {item.product_name} {item.rent_days ? `× ${item.rent_days} ngày` : `× ${item.quantity}`}
                  </span>
                  <span>{formatVND((item.unit_price ?? 0) * (item.rent_days ?? item.quantity))}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(orders ?? []).length === 0 && <p className="text-sm text-muted-foreground">Không có yêu cầu nào.</p>}
      </div>
    </div>
  );
}
