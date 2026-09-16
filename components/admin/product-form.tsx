"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpecsEditor } from "@/components/admin/specs-editor";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { createProduct, updateProduct, type ActionState } from "@/app/admin/products/actions";
import type { Category } from "@/lib/types";
import type { ProductWithImages } from "@/lib/types";

const initialState: ActionState = {};

export function ProductForm({ product, categories }: { product?: ProductWithImages; categories: Category[] }) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.ok) toast.success("Đã lưu sản phẩm");
  }, [state]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Tên sản phẩm *</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug (để trống tự tạo)</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="brand">Hãng</Label>
          <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category_id">Danh mục</Label>
          <Select name="category_id" defaultValue={product?.category_id ?? ""}>
            <SelectTrigger id="category_id">
              <SelectValue placeholder="Chọn danh mục">
                {(v: string) => categories.find((c) => c.id === v)?.name ?? "Chọn danh mục"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="condition">Tình trạng</Label>
          <Input id="condition" name="condition" placeholder="Mới 100%, Like new 98%..." defaultValue={product?.condition ?? ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stock">Tồn kho</Label>
          <Input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="short_desc">Mô tả ngắn</Label>
        <Input id="short_desc" name="short_desc" defaultValue={product?.short_desc ?? ""} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea id="description" name="description" rows={6} defaultValue={product?.description ?? ""} />
      </div>

      <div className="space-y-2 rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2">
          <Switch id="is_for_sale" name="is_for_sale" defaultChecked={product?.is_for_sale ?? true} />
          <Label htmlFor="is_for_sale">Cho phép bán</Label>
        </div>
        <Input name="sale_price" type="number" min={0} placeholder="Giá bán (VND)" defaultValue={product?.sale_price ?? ""} />
      </div>

      <div className="space-y-2 rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2">
          <Switch id="is_for_rent" name="is_for_rent" defaultChecked={product?.is_for_rent ?? true} />
          <Label htmlFor="is_for_rent">Cho phép thuê</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input name="rent_price_day" type="number" min={0} placeholder="Giá thuê/ngày (VND)" defaultValue={product?.rent_price_day ?? ""} />
          <Input name="rent_deposit" type="number" min={0} placeholder="Tiền cọc (VND)" defaultValue={product?.rent_deposit ?? ""} />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="rent_available" name="rent_available" defaultChecked={product?.rent_available ?? true} />
          <Label htmlFor="rent_available">Còn hàng cho thuê</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thông số kỹ thuật</Label>
        <SpecsEditor initial={product?.specs ?? {}} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch id="is_featured" name="is_featured" defaultChecked={product?.is_featured ?? false} />
          <Label htmlFor="is_featured">Nổi bật</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="is_active" name="is_active" defaultChecked={product?.is_active ?? true} />
          <Label htmlFor="is_active">Hiển thị công khai</Label>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sort_order">Thứ tự</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} />
        </div>
      </div>

      {product && product.camera_product_images.length > 0 && (
        <div className="space-y-2">
          <Label>Ảnh hiện có</Label>
          <ProductImageManager productId={product.id} images={product.camera_product_images} />
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="images">{product ? "Thêm ảnh mới" : "Ảnh sản phẩm"}</Label>
        <Input id="images" name="images" type="file" accept="image/*" multiple />
      </div>

      <div className="space-y-1">
        <Label htmlFor="model3d">Model 3D (.glb, tối đa 20MB)</Label>
        <Input id="model3d" name="model3d" type="file" accept=".glb" />
        {product?.model_3d_url && <p className="text-xs text-muted-foreground">Đã có model 3D — chọn file mới để thay thế.</p>}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : product ? "Lưu thay đổi" : "Tạo sản phẩm"}
      </Button>
    </form>
  );
}
