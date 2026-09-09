-- Sample catalogue for storefront smoke test (idempotent).
-- Apply via: npm run db:seed   OR   run this file in the Supabase SQL editor.

insert into public.authors (id, name, slug, bio) values
  ('a1000000-0000-4000-8000-000000000001', 'Sonam Choden', 'sonam-choden', 'Educator and writer based in Thimphu. Sample author for local development.'),
  ('a1000000-0000-4000-8000-000000000002', 'Tashi Wangchuk', 'tashi-wangchuk', 'Historian focusing on Himalayan cultures. Sample author for local development.'),
  ('a1000000-0000-4000-8000-000000000003', 'Pema Lhamo', 'pema-lhamo', 'Children''s author and storyteller. Sample author for local development.'),
  ('a1000000-0000-4000-8000-000000000004', 'Karma Dorji', 'karma-dorji', 'Language teacher and textbook contributor. Sample author for local development.'),
  ('a1000000-0000-4000-8000-000000000005', 'Ugyen Tshering', 'ugyen-tshering', 'Writer on Buddhist thought and daily practice. Sample author for local development.')
on conflict (slug) do update set
  name = excluded.name,
  bio = excluded.bio,
  updated_at = now();

insert into public.categories (id, name, slug, description, sort_order) values
  ('c1000000-0000-4000-8000-000000000001', 'Textbooks', 'textbooks', 'School and college course books', 10),
  ('c1000000-0000-4000-8000-000000000002', 'History & Culture', 'history-culture', 'Bhutanese history, heritage, and culture', 20),
  ('c1000000-0000-4000-8000-000000000003', 'Language', 'language', 'Dzongkha, English, and language learning', 30),
  ('c1000000-0000-4000-8000-000000000004', 'Children', 'children', 'Stories and readers for young readers', 40),
  ('c1000000-0000-4000-8000-000000000005', 'Religion & Philosophy', 'religion-philosophy', 'Buddhist and philosophical titles', 50)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.books (
  id, title, subtitle, slug, description, isbn_13, language, format, page_count,
  published_at, publisher_name, cost_price_btn, price_btn, stock_qty, low_stock_threshold,
  availability_status, cover_public_id, is_featured, is_published, seo_title, seo_description
) values
  (
    'b1000000-0000-4000-8000-000000000001',
    'Introduction to Dzongkha',
    'A beginner''s course for schools',
    'introduction-to-dzongkha',
    'A clear, classroom-ready introduction to Dzongkha script, basic vocabulary, and everyday conversation. Sample catalogue title.',
    '9789993600001', 'Dzongkha', 'paperback', 168,
    '2022-03-15', 'DSB Publication', 180, 350, 42, 5,
    'in_stock', '/covers/introduction-to-dzongkha.svg', true, true,
    'Introduction to Dzongkha | DSB Books',
    'Beginner Dzongkha textbook available at DSB Books, Thimphu.'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'A Short History of Bhutan',
    'From early kingdoms to the modern nation',
    'a-short-history-of-bhutan',
    'An accessible overview of Bhutanese history for students and visitors. Sample catalogue title.',
    '9789993600002', 'English', 'paperback', 224,
    '2021-08-01', 'DSB Publication', 220, 450, 28, 5,
    'in_stock', '/covers/a-short-history-of-bhutan.svg', true, true,
    'A Short History of Bhutan | DSB Books',
    'Bhutanese history primer from DSB Publication.'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'Folk Tales from the Himalayas',
    'Stories told across the ridges',
    'folk-tales-from-the-himalayas',
    'A collection of folk tales gathered from villages across Bhutan. Sample catalogue title.',
    '9789993600003', 'English', 'paperback', 192,
    '2020-11-20', 'DSB Publication', 150, 320, 35, 5,
    'in_stock', '/covers/folk-tales-from-the-himalayas.svg', true, true,
    'Folk Tales from the Himalayas | DSB Books',
    'Bhutanese folk tales for readers of all ages.'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'Mathematics for Class VII',
    'Aligned classroom workbook',
    'mathematics-for-class-vii',
    'Practice-focused mathematics workbook for Class VII students. Sample catalogue title.',
    '9789993600004', 'English', 'paperback', 256,
    '2023-01-10', 'DSB Publication', 140, 280, 60, 8,
    'in_stock', '/covers/mathematics-for-class-vii.svg', false, true,
    'Mathematics for Class VII | DSB Books',
    'Class VII maths workbook available at DSB Books.'
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    'Environmental Studies: Bhutan',
    'Land, forests, and living systems',
    'environmental-studies-bhutan',
    'An introduction to Bhutan''s environment, conservation, and local ecosystems. Sample catalogue title.',
    '9789993600005', 'English', 'paperback', 180,
    '2022-06-05', 'DSB Publication', 160, 300, 22, 5,
    'in_stock', '/covers/environmental-studies-bhutan.svg', true, true,
    'Environmental Studies: Bhutan | DSB Books',
    'Environmental studies textbook focused on Bhutan.'
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'The Traveller''s Guide to Thimphu',
    'Walks, markets, and quiet corners',
    'travellers-guide-to-thimphu',
    'A practical and friendly guide to Chang Lam, local markets, and day trips from Thimphu. Sample catalogue title.',
    '9789993600006', 'English', 'paperback', 144,
    '2024-02-14', 'DSB Publication', 200, 400, 18, 4,
    'in_stock', '/covers/travellers-guide-to-thimphu.svg', true, true,
    'The Traveller''s Guide to Thimphu | DSB Books',
    'Local guide to Thimphu from DSB Books.'
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    'Buddhist Philosophy for Beginners',
    'Clear teachings for daily life',
    'buddhist-philosophy-for-beginners',
    'Gentle introductions to core Buddhist ideas written for new readers. Sample catalogue title.',
    '9789993600007', 'English', 'paperback', 208,
    '2019-09-01', 'DSB Publication', 190, 380, 14, 4,
    'in_stock', '/covers/buddhist-philosophy-for-beginners.svg', false, true,
    'Buddhist Philosophy for Beginners | DSB Books',
    'Introductory Buddhist philosophy from DSB Publication.'
  ),
  (
    'b1000000-0000-4000-8000-000000000008',
    'Bhutanese Cuisine at Home',
    'Recipes from Thimphu kitchens',
    'bhutanese-cuisine-at-home',
    'Home-style recipes with notes on ingredients you can find in Thimphu markets. Sample catalogue title.',
    '9789993600008', 'English', 'paperback', 160,
    '2023-05-20', 'DSB Publication', 210, 420, 9, 5,
    'low_stock', '/covers/bhutanese-cuisine-at-home.svg', true, true,
    'Bhutanese Cuisine at Home | DSB Books',
    'Cook Bhutanese favourites with this DSB kitchen companion.'
  ),
  (
    'b1000000-0000-4000-8000-000000000009',
    'English Grammar Workbook',
    'Secondary school practice book',
    'english-grammar-workbook',
    'Exercises and short explanations for secondary English grammar. Sample catalogue title.',
    '9789993600009', 'English', 'paperback', 240,
    '2021-04-12', 'DSB Publication', 130, 250, 55, 8,
    'in_stock', '/covers/english-grammar-workbook.svg', false, true,
    'English Grammar Workbook | DSB Books',
    'Secondary English grammar workbook at DSB Books.'
  ),
  (
    'b1000000-0000-4000-8000-00000000000a',
    'Legends of the Thunder Dragon',
    'Stories for young readers',
    'legends-of-the-thunder-dragon',
    'Illustrated legends retold for children and families. Sample catalogue title.',
    '9789993600010', 'English', 'paperback', 96,
    '2020-07-08', 'DSB Publication', 120, 260, 31, 5,
    'in_stock', '/covers/legends-of-the-thunder-dragon.svg', true, true,
    'Legends of the Thunder Dragon | DSB Books',
    'Children''s legends from Bhutan, published by DSB.'
  ),
  (
    'b1000000-0000-4000-8000-00000000000b',
    'Civic Education: Kingdom of Bhutan',
    'Citizenship, community, and governance',
    'civic-education-kingdom-of-bhutan',
    'A school text introducing civic life and institutions in Bhutan. Sample catalogue title.',
    '9789993600011', 'English', 'paperback', 176,
    '2022-09-30', 'DSB Publication', 150, 290, 40, 6,
    'in_stock', '/covers/civic-education-kingdom-of-bhutan.svg', false, true,
    'Civic Education: Kingdom of Bhutan | DSB Books',
    'Civic education textbook available at DSB Books, Thimphu.'
  ),
  (
    'b1000000-0000-4000-8000-00000000000c',
    'Mountain Flora of Bhutan',
    'A field companion to alpine plants',
    'mountain-flora-of-bhutan',
    'Notes and descriptions of common alpine plants for students and hikers. Sample catalogue title.',
    '9789993600012', 'English', 'paperback', 212,
    '2018-05-18', 'DSB Publication', 240, 480, 3, 5,
    'low_stock', '/covers/mountain-flora-of-bhutan.svg', false, true,
    'Mountain Flora of Bhutan | DSB Books',
    'Field guide to Bhutan''s mountain flora from DSB Publication.'
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  isbn_13 = excluded.isbn_13,
  language = excluded.language,
  format = excluded.format,
  page_count = excluded.page_count,
  published_at = excluded.published_at,
  publisher_name = excluded.publisher_name,
  cost_price_btn = excluded.cost_price_btn,
  price_btn = excluded.price_btn,
  stock_qty = excluded.stock_qty,
  low_stock_threshold = excluded.low_stock_threshold,
  availability_status = excluded.availability_status,
  cover_public_id = excluded.cover_public_id,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

insert into public.book_authors (book_id, author_id, sort_order) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 0),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 0),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 0),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', 0),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 0),
  ('b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 0),
  ('b1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000005', 0),
  ('b1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 0),
  ('b1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000004', 0),
  ('b1000000-0000-4000-8000-00000000000a', 'a1000000-0000-4000-8000-000000000003', 0),
  ('b1000000-0000-4000-8000-00000000000b', 'a1000000-0000-4000-8000-000000000002', 0),
  ('b1000000-0000-4000-8000-00000000000c', 'a1000000-0000-4000-8000-000000000002', 0)
on conflict do nothing;

insert into public.book_categories (book_id, category_id) values
  ('b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004'),
  ('b1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000005'),
  ('b1000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-00000000000a', 'c1000000-0000-4000-8000-000000000004'),
  ('b1000000-0000-4000-8000-00000000000b', 'c1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-00000000000c', 'c1000000-0000-4000-8000-000000000002')
on conflict do nothing;
