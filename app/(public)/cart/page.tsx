"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOrderSchema } from "@/lib/schemas/order";
import { useCart, type CartItem } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import { z } from "zod";

const contactSchema = createOrderSchema.pick({
  customerName: true,
  customerPhone: true,
  customerEmail: true,
  note: true,
});
type ContactForm = z.infer<typeof contactSchema>;

function lineTotal(item: CartItem) {
  return item.type === "rent" ? item.unitPrice * (item.rentDays ?? 1) : item.unitPrice * item.quantity;
}

function CartGroup({ title, items, onRemove }: { title: string; items: CartItem[]; onRemove: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 font-medium">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.slug}`} className="line-clamp-1 font-medium hover:underline">
                {item.name}
              </Link>
              {item.type === "rent" ? (
                <p className="text-sm text-muted-foreground">
                  {item.rentStart} → {item.rentEnd} ({item.rentDays} ngày)
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
              )}
              <p className="text-sm font-medium">{formatVND(lineTotal(item))}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
              Xóa
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, clear, totalEstimate } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const saleItems = items.filter((i) => i.type === "sale");
  const rentItems = items.filter((i) => i.type === "rent");

  async function submitGroup(type: "sale" | "rent", groupItems: CartItem[], contact: ContactForm) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        ...contact,
        rentStart: type === "rent" ? groupItems[0]?.rentStart : undefined,
        rentEnd: type === "rent" ? groupItems[0]?.rentEnd : undefined,
        items: groupItems.map((i) => ({ productId: i.productId, quantity: i.quantity, rentDays: i.rentDays })),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Gửi yêu cầu thất bại");
    }
  }

  async function onSubmit(contact: ContactForm) {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      if (saleItems.length > 0) await submitGroup("sale", saleItems, contact);
      if (rentItems.length > 0) await submitGroup("rent", rentItems, contact);
      clear();
      toast.success("Đã gửi yêu cầu, cửa hàng sẽ liên hệ với bạn sớm.");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Giỏ yêu cầu đang trống.</p>
        <Link href="/products" className={buttonVariants({ className: "mt-4" })}>
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-8 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Giỏ yêu cầu</h1>
        <CartGroup title="Mua" items={saleItems} onRemove={removeItem} />
        <CartGroup title="Thuê" items={rentItems} onRemove={removeItem} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="h-fit space-y-4 rounded-xl border border-border/60 p-5">
        <p className="flex justify-between font-medium">
          <span>Tạm tính</span>
          <span>{formatVND(totalEstimate)}</span>
        </p>

        <div className="space-y-1">
          <Label htmlFor="customerName">Họ tên *</Label>
          <Input id="customerName" {...register("customerName")} />
          {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="customerPhone">Số điện thoại *</Label>
          <Input id="customerPhone" {...register("customerPhone")} />
          {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="customerEmail">Email</Label>
          <Input id="customerEmail" type="email" {...register("customerEmail")} />
          {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea id="note" {...register("note")} />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
      </form>
    </div>
  );
}
