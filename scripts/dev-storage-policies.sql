-- Local-dev only: storage RLS policies for the public `media` bucket so an
-- authenticated staff/owner session can upload covers (used by
-- scripts/seed-live-catalogue.mjs). The ERP media UI itself uploads via the
-- service-role admin client and does not need these policies.
--
-- Apply against a running local Supabase DB, e.g.:
--   docker exec -i supabase_db_<project_id> psql -U postgres -d postgres \
--     < scripts/dev-storage-policies.sql

do $$ begin
  create policy "media_public_read" on storage.objects
    for select using (bucket_id = 'media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "media_staff_write" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'media' and public.is_staff());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "media_staff_update" on storage.objects
    for update to authenticated
    using (bucket_id = 'media' and public.is_staff());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "media_staff_delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'media' and public.is_staff());
exception when duplicate_object then null; end $$;
