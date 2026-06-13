-- ============================================================================
--  WarpSki — Supabase schema + Row Level Security
--  Run this in the Supabase SQL editor (or `supabase db push`).
--  Every table has RLS ENABLED with least-privilege policies.
-- ============================================================================

-- ── Extensions ──
create extension if not exists "pgcrypto";

-- ── Enum for product categories ──
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_category') then
    create type product_category as enum ('performance', 'recreation', 'accessories', 'second_hand');
  end if;
end$$;

-- ============================================================================
--  ADMINS — links an auth user to admin privileges
-- ============================================================================
create table if not exists public.admins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A user may read ONLY their own admin row. This is what powers the
-- `isAdmin` check on the client (a returned row == you are an admin).
drop policy if exists "admins read own" on public.admins;
create policy "admins read own"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- No client-side writes to `admins`. Admins are provisioned by a privileged
-- role (service key / SQL editor) only — see the bootstrap snippet below.

-- Helper: is the current user an admin? (SECURITY DEFINER to avoid recursive RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ============================================================================
--  PRODUCTS
-- ============================================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  category    product_category not null,
  tagline     text not null default '',
  description text not null default '',
  price       numeric(12,2) not null check (price >= 0),
  sale_price  numeric(12,2) check (sale_price >= 0),
  currency    text not null default 'USD',
  images      jsonb not null default '[]'::jsonb,
  specs       jsonb not null default '[]'::jsonb,
  highlights  jsonb not null default '[]'::jsonb,
  in_stock    boolean not null default true,
  featured    boolean not null default false,
  rating      numeric(2,1) default 0,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone (even anonymous) may READ the catalogue.
drop policy if exists "products public read" on public.products;
create policy "products public read"
  on public.products for select
  to anon, authenticated
  using (true);

-- Only admins may INSERT / UPDATE / DELETE products.
drop policy if exists "products admin write" on public.products;
create policy "products admin write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
--  MESSAGES — contact form submissions
-- ============================================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anonymous visitors may INSERT a message (contact form) but never read them.
drop policy if exists "messages anon insert" on public.messages;
create policy "messages anon insert"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- Only admins may READ submitted messages.
drop policy if exists "messages admin read" on public.messages;
create policy "messages admin read"
  on public.messages for select
  to authenticated
  using (public.is_admin());

-- ============================================================================
--  ORDERS (optional) — a signed-in user owns their orders
-- ============================================================================
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  email       text not null,
  items       jsonb not null default '[]'::jsonb,
  total       numeric(12,2) not null check (total >= 0),
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders owner insert" on public.orders;
create policy "orders owner insert"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

-- ============================================================================
--  BOOTSTRAP — promote a user to admin (run once, in the SQL editor)
--  1. Create the user via the Auth dashboard or the app's sign-up.
--  2. Replace the email below and run:
-- ============================================================================
-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'admin@warpski.example'
-- on conflict (user_id) do nothing;
