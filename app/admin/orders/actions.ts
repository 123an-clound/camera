"use server";

import { revalidatePath } from "next/cache";
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
  revalidatePath("/admin");
  return { ok: true };
}
