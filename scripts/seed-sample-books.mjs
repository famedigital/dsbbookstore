import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
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

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or service role key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const authors = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    name: "Sonam Choden",
    slug: "sonam-choden",
    bio: "Educator and writer based in Thimphu. Sample author for local development.",
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    name: "Tashi Wangchuk",
    slug: "tashi-wangchuk",
    bio: "Historian focusing on Himalayan cultures. Sample author for local development.",
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    name: "Pema Lhamo",
    slug: "pema-lhamo",
    bio: "Children's author and storyteller. Sample author for local development.",
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    name: "Karma Dorji",
    slug: "karma-dorji",
    bio: "Language teacher and textbook contributor. Sample author for local development.",
  },
  {
    id: "a1000000-0000-4000-8000-000000000005",
    name: "Ugyen Tshering",
    slug: "ugyen-tshering",
    bio: "Writer on Buddhist thought and daily practice. Sample author for local development.",
  },
];

const categories = [
  {
    id: "c1000000-0000-4000-8000-000000000001",
    name: "Textbooks",
    slug: "textbooks",
    description: "School and college course books",
    sort_order: 10,
  },
  {
    id: "c1000000-0000-4000-8000-000000000002",
    name: "History & Culture",
    slug: "history-culture",
    description: "Bhutanese history, heritage, and culture",
    sort_order: 20,
  },
  {
    id: "c1000000-0000-4000-8000-000000000003",
    name: "Language",
    slug: "language",
    description: "Dzongkha, English, and language learning",
    sort_order: 30,
  },
  {
    id: "c1000000-0000-4000-8000-000000000004",
    name: "Children",
    slug: "children",
    description: "Stories and readers for young readers",
    sort_order: 40,
  },
  {
    id: "c1000000-0000-4000-8000-000000000005",
    name: "Religion & Philosophy",
    slug: "religion-philosophy",
    description: "Buddhist and philosophical titles",
    sort_order: 50,
  },
];

