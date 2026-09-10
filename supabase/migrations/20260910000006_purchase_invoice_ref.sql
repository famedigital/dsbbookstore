-- Supplier invoice / bill reference on purchase orders
alter table public.purchase_orders
  add column if not exists invoice_ref text;

comment on column public.purchase_orders.invoice_ref is
  'Supplier invoice / bill number (POS-style purchase bill ref)';

create index if not exists purchase_orders_invoice_ref_idx
  on public.purchase_orders (invoice_ref)
  where invoice_ref is not null;
