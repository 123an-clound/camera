-- Order integrity: server-derived rental days, date + stock validation, idempotent submits.
-- Non-destructive: adds a nullable column and a new function; the original 8-argument
-- create_camera_order stays (the currently deployed app calls it) and now delegates to v2.

alter table public.camera_orders add column if not exists client_token uuid;
create unique index if not exists camera_orders_client_token_key
  on public.camera_orders (client_token) where client_token is not null;

create or replace function public.create_camera_order_v2(
  p_type text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_note text,
  p_rent_start date,
  p_rent_end date,
  p_items jsonb,
  p_client_token uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total numeric := 0;
  v_item jsonb;
  v_product camera_products%rowtype;
  v_qty int;
  v_days int;
  v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  -- Idempotency: a retried submit (same token) returns the order already created.
  if p_client_token is not null then
    select id into v_order_id from camera_orders where client_token = p_client_token;
    if found then
      return v_order_id;
    end if;
  end if;

  if p_type not in ('sale', 'rent') then
    raise exception 'INVALID_TYPE';
  end if;
  if p_customer_name is null or length(trim(p_customer_name)) = 0 or length(p_customer_name) > 120 then
    raise exception 'INVALID_NAME';
  end if;
  if p_customer_phone is null or length(trim(p_customer_phone)) < 8 or length(p_customer_phone) > 20 then
    raise exception 'INVALID_PHONE';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 20 then
    raise exception 'INVALID_ITEMS';
  end if;

  -- Rental length is derived from the dates, never taken from the client.
  if p_type = 'rent' then
    if p_rent_start is null or p_rent_end is null then
      raise exception 'RENT_DATES_REQUIRED';
    end if;
    if p_rent_end < p_rent_start then
      raise exception 'RENT_DATES_INVALID';
    end if;
    if p_rent_start < v_today then
      raise exception 'RENT_START_PAST';
    end if;
    v_days := greatest(1, p_rent_end - p_rent_start);
    if v_days > 365 then
      raise exception 'RENT_TOO_LONG';
    end if;
  end if;

  begin
    insert into camera_orders (type, customer_name, customer_phone, customer_email, note,
                               rent_start, rent_end, total_estimate, client_token)
    values (p_type, trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_customer_email), ''),
            nullif(trim(p_note), ''),
            case when p_type = 'rent' then p_rent_start end,
            case when p_type = 'rent' then p_rent_end end,
            0, p_client_token)
    returning id into v_order_id;
  exception when unique_violation then
    -- Concurrent retry with the same token won the race.
    select id into v_order_id from camera_orders where client_token = p_client_token;
    return v_order_id;
  end;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from camera_products
      where id = (v_item->>'product_id')::uuid and is_active = true;
    if not found then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;

    if p_type = 'sale' then
      if not v_product.is_for_sale or v_product.sale_price is null then
        raise exception 'PRODUCT_NOT_FOR_SALE';
      end if;
      v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
      if v_qty > 50 then
        raise exception 'INVALID_ITEMS';
      end if;
      if v_qty > coalesce(v_product.stock, 0) then
        raise exception 'OUT_OF_STOCK';
      end if;
      insert into camera_order_items (order_id, product_id, product_name, quantity, unit_price, rent_days)
      values (v_order_id, v_product.id, v_product.name, v_qty, v_product.sale_price, null);
      v_total := v_total + v_product.sale_price * v_qty;
    else
      if not v_product.is_for_rent or v_product.rent_price_day is null or not v_product.rent_available then
        raise exception 'PRODUCT_NOT_FOR_RENT';
      end if;
      insert into camera_order_items (order_id, product_id, product_name, quantity, unit_price, rent_days)
      values (v_order_id, v_product.id, v_product.name, 1, v_product.rent_price_day, v_days);
      v_total := v_total + v_product.rent_price_day * v_days;
    end if;
  end loop;

  update camera_orders set total_estimate = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

revoke all on function public.create_camera_order_v2(text, text, text, text, text, date, date, jsonb, uuid) from public;
grant execute on function public.create_camera_order_v2(text, text, text, text, text, date, date, jsonb, uuid) to anon, authenticated;

-- Keep the original signature for the currently deployed app; same rules, no token.
create or replace function public.create_camera_order(
  p_type text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_note text,
  p_rent_start date,
  p_rent_end date,
  p_items jsonb
)
returns uuid
language sql
security definer
set search_path = public
as $$
  select public.create_camera_order_v2(p_type, p_customer_name, p_customer_phone, p_customer_email,
                                       p_note, p_rent_start, p_rent_end, p_items, null);
$$;
