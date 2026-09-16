"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = ["new", "contacted", "confirmed", "completed", "cancelled"];

export async function updateOrderStatus(id: string, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return { error: "Trạng thái không hợp lệ" };

  const supabase = await createClient();
  const { error } = await supabase.from("camera_orders").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}
