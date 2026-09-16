"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import type { ProductWithImages } from "@/lib/types";

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function AddToCart({ product, imageUrl }: { product: ProductWithImages; imageUrl: string | null }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const today = new Date().toISOString().slice(0, 10);
  const [rentStart, setRentStart] = useState(today);
  const [rentEnd, setRentEnd] = useState(today);

  const rentDays = useMemo(() => daysBetween(rentStart, rentEnd), [rentStart, rentEnd]);
  const rentTotal = (product.rent_price_day ?? 0) * rentDays;

  function handleAddSale() {
    addItem({
      id: `sale:${product.id}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl,
      type: "sale",
      unitPrice: product.sale_price ?? 0,
      quantity,
    });
    toast.success("Đã thêm vào giỏ (Mua)");
  }

  function handleAddRent() {
    if (rentEnd < rentStart) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    addItem({
      id: `rent:${product.id}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl,
      type: "rent",
      unitPrice: product.rent_price_day ?? 0,
      quantity: 1,
      rentDays,
      rentStart,
      rentEnd,
    });
    toast.success("Đã thêm vào giỏ (Thuê)");
  }

  const canSale = product.is_for_sale && product.sale_price != null;
  const canRent = product.is_for_rent && product.rent_price_day != null && product.rent_available;

  if (!canSale && !canRent) {
    return <p className="text-sm text-muted-foreground">Sản phẩm hiện không khả dụng.</p>;
  }

  const SaleBlock = (
    <div className="space-y-3">
      <p className="text-2xl font-semibold">{formatVND(product.sale_price ?? 0)}</p>
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          aria-label="Số lượng"
          className="w-20"
        />
        <Button onClick={handleAddSale} disabled={product.stock <= 0}>
          {product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ (Mua)"}
        </Button>
      </div>
    </div>
  );

  const RentBlock = (
    <div className="space-y-3">
      <p className="text-2xl font-semibold">{formatVND(product.rent_price_day ?? 0)}/ngày</p>
      {product.rent_deposit != null && (
        <p className="text-sm text-muted-foreground">Cọc: {formatVND(product.rent_deposit)}</p>
      )}
      <div className="flex gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Từ ngày</label>
          <Input type="date" value={rentStart} min={today} onChange={(e) => setRentStart(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Đến ngày</label>
          <Input type="date" value={rentEnd} min={rentStart} onChange={(e) => setRentEnd(e.target.value)} />
        </div>
      </div>
      <p className="text-sm">
        Tạm tính ({rentDays} ngày): <span className="font-medium">{formatVND(rentTotal)}</span>
      </p>
      <Button onClick={handleAddRent}>Thêm vào giỏ (Thuê)</Button>
    </div>
  );

  if (canSale && canRent) {
    return (
      <Tabs defaultValue="sale">
        <TabsList>
          <TabsTrigger value="sale">Mua</TabsTrigger>
          <TabsTrigger value="rent">Thuê</TabsTrigger>
        </TabsList>
        <TabsContent value="sale">{SaleBlock}</TabsContent>
        <TabsContent value="rent">{RentBlock}</TabsContent>
      </Tabs>
    );
  }

  return canSale ? SaleBlock : RentBlock;
}
