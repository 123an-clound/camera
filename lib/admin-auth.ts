import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Server-side gate for every admin mutation. The Supabase project is shared with another
// app, so "signed in" is not enough: the user must be on the camera_admins allowlist.
// RLS enforces the same rule in the database; this gives a clean error before any query.
export async function getAdminClient(): Promise<{ supabase: SupabaseClient } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." };

  const { data: isAdmin, error } = await supabase.rpc("camera_is_admin");
  if (error || isAdmin !== true) return { error: "Tài khoản không có quyền quản trị." };

  return { supabase };
}
