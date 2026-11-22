-- Wannabe Events — PostgreSQL Schema + Row Level Security + Admin Role (Supabase)
-- Event: 11 დეკემბერი, 2026 • 20:00 • ბარი „წრე“ (მ. წინამძღვრიშვილის 133)

create extension if not exists pgcrypto;

-- 1. User Profiles (mirrors auth.users + role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- Helper function for RLS checks without recursion
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id and role = 'user');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid() = id
      and role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- Automatically create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Ticket Orders / Requests (Authenticated Users Only — Admin Verification Unlocks QR Ticket)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_code text not null unique,
  event_id text not null default 'wannabe-dec-11',
  event_title text not null,
  event_date text not null,
  venue_name text not null,
  address text not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  quantity integer not null check (quantity >= 1 and quantity <= 6),
  unit_price integer not null default 25 check (unit_price = 25),
  total_amount integer not null check (total_amount = quantity * 25),
  bank_name text not null,
  bank_iban text not null,
  transfer_note text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  admin_note text not null default '',
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists admin_note text not null default '',
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by uuid references auth.users(id);

create index if not exists orders_user_id_created_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Authenticated users can create own pending orders" on public.orders;
create policy "Authenticated users can create own pending orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Admins can update any order status" on public.orders;
create policy "Admins can update any order status"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Lineup Favorites (Authenticated Users)
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slot_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add own favorites" on public.favorites;
create policy "Users can add own favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove own favorites" on public.favorites;
create policy "Users can remove own favorites"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

-- Backfill profiles for any users who signed up before schema upload
insert into public.profiles (id, full_name, email, phone)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'phone', '')
from auth.users u
on conflict (id) do nothing;

-- Enable Supabase Realtime on orders so approved QR tickets unlock automatically
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- 4. Admin-Only Ticket Verification RPC (Triggered when scanning QR -> /?ticket=CODE)
-- Strictly locked: anonymous visitors & non-admin accounts CANNOT inspect tickets via QR scan.
drop function if exists public.verify_ticket(text);
create or replace function public.verify_ticket(p_order_code text)
returns table (
  order_code text,
  event_title text,
  event_date text,
  venue_name text,
  address text,
  buyer_name text,
  quantity integer,
  unit_price integer,
  total_amount integer,
  status text,
  checked_in_at timestamptz,
  created_at timestamptz,
  admin_note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'მხოლოდ ადმინის ანგარიშს აქვს QR ბილეთის ნახვისა და შემოწმების უფლება'
      using errcode = '42501';
  end if;

  return query
  select
    o.order_code,
    o.event_title,
    o.event_date,
    o.venue_name,
    o.address,
    o.buyer_name,
    o.quantity,
    o.unit_price,
    o.total_amount,
    o.status,
    o.checked_in_at,
    o.created_at,
    o.admin_note
  from public.orders o
  where upper(o.order_code) = upper(trim(coalesce(p_order_code, '')))
  limit 1;
end;
$$;

revoke all on function public.verify_ticket(text) from public, anon, authenticated;
grant execute on function public.verify_ticket(text) to authenticated;

-- 5. Admin Door Check-In RPC (Marks a confirmed ticket as scanned/entered once)
create or replace function public.check_in_ticket(p_order_code text)
returns table (
  order_code text,
  event_title text,
  event_date text,
  venue_name text,
  address text,
  buyer_name text,
  quantity integer,
  unit_price integer,
  total_amount integer,
  status text,
  checked_in_at timestamptz,
  created_at timestamptz,
  admin_note text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_order_code, '')));
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'მხოლოდ ადმინს შეუძლია ბილეთის გატარება'
      using errcode = '42501';
  end if;

  update public.orders o
  set checked_in_at = now(),
      checked_in_by = auth.uid()
  where upper(o.order_code) = v_code
    and o.status = 'confirmed'
    and o.checked_in_at is null;

  return query
  select
    o.order_code,
    o.event_title,
    o.event_date,
    o.venue_name,
    o.address,
    o.buyer_name,
    o.quantity,
    o.unit_price,
    o.total_amount,
    o.status,
    o.checked_in_at,
    o.created_at,
    o.admin_note
  from public.orders o
  where upper(o.order_code) = v_code
  limit 1;
end;
$$;

revoke all on function public.check_in_ticket(text) from public, anon, authenticated;
grant execute on function public.check_in_ticket(text) to authenticated;

notify pgrst, 'reload schema';
