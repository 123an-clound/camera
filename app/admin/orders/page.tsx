import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderFilters } from "@/components/admin/order-filters";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { buttonVariants } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { ordersQuery } from "@/lib/order-query";
import type { OrderStatus } from "@/lib/types";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const supabase = await createClient();
  const { data: orders } = await ordersQuery(supabase, { status, q });

  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (q) exportParams.set("q", q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Yêu cầu</h1>
        <a href={`/admin/orders/export?${exportParams.toString()}`} className={buttonVariants({ variant: "outline" })}>
          Xuất CSV ({(orders ?? []).length})
        </a>
      </div>
      <OrderFilters />

      <div className="space-y-3">
        {(orders ?? []).map((order) => (
          <div key={order.id} className="rounded-lg border border-border/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link href={`/admin/orders/${order.id}`} className="group min-w-0">
                <p className="font-medium group-hover:underline">
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
                {order.admin_note && <p className="text-sm text-amber-600">Nội bộ: {order.admin_note}</p>}
              </Link>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{formatVND(order.total_estimate ?? 0)}</p>
                <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
              {order.camera_order_items.map(
                (item: { id: string; product_name: string | null; quantity: number; unit_price: number | null; rent_days: number | null }) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span>
                      {item.product_name} {item.rent_days ? `× ${item.rent_days} ngày` : `× ${item.quantity}`}
                    </span>
                    <span>{formatVND((item.unit_price ?? 0) * (item.rent_days ?? item.quantity))}</span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
        {(orders ?? []).length === 0 && <p className="text-sm text-muted-foreground">Không có yêu cầu nào.</p>}
      </div>
    </div>
  );
}
