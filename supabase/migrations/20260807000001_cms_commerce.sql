-- CMS pages, home sections, enquiry topics, shipping zones, commerce settings

-- Enquiry topic
alter table public.enquiries
  add column if not exists topic text;

-- Commerce settings on store_settings
alter table public.store_settings
  add column if not exists online_checkout_enabled boolean not null default false;
alter table public.store_settings
  add column if not exists btn_per_usd numeric(12,4) not null default 84;
alter table public.store_settings
  add column if not exists stripe_enabled boolean not null default false;

-- CMS template enum
do $$ begin
  create type public.cms_page_template as enum ('hub', 'article', 'legal', 'simple');
exception when duplicate_object then null;
end $$;

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  nav_label text,
  subtitle text,
  body_md text not null default '',
  seo_title text,
  seo_description text,
  hero_public_id text,
  template public.cms_page_template not null default 'article',
  show_enquire_cta boolean not null default false,
  enquire_topic text,
  is_published boolean not null default true,
  is_required boolean not null default false,
  sort_order int not null default 0,
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  value_text text,
  value_md text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  fee_btn numeric(12,2) not null default 0,
  is_active boolean not null default true,
  notes_md text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.shipping_zones enable row level security;

drop policy if exists cms_pages_public_read on public.cms_pages;
create policy cms_pages_public_read on public.cms_pages
  for select using (is_published = true or public.is_staff());

drop policy if exists cms_pages_staff_write on public.cms_pages;
create policy cms_pages_staff_write on public.cms_pages
  for all using (public.is_staff());

drop policy if exists cms_sections_public_read on public.cms_sections;
create policy cms_sections_public_read on public.cms_sections
  for select using (is_published = true or public.is_staff());

drop policy if exists cms_sections_staff_write on public.cms_sections;
create policy cms_sections_staff_write on public.cms_sections
  for all using (public.is_staff());

drop policy if exists shipping_zones_public_read on public.shipping_zones;
create policy shipping_zones_public_read on public.shipping_zones
  for select using (is_active = true or public.is_staff());

drop policy if exists shipping_zones_staff_write on public.shipping_zones;
create policy shipping_zones_staff_write on public.shipping_zones
  for all using (public.is_staff());

-- Public can create online orders (insert only) — staff manage the rest
drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert on public.orders
  for insert with check (channel = 'online');

drop policy if exists order_items_public_insert on public.order_items;
create policy order_items_public_insert on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.channel = 'online'
    )
  );

drop policy if exists payments_public_insert on public.payments;
create policy payments_public_insert on public.payments
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.channel = 'online'
    )
  );

-- Shipping zone seeds
insert into public.shipping_zones (code, label, fee_btn, notes_md, sort_order)
values
  ('pickup', 'Store pickup (Thimphu)', 0, 'Collect from Jojo''s Shopping Complex, Chang Lam.', 10),
  ('bhutan', 'Delivery within Bhutan', 150, 'We confirm delivery options and timing by email after your order.', 20),
  ('international', 'International shipping', 2500, 'Card payment required. We confirm shipping timeline and any customs notes after payment.', 30)
on conflict (code) do nothing;

-- Home sections
insert into public.cms_sections (key, label, value_text, sort_order) values
  ('home.hero.eyebrow', 'Hero eyebrow', 'Thimphu · Chang Lam', 10),
  ('home.hero.headline', 'Hero headline', 'DSB Books', 20),
  ('home.hero.support', 'Hero support', 'Bhutan''s oldest bookstore — a living digital catalogue of DSB publications. Search, browse, and know what''s on the shelf.', 30),
  ('home.hero.cta_primary_label', 'Primary CTA', 'Browse catalogue', 40),
  ('home.hero.cta_secondary_label', 'Secondary CTA', 'Visit the store', 50),
  ('home.shelf.heading', 'Shelf heading', 'On the shelf', 60),
  ('home.shelf.support', 'Shelf support', 'Live availability from the Thimphu store inventory.', 70),
  ('home.about.heading', 'About strip heading', 'About DSB', 80),
  ('home.about.support', 'About strip support', 'A family bookstore and DSB Publication imprint — bridging Bhutan and Australia through books, education, and digital knowledge.', 90),
  ('home.about.cta_label', 'About CTA', 'Our story', 100),
  ('home.visit.heading', 'Visit strip heading', 'Visit the store', 110),
  ('home.visit.support', 'Visit strip support', 'Find us on Chang Lam in Thimphu — browse the shelves and speak with our team.', 120),
  ('home.visit.cta_label', 'Visit CTA', 'Store details', 130)
on conflict (key) do nothing;

