"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveOrderNote } from "@/app/admin/orders/actions";

export function OrderNoteForm({ orderId, note }: { orderId: string; note: string }) {
  const [state, action, pending] = useActionState(saveOrderNote.bind(null, orderId), {});

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.ok) toast.success("Đã lưu ghi chú");
  }, [state]);

  return (
    <form action={action} className="space-y-2 rounded-xl border border-border/60 p-4">
      <Label htmlFor="admin_note">Ghi chú nội bộ (khách không thấy)</Label>
      <Textarea
        id="admin_note"
        name="admin_note"
        rows={4}
        maxLength={2000}
        defaultValue={note}
        placeholder="Đã gọi lúc 10h, hẹn nhận máy chiều thứ 7…"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu ghi chú"}
      </Button>
    </form>
  );
}
