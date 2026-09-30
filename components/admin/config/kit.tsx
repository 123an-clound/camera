"use client";

import { useActionState, useEffect, useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveConfigGroup } from "@/app/admin/settings/config-actions";
import { DEFAULTS, type ConfigGroup, type SiteConfigGroups } from "@/lib/site-config-schema";

// One form per config group: edits a local copy, submits it as JSON, toasts the result.
export function ConfigForm<K extends ConfigGroup>({
  group,
  initial,
  children,
  multipart,
}: {
  group: K;
  initial: SiteConfigGroups[K];
  children: (value: SiteConfigGroups[K], set: (next: SiteConfigGroups[K]) => void) => ReactNode;
  multipart?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [state, action, pending] = useActionState(saveConfigGroup.bind(null, group), {});

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.ok) toast.success("Đã lưu — trang web đã cập nhật");
  }, [state]);

  return (
    <form action={action} encType={multipart ? "multipart/form-data" : undefined} className="max-w-3xl space-y-5">
      <input type="hidden" name="payload" value={JSON.stringify(value)} />
      {children(value, setValue)}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setValue(DEFAULTS[group])}>
          <RotateCcw className="size-3.5" /> Khôi phục mặc định
        </Button>
      </div>
    </form>
  );
}

export function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-border/60 p-4">
      <div>
        <p className="font-medium">{title}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  hint,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} value={value} rows={3} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Reorderable list with add/remove. `fixed` keeps the length (reorder only).
export function ListEditor<T>({
  items,
  onChange,
  newItem,
  max = 20,
  fixed,
  addLabel = "Thêm mục",
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem?: () => T;
  max?: number;
  fixed?: boolean;
  addLabel?: string;
  children: (item: T, update: (next: T) => void, index: number) => ReactNode;
}) {
  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="min-w-0 flex-1 space-y-3">
            {children(item, (next) => onChange(items.map((x, k) => (k === i ? next : x))), i)}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Lên" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Xuống"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown />
            </Button>
            {!fixed && (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Xóa"
                onClick={() => onChange(items.filter((_, k) => k !== i))}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      ))}
      {!fixed && newItem && items.length < max && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, newItem()])}>
          <Plus /> {addLabel}
        </Button>
      )}
    </div>
  );
}
