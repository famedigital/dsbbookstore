-- Storefront CMS: structured pages, sections, and media

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text,
  seo_description text,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages (id) on delete cascade,
  key text not null,
  eyebrow text,
  heading text,
  summary text,
  body jsonb not null default '[]'::jsonb,
  cta_label text,
  cta_href text,
  image_url text,
  image_alt text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_id, key)
);

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  public_id text,
  url text,
  alt text,
  kind text not null default 'hero'
    check (kind in ('hero', 'inline', 'icon', 'other')),
  width int,
  height int,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_section_media (
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  media_id uuid not null references public.cms_media (id) on delete cascade,
  role text not null default 'background'
    check (role in ('background', 'inline', 'card')),
  sort_order int not null default 0,
  primary key (section_id, media_id, role)
);

create index if not exists cms_sections_page_id_idx on public.cms_sections (page_id);
create index if not exists cms_pages_status_idx on public.cms_pages (status);

alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_section_media enable row level security;

create policy cms_pages_public_read on public.cms_pages
  for select using (status = 'published' or public.is_staff());
create policy cms_sections_public_read on public.cms_sections
  for select using (
    exists (
      select 1 from public.cms_pages p
      where p.id = page_id and (p.status = 'published' or public.is_staff())
    )
  );
create policy cms_media_public_read on public.cms_media for select using (true);
create policy cms_section_media_public_read on public.cms_section_media for select using (true);

create policy cms_pages_staff_write on public.cms_pages
  for all using (public.is_manager_or_owner());
create policy cms_sections_staff_write on public.cms_sections
  for all using (public.is_manager_or_owner());
create policy cms_media_staff_write on public.cms_media
  for all using (public.is_manager_or_owner());
create policy cms_section_media_staff_write on public.cms_section_media
  for all using (public.is_manager_or_owner());

-- Seed pages
insert into public.cms_pages (slug, title, seo_title, seo_description, sort_order) values
  ('home', 'Home', 'DSB Books', 'Bhutan''s bookstore on Chang Lam — books and more.', 0),
  ('visit', 'Visit', 'Visit DSB Books', 'Find us on Chang Lam, Thimphu.', 10),
  ('about', 'Our Story', 'Our Story · DSB Books', 'Founder and family story.', 20),
  ('publications', 'Publications', 'DSB Publications', 'Books under the DSB imprint.', 30),
  ('australia', 'Australia Bridge', 'Bhutan–Australia Bridge', 'Partnerships between Bhutan and Australia.', 40),
  ('schools', 'Schools', 'Schools & Libraries', 'Education partnerships.', 50),
  ('digital-lab', 'Digital Lab', 'Digital Knowledge Lab', 'Digitisation and digital learning.', 60),
  ('impact', 'Impact', 'Earth & Community Impact', 'Environment and community programmes.', 70),
  ('partner', 'Partner', 'Partner With DSB', 'Collaborate with DSB Books.', 80),
  ('orders', 'International Orders', 'International Orders', 'Institutional and overseas supply.', 90),
  ('privacy', 'Privacy', 'Privacy Policy', 'How DSB Books handles personal data.', 100),
  ('terms', 'Terms', 'Terms of Use', 'Website terms of use.', 110)
on conflict (slug) do nothing;

-- Helper: section insert by page slug
create or replace function public._cms_seed_section(
  p_slug text,
  p_key text,
  p_eyebrow text,
  p_heading text,
  p_summary text,
  p_body jsonb,
  p_cta_label text default null,
  p_cta_href text default null,
  p_image_url text default null,
  p_image_alt text default null,
  p_sort int default 0
) returns void language plpgsql as $$
declare
  pid uuid;
begin
  select id into pid from public.cms_pages where slug = p_slug;
  if pid is null then return; end if;
  insert into public.cms_sections (
    page_id, key, eyebrow, heading, summary, body,
    cta_label, cta_href, image_url, image_alt, sort_order
  ) values (
    pid, p_key, p_eyebrow, p_heading, p_summary, coalesce(p_body, '[]'::jsonb),
    p_cta_label, p_cta_href, p_image_url, p_image_alt, p_sort
  )
  on conflict (page_id, key) do update set
    eyebrow = excluded.eyebrow,
    heading = excluded.heading,
    summary = excluded.summary,
    body = excluded.body,
    cta_label = excluded.cta_label,
    cta_href = excluded.cta_href,
    image_url = coalesce(excluded.image_url, public.cms_sections.image_url),
    image_alt = coalesce(excluded.image_alt, public.cms_sections.image_alt),
    sort_order = excluded.sort_order,
    updated_at = now();
