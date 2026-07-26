-- Supabase SQL Editor Script for Member and Payment Management System
-- Paste this script directly in the Supabase SQL Editor and run it.

-- 1. BATCHES TABLE
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  total_due numeric not null default 5000 check (total_due >= 0),
  status text not null default 'Active' check (status in ('Active', 'Archived')),
  created_at timestamp with time zone default now()
);

alter table public.batches enable row level security;
create policy "Batches select access" on public.batches for select using (true);
create policy "Batches admin modify" on public.batches for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 2. MEMBERS TABLE
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  member_id text unique not null,
  full_name text not null,
  contact_number text not null,
  email text unique not null,
  address text not null,
  date_registered date not null default current_date,
  membership_status text not null default 'Active' check (membership_status in ('Active', 'Inactive', 'Archived')),
  batch_id uuid references public.batches(id) on delete set null,
  total_due numeric not null default 5000 check (total_due >= 0),
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.members enable row level security;
create policy "Members select access" on public.members for select using (true);
create policy "Members admin modify" on public.members for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 3. MEMBER PAYMENTS TABLE
create table if not exists public.member_payments (
  id uuid primary key default gen_random_uuid(),
  receipt_number text unique not null,
  member_id uuid references public.members(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete set null,
  payment_date date not null default current_date,
  payment_method text not null,
  amount_paid numeric not null check (amount_paid >= 0),
  collector text not null,
  remarks text,
  created_at timestamp with time zone default now()
);

alter table public.member_payments enable row level security;
create policy "Member payments select access" on public.member_payments for select using (true);
create policy "Member payments admin modify" on public.member_payments for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
