/**
 * Enrich book bibliographic metadata from free sources (Open Library + Google Books).
 * Optional AI polish when AI_GATEWAY_API_KEY or OPENAI_API_KEY is set and --ai is passed.
 *
 * Fills empty: description, publisher_name, published_at, page_count, subtitle,
 * isbn_10, language, seo_description. Never overwrites non-empty fields unless --force.
 *
 * Usage:
 *   node scripts/enrich-book-metadata.mjs [--limit=100] [--dry-run] [--force] [--ai]
 *   npm run books:enrich
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeIsbn(value) {
  if (!value) return null;
  const clean = String(value).replace(/[^0-9Xx]/g, "");
  if (/^97[89]\d{10}$/.test(clean)) return clean;
  if (/^\d{9}[\dXx]$/.test(clean)) return clean.toUpperCase();
  return null;
}

function parseYearDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const y = s.match(/\b(19|20)\d{2}\b/);
  if (y) return `${y[0]}-01-01`;
  return null;
}

function needsEnrichment(book, force) {
  if (force) return true;
  // Already attempted (hit or miss) — skip unless --force
  if (book.metadata_enriched_at) return false;
  const thinDesc = !book.description || book.description.trim().length < 40;
  const thinPub =
    !book.publisher_name ||
    book.publisher_name === "DSB Publication" ||
    book.publisher_name === "DSB Enterprises";
  return thinDesc || thinPub || !book.published_at || !book.page_count;
}

function mergeField(current, next, force) {
  if (next == null || next === "") return current;
  if (force) return next;
  if (current == null || current === "") return next;
  if (
    typeof current === "string" &&
    (current === "DSB Publication" || current === "DSB Enterprises")
  ) {
    return next;
  }
  if (typeof current === "string" && current.trim().length < 40 && String(next).trim().length > current.trim().length) {
    return next;
  }
  return current;
}

async function fetchOpenLibrary(isbn) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "DSBBookstore/1.0 (metadata enrich)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data[`ISBN:${isbn}`];
  if (!entry) return null;

  const publishers = (entry.publishers || []).map((p) => p.name).filter(Boolean);
  const subjects = (entry.subjects || [])
    .slice(0, 6)
    .map((s) => s.name)
    .filter(Boolean);

  let description = null;
  if (typeof entry.notes === "string") description = entry.notes;
  else if (entry.excerpts?.[0]?.text) description = entry.excerpts[0].text;

  // Work description often richer
  const workKey = entry.identifiers?.openlibrary?.[0]
    ? null
    : entry.key;
  void workKey;

  return {
    source: "openlibrary",
    title: entry.title || null,
    subtitle: entry.subtitle || null,
    description: description
      ? String(description).slice(0, 4000)
      : subjects.length
        ? `Topics: ${subjects.join(", ")}.`
        : null,
    publisher_name: publishers[0] || null,
    published_at: parseYearDate(entry.publish_date),
    page_count: entry.number_of_pages || null,
    isbn_10: (entry.identifiers?.isbn_10 || [])[0] || null,
    language: entry.languages?.[0]?.key?.replace("/languages/", "") || null,
  };
}

async function fetchGoogleBooks(isbn, title, brand) {
  let q = isbn ? `isbn:${isbn}` : `intitle:${encodeURIComponent(title || "")}`;
  if (!isbn && brand) q += `+inauthor:${encodeURIComponent(brand)}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "DSBBookstore/1.0 (metadata enrich)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const info = data.items?.[0]?.volumeInfo;
  if (!info) return null;

  const ids = info.industryIdentifiers || [];
  const isbn10 = ids.find((i) => i.type === "ISBN_10")?.identifier || null;

  return {
    source: "google_books",
    title: info.title || null,
    subtitle: info.subtitle || null,
    description: info.description ? String(info.description).slice(0, 4000) : null,
    publisher_name: info.publisher || null,
    published_at: parseYearDate(info.publishedDate),
    page_count: info.pageCount || null,
    isbn_10: isbn10,
    language: info.language || null,
  };
}

async function polishWithAi(book, draft) {
  const key =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.VERCEL_AI_GATEWAY_API_KEY;
  if (!key) return null;

  const base =
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY
      ? "https://ai-gateway.vercel.sh/v1"
      : "https://api.openai.com/v1";
  const model =
    process.env.BOOK_ENRICH_MODEL ||
    (base.includes("ai-gateway") ? "openai/gpt-5.4-mini" : "gpt-5.4-mini");

  const prompt = `You write short bookstore catalogue copy for DSB Books in Thimphu, Bhutan.
Return JSON only with keys: description (2-4 sentences, factual, no hype), seo_description (max 155 chars).
Do not invent awards or fake quotes. If little is known, write a careful generic shelf note.

Title: ${book.title}
Author/brand: ${book.brand || "unknown"}
Publisher: ${draft.publisher_name || book.publisher_name || "unknown"}
Published: ${draft.published_at || book.published_at || "unknown"}
Existing blurb: ${(draft.description || book.description || "").slice(0, 800)}`;

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output valid JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const useAi = process.argv.includes("--ai");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 100;

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
    .select(
      "id, title, brand, subtitle, description, publisher_name, published_at, page_count, isbn_13, isbn_10, barcode, language, seo_description, metadata_source, metadata_enriched_at"
    )
    .eq("product_kind", "book")
    .order("updated_at", { ascending: false })
    .range(from, from + 999);
  if (error) throw error;
  books.push(...(data || []));
  if (!data || data.length < 1000) break;
  from += 1000;
}

const queue = books.filter((b) => needsEnrichment(b, force)).slice(0, limit);
console.log({
  total: books.length,
  needing: books.filter((b) => needsEnrichment(b, false)).length,
  processing: queue.length,
  dryRun,
  force,
  useAi,
});

let updated = 0;
let skipped = 0;
let errors = 0;

for (let i = 0; i < queue.length; i++) {
  const book = queue[i];
  const isbn = normalizeIsbn(book.isbn_13) || normalizeIsbn(book.barcode);

  try {
    let ol = null;
    let gb = null;
    if (isbn) {
      ol = await fetchOpenLibrary(isbn);
      await sleep(200);
      gb = await fetchGoogleBooks(isbn);
      await sleep(200);
    } else {
      gb = await fetchGoogleBooks(null, book.title, book.brand);
      await sleep(250);
    }

    const sources = [ol, gb].filter(Boolean);
    if (sources.length === 0) {
      if (!dryRun) {
        const { error } = await supabase
          .from("books")
          .update({
            metadata_source: "none",
            metadata_enriched_at: new Date().toISOString(),
          })
          .eq("id", book.id);
        if (error) throw error;
      }
      skipped += 1;
      if (i < 5 || (i + 1) % 50 === 0) {
        console.log(`SKIP ${i + 1}/${queue.length} no metadata ${book.title.slice(0, 40)}`);
      }
      continue;
    }

    const draft = {
      subtitle: mergeField(book.subtitle, ol?.subtitle || gb?.subtitle, force),
      description: mergeField(
        book.description,
        gb?.description || ol?.description,
        force
      ),
      publisher_name: mergeField(
        book.publisher_name,
        gb?.publisher_name || ol?.publisher_name,
        force
      ),
      published_at: mergeField(
        book.published_at,
        gb?.published_at || ol?.published_at,
        force
      ),
      page_count: mergeField(
        book.page_count,
        gb?.page_count || ol?.page_count,
        force
      ),
      isbn_10: mergeField(book.isbn_10, ol?.isbn_10 || gb?.isbn_10, force),
      language: mergeField(
        book.language,
        gb?.language || ol?.language,
        force
      ),
      seo_description: book.seo_description,
      metadata_source:
        ol && gb ? "mixed" : ol ? "openlibrary" : "google_books",
    };

    if (useAi && (!draft.description || draft.description.length < 80)) {
      try {
        const ai = await polishWithAi(book, draft);
        if (ai?.description) {
          draft.description = mergeField(draft.description, ai.description, force || !draft.description);
          draft.metadata_source =
            draft.metadata_source === "mixed"
              ? "mixed"
              : `${draft.metadata_source}+ai`;
        }
        if (ai?.seo_description) {
          draft.seo_description = mergeField(
            draft.seo_description,
            String(ai.seo_description).slice(0, 160),
            force || !draft.seo_description
          );
        }
        await sleep(400);
      } catch (e) {
        console.warn(`AI skip ${book.title.slice(0, 32)}`, e.message || e);
      }
    }

    if (!draft.seo_description && draft.description) {
      draft.seo_description = String(draft.description)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 155);
    }

    const payload = {
      subtitle: draft.subtitle,
      description: draft.description,
      publisher_name: draft.publisher_name,
      published_at: draft.published_at,
      page_count: draft.page_count,
      isbn_10: draft.isbn_10,
      language: draft.language,
      seo_description: draft.seo_description,
      metadata_source: draft.metadata_source,
      metadata_enriched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const changed =
      payload.description !== book.description ||
      payload.publisher_name !== book.publisher_name ||
      payload.published_at !== book.published_at ||
      payload.page_count !== book.page_count ||
      payload.subtitle !== book.subtitle;

    if (!changed) {
      if (!dryRun) {
        const { error } = await supabase
          .from("books")
          .update({
            metadata_source: draft.metadata_source || book.metadata_source || "checked",
            metadata_enriched_at: new Date().toISOString(),
          })
          .eq("id", book.id);
        if (error) throw error;
      }
      skipped += 1;
      continue;
    }

    if (dryRun) {
      updated += 1;
      console.log(`DRY  ${book.title.slice(0, 36)} ← ${draft.metadata_source}`);
    } else {
      const { error } = await supabase.from("books").update(payload).eq("id", book.id);
      if (error) throw error;
      updated += 1;
      if (i < 3 || (i + 1) % 25 === 0) {
        console.log(
          `OK   ${i + 1}/${queue.length} updated=${updated} ${book.title.slice(0, 32)}`
        );
      }
    }
  } catch (e) {
    errors += 1;
    console.error(`ERR ${book.title.slice(0, 40)}`, e.message || e);
  }
}

console.log({ updated, skipped, errors, processed: queue.length });
