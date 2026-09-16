import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DeleteButton } from "@/components/admin/delete-button";
import { createCategory, deleteCategory, updateCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("camera_categories").select("*").order("sort_order");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Danh mục</h1>

      <form
        action={async (formData) => {
          "use server";
          await createCategory(formData);
        }}
        className="grid max-w-2xl grid-cols-2 gap-3 rounded-xl border border-border/60 p-4"
      >
        <div className="space-y-1">
          <Label htmlFor="new-name">Tên danh mục</Label>
          <Input id="new-name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-slug">Slug (để trống tự tạo)</Label>
          <Input id="new-slug" name="slug" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="new-desc">Mô tả</Label>
          <Input id="new-desc" name="description" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-sort">Thứ tự</Label>
          <Input id="new-sort" name="sort_order" type="number" defaultValue={0} />
        </div>
        <div className="flex items-end">
          <Button type="submit">Thêm danh mục</Button>
        </div>
      </form>

      <div className="space-y-3">
        {(categories ?? []).map((c) => (
          <form
            key={c.id}
            action={async (formData) => {
              "use server";
              await updateCategory(c.id, formData);
            }}
            className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] items-end gap-3 rounded-lg border border-border/60 p-3"
          >
            <Input name="name" defaultValue={c.name} />
            <Input name="slug" defaultValue={c.slug} />
            <Input name="description" defaultValue={c.description ?? ""} />
            <Input name="sort_order" type="number" defaultValue={c.sort_order} className="w-20" />
            <Button type="submit" variant="outline" size="sm">
              Lưu
            </Button>
            <DeleteButton action={deleteCategory.bind(null, c.id)} />
          </form>
        ))}
        {(categories ?? []).length === 0 && <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>}
      </div>
    </div>
  );
}
