create trigger trg_sync_book_clo_val
  before insert or update of stock_qty, price_btn on public.books
  for each row execute function public.sync_book_clo_val();
