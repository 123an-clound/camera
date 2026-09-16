import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [newOrders, totalProducts, recentOrders] = await Promise.all([
    supabase.from("camera_orders").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("camera_products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("camera_orders").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Yêu cầu mới</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{newOrders.count ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Sản phẩm đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalProducts.count ?? 0}</CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-medium">Yêu cầu gần đây</h2>
        {(recentOrders.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có yêu cầu nào.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.data!.map((order) => (
              <Link
                key={order.id}
                href="/admin/orders"
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {order.customer_name} · {order.customer_phone}
                  </p>
                  <p className="text-muted-foreground">
                    {order.type === "sale" ? "Mua" : "Thuê"} · {formatVND(order.total_estimate ?? 0)}
                  </p>
                </div>
                <Badge variant="outline">{STATUS_LABEL[order.status] ?? order.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
