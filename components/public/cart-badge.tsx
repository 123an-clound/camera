"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartBadge() {
  const { totalCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Giỏ yêu cầu (${totalCount} sản phẩm)`}
      className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ShoppingBag className="size-5" />
      {totalCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
