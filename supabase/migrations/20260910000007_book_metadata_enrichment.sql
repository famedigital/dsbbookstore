-- Track bibliographic enrichment (Open Library / Google Books / optional AI).
alter table public.books
  add column if not exists metadata_source text,
  add column if not exists metadata_enriched_at timestamptz;

comment on column public.books.metadata_source is
  'Where description/publisher/date came from: openlibrary, google_books, ai, mixed';
comment on column public.books.metadata_enriched_at is
  'Last time enrichment script wrote bibliographic fields';
