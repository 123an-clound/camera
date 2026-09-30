import type { SupabaseClient } from "@supabase/supabase-js";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

// Strip characters that carry meaning in PostgREST filter syntax (",", "()", "*", "%", "\")
// so a search term can't inject extra `or` conditions.
export function sanitizeSearch(q: string) {
  return q.replace(/[,()*%\\]/g, " ").trim().slice(0, 80);
}

// Shared filter for the orders list and CSV export.
export function ordersQuery(supabase: SupabaseClient, opts: { status?: string; q?: string }) {
  let query = supabase.from("camera_orders").select("*, camera_order_items(*)").order("created_at", { ascending: false });
  if (opts.status && opts.status in ORDER_STATUS_LABEL) query = query.eq("status", opts.status);
  const q = opts.q ? sanitizeSearch(opts.q) : "";
  if (q) query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`);
  return query;
}
