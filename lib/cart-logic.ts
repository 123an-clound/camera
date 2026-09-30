// Pure cart rules (no React, no I/O) so they can be self-checked: node lib/cart-logic.check.mjs
import { rentalDays, validateRentalRange } from "./rental.ts";

export type CartLine = {
  id: string;
  productId: string;
  type: "sale" | "rent";
  unitPrice: number;
  quantity: number;
  rentStart?: string;
  rentEnd?: string;
};

export type ProductNow = {
  id: string;
  salePrice: number | null;
  rentPriceDay: number | null;
  stock: number;
  canSale: boolean;
  canRent: boolean;
};

export function lineDays(line: CartLine): number {
  return line.type === "rent" && line.rentStart && line.rentEnd ? rentalDays(line.rentStart, line.rentEnd) : 1;
}

export function lineTotal(line: CartLine): number {
  return line.type === "rent" ? line.unitPrice * lineDays(line) : line.unitPrice * line.quantity;
}

// One order per type, and for rentals one order per date range: an order carries a single
// pickup/return window, so items with different dates must not be merged.
export function groupForSubmit<T extends CartLine>(lines: T[]) {
  const groups = new Map<string, { key: string; type: "sale" | "rent"; rentStart?: string; rentEnd?: string; lines: T[] }>();
  for (const line of lines) {
    const key = line.type === "sale" ? "sale" : `rent:${line.rentStart}:${line.rentEnd}`;
    const g = groups.get(key) ?? { key, type: line.type, rentStart: line.rentStart, rentEnd: line.rentEnd, lines: [] };
    g.lines.push(line);
    groups.set(key, g);
  }
  return [...groups.values()];
}

// Why a cart line can't be submitted as-is (null = OK), given the product's current state.
export function lineIssue(line: CartLine, product: ProductNow | undefined, today: string): string | null {
  if (!product) return "Sản phẩm đã ngừng kinh doanh.";
  if (line.type === "sale") {
    if (!product.canSale) return "Sản phẩm hiện không bán.";
    if (product.stock <= 0) return "Sản phẩm đã hết hàng.";
    if (line.quantity > product.stock) return `Chỉ còn ${product.stock} sản phẩm.`;
    return null;
  }
  if (!product.canRent) return "Sản phẩm hiện không cho thuê.";
  return validateRentalRange(line.rentStart, line.rentEnd, today);
}

// Current unit price for the line (null when the product can no longer be ordered this way).
export function currentUnitPrice(line: CartLine, product: ProductNow | undefined): number | null {
  if (!product) return null;
  return line.type === "sale" ? product.salePrice : product.rentPriceDay;
}