const books = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    title: "Introduction to Dzongkha",
    subtitle: "A beginner's course for schools",
    slug: "introduction-to-dzongkha",
    description:
      "A clear, classroom-ready introduction to Dzongkha script, basic vocabulary, and everyday conversation. Sample catalogue title.",
    isbn_13: "9789993600001",
    language: "Dzongkha",
    format: "paperback",
    page_count: 168,
    published_at: "2022-03-15",
    publisher_name: "DSB Publication",
    cost_price_btn: 180,
    price_btn: 350,
    stock_qty: 42,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/introduction-to-dzongkha.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Introduction to Dzongkha | DSB Books",
    seo_description: "Beginner Dzongkha textbook available at DSB Books, Thimphu.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    title: "A Short History of Bhutan",
    subtitle: "From early kingdoms to the modern nation",
    slug: "a-short-history-of-bhutan",
    description:
      "An accessible overview of Bhutanese history for students and visitors. Sample catalogue title.",
    isbn_13: "9789993600002",
    language: "English",
    format: "paperback",
    page_count: 224,
    published_at: "2021-08-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 220,
    price_btn: 450,
    stock_qty: 28,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/a-short-history-of-bhutan.svg",
    is_featured: true,
    is_published: true,
    seo_title: "A Short History of Bhutan | DSB Books",
    seo_description: "Bhutanese history primer from DSB Publication.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000003",
    title: "Folk Tales from the Himalayas",
    subtitle: "Stories told across the ridges",
    slug: "folk-tales-from-the-himalayas",
    description:
      "A collection of folk tales gathered from villages across Bhutan. Sample catalogue title.",
    isbn_13: "9789993600003",
    language: "English",
    format: "paperback",
    page_count: 192,
    published_at: "2020-11-20",
    publisher_name: "DSB Publication",
    cost_price_btn: 150,
    price_btn: 320,
    stock_qty: 35,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/folk-tales-from-the-himalayas.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Folk Tales from the Himalayas | DSB Books",
    seo_description: "Bhutanese folk tales for readers of all ages.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000004",
    title: "Mathematics for Class VII",
    subtitle: "Aligned classroom workbook",
    slug: "mathematics-for-class-vii",
    description:
      "Practice-focused mathematics workbook for Class VII students. Sample catalogue title.",
    isbn_13: "9789993600004",
    language: "English",
    format: "paperback",
    page_count: 256,
    published_at: "2023-01-10",
    publisher_name: "DSB Publication",
    cost_price_btn: 140,
    price_btn: 280,
    stock_qty: 60,
    low_stock_threshold: 8,
    availability_status: "in_stock",
    cover_public_id: "/covers/mathematics-for-class-vii.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Mathematics for Class VII | DSB Books",
    seo_description: "Class VII maths workbook available at DSB Books.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000005",
    title: "Environmental Studies: Bhutan",
    subtitle: "Land, forests, and living systems",
    slug: "environmental-studies-bhutan",
    description:
      "An introduction to Bhutan's environment, conservation, and local ecosystems. Sample catalogue title.",
    isbn_13: "9789993600005",
    language: "English",
    format: "paperback",
    page_count: 180,
    published_at: "2022-06-05",
    publisher_name: "DSB Publication",
    cost_price_btn: 160,
    price_btn: 300,
    stock_qty: 22,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/environmental-studies-bhutan.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Environmental Studies: Bhutan | DSB Books",
    seo_description: "Environmental studies textbook focused on Bhutan.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000006",
    title: "The Traveller's Guide to Thimphu",
    subtitle: "Walks, markets, and quiet corners",
    slug: "travellers-guide-to-thimphu",
    description:
      "A practical and friendly guide to Chang Lam, local markets, and day trips from Thimphu. Sample catalogue title.",
    isbn_13: "9789993600006",
    language: "English",
    format: "paperback",
    page_count: 144,
    published_at: "2024-02-14",
    publisher_name: "DSB Publication",
    cost_price_btn: 200,
    price_btn: 400,
    stock_qty: 18,
    low_stock_threshold: 4,
    availability_status: "in_stock",
    cover_public_id: "/covers/travellers-guide-to-thimphu.svg",
    is_featured: true,
    is_published: true,
    seo_title: "The Traveller's Guide to Thimphu | DSB Books",
    seo_description: "Local guide to Thimphu from DSB Books.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000007",
    title: "Buddhist Philosophy for Beginners",
    subtitle: "Clear teachings for daily life",
    slug: "buddhist-philosophy-for-beginners",
    description:
      "Gentle introductions to core Buddhist ideas written for new readers. Sample catalogue title.",
    isbn_13: "9789993600007",
    language: "English",
    format: "paperback",
    page_count: 208,
    published_at: "2019-09-01",
    publisher_name: "DSB Publication",
    cost_price_btn: 190,
    price_btn: 380,
    stock_qty: 14,
    low_stock_threshold: 4,
    availability_status: "in_stock",
    cover_public_id: "/covers/buddhist-philosophy-for-beginners.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Buddhist Philosophy for Beginners | DSB Books",
    seo_description: "Introductory Buddhist philosophy from DSB Publication.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000008",
    title: "Bhutanese Cuisine at Home",
    subtitle: "Recipes from Thimphu kitchens",
    slug: "bhutanese-cuisine-at-home",
    description:
      "Home-style recipes with notes on ingredients you can find in Thimphu markets. Sample catalogue title.",
    isbn_13: "9789993600008",
    language: "English",
    format: "paperback",
    page_count: 160,
    published_at: "2023-05-20",
    publisher_name: "DSB Publication",
    cost_price_btn: 210,
    price_btn: 420,
    stock_qty: 9,
    low_stock_threshold: 5,
    availability_status: "low_stock",
    cover_public_id: "/covers/bhutanese-cuisine-at-home.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Bhutanese Cuisine at Home | DSB Books",
    seo_description: "Cook Bhutanese favourites with this DSB kitchen companion.",
  },
  {
    id: "b1000000-0000-4000-8000-000000000009",
    title: "English Grammar Workbook",
    subtitle: "Secondary school practice book",
    slug: "english-grammar-workbook",
    description:
      "Exercises and short explanations for secondary English grammar. Sample catalogue title.",
    isbn_13: "9789993600009",
    language: "English",
    format: "paperback",
    page_count: 240,
    published_at: "2021-04-12",
    publisher_name: "DSB Publication",
    cost_price_btn: 130,
    price_btn: 250,
    stock_qty: 55,
    low_stock_threshold: 8,
    availability_status: "in_stock",
    cover_public_id: "/covers/english-grammar-workbook.svg",
    is_featured: false,
    is_published: true,
    seo_title: "English Grammar Workbook | DSB Books",
    seo_description: "Secondary English grammar workbook at DSB Books.",
  },
  {
    id: "b1000000-0000-4000-8000-00000000000a",
    title: "Legends of the Thunder Dragon",
    subtitle: "Stories for young readers",
    slug: "legends-of-the-thunder-dragon",
    description:
      "Illustrated legends retold for children and families. Sample catalogue title.",
    isbn_13: "9789993600010",
    language: "English",
    format: "paperback",
    page_count: 96,
    published_at: "2020-07-08",
    publisher_name: "DSB Publication",
    cost_price_btn: 120,
    price_btn: 260,
    stock_qty: 31,
    low_stock_threshold: 5,
    availability_status: "in_stock",
    cover_public_id: "/covers/legends-of-the-thunder-dragon.svg",
    is_featured: true,
    is_published: true,
    seo_title: "Legends of the Thunder Dragon | DSB Books",
    seo_description: "Children's legends from Bhutan, published by DSB.",
  },
  {
    id: "b1000000-0000-4000-8000-00000000000b",
    title: "Civic Education: Kingdom of Bhutan",
    subtitle: "Citizenship, community, and governance",
    slug: "civic-education-kingdom-of-bhutan",
    description:
      "A school text introducing civic life and institutions in Bhutan. Sample catalogue title.",
    isbn_13: "9789993600011",
    language: "English",
    format: "paperback",
    page_count: 176,
    published_at: "2022-09-30",
    publisher_name: "DSB Publication",
    cost_price_btn: 150,
    price_btn: 290,
    stock_qty: 40,
    low_stock_threshold: 6,
    availability_status: "in_stock",
    cover_public_id: "/covers/civic-education-kingdom-of-bhutan.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Civic Education: Kingdom of Bhutan | DSB Books",
    seo_description: "Civic education textbook available at DSB Books, Thimphu.",
  },
  {
    id: "b1000000-0000-4000-8000-00000000000c",
    title: "Mountain Flora of Bhutan",
    subtitle: "A field companion to alpine plants",
    slug: "mountain-flora-of-bhutan",
    description:
      "Notes and descriptions of common alpine plants for students and hikers. Sample catalogue title.",
    isbn_13: "9789993600012",
    language: "English",
    format: "paperback",
    page_count: 212,
    published_at: "2018-05-18",
    publisher_name: "DSB Publication",
    cost_price_btn: 240,
    price_btn: 480,
    stock_qty: 3,
    low_stock_threshold: 5,
    availability_status: "low_stock",
    cover_public_id: "/covers/mountain-flora-of-bhutan.svg",
    is_featured: false,
    is_published: true,
    seo_title: "Mountain Flora of Bhutan | DSB Books",
    seo_description: "Field guide to Bhutan's mountain flora from DSB Publication.",
  },
];