end;
$$;

select public._cms_seed_section(
  'home', 'beyond_thimphu', 'Beyond Thimphu',
  'Australia Bridge & Digital Lab',
  'Partnerships for publishing, education, and digitisation — connecting Bhutanese books with Australian institutions and digital learning.',
  '[]'::jsonb, 'Australia', '/australia',
  '/images/hero-dsb-magazines.jpg', 'Periodicals and titles at DSB Books', 10
);

select public._cms_seed_section(
  'home', 'visit_cta', 'Visit',
  'Find us on Chang Lam',
  'Jojo''s Shopping Complex near Clock Tower Square.',
  '[]'::jsonb, 'Store details', '/visit', null, null, 20
);

select public._cms_seed_section(
  'visit', 'hero', 'Chang Lam · Thimphu',
  'DSB Books',
  'Bhutan''s oldest bookstore on Chang Lam — books, stationery, and enquiries welcome.',
  '[]'::jsonb, 'Open in Maps', null,
  '/images/hero-dsb-exterior.jpg', 'DSB BOOKS on Chang Lam, Thimphu', 0
);

select public._cms_seed_section(
  'about', 'intro', 'Our founder & family',
  'Our Founder and Family Story',
  'The people and values behind Bhutan''s oldest bookstore on Chang Lam.',
  '["DSB Books grew from a family commitment to making knowledge available in Thimphu and beyond. From the shop floor at Jojo''s Shopping Complex to DSB Publication titles on the shelf, the bookstore remains a place where readers, students, and visitors meet Bhutanese publishing.","This page will hold the founder''s story, family stewardship of the store, and the journey from a neighbourhood bookshop into a bridge for culture, education, and digital knowledge."]'::jsonb,
  'Send an enquiry', '/enquiry', null, null, 0
);

select public._cms_seed_section(
  'publications', 'intro', 'DSB Publication',
  'DSB Publications',
  'Books published under the DSB imprint — searchable in the live catalogue.',
  '["DSB Publications produces and distributes titles that reflect Bhutanese learning, culture, and place. The online catalogue lets visitors search, browse, and check live shelf availability while administrators manage books, authors, pricing, and inventory.","Use the catalogue for current stock and title detail; this section explains the publishing imprint and how schools, libraries, and partners work with DSB."]'::jsonb,
  'Browse catalogue', '/books', null, null, 0
);

select public._cms_seed_section(
  'australia', 'hero', 'Bhutan–Australia Bridge',
  'Books, learning & partnership across two countries',
  'DSB connects Chang Lam publishing with Australian schools, universities, libraries, printers, and cultural partners.',
  '[]'::jsonb, 'Start a conversation', '/enquiry',
  '/images/hero-bookstore.jpg', 'Bookstore shelves', 0
);

select public._cms_seed_section(
  'australia', 'intro', 'Why it matters',
  'A living bridge for Bhutanese knowledge',
  'The Bhutan–Australia Bridge is how DSB moves from a Thimphu storefront into classrooms, libraries, and cultural programmes in Australia.',
  '["We support legal trade in books, print-on-demand where freight is slow, and long-term relationships with educators and institutions who want authentic Bhutanese content."]'::jsonb,
  null, null, null, null, 10
);

select public._cms_seed_section(
  'australia', 'pillars', 'What we work on',
  'Four pillars',
  null,
  '[{"title":"Trade & distribution","body":"Legal import pathways for DSB titles into Australia, with wholesale and institutional fulfilment options."},{"title":"Print & production","body":"Australian printing and print-on-demand so schools and libraries can restock without long freight waits."},{"title":"Education partners","body":"Universities, schools, and libraries building Bhutanese collections and classroom resources."},{"title":"Culture & exchange","body":"Author visits, book events, and cultural programmes that keep Bhutanese stories present abroad."}]'::jsonb,
  null, null, null, null, 20
);

select public._cms_seed_section(
  'schools', 'intro', 'Education partners',
  'Schools, Universities and Libraries',
  'Supply, access, and learning partnerships for classrooms and collections.',
  '["DSB works with schools, universities, and libraries that need reliable access to Bhutanese and educational titles. Enquiries can cover bulk orders, availability checks, and ongoing supply relationships.","Combined with the Australia Bridge and Digital Knowledge Lab, this channel supports both print holdings and emerging digital learning needs."]'::jsonb,
  'Send an enquiry', '/enquiry', null, null, 0
);

