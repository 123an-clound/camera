import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function uploadFromUrl(bucket, sourceUrl, filename, contentType) {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`fetch failed ${sourceUrl}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(filename, buf, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(filename).data.publicUrl;
}

console.log("Seeding site_settings...");
await supabase.from("camera_site_settings").upsert(
  [
    { key: "store_name", value: "Camera Rent" },
    { key: "hero_title", value: "Bán & Cho thuê máy ảnh chính hãng" },
    { key: "hero_subtitle", value: "Canon, Sony, Fujifilm — thuê theo ngày, giao nhận tận nơi." },
    { key: "phone", value: "0901 234 567" },
    { key: "email", value: "lienhe@camerarent.vn" },
    { key: "address", value: "123 Nguyễn Huệ, Quận 1, TP.HCM" },
    { key: "facebook_url", value: "https://facebook.com/camerarent" },
    { key: "about", value: "Camera Rent chuyên bán và cho thuê máy ảnh, ống kính chính hãng với giá tốt nhất thị trường. Đội ngũ tư vấn tận tâm, hỗ trợ 24/7." },
  ],
  { onConflict: "key" }
);

console.log("Seeding categories...");
const { data: categories, error: catError } = await supabase
  .from("camera_categories")
  .upsert(
    [
      { name: "Máy ảnh", slug: "may-anh", description: "Thân máy DSLR, Mirrorless", sort_order: 1 },
      { name: "Ống kính", slug: "ong-kinh", description: "Lens cho các hệ máy", sort_order: 2 },
    ],
    { onConflict: "slug" }
  )
  .select();
if (catError) throw catError;
const catId = (slug) => categories.find((c) => c.slug === slug).id;

console.log("Downloading sample .glb models...");
const cameraGlbUrl = await uploadFromUrl(
  "models-3d",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
  "antique-camera.glb",
  "model/gltf-binary"
);
const helmetGlbUrl = await uploadFromUrl(
  "models-3d",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
  "damaged-helmet.glb",
  "model/gltf-binary"
);

const products = [
  {
    name: "Canon EOS R6 Mark II",
    slug: "canon-eos-r6-mark-ii",
    brand: "Canon",
    category: "may-anh",
    short_desc: "Full-frame mirrorless, quay 4K60p, lấy nét siêu nhanh.",
    description: "Canon EOS R6 Mark II là thân máy full-frame mirrorless cao cấp, phù hợp cho cả chụp ảnh và quay video chuyên nghiệp. Chống rung 5 trục, lấy nét theo mắt/động vật/xe cộ.",
    specs: { "Cảm biến": "Full-frame 24.2MP", "Quay video": "4K60p", "ISO": "100-102400", "Chống rung": "5 trục, 8 stop" },
    is_for_sale: true,
    is_for_rent: true,
    sale_price: 62000000,
    rent_price_day: 450000,
    rent_deposit: 5000000,
    stock: 3,
    condition: "Mới 100%",
    is_featured: true,
    model3d: cameraGlbUrl,
  },
  {
    name: "Sony Alpha A7 IV",
    slug: "sony-alpha-a7-iv",
    brand: "Sony",
    category: "may-anh",
    short_desc: "Hybrid full-frame 33MP, video 4K10bit.",
    description: "Sony A7 IV cân bằng hoàn hảo giữa chụp ảnh độ phân giải cao và quay video chuyên nghiệp, lấy nét AI theo thời gian thực.",
    specs: { "Cảm biến": "Full-frame 33MP", "Quay video": "4K30p 10-bit", "ISO": "100-51200", "Khe thẻ": "Dual SD/CFexpress" },
    is_for_sale: true,
    is_for_rent: true,
    sale_price: 58000000,
    rent_price_day: 420000,
    rent_deposit: 5000000,
    stock: 2,
    condition: "Mới 100%",
    is_featured: true,
    model3d: helmetGlbUrl,
  },
  {
    name: "Fujifilm X-T5",
    slug: "fujifilm-x-t5",
    brand: "Fujifilm",
    category: "may-anh",
    short_desc: "APS-C 40MP, thiết kế cổ điển, màu phim Film Simulation.",
    description: "Fujifilm X-T5 mang thiết kế retro, cảm biến APS-C 40MP độ chi tiết cao cùng 20 chế độ giả lập màu phim đặc trưng của Fujifilm.",
    specs: { "Cảm biến": "APS-C 40.2MP", "Quay video": "6.2K30p", "ISO": "125-12800", "Chống rung": "5 trục, 7 stop" },
    is_for_sale: true,
    is_for_rent: true,
    sale_price: 42000000,
    rent_price_day: 350000,
    rent_deposit: 4000000,
    stock: 4,
    condition: "Mới 100%",
    is_featured: true,
  },
  {
    name: "Canon EOS 90D",
    slug: "canon-eos-90d",
    brand: "Canon",
    category: "may-anh",
    short_desc: "DSLR APS-C 32.5MP, phù hợp người mới.",
    description: "Canon EOS 90D là lựa chọn DSLR APS-C mạnh mẽ cho người mới bắt đầu, độ phân giải cao, pin trâu, giá hợp lý.",
    specs: { "Cảm biến": "APS-C 32.5MP", "Quay video": "4K30p", "ISO": "100-25600" },
    is_for_sale: true,
    is_for_rent: true,
    sale_price: 25000000,
    rent_price_day: 220000,
    rent_deposit: 3000000,
    stock: 5,
    condition: "Like new 98%",
    is_featured: false,
  },
  {
    name: "Ống kính Canon RF 24-70mm f/2.8L",
    slug: "canon-rf-24-70mm-f28l",
    brand: "Canon",
    category: "ong-kinh",
    short_desc: "Lens zoom tiêu chuẩn khẩu lớn, sắc nét toàn dải.",
    description: "Canon RF 24-70mm f/2.8L IS USM là lens zoom tiêu chuẩn cao cấp, khẩu độ f/2.8 không đổi, chống rung quang học.",
    specs: { "Tiêu cự": "24-70mm", "Khẩu độ": "f/2.8", "Ngàm": "Canon RF" },
    is_for_sale: true,
    is_for_rent: true,
    sale_price: 45000000,
    rent_price_day: 280000,
    rent_deposit: 4000000,
    stock: 2,
    condition: "Mới 100%",
    is_featured: false,
  },
  {
    name: "Ống kính Sony FE 70-200mm f/2.8 GM",
    slug: "sony-fe-70-200mm-f28-gm",
    brand: "Sony",
    category: "ong-kinh",
    short_desc: "Lens tele khẩu lớn, chuyên chụp chân dung, thể thao.",
    description: "Sony FE 70-200mm f/2.8 GM II nhẹ hơn 30% so với đời trước, lấy nét cực nhanh, chất lượng quang học hàng đầu.",
    specs: { "Tiêu cự": "70-200mm", "Khẩu độ": "f/2.8", "Ngàm": "Sony E" },
    is_for_sale: false,
    is_for_rent: true,
    rent_price_day: 320000,
    rent_deposit: 4500000,
    stock: 0,
    condition: "Mới 100%",
    is_featured: false,
  },
];

console.log("Seeding products...");
for (const [i, p] of products.entries()) {
  const { data: product, error } = await supabase
    .from("camera_products")
    .upsert(
      {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category_id: catId(p.category),
        short_desc: p.short_desc,
        description: p.description,
        specs: p.specs,
        is_for_sale: p.is_for_sale,
        is_for_rent: p.is_for_rent,
        sale_price: p.sale_price ?? null,
        rent_price_day: p.rent_price_day ?? null,
        rent_deposit: p.rent_deposit ?? null,
        stock: p.stock,
        rent_available: true,
        condition: p.condition,
        model_3d_url: p.model3d ?? null,
        is_featured: p.is_featured,
        is_active: true,
        sort_order: i,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  if (error) throw error;

  const seed = encodeURIComponent(p.slug);
  const imageUrl = await uploadFromUrl(
    "product-images",
    `https://picsum.photos/seed/${seed}/900/900`,
    `${p.slug}.jpg`,
    "image/jpeg"
  );
  await supabase.from("camera_product_images").delete().eq("product_id", product.id);
  await supabase
    .from("camera_product_images")
    .insert({ product_id: product.id, url: imageUrl, sort_order: 0, is_primary: true });

  console.log(`  seeded ${p.name}`);
}

console.log("Seeding banners...");
await supabase.from("camera_banners").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const bannerImg1 = await uploadFromUrl("site-assets", "https://picsum.photos/seed/banner1/1600/700", "banner-1.jpg", "image/jpeg");
const bannerImg2 = await uploadFromUrl("site-assets", "https://picsum.photos/seed/banner2/1600/700", "banner-2.jpg", "image/jpeg");
await supabase.from("camera_banners").insert([
  { title: "Ưu đãi thuê máy ảnh cuối tuần", subtitle: "Giảm 15% cho đơn thuê từ 3 ngày", image_url: bannerImg1, sort_order: 0, is_active: true },
  { title: "Bộ sưu tập máy ảnh Full-frame", subtitle: "Canon · Sony chính hãng, bảo hành 12 tháng", image_url: bannerImg2, sort_order: 1, is_active: true },
]);

console.log("Done.");
