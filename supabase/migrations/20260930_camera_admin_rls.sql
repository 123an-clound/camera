-- Camera shop admin allowlist + RLS hardening.
-- The Supabase project is shared with another app, so "authenticated" is not the same as
-- "camera shop admin". Every camera write/admin-read now requires camera_is_admin().

create table if not exists public.camera_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.camera_admins enable row level security;
drop policy if exists camera_admins_self_read on public.camera_admins;
create policy camera_admins_self_read on public.camera_admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.camera_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.camera_admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.camera_is_admin() from public, anon;
grant execute on function public.camera_is_admin() to authenticated;

-- Seed the shop owner's existing account.
insert into public.camera_admins (user_id)
select id from auth.users where email = 'phamtuanan3939@gmail.com'
on conflict do nothing;

-- Admin-editable content tables: public read stays, writes admin-only.
drop policy if exists camera_banners_write_auth on public.camera_banners;
create policy camera_banners_write_admin on public.camera_banners
  for all to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());
drop policy if exists camera_banners_select_active on public.camera_banners;
create policy camera_banners_select_active on public.camera_banners
  for select to anon, authenticated using (is_active = true);
create policy camera_banners_select_admin on public.camera_banners
  for select to authenticated using (public.camera_is_admin());

drop policy if exists camera_products_write_auth on public.camera_products;
create policy camera_products_write_admin on public.camera_products
  for all to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());
drop policy if exists camera_products_select_active on public.camera_products;
create policy camera_products_select_active on public.camera_products
  for select to anon, authenticated using (is_active = true);
create policy camera_products_select_admin on public.camera_products
  for select to authenticated using (public.camera_is_admin());

drop policy if exists camera_categories_write_auth on public.camera_categories;
create policy camera_categories_write_admin on public.camera_categories
  for all to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());

drop policy if exists camera_product_images_write_auth on public.camera_product_images;
create policy camera_product_images_write_admin on public.camera_product_images
  for all to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());

drop policy if exists camera_site_settings_write_auth on public.camera_site_settings;
create policy camera_site_settings_write_admin on public.camera_site_settings
  for all to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());

-- Orders: public may only insert (via the order form); everything else admin-only.
drop policy if exists camera_orders_select_auth on public.camera_orders;
drop policy if exists camera_orders_update_auth on public.camera_orders;
drop policy if exists camera_orders_delete_auth on public.camera_orders;
create policy camera_orders_select_admin on public.camera_orders
  for select to authenticated using (public.camera_is_admin());
create policy camera_orders_update_admin on public.camera_orders
  for update to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());
create policy camera_orders_delete_admin on public.camera_orders
  for delete to authenticated using (public.camera_is_admin());

drop policy if exists camera_order_items_select_auth on public.camera_order_items;
drop policy if exists camera_order_items_update_auth on public.camera_order_items;
drop policy if exists camera_order_items_delete_auth on public.camera_order_items;
create policy camera_order_items_select_admin on public.camera_order_items
  for select to authenticated using (public.camera_is_admin());
create policy camera_order_items_update_admin on public.camera_order_items
  for update to authenticated using (public.camera_is_admin()) with check (public.camera_is_admin());
create policy camera_order_items_delete_admin on public.camera_order_items
  for delete to authenticated using (public.camera_is_admin());

-- Storage: camera buckets writable by camera admins only.
drop policy if exists camera_bucket_auth_write on storage.objects;
drop policy if exists camera_bucket_auth_update on storage.objects;
drop policy if exists camera_bucket_auth_delete on storage.objects;
create policy camera_bucket_admin_write on storage.objects
  for insert to authenticated
  with check (bucket_id = any (array['product-images', 'models-3d', 'site-assets']) and public.camera_is_admin());
create policy camera_bucket_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = any (array['product-images', 'models-3d', 'site-assets']) and public.camera_is_admin());
create policy camera_bucket_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = any (array['product-images', 'models-3d', 'site-assets']) and public.camera_is_admin());

-- New admin features.
alter table public.camera_orders add column if not exists admin_note text;
alter table public.camera_products add column if not exists seo_title text;
alter table public.camera_products add column if not exists seo_description text;
