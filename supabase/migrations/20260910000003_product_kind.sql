-- Product kinds for books / stationery / other on the unified catalogue table
do $$ begin
  create type public.product_kind as enum ('book', 'stationery', 'other');
exception when duplicate_object then null; end $$;

alter table public.store_settings
  add column if not exists bank_qr_image_url text;

alter table public.books
  add column if not exists product_kind public.product_kind not null default 'book',
  add column if not exists barcode text,
  add column if not exists sku_code text;

create index if not exists books_product_kind_idx on public.books (product_kind);
create index if not exists books_barcode_idx on public.books (barcode);

comment on column public.books.product_kind is
  'Merchandising kind: book (website /books), stationery (/stationery), other (ERP/Counter)';
comment on column public.store_settings.bank_qr_image_url is
  'Optional Bhutan QR image URL shown on Counter tender Bhutan QR tab';
