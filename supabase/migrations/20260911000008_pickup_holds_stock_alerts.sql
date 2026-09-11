-- Pickup holds (Waterstones-style reserve) + back-in-stock alerts

create table if not exists public.pickup_holds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  note text,
  status text not null default 'new'
    check (status in ('new', 'ready', 'collected', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  total_btn numeric(12,2) not null default 0,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pickup_holds_status_idx on public.pickup_holds (status, created_at desc);

alter table public.pickup_holds enable row level security;

create policy pickup_holds_public_insert on public.pickup_holds
  for insert with check (true);

create policy pickup_holds_staff_all on public.pickup_holds
  for all using (public.is_staff());

create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  email text not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (book_id, email)
);

create index if not exists stock_alerts_book_idx on public.stock_alerts (book_id)
  where notified_at is null;

alter table public.stock_alerts enable row level security;

create policy stock_alerts_public_insert on public.stock_alerts
  for insert with check (true);

create policy stock_alerts_staff_all on public.stock_alerts
  for all using (public.is_staff());

comment on table public.pickup_holds is
  'Storefront hold-for-pickup requests; pay at Chang Lam counter';
comment on table public.stock_alerts is
  'Guest back-in-stock email alerts';
