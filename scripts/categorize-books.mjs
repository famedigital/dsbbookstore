/**
 * Ensure browse categories exist and assign uncategorized published books.
 * Keyword heuristics for a Bhutan bookstore catalogue.
 *
 * Usage: node scripts/categorize-books.mjs
 */
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

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** @type {{ name: string; sort: number; match: (t: string, b: string) => boolean }[]} */
const RULES = [
  {
    name: "Buddhism & Dharma",
    sort: 10,
    match: (t) =>
      /\b(buddh|dharma|dalai|lama|tibet|zen|sutra|meditation|mindfulness|osho|thich|vajra|sangha|monk|nirvana|karma)\b/i.test(
        t
      ),
  },
  {
    name: "Bhutan & Himalaya",
    sort: 20,
    match: (t) =>
      /\b(bhutan|thimphu|druk|dzong|himalay|paro|punakha|wangchuck|lekh|sherig|driglam)\b/i.test(
        t
      ),
  },
  {
    name: "Children & Young Readers",
    sort: 30,
    match: (t) =>
      /\b(children|child|kids|junior|geronimo|stilton|diary of|princess|fairy|sticker|picture book|young reader|junior)\b/i.test(
        t
      ),
  },
  {
    name: "Fiction & Literature",
    sort: 40,
    match: (t) =>
      /\b(novel|story|stories|fiction|poem|poetry|literature|murty|chase|ludlum|kinney|walliams)\b/i.test(
        t
      ),
  },
  {
    name: "Business & Self-Help",
    sort: 50,
    match: (t) =>
      /\b(business|success|leader|wealth|rich|habit|mindset|self.?help|napoleon hill|robin sharma|think and grow)\b/i.test(
        t
      ),
  },
  {
    name: "History & Culture",
    sort: 60,
    match: (t) =>
      /\b(history|historic|culture|civilization|war|biography|memoir|heritage|ancient)\b/i.test(
        t
      ),
  },
  {
    name: "Education & Reference",
    sort: 70,
    match: (t) =>
      /\b(dictionary|grammar|english|math|science|textbook|guide|encyclopedia|atlas|curriculum|school)\b/i.test(
        t
      ),
  },
  {
    name: "General Interest",
    sort: 100,
    match: () => true,
  },
];

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Ensure categories
const catByName = new Map();
for (const rule of RULES) {
  const slug = slugify(rule.name);
  const { data: existing } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    catByName.set(rule.name, existing.id);
    continue;
  }
  const { data: created, error } = await supabase
    .from("categories")
    .insert({
      name: rule.name,
      slug,
      sort_order: rule.sort,
      description: `${rule.name} titles at DSB Books`,
    })
    .select("id")
    .single();
  if (error) {
    console.error("category create failed", rule.name, error.message);
    process.exit(1);
  }
  catByName.set(rule.name, created.id);
  console.log("created category", rule.name);
}

// Load books (published books preferred; also stock register titles)
const books = [];
let from = 0;
for (;;) {
  const { data, error } = await supabase
    .from("books")
    .select("id, title, brand, product_kind, is_published")
    .eq("product_kind", "book")
    .range(from, from + 999);
  if (error) throw error;
  books.push(...(data || []));
  if (!data || data.length < 1000) break;
  from += 1000;
}

const { data: linkRows } = await supabase
  .from("book_categories")
  .select("book_id");
// paginate if needed
let allLinks = linkRows || [];
if ((linkRows || []).length >= 1000) {
  let lf = 1000;
  for (;;) {
    const { data: more } = await supabase
      .from("book_categories")
      .select("book_id")
      .range(lf, lf + 999);
    allLinks = allLinks.concat(more || []);
    if (!more || more.length < 1000) break;
    lf += 1000;
  }
}
const linked = new Set(allLinks.map((l) => l.book_id));

const uncategorized = books.filter((b) => !linked.has(b.id));
console.log({
  totalBooks: books.length,
  alreadyLinked: linked.size,
  uncategorized: uncategorized.length,
});

if (uncategorized.length < 6 && uncategorized.length > 0) {
  console.log(
    `Only ${uncategorized.length} uncategorized — still assigning them.`
  );
}

let assigned = 0;
const counts = Object.fromEntries(RULES.map((r) => [r.name, 0]));
const batch = [];

for (const book of uncategorized) {
  const hay = `${book.title} ${book.brand || ""}`;
  const rule = RULES.find((r) => r.match(hay)) || RULES[RULES.length - 1];
  const categoryId = catByName.get(rule.name);
  batch.push({ book_id: book.id, category_id: categoryId });
  counts[rule.name] += 1;
  assigned += 1;

  if (batch.length >= 200) {
    const { error } = await supabase.from("book_categories").upsert(batch, {
      onConflict: "book_id,category_id",
    });
    if (error) throw error;
    batch.length = 0;
    console.log(`… assigned ${assigned}`);
  }
}

if (batch.length) {
  const { error } = await supabase.from("book_categories").upsert(batch, {
    onConflict: "book_id,category_id",
  });
  if (error) throw error;
}

console.log(JSON.stringify({ assigned, counts }, null, 2));
