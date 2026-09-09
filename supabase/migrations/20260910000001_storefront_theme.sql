-- Add switchable storefront theme (Figma template presets)
alter table public.store_settings
  add column if not exists storefront_theme text not null default 'uikit';

comment on column public.store_settings.storefront_theme is
  'Storefront visual preset: uikit | booksaw | booketic | atelier';
