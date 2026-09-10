/**
 * Fast import of docs/Stock Register 31-12-25.xlsx into books.
 * Excel columns → DB (ditto):
 *   Product→title, Brand→brand, Pur Rate→cost_price_btn, Sal Rate→price_btn,
 *   Opening→opening_qty, Closing→stock_qty (via movements), Clo Val→clo_val_btn,
 *   UPCEAN→barcode
 *
 * Usage: node scripts/import-stock-register.mjs [--dry-run] [path]
 */
import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

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
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isIsbn13(upc) {
  return /^97[89]\d{10}$/.test(upc);
}

function normalizeBrand(brand) {
  const b = String(brand || "").trim();
  if (!b) return null;
  const upper = b.toUpperCase();
  if (upper === "NONE" || upper === "[NONE]" || upper === "NONME") return null;
  return b;
}

function parseStockRegister(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  let headerIdx = -1;
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const cells = (rows[i] || []).map((c) =>
      String(c ?? "")
        .trim()
        .toLowerCase()
    );
    if (cells.includes("product") && cells.includes("upcean")) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) throw new Error("Could not find Stock Register header row");

  const header = rows[headerIdx].map((c) =>
    String(c ?? "")
      .trim()
      .toLowerCase()
  );
  const col = (name) => header.indexOf(name);
  const idx = {
    product: col("product"),
    brand: col("brand"),
    pur: col("pur rate"),
    sal: col("sal rate"),
    opening: col("opening"),
    closing: col("closing"),
    cloVal: col("clo val"),
    upcean: col("upcean"),
  };
  for (const [k, v] of Object.entries(idx)) {
    if (v < 0) throw new Error(`Missing column: ${k}`);
  }

  const out = [];
  const seen = new Set();
  for (const row of rows.slice(headerIdx + 1)) {
    if (!row) continue;
    const product = String(row[idx.product] ?? "").trim();
    const upcean = String(row[idx.upcean] ?? "").trim();
    if (!product || !upcean) continue;
    if (seen.has(upcean)) continue;
    seen.add(upcean);

    const sal = num(row[idx.sal]);
    const closing = Math.max(0, Math.round(num(row[idx.closing])));
    const cloFromSheet = num(row[idx.cloVal]);
    const clo_val =
      cloFromSheet > 0 ? cloFromSheet : Math.round(closing * sal * 100) / 100;

    out.push({
      product,
      brand: normalizeBrand(row[idx.brand]),
      pur_rate: num(row[idx.pur]),
      sal_rate: sal,
      opening: Math.max(0, Math.round(num(row[idx.opening]))),
      closing,
      clo_val,
      upcean,
    });
  }
  return out;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing Supabase URL or service role key");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
const filePath = resolve(args[0] || "docs/Stock Register 31-12-25.xlsx");
const dryRun = process.argv.includes("--dry-run");

