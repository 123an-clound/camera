"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/app/admin/settings/actions";
import { settingText, type SiteSettings } from "@/lib/site-settings-shared";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSettings, {});
  const text = (key: string) => settingText(settings, key, "");

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.ok) toast.success("Đã lưu cài đặt");
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <p className="font-medium">Thông tin chung</p>
        <div className="space-y-1">
          <Label htmlFor="store_name">Tên cửa hàng</Label>
          <Input id="store_name" name="store_name" defaultValue={text("store_name")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="logo_url">Logo</Label>
          <Input id="logo_url" name="logo_url" type="file" accept="image/*" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" name="phone" defaultValue={text("phone")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={text("email")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="address">Địa chỉ</Label>
          <Input id="address" name="address" defaultValue={text("address")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="facebook_url">Link Facebook</Label>
          <Input id="facebook_url" name="facebook_url" defaultValue={text("facebook_url")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="about">Giới thiệu</Label>
          <Textarea id="about" name="about" rows={5} defaultValue={text("about")} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <p className="font-medium">Trang chủ (Hero)</p>
        <div className="space-y-1">
          <Label htmlFor="hero_title">Tiêu đề</Label>
          <Input id="hero_title" name="hero_title" defaultValue={text("hero_title")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hero_subtitle">Phụ đề</Label>
          <Input id="hero_subtitle" name="hero_subtitle" defaultValue={text("hero_subtitle")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hero_image">Ảnh hero (dùng khi chưa có banner)</Label>
          <Input id="hero_image" name="hero_image" type="file" accept="image/*" />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu cài đặt"}
      </Button>
    </form>
  );
}
