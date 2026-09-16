"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/lib/types";

const ALL = "__all__";

const MODE_LABEL: Record<string, string> = { [ALL]: "Tất cả", sale: "Bán", rent: "Cho thuê" };
const SORT_LABEL: Record<string, string> = { newest: "Mới nhất", price_asc: "Giá tăng dần", price_desc: "Giá giảm dần" };

export function ProductFilters({ categories, brands }: { categories: Category[]; brands: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryLabel: Record<string, string> = { [ALL]: "Tất cả danh mục", ...Object.fromEntries(categories.map((c) => [c.slug, c.name])) };
  const brandLabel: Record<string, string> = { [ALL]: "Tất cả hãng", ...Object.fromEntries(brands.map((b) => [b, b])) };

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === ALL) params.delete(key);
      else params.set(key, value);
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Input
        placeholder="Tìm theo tên..."
        defaultValue={searchParams.get("q") ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("q", e.currentTarget.value);
        }}
        onBlur={(e) => setParam("q", e.currentTarget.value)}
        className="col-span-2 md:col-span-1"
      />

      <Select value={searchParams.get("mode") ?? ALL} onValueChange={(v) => setParam("mode", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Hình thức">{(v: string) => MODE_LABEL[v] ?? "Hình thức"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả</SelectItem>
          <SelectItem value="sale">Bán</SelectItem>
          <SelectItem value="rent">Cho thuê</SelectItem>
        </SelectContent>
      </Select>

      <Select value={searchParams.get("category") ?? ALL} onValueChange={(v) => setParam("category", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Danh mục">{(v: string) => categoryLabel[v] ?? "Danh mục"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả danh mục</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("brand") ?? ALL} onValueChange={(v) => setParam("brand", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Hãng">{(v: string) => brandLabel[v] ?? "Hãng"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả hãng</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Giá từ"
        defaultValue={searchParams.get("minPrice") ?? ""}
        onBlur={(e) => setParam("minPrice", e.currentTarget.value)}
      />
      <Input
        type="number"
        placeholder="Giá đến"
        defaultValue={searchParams.get("maxPrice") ?? ""}
        onBlur={(e) => setParam("maxPrice", e.currentTarget.value)}
      />

      <Select value={searchParams.get("sort") ?? "newest"} onValueChange={(v) => setParam("sort", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Sắp xếp">{(v: string) => SORT_LABEL[v] ?? "Sắp xếp"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="price_asc">Giá tăng dần</SelectItem>
          <SelectItem value="price_desc">Giá giảm dần</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
