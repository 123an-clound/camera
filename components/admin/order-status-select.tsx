"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-36">
        <SelectValue>{(value: OrderStatus) => STATUS_LABEL[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
