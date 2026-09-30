import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-query";

const DAYS = 30;
const REVENUE_STATUSES = ["confirmed", "completed"];

type OrderRow = { id: string; status: string; type: string; total_estimate: number | null; created_at: string };
type ItemRow = { order_id: string; product_name: string | null; quantity: number; rent_days: number | null };

// Start of the reporting window (local midnight, DAYS-1 days ago). Kept outside the
// component: reading the clock is a side effect.
function periodStart(): Date {
  const since = new Date(Date.now() - (DAYS - 1) * 86_400_000);
  since.setHours(0, 0, 0, 0);
  return since;
}

function dayKey(d: Date) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }); // YYYY-MM-DD
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const since = periodStart();

  const [newOrders, products, recentOrders, periodOrders] = await Promise.all([
    supabase.from("camera_orders").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("camera_products").select("is_active, is_featured"),
    supabase.from("camera_orders").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("camera_orders").select("id, status, type, total_estimate, created_at").gte("created_at", since.toISOString()),
  ]);

  const orders = (periodOrders.data ?? []) as OrderRow[];
  const { data: itemData } = orders.length
    ? await supabase
        .from("camera_order_items")
        .select("order_id, product_name, quantity, rent_days")
        .in("order_id", orders.map((o) => o.id))
    : { data: [] };
  const items = (itemData ?? []) as ItemRow[];

  const revenue = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + (o.total_estimate ?? 0), 0);
  const pipeline = orders
    .filter((o) => o.status === "new" || o.status === "contacted")
    .reduce((sum, o) => sum + (o.total_estimate ?? 0), 0);
  const productRows = products.data ?? [];
  const activeProducts = productRows.filter((p) => p.is_active).length;

  // Requests per day for the last 30 days.
  const perDay = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) perDay.set(dayKey(new Date(since.getTime() + i * 86_400_000)), 0);
  for (const o of orders) {
    const k = dayKey(new Date(o.created_at));
    if (perDay.has(k)) perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const series = [...perDay.entries()];
  const maxDay = Math.max(1, ...series.map(([, n]) => n));

  const byStatus = Object.keys(ORDER_STATUS_LABEL).map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));
  const rentCount = orders.filter((o) => o.type === "rent").length;

  const topProducts = [...items
    .reduce((m, i) => {
      const name = i.product_name ?? "—";
      m.set(name, (m.get(name) ?? 0) + 1);
      return m;
    }, new Map<string, number>())
    .entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    { label: "Yêu cầu mới (chờ xử lý)", value: String(newOrders.count ?? 0) },
    { label: `Yêu cầu ${DAYS} ngày`, value: `${orders.length}`, sub: `${rentCount} thuê · ${orders.length - rentCount} mua` },
    { label: `Doanh thu ước tính ${DAYS} ngày`, value: formatVND(revenue), sub: `Đang chờ chốt: ${formatVND(pipeline)}` },
    { label: "Sản phẩm đang hiển thị", value: `${activeProducts}/${productRows.length}`, sub: `${productRows.filter((p) => p.is_featured).length} nổi bật` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{s.value}</p>
              {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Yêu cầu theo ngày ({DAYS} ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            <div aria-hidden className="flex h-40 items-end gap-1">
              {series.map(([day, n]) => (
                <div key={day} title={`${day}: ${n}`} className="flex flex-1 flex-col justify-end">
                  <div className="rounded-t bg-primary" style={{ height: `${(n / maxDay) * 100}%`, minHeight: n ? 4 : 1 }} />
                </div>
              ))}
            </div>
            <div aria-hidden className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{series[0]?.[0]}</span>
              <span>{series[series.length - 1]?.[0]}</span>
            </div>
            <table className="sr-only">
              <caption>Số yêu cầu theo ngày</caption>
              <tbody>
                {series.map(([day, n]) => (
                  <tr key={day}>
                    <th scope="row">{day}</th>
                    <td>{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Theo trạng thái ({DAYS} ngày)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map(({ s, n }) => (
              <Link key={s} href={`/admin/orders?status=${s}`} className="block text-sm hover:underline">
                <div className="flex justify-between">
                  <span>{ORDER_STATUS_LABEL[s]}</span>
                  <span className="font-medium">{n}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${orders.length ? (n / orders.length) * 100 : 0}%` }} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sản phẩm được hỏi nhiều ({DAYS} ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {topProducts.map(([name, n], i) => (
                  <li key={name} className="flex justify-between gap-3">
                    <span className="truncate">
                      {i + 1}. {name}
                    </span>
                    <span className="shrink-0 font-medium">{n} lượt</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 font-medium">Yêu cầu gần đây</h2>
          {(recentOrders.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có yêu cầu nào.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.data!.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
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
                  <Badge variant="outline">{ORDER_STATUS_LABEL[order.status] ?? order.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