select public._cms_seed_section(
  'digital-lab', 'hero', 'Digital Knowledge Lab',
  'From shelf to screen — Bhutanese knowledge, carefully digitised',
  'The Lab extends DSB beyond Chang Lam: heritage scans, e-editions, learning platforms, and archives rooted in Bhutanese content.',
  '[]'::jsonb, 'Discuss a project', '/enquiry',
  '/images/hero-dsb-magazines.jpg', 'Print and reading materials at DSB', 0
);

select public._cms_seed_section(
  'digital-lab', 'intro', 'Approach',
  'Technology with a bookstore''s patience',
  'We don''t treat digitisation as a race. Rights, language, and cultural context sit beside file formats.',
  '[]'::jsonb, null, null,
  '/images/hero-dsb-interior.jpg', 'Shelves inside DSB Books', 10
);

select public._cms_seed_section(
  'digital-lab', 'services', 'Services',
  'What the Lab can build with you',
  null,
  '[{"title":"Digitisation","body":"Scan and preserve Bhutanese books, manuscripts, and institutional documents with care for metadata and access."},{"title":"E-books & audio","body":"Produce readable and listen-friendly editions for diaspora readers, schools, and travellers."},{"title":"Learning platforms","body":"Course packaging and LMS-ready materials for classrooms that need Bhutanese context online."},{"title":"Archives","body":"Digital collections for cultural organisations that want search, backup, and controlled sharing."},{"title":"Multilingual tech","body":"Workflows that respect Dzongkha and English publishing."},{"title":"Export & partners","body":"Package Bhutanese digital services for schools, publishers, and partners abroad."}]'::jsonb,
  null, null, null, null, 20
);

select public._cms_seed_section(
  'impact', 'intro', 'Earth & community',
  'Earth and Community Impact',
  'Publishing and programmes that respect land, culture, and community.',
  '["DSB''s impact work ties storytelling and education to environmental awareness and community wellbeing. Content and programmes may support sustainability education, cultural continuity, and responsible partnership with local and international stakeholders."]'::jsonb,
  'Send an enquiry', '/enquiry', null, null, 0
);

select public._cms_seed_section(
  'partner', 'intro', 'Collaborate',
  'Partner With DSB',
  'Publishers, educators, technologists, and investors welcome.',
  '["Partnerships span co-publishing, distribution, school and library supply, digital projects, cultural programmes, and carefully scoped investment in permitted Bhutan projects.","Share your organisation, goals, and timeline through the enquiry form — the team will respond by email."]'::jsonb,
  'Send an enquiry', '/enquiry', null, null, 0
);

select public._cms_seed_section(
  'orders', 'intro', 'International',
  'International Orders',
  'Request titles for delivery, institutional supply, or Australia Bridge fulfilment.',
  '["International buyers, diaspora readers, and institutions can enquire about availability, shipping options, and wholesale or library supply. Australia Bridge partners can also discuss local printing and distribution.","There is no self-serve checkout yet — enquiries are handled by staff so stock, shipping, and licensing stay accurate."]'::jsonb,
  'Send an enquiry', '/enquiry', null, null, 0
);

select public._cms_seed_section(
  'privacy', 'prose', null, 'Privacy Policy', null,
  '["DSB Books (Thimphu) respects your privacy. This page describes how we handle information submitted through our website.","When you submit an enquiry, we collect your name, email address, optional phone number, and message.","Enquiry details are used to respond to your request about books, orders, or store visits. We do not sell personal data to third parties.","Enquiries are retained in our database for customer service and operational records. Contact us to request deletion where applicable under local law."]'::jsonb,
  null, null, null, null, 0
);

select public._cms_seed_section(
  'terms', 'prose', null, 'Terms of Use', null,
  '["By using the DSB Books website you agree to these terms.","Catalogue information is provided for convenience; stock and prices may change. Enquiries are not binding purchase contracts until confirmed by staff.","Content on this site is owned by DSB Books or its partners unless otherwise noted."]'::jsonb,
  null, null, null, null, 0
);

-- Seed media library from known heroes
insert into public.cms_media (public_id, url, alt, kind)
select null, v.url, v.alt, 'hero'
from (values
  ('/images/hero-dsb-exterior.jpg', 'DSB BOOKS exterior on Chang Lam'),
  ('/images/hero-dsb-interior.jpg', 'Inside DSB Books'),
  ('/images/hero-dsb-magazines.jpg', 'Magazines and titles at DSB'),
  ('/images/hero-bookstore.jpg', 'Bookstore shelves')
) as v(url, alt)
where not exists (select 1 from public.cms_media m where m.url = v.url);

drop function if exists public._cms_seed_section(text, text, text, text, text, jsonb, text, text, text, text, int);
