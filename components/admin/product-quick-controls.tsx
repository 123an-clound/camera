"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { duplicateProduct, setProductFlag, setProductSort } from "@/app/admin/products/actions";

function useAction() {
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<{ error?: string } | undefined>) {
    startTransition(async () => {
      const result = await fn();
      if (result?.error) toast.error(result.error);
    });
  }
  return { pending, run };
}

export function ProductQuickControls({
  id,
  isActive,
  isFeatured,
  sortOrder,
  name,
}: {
  id: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  name: string;
}) {
  const { pending, run } = useAction();
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <label className="flex items-center gap-1.5">
        <Switch
          size="sm"
          checked={isActive}
          disabled={pending}
          aria-label={`Hiển thị ${name}`}
          onCheckedChange={(v) => run(() => setProductFlag(id, "is_active", v))}
        />
        Hiển thị
      </label>
      <label className="flex items-center gap-1.5">
        <Switch
          size="sm"
          checked={isFeatured}
          disabled={pending}
          aria-label={`Nổi bật ${name}`}
          onCheckedChange={(v) => run(() => setProductFlag(id, "is_featured", v))}
        />
        Nổi bật
      </label>
      <label className="flex items-center gap-1.5">
        Thứ tự
        <Input
          type="number"
          defaultValue={sortOrder}
          aria-label={`Thứ tự ${name}`}
          className="h-7 w-16"
          onBlur={(e) => {
            const n = Number(e.currentTarget.value);
            if (n !== sortOrder) run(() => setProductSort(id, n));
          }}
        />
      </label>
      <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => run(() => duplicateProduct(id))}>
        <Copy className="size-3.5" /> Nhân bản
      </Button>
    </div>
  );
}

const ALL = "__all__";
const STATUS: Record<string, string> = {
  [ALL]: "Tất cả",
  active: "Đang hiển thị",
  hidden: "Đang ẩn",
  featured: "Nổi bật",
  sale: "Đang bán",
  rent: "Cho thuê",
};

export function ProductFilters({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catLabel: Record<string, string> = { [ALL]: "Mọi danh mục", ...Object.fromEntries(categories.map((c) => [c.id, c.name])) };

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    router.push(`/admin/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        type="search"
        aria-label="Tìm sản phẩm"
        placeholder="Tìm tên, hãng… (Enter)"
        defaultValue={searchParams.get("q") ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("q", e.currentTarget.value);
        }}
        onBlur={(e) => setParam("q", e.currentTarget.value)}
        className="max-w-64"
      />
      <Select value={searchParams.get("status") ?? ALL} onValueChange={(v) => setParam("status", v)}>
        <SelectTrigger className="w-40" aria-label="Lọc trạng thái">
          <SelectValue>{(v: string) => STATUS[v] ?? "Trạng thái"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS).map(([v, label]) => (
            <SelectItem key={v} value={v}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("category") ?? ALL} onValueChange={(v) => setParam("category", v)}>
        <SelectTrigger className="w-44" aria-label="Lọc danh mục">
          <SelectValue>{(v: string) => catLabel[v] ?? "Danh mục"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(catLabel).map(([v, label]) => (
            <SelectItem key={v} value={v}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
