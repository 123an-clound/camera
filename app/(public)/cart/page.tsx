"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOrderSchema } from "@/lib/schemas/order";
import { useCart, type CartItem } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import { currentUnitPrice, groupForSubmit, lineDays, lineIssue, lineTotal, type ProductNow } from "@/lib/cart-logic";
import { todayInShop } from "@/lib/rental";
import { getCartProducts } from "./actions";

const contactSchema = createOrderSchema.pick({
  customerName: true,
  customerPhone: true,
  customerEmail: true,
  note: true,
});
type ContactForm = z.infer<typeof contactSchema>;

// One idempotency token per submission group, kept in sessionStorage so a retry (double
// click, lost response, even a reload) reuses it and can never create the same request twice.
function submissionToken(key: string): string {
  const storageKey = `order-token:${key}`;
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const token = crypto.randomUUID();
    sessionStorage.setItem(storageKey, token);
    return token;
  } catch {
    return crypto.randomUUID();
  }
}

function CartLineRow({
  item,
  oldPrice,
  issue,
  onRemove,
  onQuantity,
}: {
  item: CartItem;
  oldPrice: number | null;
  issue: string | null;
  onRemove: () => void;
  onQuantity: (q: number) => void;
}) {
  return (
    <div className={`rounded-lg border p-3 ${issue ? "border-destructive/60" : "border-border/60"}`}>
      <div className="flex items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/products/${item.slug}`} className="line-clamp-1 font-medium hover:underline">
            {item.name}
          </Link>
          {item.type === "rent" ? (
            <p className="text-sm text-muted-foreground">
              {item.rentStart} → {item.rentEnd} ({lineDays(item)} ngày × {formatVND(item.unitPrice)})
            </p>
          ) : (
            <label className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              Số lượng
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={50}
                value={item.quantity}
                onChange={(e) => onQuantity(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
                className="h-8 w-16"
              />
            </label>
          )}
          <p className="text-sm font-medium">
            {formatVND(lineTotal(item))}
            {oldPrice != null && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (giá cập nhật, trước đây <s>{formatVND(oldPrice)}</s>/{item.type === "rent" ? "ngày" : "sp"})
              </span>
            )}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Xoá ${item.name} khỏi giỏ`}>
          Xoá
        </Button>
      </div>
      {issue && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {issue}
        </p>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items: storedItems, removeItem, updateQuantity } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Map<string, ProductNow> | null>(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentOrders, setSentOrders] = useState<string[] | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  // Re-read current price/availability: the cart is stored in the browser and may be stale.
  const productKey = [...new Set(storedItems.map((i) => i.productId))].sort().join(",");
  useEffect(() => {
    if (!productKey) return;
    let cancelled = false;
    getCartProducts(productKey.split(","))
      .then((list) => {
        if (!cancelled) setProducts(new Map(list.map((p) => [p.id, p])));
      })
      .catch(() => {
        // Server re-validates on submit anyway; don't block the customer on a refresh failure.
        if (!cancelled) {
          setRefreshFailed(true);
          setProducts(new Map());
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productKey]);

  // Show and total the *current* price (the one the server will charge); remember the
  // stored one only to tell the customer it changed.
  const items = useMemo(
    () =>
      storedItems.map((item) => {
        const price = products && !refreshFailed ? currentUnitPrice(item, products.get(item.productId)) : null;
        return price != null && price !== item.unitPrice ? { ...item, unitPrice: price, oldPrice: item.unitPrice } : { ...item, oldPrice: null };
      }),
    [storedItems, products, refreshFailed]
  );
  const totalEstimate = items.reduce((sum, i) => sum + lineTotal(i), 0);
  const priceChanged = items.some((i) => i.oldPrice != null);

  const today = todayInShop();
  const issues = useMemo(() => {
    const map = new Map<string, string | null>();
    if (!products || refreshFailed) return map;
    for (const item of items) map.set(item.id, lineIssue(item, products.get(item.productId), today));
    return map;
  }, [items, products, refreshFailed, today]);
  const hasIssues = [...issues.values()].some(Boolean);

  async function onSubmit(contact: ContactForm) {
    if (items.length === 0 || hasIssues) return;
    setSubmitting(true);
    setSubmitError(null);
    const created: string[] = [];
    try {
      for (const group of groupForSubmit(items)) {
        const clientToken = submissionToken(`${group.key}|${group.lines.map((l) => `${l.id}x${l.quantity}`).join(",")}`);

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: group.type,
            ...contact,
            rentStart: group.rentStart,
            rentEnd: group.rentEnd,
            clientToken,
            items: group.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Gửi yêu cầu thất bại, vui lòng thử lại.");
        created.push(String(body.orderId));
        // Remove what was sent so a retry after a later failure only sends the rest.
        group.lines.forEach((l) => removeItem(l.id));
      }
      setSentOrders(created);
      toast.success("Đã gửi yêu cầu, cửa hàng sẽ liên hệ với bạn sớm.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gửi yêu cầu thất bại, vui lòng thử lại.";
      setSubmitError(created.length ? `${created.length} yêu cầu đã gửi thành công. ${message}` : message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sentOrders) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Đã gửi yêu cầu</h1>
        <p className="mt-3 text-muted-foreground">
          Cửa hàng sẽ gọi lại để xác nhận lịch nhận máy và tiền cọc. Mã yêu cầu của bạn:
        </p>
        <p className="mt-3 font-mono text-lg text-primary">
          {sentOrders.map((id) => id.slice(0, 8).toUpperCase()).join(" · ")}
        </p>
        <Link href="/products" className={buttonVariants({ className: "mt-6" })}>
          Tiếp tục xem sản phẩm
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Giỏ yêu cầu</h1>
        <p className="mt-3 text-muted-foreground">Giỏ yêu cầu đang trống.</p>
        <Link href="/products" className={buttonVariants({ className: "mt-4" })}>
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  const saleItems = items.filter((i) => i.type === "sale");
  const rentItems = items.filter((i) => i.type === "rent");
  const fieldError = (name: keyof ContactForm) =>
    errors[name] ? (
      <p id={`${name}-error`} className="text-sm text-destructive">
        {errors[name]?.message}
      </p>
    ) : null;

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-8 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Giỏ yêu cầu</h1>
        {priceChanged && (
          <p role="status" className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
            Giá một số sản phẩm đã được cập nhật theo giá hiện tại.
          </p>
        )}
        {[
          ["Mua", saleItems],
          ["Thuê", rentItems],
        ].map(([title, list]) =>
          (list as typeof items).length === 0 ? null : (
            <section key={title as string}>
              <h2 className="mb-3 font-medium">{title as string}</h2>
              <div className="space-y-3">
                {(list as typeof items).map((item) => (
                  <CartLineRow
                    key={item.id}
                    item={item}
                    oldPrice={item.oldPrice}
                    issue={issues.get(item.id) ?? null}
                    onRemove={() => removeItem(item.id)}
                    onQuantity={(q) => updateQuantity(item.id, q)}
                  />
                ))}
              </div>
            </section>
          )
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="h-fit space-y-4 rounded-xl border border-border/60 p-5">
        <p className="flex justify-between font-medium">
          <span>Tạm tính</span>
          <span>{formatVND(totalEstimate)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Đây là yêu cầu, chưa phải thanh toán. Cửa hàng sẽ liên hệ xác nhận, báo tiền cọc (nếu thuê) và lịch nhận máy.
        </p>

        <div className="space-y-1">
          <Label htmlFor="customerName">Họ tên *</Label>
          <Input
            id="customerName"
            autoComplete="name"
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={errors.customerName ? "customerName-error" : undefined}
            {...register("customerName")}
          />
          {fieldError("customerName")}
        </div>
        <div className="space-y-1">
          <Label htmlFor="customerPhone">Số điện thoại *</Label>
          <Input
            id="customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.customerPhone)}
            aria-describedby={errors.customerPhone ? "customerPhone-error" : undefined}
            {...register("customerPhone")}
          />
          {fieldError("customerPhone")}
        </div>
        <div className="space-y-1">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.customerEmail)}
            aria-describedby={errors.customerEmail ? "customerEmail-error" : undefined}
            {...register("customerEmail")}
          />
          {fieldError("customerEmail")}
        </div>
        <div className="space-y-1">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea id="note" maxLength={1000} {...register("note")} />
        </div>

        {submitError && (
          <p role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </p>
        )}
        {hasIssues && (
          <p className="text-sm text-destructive">Vui lòng xử lý các sản phẩm được đánh dấu trước khi gửi.</p>
        )}

        <Button type="submit" disabled={submitting || hasIssues || products === null} className="w-full">
          {submitting ? "Đang gửi..." : products === null ? "Đang kiểm tra giá..." : "Gửi yêu cầu"}
        </Button>
      </form>
    </div>
  );
}
