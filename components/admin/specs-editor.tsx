"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Row = { key: string; value: string };

export function SpecsEditor({ initial }: { initial: Record<string, string> }) {
  const [rows, setRows] = useState<Row[]>(
    Object.entries(initial).map(([key, value]) => ({ key, value })).concat([{ key: "", value: "" }])
  );

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (index === next.length - 1 && (value || next[index][field === "key" ? "value" : "key"])) {
        next.push({ key: "", value: "" });
      }
      return next;
    });
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="specs" value={JSON.stringify(rows.filter((r) => r.key.trim()))} />
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <Input placeholder="Thông số (VD: Cảm biến)" value={row.key} onChange={(e) => updateRow(i, "key", e.target.value)} />
          <Input placeholder="Giá trị (VD: Full-frame)" value={row.value} onChange={(e) => updateRow(i, "value", e.target.value)} />
          {i < rows.length - 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(i)}>
              <X className="size-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
