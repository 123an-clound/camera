export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  brand: string | null;
  short_desc: string | null;
  description: string | null;
  specs: Record<string, string> | null;
  is_for_sale: boolean;
  is_for_rent: boolean;
  sale_price: number | null;
  rent_price_day: number | null;
  rent_deposit: number | null;
  stock: number;
  rent_available: boolean;
  condition: string | null;
  model_3d_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ProductWithImages = Product & {
  camera_product_images: ProductImage[];
  camera_categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type OrderType = "sale" | "rent";
export type OrderStatus = "new" | "contacted" | "confirmed" | "completed" | "cancelled";

export type Order = {
  id: string;
  type: OrderType;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  note: string | null;
  rent_start: string | null;
  rent_end: string | null;
  status: OrderStatus;
  total_estimate: number | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  unit_price: number | null;
  rent_days: number | null;
};
