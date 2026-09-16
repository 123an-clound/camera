import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`admin-login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Quá nhiều lần thử, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Thông tin đăng nhập không hợp lệ" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
