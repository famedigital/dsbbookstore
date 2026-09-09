/**
 * Appends real DSB Publication titles (Open Library / Mary Martin) into the seed run.
 * Run via: node scripts/seed-sample-books.mjs (base) then this file, OR npm run db:seed after merging.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const authors = [
  {
    id: "a2000000-0000-4000-8000-000000000001",
    name: "Chador Wangmo",
    slug: "chador-wangmo",
    bio: "Bhutanese children's author published by DSB Publication.",
  },
  {
    id: "a2000000-0000-4000-8000-000000000002",
    name: "D. B. Gurung",
    slug: "d-b-gurung",
    bio: "Author of An Illustrated Guide to the Orchids of Bhutan (DSB Publication).",
  },
  {
    id: "a2000000-0000-4000-8000-000000000003",
    name: "Sonam Kinga",
    slug: "sonam-kinga",
    bio: "Bhutanese historian and writer; Speaking Statues, Flying Rocks (DSB Publication).",
  },
  {
    id: "a2000000-0000-4000-8000-000000000004",
    name: "Tandin Wangchuk",
    slug: "tandin-wangchuk",
    bio: "Author of Journey Across Singye Dzong (DSB Publication).",
  },
  {
    id: "a2000000-0000-4000-8000-000000000005",
    name: "Singye Namgyel",
    slug: "singye-namgyel",
    bio: "Author of Quality of Education in Bhutan (DSB Publication).",
  },
  {
    id: "a2000000-0000-4000-8000-000000000006",
    name: "Dawn A. Murray",
    slug: "dawn-a-murray",
    bio: "Author of Monpa Medicinal Plants (DSB Publication, 2023).",
  },
];

const books = [
  {
    id: "b2000000-0000-4000-8000-000000000001",
    title: "An Illustrated Guide to the Orchids of Bhutan",
    subtitle: null,
    slug: "orchids-of-bhutan",
    description:
      "A classic DSB Publication field guide to orchids found in Bhutan. Listed on Open Library as published by DSB Publication.",
    isbn_13: null,
    language: "English",
    format: "hardcover",
    page_count: null,
    published_at: "1991-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 400,
    price_btn: 850,
    stock_qty: 6,
    low_stock_threshold: 3,
    availability_status: "low_stock",
    cover_public_id: "https://covers.openlibrary.org/b/id/13729617-L.jpg",
    is_featured: true,
    is_published: true,
    seo_title: "Orchids of Bhutan | DSB Books",
    seo_description: "Illustrated orchid guide from DSB Publication.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000002",
    title: "Speaking Statues, Flying Rocks",
    subtitle: null,
    slug: "speaking-statues-flying-rocks",
    description:
      "Historical writing from Bhutan by Sonam Kinga, published by DSB Publication (2005).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2005-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 220,
    price_btn: 450,
    stock_qty: 12,
    low_stock_threshold: 4,
    availability_status: "in_stock",
    cover_public_id: "/covers/speaking-statues-flying-rocks.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Speaking Statues, Flying Rocks | DSB Books",
    seo_description: "Sonam Kinga — DSB Publication.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000003",
    title: "Journey Across Singye Dzong",
    subtitle: null,
    slug: "journey-across-singye-dzong",
    description:
      "Travel and pilgrimage writing focused on Singye Dzong, published by DSB Publication (2011).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2011-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 200,
    price_btn: 400,
    stock_qty: 10,
    low_stock_threshold: 4,
    availability_status: "in_stock",
    cover_public_id: "/covers/journey-across-singye-dzong.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Journey Across Singye Dzong | DSB Books",
    seo_description: "Tandin Wangchuk — DSB Publication.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000004",
    title: "Abi, Memey, and the Monkey",
    subtitle: "A Bhutanese children's story",
    slug: "abi-memey-and-the-monkey",
    description:
      "Children's folklore title by Chador Wangmo, published by DSB Publication (2012).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2012-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 120,
    price_btn: 280,
    stock_qty: 20,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/abi-memey-and-the-monkey.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Abi, Memey, and the Monkey | DSB Books",
    seo_description: "Chador Wangmo — DSB Publication children's story.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000005",
    title: "Abi, Memey, and the Mosquito",
    subtitle: "A Bhutanese children's story",
    slug: "abi-memey-and-the-mosquito",
    description:
      "Children's folklore title by Chador Wangmo, published by DSB Publication (2012).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2012-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 120,
    price_btn: 280,
    stock_qty: 18,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/abi-memey-and-the-mosquito.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Abi, Memey, and the Mosquito | DSB Books",
    seo_description: "Chador Wangmo — DSB Publication children's story.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000006",
    title: "The Three Friends",
    subtitle: null,
    slug: "the-three-friends",
    description:
      "Children's title by Chador Wangmo, published by DSB Publication (2012).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2012-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 110,
    price_btn: 260,
    stock_qty: 15,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/the-three-friends.svg",
    is_featured: false,
    is_published: true,
    seo_title: "The Three Friends | DSB Books",
    seo_description: "Chador Wangmo — DSB Publication.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000007",
    title: "Kuenden, the Valiant Son",
    subtitle: null,
    slug: "kuenden-the-valiant-son",
    description:
      "DSB Publication title (2012) listed in the Open Library DSB Publication catalogue.",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2012-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 130,
    price_btn: 300,
    stock_qty: 11,
    low_stock_threshold: 4,
    availability_status: "in_stock",
    cover_public_id: "/covers/kuenden-the-valiant-son.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Kuenden, the Valiant Son | DSB Books",
    seo_description: "DSB Publication catalogue title.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000008",
    title: "Dear Seday",
    subtitle: null,
    slug: "dear-seday",
    description:
      "Bhutanese fiction title published by DSB Publication (2012).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2012-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 140,
    price_btn: 320,
    stock_qty: 9,
    low_stock_threshold: 4,
    availability_status: "low_stock",
    cover_public_id: "/covers/dear-seday.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Dear Seday | DSB Books",
    seo_description: "DSB Publication fiction title.",
  },
  {
    id: "b2000000-0000-4000-8000-000000000009",
    title: "Quality of Education in Bhutan",
    subtitle: null,
    slug: "quality-of-education-in-bhutan",
    description:
      "Education study by Singye Namgyel, published by DSB Publication (2011).",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: null,
    published_at: "2011-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 250,
    price_btn: 480,
    stock_qty: 8,
    low_stock_threshold: 3,
    availability_status: "in_stock",
    cover_public_id: "/covers/quality-of-education-in-bhutan.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Quality of Education in Bhutan | DSB Books",
    seo_description: "Singye Namgyel — DSB Publication.",
  },
  {
    id: "b2000000-0000-4000-8000-00000000000a",
    title: "Monpa Medicinal Plants",
    subtitle: "Indigenous Knowledge from a Himalayan Healer",
    slug: "monpa-medicinal-plants",
    description:
      "Dawn A. Murray — Monpa medicinal plant knowledge from the Himalayas. DSB Publication, 2023 (ISBN 9789993612872).",
    isbn_13: "9789993612872",
    language: "English",
    format: "hardcover",
    page_count: 44,
    published_at: "2023-01-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 500,
    price_btn: 1200,
    stock_qty: 5,
    low_stock_threshold: 2,
    availability_status: "low_stock",
    cover_public_id: "/covers/monpa-medicinal-plants.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Monpa Medicinal Plants | DSB Books",
    seo_description: "Dawn A. Murray — DSB Publication 2023.",
  },
];

const bookAuthors = [
  ["b2000000-0000-4000-8000-000000000001", "a2000000-0000-4000-8000-000000000002"],
  ["b2000000-0000-4000-8000-000000000002", "a2000000-0000-4000-8000-000000000003"],
  ["b2000000-0000-4000-8000-000000000003", "a2000000-0000-4000-8000-000000000004"],
  ["b2000000-0000-4000-8000-000000000004", "a2000000-0000-4000-8000-000000000001"],
  ["b2000000-0000-4000-8000-000000000005", "a2000000-0000-4000-8000-000000000001"],
  ["b2000000-0000-4000-8000-000000000006", "a2000000-0000-4000-8000-000000000001"],
  ["b2000000-0000-4000-8000-000000000009", "a2000000-0000-4000-8000-000000000005"],
  ["b2000000-0000-4000-8000-00000000000a", "a2000000-0000-4000-8000-000000000006"],
];

const bookCategories = [
  ["b2000000-0000-4000-8000-000000000001", "c1000000-0000-4000-8000-000000000002"],
  ["b2000000-0000-4000-8000-000000000002", "c1000000-0000-4000-8000-000000000002"],
  ["b2000000-0000-4000-8000-000000000003", "c1000000-0000-4000-8000-000000000005"],
  ["b2000000-0000-4000-8000-000000000004", "c1000000-0000-4000-8000-000000000004"],
  ["b2000000-0000-4000-8000-000000000005", "c1000000-0000-4000-8000-000000000004"],
  ["b2000000-0000-4000-8000-000000000006", "c1000000-0000-4000-8000-000000000004"],
  ["b2000000-0000-4000-8000-000000000007", "c1000000-0000-4000-8000-000000000004"],
  ["b2000000-0000-4000-8000-000000000008", "c1000000-0000-4000-8000-000000000002"],
  ["b2000000-0000-4000-8000-000000000009", "c1000000-0000-4000-8000-000000000001"],
  ["b2000000-0000-4000-8000-00000000000a", "c1000000-0000-4000-8000-000000000002"],
];

function escapeXml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

mkdirSync(resolve("public/covers"), { recursive: true });
const palette = [
  ["#5c241c", "#9c7a3e"],
  ["#24352c", "#c4a46a"],
  ["#1a2744", "#9c7a3e"],
  ["#3d2c08", "#e8d5a3"],
  ["#2d1b4e", "#c4a46a"],
  ["#0d1b2a", "#9c7a3e"],
  ["#4a1c16", "#f0d789"],
  ["#1b4332", "#95d5b2"],
  ["#023e8a", "#caf0f8"],
];

for (const [i, book] of books.entries()) {
  if (!book.cover_public_id.startsWith("/covers/")) continue;
  const [bg, accent] = palette[i % palette.length];
  const lines = book.title.split(/:\s+|,\s+/).slice(0, 2);
  const text = lines
    .map(
      (line, idx) =>
        `<tspan x="50" dy="${idx === 0 ? 0 : 1.15}em">${escapeXml(line)}</tspan>`,
    )
    .join("");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="#0a0908"/>
  </linearGradient></defs>
  <rect width="800" height="1200" fill="url(#g)"/>
  <rect x="48" y="48" width="704" height="1104" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="2"/>
  <text x="80" y="160" fill="${accent}" font-family="Georgia, serif" font-size="26" letter-spacing="0.28em">DSB</text>
  <text x="50" y="520" text-anchor="middle" fill="#f3eee4" font-family="Georgia, serif" font-size="48" font-weight="600" transform="translate(350 0)">${text}</text>
  <text x="80" y="1080" fill="${accent}" font-family="Georgia, serif" font-size="22">DSB Publication</text>
</svg>`;
  writeFileSync(resolve(`public${book.cover_public_id}`), svg);
}

function assertOk(label, error) {
  if (error) {
    console.error(label, error.message);
    process.exit(1);
  }
}

assertOk("authors", (await supabase.from("authors").upsert(authors, { onConflict: "slug" })).error);
assertOk("books", (await supabase.from("books").upsert(books, { onConflict: "slug" })).error);
assertOk(
  "book_authors",
  (
    await supabase.from("book_authors").upsert(
      bookAuthors.map(([book_id, author_id]) => ({ book_id, author_id, sort_order: 0 })),
      { onConflict: "book_id,author_id", ignoreDuplicates: true },
    )
  ).error,
);
assertOk(
  "book_categories",
  (
    await supabase.from("book_categories").upsert(
      bookCategories.map(([book_id, category_id]) => ({ book_id, category_id })),
      { onConflict: "book_id,category_id", ignoreDuplicates: true },
    )
  ).error,
);

const { count } = await supabase
  .from("books")
  .select("*", { count: "exact", head: true })
  .eq("is_published", true);
console.log(`DSB Publication titles seeded. Published books now: ${count}`);
