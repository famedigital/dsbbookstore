/**
 * Free-tier cover strategy for 6k+ catalogue:
 * - Do NOT upload covers to Cloudinary (blows free credits/storage)
 * - Link Open Library CDN URLs into books.cover_public_id by ISBN/barcode
 * - Fall back to Open Library title search (cover_i) when ISBN has no cover
 * - Rate-limited; skips titles that already have a real cover
 *
 * Usage: node scripts/link-openlibrary-covers.mjs [--limit=500] [--dry-run]
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

function normalizeIsbn(value) {
  if (!value) return null;
  const clean = String(value).replace(/[^0-9Xx]/g, "");
  if (/^97[89]\d{10}$/.test(clean)) return clean;
  if (/^\d{9}[\dXx]$/.test(clean)) return clean.toUpperCase();
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function coverExists(url) {
  const res = await fetch(url, { redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  return res.ok && buf.length >= 1000 ? url.split("?")[0] + "?default=false" : null;
}

async function coverByIsbn(isbn) {
  return coverExists(
    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
  );
}

async function coverByTitle(title) {
  const q = encodeURIComponent(String(title || "").slice(0, 120));
  if (!q) return null;
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${q}&limit=5&fields=title,cover_i`
  );
  if (!res.ok) return null;
  const json = await res.json();
  for (const doc of json.docs || []) {
    if (!doc.cover_i) continue;
    // cover_i IDs are known-good on OL — skip second download verify
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
  }
  return null;
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;
const noTitle = process.argv.includes("--isbn-only");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);

const books = [];
let from = 0;
for (;;) {
  const { data, error } = await supabase
    .from("books")
    .select("id, title, isbn_13, barcode, cover_public_id")
    .eq("product_kind", "book")
    .range(from, from + 999);
  if (error) throw error;
  books.push(...(data || []));
  if (!data || data.length < 1000) break;
  from += 1000;
}

const needs = books.filter((b) => {
  const c = b.cover_public_id || "";
  if (c.startsWith("http") || (c.startsWith("/covers/") && !c.endsWith(".svg")))
    return false;
  return true;
});

const queue = limit > 0 ? needs.slice(0, limit) : needs;
console.log({
  total: books.length,
  needingCover: needs.length,
  processing: queue.length,
  dryRun,
  titleFallback: !noTitle,
});

let linked = 0;
let miss = 0;
let errors = 0;
let byIsbn = 0;
let byTitle = 0;

for (let i = 0; i < queue.length; i++) {
  const book = queue[i];
  const isbn = normalizeIsbn(book.isbn_13) || normalizeIsbn(book.barcode);

  try {
    let coverUrl = null;
    if (isbn) {
      coverUrl = await coverByIsbn(isbn);
      if (coverUrl) byIsbn += 1;
    }
    if (!coverUrl && !noTitle) {
      coverUrl = await coverByTitle(book.title);
      if (coverUrl) byTitle += 1;
    }

    if (!coverUrl) {
      miss += 1;
      if ((i + 1) % 100 === 0 || i < 5) {
        console.log(`MISS ${i + 1}/${queue.length} ${book.title.slice(0, 40)}`);
      }
    } else if (dryRun) {
      linked += 1;
      console.log(`DRY  ${book.title.slice(0, 40)} → ${coverUrl}`);
    } else {
      const { error } = await supabase
        .from("books")
        .update({ cover_public_id: coverUrl })
        .eq("id", book.id);
      if (error) throw error;
      linked += 1;
      if ((i + 1) % 50 === 0 || i < 3) {
        console.log(
          `OK   ${i + 1}/${queue.length} linked=${linked} isbn=${byIsbn} title=${byTitle} miss=${miss} ${book.title.slice(0, 28)}`
        );
      }
    }
  } catch (e) {
    errors += 1;
    console.error(`ERR ${book.title.slice(0, 40)}`, e.message || e);
  }

  await sleep(120);
}

console.log(
  JSON.stringify(
    { linked, byIsbn, byTitle, miss, errors, processed: queue.length },
    null,
    2
  )
);
