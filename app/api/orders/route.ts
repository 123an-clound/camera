import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/schemas/order";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`orders:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_camera_order", {
    p_type: input.type,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail || null,
    p_note: input.note || null,
    p_rent_start: input.rentStart || null,
    p_rent_end: input.rentEnd || null,
    p_items: input.items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
      rent_days: i.rentDays,
    })),
  });

  if (error) {
    return NextResponse.json({ error: "Không tạo được yêu cầu, vui lòng thử lại." }, { status: 400 });
  }

  return NextResponse.json({ orderId: data }, { status: 201 });
}
