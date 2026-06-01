-- Delmar Piggery Farm Management System Database Schema
-- Paste this script directly in the Supabase SQL Editor and run it.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS PROFILE TABLE
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique not null,
  phone text,
  address text,
  role text default 'customer' check (role in ('admin', 'customer')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- USERS RLS Policies
create policy "Public profiles read-only" on public.users 
  for select using (true);

create policy "Users can update own profile" on public.users 
  for update using (auth.uid() = id);

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamp with time zone default now()
);

alter table public.categories enable row level security;
create policy "Categories public read" on public.categories for select using (true);
create policy "Categories admin modify" on public.categories for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 3. PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  unit text not null,
  category_id uuid references public.categories(id) on delete set null,
  stock_status text default 'Available',
  specifications text,
  status text default 'Active',
  created_at timestamp with time zone default now()
);

alter table public.products enable row level security;
create policy "Products public read" on public.products for select using (status = 'Active');
create policy "Products admin modify" on public.products for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 4. INVENTORY TABLE
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Piglets', 'Fattening Pigs', 'Fresh Pork Meat', 'Lechon Packages', 'Catering Packages', 'Sweet Corners', 'Food Packages')),
  quantity integer not null default 0 check (quantity >= 0),
  unit text not null default 'pcs',
  price numeric not null default 0,
  min_stock_level integer not null default 5,
  status text not null default 'Available' check (status in ('Available', 'Low Stock', 'Out of Stock')),
  tag_number text unique,
  breed text,
  age_weeks integer,
  weight_kg numeric,
  pen_number text,
  health_status text default 'Healthy' check (health_status in ('Healthy', 'Under Treatment', 'Sick', 'N/A')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.inventory enable row level security;
create policy "Inventory admin all" on public.inventory for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Inventory select authenticated" on public.inventory for select using (true);

-- 5. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  order_date date default current_date,
  total_amount numeric not null,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Awaiting Payment', 'Payment Verification', 'Processing', 'Ready For Pickup', 'Out For Delivery', 'Delivered', 'Completed', 'Cancelled')),
  payment_status text default 'Pending' check (payment_status in ('Paid', 'Pending')),
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;
create policy "Orders read own" on public.orders for select using (auth.uid() = user_id or exists (
  select 1 from public.users where id = auth.uid() and role = 'admin'
));
create policy "Orders insert authenticated" on public.orders for insert with check (auth.uid() = user_id);
create policy "Orders admin update" on public.orders for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 6. ORDER_ITEMS TABLE
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null,
  created_at timestamp with time zone default now()
);

alter table public.order_items enable row level security;
create policy "Order items read access" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    ))
  )
);
create policy "Order items insert authenticated" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);

-- 7. RESERVATIONS TABLE
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  category text not null check (category in ('Piglets', 'Fattening Pigs', 'Crispylicious Lechon', 'Catering Services')),
  quantity integer not null check (quantity > 0),
  price numeric not null,
  reservation_date date default current_date,
  pickup_date date not null,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Declined', 'Completed')),
  created_at timestamp with time zone default now()
);

-- Double booking prevention trigger for Catering Services
create or replace function public.check_double_booking()
returns trigger as $$
begin
  if new.category = 'Catering Services' and new.status = 'Approved' then
    if exists (
      select 1 from public.reservations 
      where category = 'Catering Services' 
        and status = 'Approved' 
        and pickup_date = new.pickup_date
        and id != new.id
    ) then
      raise exception 'This date is already fully booked for Catering Services.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_double_booking on public.reservations;
create trigger trg_prevent_double_booking
  before insert or update on public.reservations
  for each row execute procedure public.check_double_booking();

alter table public.reservations enable row level security;
create policy "Reservations read access" on public.reservations for select using (auth.uid() = user_id or exists (
  select 1 from public.users where id = auth.uid() and role = 'admin'
));
create policy "Reservations insert authenticated" on public.reservations for insert with check (auth.uid() = user_id);
create policy "Reservations admin update" on public.reservations for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 8. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete cascade,
  amount numeric not null,
  payment_method text not null,
  reference_number text,
  proof_of_payment_url text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamp with time zone default now()
);

alter table public.payments enable row level security;
create policy "Payments read access" on public.payments for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin') or 
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()) or
  exists (select 1 from public.reservations r where r.id = reservation_id and r.user_id = auth.uid())
);
create policy "Payments insert own" on public.payments for insert with check (true);

