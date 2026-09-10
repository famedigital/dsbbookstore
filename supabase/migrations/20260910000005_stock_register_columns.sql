-- Align catalogue with DSB Stock Register Excel columns:
-- Product | Brand | Pur Rate | Sal Rate | Opening | Closing | Clo Val | UPCEAN

alter table public.books
  add column if not exists brand text,
  add column if not exists opening_qty int not null default 0,
  add column if not exists clo_val_btn numeric(14, 2) not null default 0;

comment on column public.books.title is 'Stock Register: Product';
comment on column public.books.brand is 'Stock Register: Brand (author / imprint)';
comment on column public.books.cost_price_btn is 'Stock Register: Pur Rate';
comment on column public.books.price_btn is 'Stock Register: Sal Rate';
comment on column public.books.opening_qty is 'Stock Register: Opening';
comment on column public.books.stock_qty is 'Stock Register: Closing';
comment on column public.books.clo_val_btn is 'Stock Register: Clo Val (Closing × Sal Rate)';
comment on column public.books.barcode is 'Stock Register: UPCEAN';

create index if not exists books_brand_idx on public.books (brand);
create unique index if not exists books_barcode_unique_idx
  on public.books (barcode)
  where barcode is not null and barcode <> '';

-- Excel-shaped projection for exports / POS-style sheets
create or replace view public.stock_register as
select
  b.id,
  b.title as product,
  coalesce(b.brand, '') as brand,
  b.cost_price_btn as pur_rate,
  b.price_btn as sal_rate,
  b.opening_qty as opening,
  b.stock_qty as closing,
  b.clo_val_btn as clo_val,
  b.barcode as upcean,
  b.product_kind,
  b.availability_status,
  b.is_published,
  b.updated_at
from public.books b;

comment on view public.stock_register is
  'Stock Register sheet shape: Product, Brand, Pur Rate, Sal Rate, Opening, Closing, Clo Val, UPCEAN';

-- Keep Clo Val in sync with Closing × Sal Rate when stock moves
create or replace function public.sync_book_clo_val()
returns trigger
language plpgsql
as $$
begin
  new.clo_val_btn := round(coalesce(new.stock_qty, 0) * coalesce(new.price_btn, 0), 2);
  return new;
end;
$$;

drop trigger if exists trg_sync_book_clo_val on public.books;
create trigger trg_sync_book_clo_val
  before insert or update of stock_qty, price_btn on public.books
  for each row execute function public.sync_book_clo_val();

-- After stock movements update stock_qty, clo_val is refreshed by the books trigger above
-- (apply_stock_movement updates stock_qty → fires trg_sync_book_clo_val).

grant select on public.stock_register to anon, authenticated, service_role;
