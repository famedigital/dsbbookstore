-- Public shop profile extras + Counter receipt / USB print prefs
alter table public.store_settings
  add column if not exists public_tagline text,
  add column if not exists visit_directions text,
  add column if not exists website_url text,
  add column if not exists receipt_header_note text,
  add column if not exists receipt_thanks text default 'Thank you',
  add column if not exists receipt_paper_mm int not null default 80,
  add column if not exists print_mode text not null default 'usb';

alter table public.store_settings
  drop constraint if exists store_settings_receipt_paper_mm_check;

alter table public.store_settings
  add constraint store_settings_receipt_paper_mm_check
  check (receipt_paper_mm in (58, 80));

alter table public.store_settings
  drop constraint if exists store_settings_print_mode_check;

alter table public.store_settings
  add constraint store_settings_print_mode_check
  check (print_mode in ('usb', 'none'));

comment on column public.store_settings.public_tagline is
  'Short line on public Visit / footer; syncs with storefront';
comment on column public.store_settings.visit_directions is
  'How to find the shop — Visit page body';
comment on column public.store_settings.print_mode is
  'usb = system/USB print dialog after Charge; none = no auto print';

update public.store_settings
set
  public_tagline = coalesce(
    public_tagline,
    'Bhutan''s oldest bookstore on Chang Lam, Thimphu.'
  ),
  visit_directions = coalesce(
    visit_directions,
    'Ground floor, Jojo''s Shopping Complex — look for the blue DSB BOOKS sign near Druk Hotel.'
  ),
  phone = coalesce(phone, '02 326275'),
  opening_hours = coalesce(opening_hours, 'Typically 9:00 – 20:00'),
  receipt_thanks = coalesce(receipt_thanks, 'Thank you for shopping at DSB Books'),
  receipt_footer = coalesce(
    receipt_footer,
    'Books · stationery · enquiries welcome'
  )
where id = 1;
