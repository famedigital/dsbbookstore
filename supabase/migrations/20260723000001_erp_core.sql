-- DSB Book Store ERP — core schema
-- System of record for catalogue, inventory ledger, purchasing, sales, CRM, finance

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('owner', 'manager', 'staff', 'customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.availability_status as enum (
    'in_stock', 'low_stock', 'out_of_stock', 'coming_soon', 'enquire_only'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.stock_movement_type as enum (
    'purchase_in', 'sale_out', 'adjustment', 'damage',
    'return_in', 'return_out', 'transfer', 'count_adjust'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.po_status as enum (
    'draft', 'ordered', 'partial', 'received', 'cancelled', 'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'draft', 'confirmed', 'paid', 'cod_pending', 'fulfilled', 'cancelled', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_channel as enum ('pos', 'online', 'phone', 'wholesale');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fulfillment_type as enum (
    'pickup', 'thimphu_delivery', 'nationwide', 'international', 'digital'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum (
    'cash', 'cod', 'bank_qr', 'card', 'transfer', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending', 'completed', 'failed', 'refunded', 'partial'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enquiry_status as enum ('new', 'in_progress', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.publishing_stage as enum (
    'idea', 'editing', 'design', 'print', 'published', 'archived'
  );
exception when duplicate_object then null; end $$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Store settings (singleton row id = 1)
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'DSB Books',
  legal_name text,
  address_line1 text default 'Jojo''s Shopping Complex, Chang Lam',
  city text default 'Thimphu',
  country text default 'Bhutan',
  phone text,
  email text,
  opening_hours text,
  currency_code text not null default 'BTN',
  low_stock_default int not null default 3,
  receipt_footer text,
  tax_enabled boolean not null default false,
  tax_rate numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1)
on conflict (id) do nothing;

-- Authors
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  photo_public_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Collections / curated shelves
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  hero_public_id text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Books (PIM)
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  description text,
  isbn_13 text unique,
  isbn_10 text,
  language text default 'English',
  format text default 'paperback',
  page_count int,
  dimensions text,
  weight_grams int,
  published_at date,
  publisher_name text default 'DSB Publication',
  cost_price_btn numeric(12,2) not null default 0,
  price_btn numeric(12,2) not null default 0,
  compare_at_price_btn numeric(12,2),
  stock_qty int not null default 0,
  low_stock_threshold int,
  availability_status public.availability_status not null default 'out_of_stock',
  cover_public_id text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_authors (
  book_id uuid not null references public.books (id) on delete cascade,
  author_id uuid not null references public.authors (id) on delete cascade,
  sort_order int not null default 0,
  primary key (book_id, author_id)
);

create table if not exists public.book_categories (
  book_id uuid not null references public.books (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (book_id, category_id)
);

create table if not exists public.collection_books (
  collection_id uuid not null references public.collections (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, book_id)
);

-- Suppliers & purchasing
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid references public.suppliers (id),
  status public.po_status not null default 'draft',
  ordered_at timestamptz,
  expected_at date,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  book_id uuid not null references public.books (id),
  qty_ordered int not null check (qty_ordered > 0),
  qty_received int not null default 0,
  unit_cost_btn numeric(12,2) not null default 0
);

create table if not exists public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references public.purchase_orders (id),
  received_at timestamptz not null default now(),
  received_by uuid references public.profiles (id),
  notes text
);

create table if not exists public.goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references public.goods_receipts (id) on delete cascade,
  book_id uuid not null references public.books (id),
  qty int not null check (qty > 0),
  unit_cost_btn numeric(12,2) not null default 0
);

