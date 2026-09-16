"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all__";

const STATUS_LABEL: Record<string, string> = {
  [ALL]: "Tất cả trạng thái",
  new: "Mới",
  contacted: "Đã liên hệ",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="flex gap-3">
      <Input
        placeholder="Tìm theo SĐT..."
        defaultValue={searchParams.get("phone") ?? ""}
        onBlur={(e) => setParam("phone", e.currentTarget.value)}
        className="max-w-56"
      />
      <Select value={searchParams.get("status") ?? ALL} onValueChange={(v) => setParam("status", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Trạng thái">{(value: string) => STATUS_LABEL[value] ?? "Trạng thái"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
          <SelectItem value="new">Mới</SelectItem>
          <SelectItem value="contacted">Đã liên hệ</SelectItem>
          <SelectItem value="confirmed">Đã xác nhận</SelectItem>
          <SelectItem value="completed">Hoàn tất</SelectItem>
          <SelectItem value="cancelled">Đã hủy</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
