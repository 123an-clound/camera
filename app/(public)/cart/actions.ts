"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type CartProductState = {
  id: string;
  name: string;
  salePrice: number | null;
  rentPriceDay: number | null;
  stock: number;
  canSale: boolean;
  canRent: boolean;
};

const ids = z.array(z.string().uuid()).max(50);

// Current price/availability for the products in a cart (the cart itself lives in
// localStorage and can be days old). Only public, active-product fields are returned.
export async function getCartProducts(productIds: string[]): Promise<CartProductState[]> {
  const parsed = ids.safeParse(productIds);
  if (!parsed.success || parsed.data.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("camera_products")
    .select("id, name, sale_price, rent_price_day, stock, is_for_sale, is_for_rent, rent_available")
    .in("id", parsed.data)
    .eq("is_active", true);

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    salePrice: p.sale_price,
    rentPriceDay: p.rent_price_day,
    stock: p.stock ?? 0,
    canSale: Boolean(p.is_for_sale && p.sale_price != null),
    canRent: Boolean(p.is_for_rent && p.rent_price_day != null && p.rent_available),
  }));
}
