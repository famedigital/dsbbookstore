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
