import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/admin-auth";
import { ORDER_STATUS_LABEL, ordersQuery } from "@/lib/order-query";

type Item = { product_name: string | null; quantity: number; rent_days: number | null };

// Excel-safe CSV cell: quote everything and neutralise formula injection (=, +, -, @).
function cell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const auth = await getAdminClient();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 403 });

  const sp = request.nextUrl.searchParams;
  const { data, error } = await ordersQuery(auth.supabase, {
    status: sp.get("status") ?? undefined,
    q: sp.get("q") ?? undefined,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = ["Ngày tạo", "Loại", "Trạng thái", "Khách hàng", "SĐT", "Email", "Thuê từ", "Thuê đến", "Sản phẩm", "Tạm tính (VND)", "Ghi chú khách", "Ghi chú nội bộ"];
  const rows = (data ?? []).map((o) =>
    [
      new Date(o.created_at).toLocaleString("vi-VN"),
      o.type === "sale" ? "Mua" : "Thuê",
      ORDER_STATUS_LABEL[o.status] ?? o.status,
      o.customer_name,
      o.customer_phone,
      o.customer_email,
      o.rent_start,
      o.rent_end,
      (o.camera_order_items as Item[])
        .map((i) => `${i.product_name} × ${i.rent_days ? `${i.rent_days} ngày` : i.quantity}`)
        .join("; "),
      o.total_estimate,
      o.note,
      o.admin_note,
    ]
      .map(cell)
      .join(",")
  );
  // BOM so Excel opens Vietnamese text as UTF-8.
  const csv = "﻿" + [header.map(cell).join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="yeu-cau-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