const bookAuthors = [
  ["b1000000-0000-4000-8000-000000000001", "a1000000-0000-4000-8000-000000000004"],
  ["b1000000-0000-4000-8000-000000000002", "a1000000-0000-4000-8000-000000000002"],
  ["b1000000-0000-4000-8000-000000000003", "a1000000-0000-4000-8000-000000000003"],
  ["b1000000-0000-4000-8000-000000000004", "a1000000-0000-4000-8000-000000000004"],
  ["b1000000-0000-4000-8000-000000000005", "a1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000006", "a1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000007", "a1000000-0000-4000-8000-000000000005"],
  ["b1000000-0000-4000-8000-000000000008", "a1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000009", "a1000000-0000-4000-8000-000000000004"],
  ["b1000000-0000-4000-8000-00000000000a", "a1000000-0000-4000-8000-000000000003"],
  ["b1000000-0000-4000-8000-00000000000b", "a1000000-0000-4000-8000-000000000002"],
  ["b1000000-0000-4000-8000-00000000000c", "a1000000-0000-4000-8000-000000000002"],
];

const bookCategories = [
  ["b1000000-0000-4000-8000-000000000001", "c1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000001", "c1000000-0000-4000-8000-000000000003"],
  ["b1000000-0000-4000-8000-000000000002", "c1000000-0000-4000-8000-000000000002"],
  ["b1000000-0000-4000-8000-000000000003", "c1000000-0000-4000-8000-000000000002"],
  ["b1000000-0000-4000-8000-000000000003", "c1000000-0000-4000-8000-000000000004"],
  ["b1000000-0000-4000-8000-000000000004", "c1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000005", "c1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000006", "c1000000-0000-4000-8000-000000000002"],
  ["b1000000-0000-4000-8000-000000000007", "c1000000-0000-4000-8000-000000000005"],
  ["b1000000-0000-4000-8000-000000000008", "c1000000-0000-4000-8000-000000000002"],
  ["b1000000-0000-4000-8000-000000000009", "c1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-000000000009", "c1000000-0000-4000-8000-000000000003"],
  ["b1000000-0000-4000-8000-00000000000a", "c1000000-0000-4000-8000-000000000004"],
  ["b1000000-0000-4000-8000-00000000000b", "c1000000-0000-4000-8000-000000000001"],
  ["b1000000-0000-4000-8000-00000000000c", "c1000000-0000-4000-8000-000000000002"],
];

function assertOk(label, error) {
  if (error) {
    console.error(`${label}:`, error.message);
    process.exit(1);
  }
}

const { error: aErr } = await supabase.from("authors").upsert(authors, {
  onConflict: "slug",
});
assertOk("authors", aErr);

const { error: cErr } = await supabase.from("categories").upsert(categories, {
  onConflict: "slug",
});
assertOk("categories", cErr);

const { error: bErr } = await supabase.from("books").upsert(books, {
  onConflict: "slug",
});
assertOk("books", bErr);

const { error: baErr } = await supabase.from("book_authors").upsert(
  bookAuthors.map(([book_id, author_id]) => ({
    book_id,
    author_id,
    sort_order: 0,
  })),
  { onConflict: "book_id,author_id", ignoreDuplicates: true },
);
assertOk("book_authors", baErr);

const { error: bcErr } = await supabase.from("book_categories").upsert(
  bookCategories.map(([book_id, category_id]) => ({ book_id, category_id })),
  { onConflict: "book_id,category_id", ignoreDuplicates: true },
);
assertOk("book_categories", bcErr);

const { count: bookCount } = await supabase
  .from("books")
  .select("*", { count: "exact", head: true })
  .eq("is_published", true);

console.log(
  `Seeded sample catalogue: ${bookCount} published books on ${new URL(url).host}`,
);
