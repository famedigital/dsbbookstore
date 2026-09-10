create or replace function public.sync_book_clo_val()
returns trigger
language plpgsql
as $$
begin
  new.clo_val_btn := round(coalesce(new.stock_qty, 0) * coalesce(new.price_btn, 0), 2);
  return new;
end;
$$;