-- 9. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;
create policy "Reviews read public" on public.reviews for select using (true);
create policy "Reviews write authenticated" on public.reviews for insert with check (auth.uid() = user_id);

-- 10. GALLERY TABLE
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  caption text,
  color text,
  created_at timestamp with time zone default now()
);

alter table public.gallery enable row level security;
create policy "Gallery read public" on public.gallery for select using (true);
create policy "Gallery admin modify" on public.gallery for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 11. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('order', 'reservation', 'system')),
  read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;
create policy "Notifications read personal" on public.notifications for select using (
  user_id = auth.uid() or (user_id is null) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);
create policy "Notifications update personal" on public.notifications for update using (user_id = auth.uid());

-- 12. INVENTORY_LOGS TABLE
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references public.inventory(id) on delete cascade not null,
  action text not null check (action in ('Stock In', 'Stock Out', 'Sale', 'Manual Adjustment', 'Status Update')),
  quantity_changed integer not null default 0,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.inventory_logs enable row level security;
create policy "Logs admin access" on public.inventory_logs for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 13. FAQS TABLE
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default now()
);

alter table public.faqs enable row level security;
create policy "FAQs read public" on public.faqs for select using (true);
create policy "FAQs admin modify" on public.faqs for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);


-- ==================== PROCEDURES & TRIGGERS ====================

-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- Creates a row in public.users whenever an entry is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Customer'),
    new.email,
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- AUTOMATIC STOCK ADJUSTMENT TRIGGER ON ORDER COMPLETED (DELIVERED)
create or replace function public.adjust_stock_on_delivery()
returns trigger as $$
declare
  item_record record;
  product_name text;
  inv_id uuid;
  new_qty integer;
  new_status text;
begin
  -- Only trigger when order is set to 'Delivered'
  if new.status = 'Delivered' and (old.status is null or old.status != 'Delivered') then
    
    -- Loop through order items
    for item_record in 
      select product_id, quantity from public.order_items where order_id = new.id
    loop
      -- Get product name
      select name into product_name from public.products where id = item_record.product_id;
      
      if product_name is not null then
        -- Find matching inventory item (by case-insensitive name match)
        select id into inv_id from public.inventory 
        where lower(name) = lower(product_name) 
        limit 1;
        
        -- Fallback to category match if no direct name match
        if inv_id is null then
          select i.id into inv_id from public.inventory i
          join public.products p on lower(i.category) = lower(p.unit)
          where p.id = item_record.product_id
          limit 1;
        end if;
        
        -- Adjust stock if matching inventory item is found
        if inv_id is not null then
          -- Decrement quantity
          update public.inventory 
          set quantity = greatest(0, quantity - item_record.quantity),
              updated_at = now()
          where id = inv_id
          returning quantity into new_qty;
          
          -- Determine new status based on min_stock_level
          select 
            case 
              when new_qty = 0 then 'Out of Stock'
              when new_qty <= min_stock_level then 'Low Stock'
              else 'Available'
            end
          into new_status
          from public.inventory
          where id = inv_id;
          
          update public.inventory set status = new_status where id = inv_id;
          
          -- Log the stock adjustment
          insert into public.inventory_logs (inventory_id, action, quantity_changed, notes)
          values (inv_id, 'Sale', -item_record.quantity, 'Auto-decrement from completed order ' || new.id);
          
          -- Trigger Low Stock notification alert if applicable
          if new_status = 'Low Stock' or new_status = 'Out of Stock' then
            insert into public.notifications (user_id, title, message, type)
            values (
              null, -- system notification
              'Low Stock Alert: ' || product_name,
              'Inventory item ' || product_name || ' has dropped to ' || new_qty || ' units (Threshold: ' || (select min_stock_level from public.inventory where id = inv_id) || ').',
              'system'
            );
          end if;
          
        end if;
      end if;
      
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_order_delivered on public.orders;
create trigger on_order_delivered
  after update on public.orders
  for each row execute procedure public.adjust_stock_on_delivery();


-- Create table public.chatbot_settings
create table if not exists public.chatbot_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

alter table public.chatbot_settings enable row level security;
create policy "Chatbot settings read public" on public.chatbot_settings for select using (true);
create policy "Chatbot settings admin modify" on public.chatbot_settings for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- SEED INSTRUCTIONS:
-- After registering an account via the frontend, you can set it as the single admin using this SQL query:
-- update public.users set role = 'admin' where email = 'your_admin_email@example.com';
