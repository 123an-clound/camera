"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/admin-auth";
import type { ActionState } from "@/app/admin/products/actions";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = ["new", "contacted", "confirmed", "completed", "cancelled"];

export async function updateOrderStatus(id: string, status: string): Promise<ActionState> {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return { error: "Trạng thái không hợp lệ" };

  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("camera_orders").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

// Internal note, only visible in admin.
export async function saveOrderNote(id: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const note = String(formData.get("admin_note") ?? "").trim();
  if (note.length > 2000) return { error: "Ghi chú tối đa 2000 ký tự" };

  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("camera_orders").update({ admin_note: note || null }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<ActionState> {
  const auth = await getAdminClient();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  await supabase.from("camera_order_items").delete().eq("order_id", id);
  const { error } = await supabase.from("camera_orders").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders");
}
