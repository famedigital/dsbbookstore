-- Editable WhatsApp number for storefront CTAs (wa.me)

alter table public.store_settings
  add column if not exists whatsapp_number text;

comment on column public.store_settings.whatsapp_number is
  'E.164 or local digits for WhatsApp deep links (wa.me). Separate from shop landline phone.';

update public.store_settings
set whatsapp_number = coalesce(nullif(trim(whatsapp_number), ''), '+61 434 741 331')
where id = 1;