-- CMS pages (required + about tree)
insert into public.cms_pages (slug, title, nav_label, subtitle, body_md, seo_title, seo_description, template, show_enquire_cta, enquire_topic, is_published, is_required, sort_order)
values
(
  'about',
  'About DSB',
  'About',
  'Bookstore, imprint, and Bhutan–Australia bridge.',
  'DSB Books is Bhutan''s oldest bookstore on Chang Lam in Thimphu, home to the DSB Publication imprint. Explore our story, institutional work, and ways to partner.',
  'About DSB Books',
  'Learn about DSB Books, DSB Publication, and our Bhutan–Australia programmes.',
  'hub',
  false,
  null,
  true,
  true,
  0
),
(
  'about/founder',
  'Our Founder and Family Story',
  'Founder & family',
  'A family bookstore rooted in Thimphu.',
  E'DSB Books grew as a family bookstore on Chang Lam — a place where readers, students, and visitors meet Bhutanese publishing.\n\n*(Staff: replace this section in ERP Content with the real founder biography — names, dates, and photos as you wish them published.)*\n\nToday the shop remains a living catalogue: DSB Publication titles beside carefully chosen books for schools, libraries, and travellers.',
  'Our Founder and Family Story · DSB Books',
  'The family story behind DSB Books, Bhutan''s oldest bookstore in Thimphu.',
  'article',
  false,
  null,
  true,
  false,
  10
),
(
  'about/publications',
  'DSB Publications',
  'Publications',
  'The DSB Publication imprint.',
  E'DSB Publication is the publishing arm connected to our Thimphu bookstore. We develop, print, and distribute titles that serve readers in Bhutan and partners abroad.\n\nBrowse live stock in our [catalogue](/books), or [enquire](/enquiry?topic=general) about wholesale and institutional supply.',
  'DSB Publications',
  'DSB Publication imprint — books from Bhutan''s oldest bookstore.',
  'article',
  true,
  'general',
  true,
  false,
  20
),
(
  'about/bhutan-australia',
  'Bhutan–Australia Bridge',
  'Bhutan–Australia',
  'Publishing, education, and cultural exchange between Bhutan and Australia.',
  E'We work across Bhutan and Australia to move books, ideas, and programmes in both directions.\n\n## What we offer\n\n- Importing and distributing DSB publications in Australia\n- Australian printing or print-on-demand\n- Book events and author exchanges\n- University, library and school relationships\n- Australian sales, licensing and marketing\n- Finding technology and educational partners\n- Raising investment for permitted Bhutan projects\n- Hosting Bhutan–Australia cultural and sustainability programs\n\n[Partner with DSB](/about/partner) or [enquire](/enquiry?topic=australia).',
  'Bhutan–Australia Bridge · DSB',
  'DSB''s Bhutan–Australia bridge for publishing, education, and cultural programmes.',
  'article',
  true,
  'australia',
  true,
  false,
  30
),
(
  'about/schools-universities-libraries',
  'Schools, Universities and Libraries',
  'Schools & libraries',
  'Institutional relationships for readers and educators.',
  E'DSB works with schools, universities, and libraries on catalogue supply, reading programmes, and long-term collection building.\n\n## Focus\n\n- University, library and school relationships\n- Title selection for classrooms and research\n- Bulk and institutional enquiries through our store team\n\n[Send an institutional enquiry](/enquiry?topic=schools).',
  'Schools, Universities and Libraries · DSB',
  'Institutional supply and relationships for schools, universities, and libraries.',
  'article',
  true,
  'schools',
  true,
  false,
  40
),
(
  'about/digital-knowledge-lab',
  'Digital Knowledge Lab',
  'Digital Knowledge Lab',
  'Digitisation, learning platforms, and Bhutanese digital content.',
  E'The Digital Knowledge Lab is where DSB develops digital publishing and education technology services.\n\n## Capabilities\n\n- Digitising Bhutanese books and historical documents\n- E-books and audiobooks\n- Translation and multilingual publishing technology\n- Educational course production\n- Learning-management platforms\n- Digital archives for cultural institutions\n- Sustainability and environmental education content\n- Technology services for Bhutanese schools, publishers and organisations\n- Export of Bhutanese digital content and services\n\n[Enquire about the Digital Knowledge Lab](/enquiry?topic=digital-lab).',
  'Digital Knowledge Lab · DSB',
  'Digitisation, e-books, LMS, archives, and digital services from DSB.',
  'article',
  true,
  'digital-lab',
  true,
  false,
  50
),
(
  'about/earth-community',
  'Earth and Community Impact',
  'Earth & community',
  'Sustainability education and community-minded publishing.',
  E'DSB supports sustainability and environmental education through publishing and digital content — aligned with our Digital Knowledge Lab and Bhutan–Australia cultural programmes.\n\nWe do not invent impact metrics here. Ask us about current projects and how your school, library, or organisation can take part.\n\n[Talk to us](/enquiry?topic=general).',
  'Earth and Community Impact · DSB',
  'Sustainability and community education content from DSB Books.',
  'article',
  true,
  'general',
  true,
  false,
  60
),
(
  'about/partner',
  'Partner With DSB',
  'Partner',
  'Technology, education, investment, and cultural programmes.',
  E'We welcome partners who share a careful, long-term approach to Bhutanese publishing and education.\n\n## Ways to partner\n\n- Finding technology and educational partners\n- Raising investment for permitted Bhutan projects\n- Hosting Bhutan–Australia cultural and sustainability programs\n- Distribution, licensing, and institutional supply\n\n[Start a partner conversation](/enquiry?topic=partner).',
  'Partner With DSB',
  'Partner with DSB on education, technology, investment, and cultural programmes.',
  'article',
  true,
  'partner',
  true,
  false,
  70
),
(
  'about/international-orders',
  'International Orders',
  'International orders',
  'Ordering DSB titles from outside Bhutan.',
  E'Readers, diaspora communities, and institutions can order through our online checkout when enabled, or by enquiry.\n\n## How it works\n\n1. Browse the [catalogue](/books) for live stock.\n2. Add titles to your cart and choose **international shipping**, or [enquire](/enquiry?topic=international) if you need a quote first.\n3. International card payments are processed securely; we confirm fulfilment timing after payment.\n\nAustralian partners may also use our [Bhutan–Australia Bridge](/about/bhutan-australia) channels for distribution and print-on-demand.\n\nWe do not promise fixed delivery dates on this page — staff confirm each shipment.',
  'International Orders · DSB Books',
  'How to order DSB Books internationally — checkout or enquiry.',
  'article',
  true,
  'international',
  true,
  false,
  80
),
(
  'visit',
  'Visit the store',
  'Visit',
  'Bhutan''s oldest bookstore in Thimphu.',
  E'Come to Jojo''s Shopping Complex on Chang Lam. Opening hours and contact details appear below and are kept current by our staff.\n\nFor school groups or author events, [send an enquiry](/enquiry?topic=general).',
  'Visit DSB Books · Thimphu',
  'Visit DSB Books on Chang Lam, Thimphu — hours and contact.',
  'simple',
  false,
  null,
  true,
  true,
  90
),
(
  'enquiry',
  'Enquiry',
  'Enquire',
  'Ask about a title, school orders, partnership, or store pickup.',
  E'Tell us what you need — a single title, institutional supply, Digital Knowledge Lab work, or an international order. We reply by email.',
  'Enquiry · DSB Books',
  'Contact DSB Books about titles, schools, partners, or international orders.',
  'simple',
  false,
  null,
  true,
  true,
  100
),
(
  'privacy',
  'Privacy Policy',
  'Privacy',
  'How DSB Books handles information submitted through our website.',
  E'## Information we collect\n\nWhen you submit an enquiry or place an online order, we collect your name, email address, optional phone number, message, optional enquiry topic, and order/shipping details needed to fulfil your request.\n\nStaff who use our internal systems authenticate separately; their profiles and roles are stored for access control.\n\n## How we use it\n\nWe use this information to respond to enquiries, process orders, and operate the bookstore. We do not sell personal data to third parties.\n\n## Payments\n\nCard payments for online orders are processed by Stripe. We do not store full card numbers on our servers.\n\n## Retention\n\nEnquiries and orders are retained for customer service and operational records. Contact us to request deletion where applicable under local law.\n\n## Contact\n\nQuestions about privacy: use our [enquiry form](/enquiry) or see the [visit page](/visit).',
  'Privacy Policy · DSB Books',
  'Privacy policy for DSB Books website enquiries and orders.',
  'legal',
  false,
  null,
  true,
  true,
  110
),
(
  'terms',
  'Terms of Use',
  'Terms',
  'Terms for using the DSB Books website and online catalogue.',
  E'## Catalogue and availability\n\nStock levels and prices are shown in good faith from our inventory. Availability may change. Prices are in Bhutanese Ngultrum (BTN) unless stated otherwise. Online card charges may be converted to USD at the rate shown at checkout.\n\n## Enquiries\n\nSubmitting an enquiry does not create a binding order until we confirm in writing.\n\n## Online orders\n\nWhen online checkout is enabled, placing an order creates a purchase subject to stock confirmation and our fulfilment notes for pickup, Bhutan delivery, or international shipping. International shipments are confirmed after payment.\n\n## Intellectual property\n\nBook covers, descriptions, and site content remain the property of DSB Books, publishers, and respective rights holders.\n\n## Limitation\n\nThe site is provided as-is. DSB Books is not liable for indirect damages arising from use of this website or reliance on catalogue data.',
  'Terms of Use · DSB Books',
  'Terms of use for the DSB Books website and online orders.',
  'legal',
  false,
  null,
  true,
  true,
  120
)
on conflict (slug) do nothing;
