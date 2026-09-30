import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderNoteForm } from "@/components/admin/order-note-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatVND } from "@/lib/format";
import { rentalDays } from "@/lib/rental";
import type { OrderItem, OrderStatus } from "@/lib/types";
import { deleteOrder } from "../actions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("camera_orders").select("*, camera_order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();

  const items = order.camera_order_items as OrderItem[];
  const days = order.rent_start && order.rent_end ? rentalDays(order.rent_start, order.rent_end) : null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
        ← Tất cả yêu cầu
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.customer_name}</h1>
          <p className="text-sm text-muted-foreground">
            {order.type === "sale" ? "Yêu cầu mua" : "Yêu cầu thuê"} · {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
      </div>

      <section className="grid gap-4 rounded-xl border border-border/60 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Điện thoại</p>
          <a href={`tel:${order.customer_phone}`} className="font-medium hover:underline">
            {order.customer_phone}
          </a>
        </div>
        {order.customer_email && (
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <a href={`mailto:${order.customer_email}`} className="font-medium hover:underline">
              {order.customer_email}
            </a>
          </div>
        )}
        {order.rent_start && order.rent_end && (
          <div>
            <p className="text-xs text-muted-foreground">Thời gian thuê</p>
            <p className="font-medium">
              {order.rent_start} → {order.rent_end} ({days} ngày)
            </p>
          </div>
        )}
        {order.note && (
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Ghi chú của khách</p>
            <p className="whitespace-pre-line">{order.note}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border/60">
        <p className="border-b border-border/60 p-4 font-medium">Sản phẩm</p>
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 p-4 text-sm">
              <div>
                {item.product_id ? (
                  <Link href={`/admin/products/${item.product_id}`} className="font-medium hover:underline">
                    {item.product_name}
                  </Link>
                ) : (
                  <p className="font-medium">{item.product_name}</p>
                )}
                <p className="text-muted-foreground">
                  {formatVND(item.unit_price ?? 0)} {item.rent_days ? `× ${item.rent_days} ngày` : `× ${item.quantity}`}
                </p>
              </div>
              <p className="font-medium">{formatVND((item.unit_price ?? 0) * (item.rent_days ?? item.quantity))}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-border/60 p-4 font-semibold">
          <span>Tạm tính</span>
          <span>{formatVND(order.total_estimate ?? 0)}</span>
        </div>
      </section>

      <OrderNoteForm orderId={order.id} note={order.admin_note ?? ""} />

      <div className="border-t border-border/60 pt-4">
        <DeleteButton action={deleteOrder.bind(null, order.id)} label="Xóa yêu cầu" />
      </div>
    </div>
  );
}
