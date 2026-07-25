-- Production upgrade: media pipeline (Supabase-first) + POS session helpers

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'cover',
  title text,
  prompt text,
  storage_provider text not null default 'supabase'
    check (storage_provider in ('supabase', 'cloudinary')),
  supabase_path text,
  supabase_url text,
  cloudinary_public_id text,
  width int,
  height int,
  bytes int,
  mime_type text,
  created_by uuid references public.profiles (id),
  migrated_at timestamptz,
  deleted_from_supabase_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_provider_idx
  on public.media_assets (storage_provider);
create index if not exists media_assets_created_at_idx
  on public.media_assets (created_at desc);

alter table public.books
  add column if not exists cover_media_id uuid references public.media_assets (id) on delete set null;

alter table public.media_assets enable row level security;

create policy media_public_read on public.media_assets
  for select using (true);

create policy media_staff_all on public.media_assets
  for all using (public.is_staff());

-- Backfill: existing cloudinary covers become media_assets rows (optional, safe)
insert into public.media_assets (kind, title, storage_provider, cloudinary_public_id)
select 'cover', b.title, 'cloudinary', b.cover_public_id
from public.books b
where b.cover_public_id is not null
  and not exists (
    select 1 from public.media_assets m
    where m.cloudinary_public_id = b.cover_public_id
  );

update public.books b
set cover_media_id = m.id
from public.media_assets m
where b.cover_public_id is not null
  and m.cloudinary_public_id = b.cover_public_id
  and b.cover_media_id is null;