const lines = parseStockRegister(filePath);
console.log(`Parsed ${lines.length} rows from ${filePath}`);
if (dryRun) {
  console.log("Sample:", lines.slice(0, 3));
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const byBarcode = new Map();
const byIsbn = new Map();
let from = 0;
const pageSize = 1000;
for (;;) {
  const { data, error } = await supabase
    .from("books")
    .select("id, barcode, isbn_13, stock_qty, slug")
    .range(from, from + pageSize - 1);
  if (error) throw error;
  for (const b of data || []) {
    if (b.barcode) byBarcode.set(String(b.barcode), b);
    if (b.isbn_13) byIsbn.set(String(b.isbn_13), b);
  }
  if (!data || data.length < pageSize) break;
  from += pageSize;
}
console.log(
  `Existing books loaded: barcodes=${byBarcode.size} isbns=${byIsbn.size}`
);

const CHUNK = 100;
let created = 0;
let updated = 0;
let stockMoves = 0;
let errors = 0;

for (let i = 0; i < lines.length; i += CHUNK) {
  const chunk = lines.slice(i, i + CHUNK);
  const toInsert = [];
  const toUpdate = [];

  for (const line of chunk) {
    const existing =
      byBarcode.get(line.upcean) ||
      (isIsbn13(line.upcean) ? byIsbn.get(line.upcean) : null);
    const isbn = isIsbn13(line.upcean) ? line.upcean : null;
    // Avoid books_isbn_13_key collisions with seed/other rows
    const isbnSafe =
      isbn && (!byIsbn.has(isbn) || byIsbn.get(isbn)?.id === existing?.id)
        ? isbn
        : null;
    const baseSlug = slugify(line.product) || `item`;
    const slug = existing?.slug || `${baseSlug}-${line.upcean}`;
    const payload = {
      title: line.product,
      brand: line.brand,
      cost_price_btn: line.pur_rate,
      price_btn: line.sal_rate,
      opening_qty: line.opening,
      clo_val_btn: line.clo_val,
      barcode: line.upcean,
      isbn_13: isbnSafe,
      product_kind: "book",
      format: "paperback",
      language: "English",
      publisher_name: "DSB Enterprises",
      is_published: line.closing > 0,
      slug,
      _closing: line.closing,
      _existing: existing || null,
    };
    if (existing) toUpdate.push(payload);
    else toInsert.push(payload);
  }

  if (toInsert.length) {
    const rows = toInsert.map(({ _closing, _existing, ...r }) => ({
      ...r,
      stock_qty: 0,
      availability_status: "out_of_stock",
    }));
    const { data, error } = await supabase
      .from("books")
      .insert(rows)
      .select("id, barcode, stock_qty");
    if (error) {
      // fall back one-by-one for this chunk
      console.warn("batch insert failed, falling back:", error.message);
      for (const row of rows) {
        const { data: one, error: e1 } = await supabase
          .from("books")
          .insert(row)
          .select("id, barcode, stock_qty")
          .single();
        if (e1) {
          errors += 1;
          console.error("insert fail", row.barcode, e1.message);
          continue;
        }
        byBarcode.set(one.barcode, one);
        created += 1;
      }
    } else {
      for (const one of data || []) {
        byBarcode.set(one.barcode, one);
        if (isIsbn13(one.barcode)) byIsbn.set(one.barcode, one);
      }
      created += (data || []).length;
    }
  }

  // Parallel updates (PostgREST has no multi-row update-by-id)
  if (toUpdate.length) {
    const results = await Promise.all(
      toUpdate.map(async (payload) => {
        const existing = payload._existing;
        const { _closing, _existing, ...r } = payload;
        const { error } = await supabase
          .from("books")
          .update(r)
          .eq("id", existing.id);
        if (error) {
          console.error("update fail", r.barcode, error.message);
          return false;
        }
        return true;
      })
    );
    updated += results.filter(Boolean).length;
    errors += results.filter((ok) => !ok).length;
  }

  // Stock movements for this chunk (Closing vs current)
  const moves = [];
  for (const line of chunk) {
    const book = byBarcode.get(line.upcean);
    if (!book) continue;
    const current = book.stock_qty ?? 0;
    const delta = line.closing - current;
    if (delta === 0) continue;
    moves.push({
      book_id: book.id,
      movement_type: "count_adjust",
      qty_delta: delta,
      reason: "Stock Register 31-12-25 import (Closing)",
      reference_type: "stock_register_import",
    });
    book.stock_qty = line.closing;
  }

  if (moves.length) {
    const { error } = await supabase.from("stock_movements").insert(moves);
    if (error) {
      console.warn("batch moves failed, falling back:", error.message);
      for (const m of moves) {
        const { error: e2 } = await supabase.from("stock_movements").insert(m);
        if (e2) {
          errors += 1;
          console.error("move fail", m.book_id, e2.message);
        } else stockMoves += 1;
      }
    } else {
      stockMoves += moves.length;
    }
  }

  console.log(
    `… ${Math.min(i + CHUNK, lines.length)}/${lines.length} (created ${created}, updated ${updated}, moves ${stockMoves}, errors ${errors})`
  );
}

console.log(
  JSON.stringify(
    { created, updated, stockMoves, errors, total: lines.length },
    null,
    2
  )
);
