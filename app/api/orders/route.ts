import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/schemas/order";
import { isRateLimited } from "@/lib/rate-limit";

// Business-rule codes raised by create_camera_order_v2 → messages safe to show customers.
const RULE_MESSAGES: Record<string, string> = {
  RENT_DATES_REQUIRED: "Vui lòng chọn ngày nhận và ngày trả máy.",
  RENT_DATES_INVALID: "Ngày trả phải sau hoặc bằng ngày nhận.",
  RENT_START_PAST: "Ngày nhận máy đã qua, vui lòng chọn lại ngày thuê.",
  RENT_TOO_LONG: "Thời gian thuê tối đa 365 ngày.",
  OUT_OF_STOCK: "Một sản phẩm không còn đủ số lượng, vui lòng giảm số lượng.",
  PRODUCT_UNAVAILABLE: "Một sản phẩm đã ngừng kinh doanh, vui lòng xoá khỏi giỏ.",
  PRODUCT_NOT_FOR_SALE: "Một sản phẩm hiện không bán, vui lòng xoá khỏi giỏ.",
  PRODUCT_NOT_FOR_RENT: "Một sản phẩm hiện không cho thuê, vui lòng xoá khỏi giỏ.",
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`orders:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createClient();

  // Prices, rental days and availability are all computed in the database; the client only
  // says which products and which dates.
  const { data, error } = await supabase.rpc("create_camera_order_v2", {
    p_type: input.type,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail || null,
    p_note: input.note || null,
    p_rent_start: input.type === "rent" ? (input.rentStart ?? null) : null,
    p_rent_end: input.type === "rent" ? (input.rentEnd ?? null) : null,
    p_items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    p_client_token: input.clientToken ?? null,
  });

  if (error) {
    const rule = RULE_MESSAGES[error.message];
    if (rule) return NextResponse.json({ error: rule, code: error.message }, { status: 409 });
    // Unexpected: log the code only (no customer data), return a generic message.
    console.error("create_camera_order_v2 failed", error.code, error.message);
    return NextResponse.json({ error: "Không tạo được yêu cầu, vui lòng thử lại." }, { status: 500 });
  }

  return NextResponse.json({ orderId: data }, { status: 201 });
}
