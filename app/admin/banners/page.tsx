import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/components/admin/delete-button";
import { createBanner, deleteBanner, updateBanner } from "./actions";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase.from("camera_banners").select("*").order("sort_order");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Banner trang chủ</h1>

      <form
        action={async (formData) => {
          "use server";
          await createBanner(formData);
        }}
        className="max-w-2xl space-y-3 rounded-xl border border-border/60 p-4"
      >
        <p className="font-medium">Thêm banner</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="b-title">Tiêu đề</Label>
            <Input id="b-title" name="title" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="b-subtitle">Phụ đề</Label>
            <Input id="b-subtitle" name="subtitle" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="b-link">Link (tùy chọn)</Label>
            <Input id="b-link" name="link_url" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="b-sort">Thứ tự</Label>
            <Input id="b-sort" name="sort_order" type="number" defaultValue={0} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="b-image">Ảnh banner</Label>
            <Input id="b-image" name="image" type="file" accept="image/*" required />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch name="is_active" defaultChecked />
          <span className="text-sm">Hiển thị</span>
        </div>
        <Button type="submit">Thêm banner</Button>
      </form>

      <div className="space-y-3">
        {(banners ?? []).map((b) => (
          <form
            key={b.id}
            action={async (formData) => {
              "use server";
              await updateBanner(b.id, formData);
            }}
            className="grid grid-cols-[80px_1fr_1fr_auto] items-start gap-3 rounded-lg border border-border/60 p-3"
          >
            <div className="relative size-16 overflow-hidden rounded-md bg-muted">
              <Image src={b.image_url} alt={b.title ?? ""} fill sizes="64px" className="object-cover" />
            </div>
            <div className="space-y-2">
              <Input name="title" defaultValue={b.title ?? ""} placeholder="Tiêu đề" />
              <Input name="subtitle" defaultValue={b.subtitle ?? ""} placeholder="Phụ đề" />
              <Input name="link_url" defaultValue={b.link_url ?? ""} placeholder="Link" />
            </div>
            <div className="space-y-2">
              <Input name="sort_order" type="number" defaultValue={b.sort_order} />
              <Input name="image" type="file" accept="image/*" />
              <div className="flex items-center gap-2">
                <Switch name="is_active" defaultChecked={b.is_active} />
                <span className="text-sm">Hiển thị</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" variant="outline" size="sm">
                Lưu
              </Button>
              <DeleteButton action={deleteBanner.bind(null, b.id)} />
            </div>
          </form>
        ))}
        {(banners ?? []).length === 0 && <p className="text-sm text-muted-foreground">Chưa có banner nào.</p>}
      </div>
    </div>
  );
}