-- Inventory ledger
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id),
  movement_type public.stock_movement_type not null,
  qty_delta int not null,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_book_id_idx on public.stock_movements (book_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements (created_at desc);

-- Customers CRM
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  organization text,
  customer_type text not null default 'individual',
  notes text,
  profile_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enquiries
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status public.enquiry_status not null default 'new',
  assigned_to uuid references public.profiles (id),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- POS sessions
create table if not exists public.pos_sessions (
  id uuid primary key default gen_random_uuid(),
  opened_by uuid not null references public.profiles (id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_float_btn numeric(12,2) not null default 0,
  closing_cash_btn numeric(12,2),
  notes text
);

-- Orders (POS + online)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  channel public.order_channel not null default 'pos',
  status public.order_status not null default 'draft',
  customer_id uuid references public.customers (id),
  customer_name text,
  customer_email text,
  customer_phone text,
  fulfillment_type public.fulfillment_type default 'pickup',
  shipping_address jsonb,
  subtotal_btn numeric(12,2) not null default 0,
  discount_btn numeric(12,2) not null default 0,
  shipping_fee_btn numeric(12,2) not null default 0,
  tax_btn numeric(12,2) not null default 0,
  total_btn numeric(12,2) not null default 0,
  pos_session_id uuid references public.pos_sessions (id),
  created_by uuid references public.profiles (id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  book_id uuid not null references public.books (id),
  title_snapshot text not null,
  quantity int not null check (quantity > 0),
  unit_price_btn numeric(12,2) not null,
  unit_cost_btn numeric(12,2) not null default 0,
  line_total_btn numeric(12,2) not null
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount_btn numeric(12,2) not null,
  reference text,
  received_by uuid references public.profiles (id),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount_btn numeric(12,2) not null,
  expense_date date not null default current_date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Audit log
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- Publishing ops
create table if not exists public.publishing_titles (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books (id),
  working_title text not null,
  stage public.publishing_stage not null default 'idea',
  editor_notes text,
  target_publish_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_runs (
  id uuid primary key default gen_random_uuid(),
  publishing_title_id uuid references public.publishing_titles (id) on delete cascade,
  book_id uuid references public.books (id),
  quantity int not null,
  unit_print_cost_btn numeric(12,2) not null default 0,
  printer_name text,
  printed_at date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.royalty_agreements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors (id),
  book_id uuid references public.books (id),
  royalty_percent numeric(5,2) not null default 0,
  notes text,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.royalty_payouts (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.royalty_agreements (id) on delete cascade,
  amount_btn numeric(12,2) not null,
  period_label text,
  paid_at date,
  notes text,
  created_at timestamptz not null default now()
);

-- Helpers: availability from stock
create or replace function public.recompute_book_availability(p_book_id uuid)
returns void
language plpgsql
as $$
declare
  v_qty int;
  v_threshold int;
  v_status public.availability_status;
begin
  select stock_qty, coalesce(low_stock_threshold, (select low_stock_default from public.store_settings where id = 1))
    into v_qty, v_threshold
  from public.books where id = p_book_id;

  if v_qty is null then
    return;
  end if;

  if v_qty <= 0 then
    v_status := 'out_of_stock';
  elsif v_qty <= v_threshold then
    v_status := 'low_stock';
  else
    v_status := 'in_stock';
  end if;

  update public.books
    set availability_status = v_status, updated_at = now()
  where id = p_book_id;
end;
$$;

-- Apply stock movement and update cache
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
as $$
begin
  update public.books
    set stock_qty = stock_qty + new.qty_delta,
        updated_at = now()
  where id = new.book_id;

  perform public.recompute_book_availability(new.book_id);
  return new;
end;
$$;

drop trigger if exists trg_apply_stock_movement on public.stock_movements;
create trigger trg_apply_stock_movement
  after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- Profile bootstrap on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helpers for RLS
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('owner', 'manager', 'staff')
  );
$$;

create or replace function public.is_manager_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('owner', 'manager')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = 'owner'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.books enable row level security;
alter table public.book_authors enable row level security;
alter table public.book_categories enable row level security;
alter table public.collection_books enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.goods_receipts enable row level security;
alter table public.goods_receipt_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.customers enable row level security;
alter table public.enquiries enable row level security;
alter table public.pos_sessions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.audit_logs enable row level security;
alter table public.publishing_titles enable row level security;
alter table public.print_runs enable row level security;
alter table public.royalty_agreements enable row level security;
alter table public.royalty_payouts enable row level security;

-- Public read published catalogue
drop policy if exists books_public_read on public.books;
create policy books_public_read on public.books for select using (is_published = true or public.is_staff());
drop policy if exists authors_public_read on public.authors;
create policy authors_public_read on public.authors for select using (true);
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections for select using (true);
drop policy if exists book_authors_public_read on public.book_authors;
create policy book_authors_public_read on public.book_authors for select using (true);
drop policy if exists book_categories_public_read on public.book_categories;
create policy book_categories_public_read on public.book_categories for select using (true);
drop policy if exists collection_books_public_read on public.collection_books;
create policy collection_books_public_read on public.collection_books for select using (true);
drop policy if exists store_settings_public_read on public.store_settings;
create policy store_settings_public_read on public.store_settings for select using (true);

-- Public insert enquiries
drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert with check (true);
drop policy if exists enquiries_staff_all on public.enquiries;
create policy enquiries_staff_all on public.enquiries for all using (public.is_staff());

-- Staff write policies
drop policy if exists books_staff_write on public.books;
create policy books_staff_write on public.books for all using (public.is_staff());
drop policy if exists authors_staff_write on public.authors;
create policy authors_staff_write on public.authors for all using (public.is_staff());
drop policy if exists categories_staff_write on public.categories;
create policy categories_staff_write on public.categories for all using (public.is_staff());
drop policy if exists collections_staff_write on public.collections;
create policy collections_staff_write on public.collections for all using (public.is_staff());
drop policy if exists book_authors_staff_write on public.book_authors;
create policy book_authors_staff_write on public.book_authors for all using (public.is_staff());
drop policy if exists book_categories_staff_write on public.book_categories;
create policy book_categories_staff_write on public.book_categories for all using (public.is_staff());
drop policy if exists collection_books_staff_write on public.collection_books;
create policy collection_books_staff_write on public.collection_books for all using (public.is_staff());

drop policy if exists suppliers_staff on public.suppliers;
create policy suppliers_staff on public.suppliers for all using (public.is_staff());
drop policy if exists po_staff on public.purchase_orders;
create policy po_staff on public.purchase_orders for all using (public.is_staff());
drop policy if exists poi_staff on public.purchase_order_items;
create policy poi_staff on public.purchase_order_items for all using (public.is_staff());
drop policy if exists gr_staff on public.goods_receipts;
create policy gr_staff on public.goods_receipts for all using (public.is_staff());
drop policy if exists gri_staff on public.goods_receipt_items;
create policy gri_staff on public.goods_receipt_items for all using (public.is_staff());
drop policy if exists stock_staff on public.stock_movements;
create policy stock_staff on public.stock_movements for all using (public.is_staff());
drop policy if exists customers_staff on public.customers;
create policy customers_staff on public.customers for all using (public.is_staff());
drop policy if exists pos_staff on public.pos_sessions;
create policy pos_staff on public.pos_sessions for all using (public.is_staff());
drop policy if exists orders_staff on public.orders;
create policy orders_staff on public.orders for all using (public.is_staff());
drop policy if exists order_items_staff on public.order_items;
create policy order_items_staff on public.order_items for all using (public.is_staff());
drop policy if exists payments_staff on public.payments;
create policy payments_staff on public.payments for all using (public.is_staff());

drop policy if exists expenses_manager on public.expenses;
create policy expenses_manager on public.expenses for all using (public.is_manager_or_owner());
drop policy if exists audit_manager on public.audit_logs;
create policy audit_manager on public.audit_logs for select using (public.is_manager_or_owner());
drop policy if exists audit_staff_insert on public.audit_logs;
create policy audit_staff_insert on public.audit_logs for insert with check (public.is_staff());
drop policy if exists publishing_manager on public.publishing_titles;
create policy publishing_manager on public.publishing_titles for all using (public.is_manager_or_owner());
drop policy if exists print_runs_manager on public.print_runs;
create policy print_runs_manager on public.print_runs for all using (public.is_manager_or_owner());
drop policy if exists royalty_manager on public.royalty_agreements;
create policy royalty_manager on public.royalty_agreements for all using (public.is_manager_or_owner());
drop policy if exists royalty_payouts_manager on public.royalty_payouts;
create policy royalty_payouts_manager on public.royalty_payouts for all using (public.is_manager_or_owner());
drop policy if exists settings_owner on public.store_settings;
create policy settings_owner on public.store_settings for update using (public.is_owner());

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles for select using (auth.uid() = id or public.is_manager_or_owner());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id or public.is_owner());
drop policy if exists profiles_owner_all on public.profiles;
create policy profiles_owner_all on public.profiles for all using (public.is_owner());

-- Search indexes
create index if not exists books_title_idx on public.books using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(subtitle,'')));
create index if not exists books_isbn_13_idx on public.books (isbn_13);
