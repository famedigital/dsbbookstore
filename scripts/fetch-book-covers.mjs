import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, createWriteStream } from "node:fs";
import { resolve, extname } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

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

const OUT_DIR = resolve("public/covers");
mkdirSync(OUT_DIR, { recursive: true });

async function openLibraryByIsbn(isbn) {
  const clean = isbn.replace(/[^0-9Xx]/g, "");
  if (!clean) return null;
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`;
  const head = await fetch(coverUrl, { method: "HEAD", redirect: "follow" });
  if (head.ok && Number(head.headers.get("content-length") || 0) > 1000) {
    return coverUrl;
  }
  return null;
}

async function openLibraryByTitle(title, authorHint = "") {
  const q = encodeURIComponent(`${title} ${authorHint}`.trim());
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${q}&limit=5&fields=title,cover_i,isbn,author_name,publisher`
  );
  if (!res.ok) return null;
  const json = await res.json();
  const docs = json.docs || [];
  for (const doc of docs) {
    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }
  }
  return null;
}

async function googleBooksCover(title) {
  const q = encodeURIComponent(`intitle:${title}`);
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`
  );
  if (!res.ok) return null;
  const json = await res.json();
  for (const item of json.items || []) {
    const links = item.volumeInfo?.imageLinks;
    const src =
      links?.extraLarge ||
      links?.large ||
      links?.medium ||
      links?.thumbnail ||
      links?.smallThumbnail;
    if (src) return src.replace("http://", "https://");
  }
  return null;
}

async function downloadCover(imageUrl, slug) {
  const res = await fetch(imageUrl, { redirect: "follow" });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const ctype = res.headers.get("content-type") || "";
  let ext = ".jpg";
  if (ctype.includes("png")) ext = ".png";
  else if (ctype.includes("webp")) ext = ".webp";
  else if (ctype.includes("gif")) ext = ".gif";
  else {
    const fromUrl = extname(new URL(imageUrl).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromUrl)) {
      ext = fromUrl === ".jpeg" ? ".jpg" : fromUrl;
    }
  }
  const dest = resolve(OUT_DIR, `${slug}${ext}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return `/covers/${slug}${ext}`;
}

async function findCover(book) {
  if (book.isbn_13) {
    const byIsbn = await openLibraryByIsbn(book.isbn_13);
    if (byIsbn) return { source: "openlibrary-isbn", url: byIsbn };
  }
  const byTitle = await openLibraryByTitle(book.title);
  if (byTitle) return { source: "openlibrary-title", url: byTitle };
  const byGoogle = await googleBooksCover(book.title);
  if (byGoogle) return { source: "google-books", url: byGoogle };
  return null;
}

const { data: books, error } = await supabase
  .from("books")
  .select("id, title, slug, isbn_13, cover_public_id")
  .order("title");

if (error) {
  console.error(error);
  process.exit(1);
}

const report = [];

for (const book of books) {
  const current = book.cover_public_id || "";
  const alreadyRemote =
    current.startsWith("http://") || current.startsWith("https://");
  const alreadyLocalRaster =
    current.startsWith("/covers/") && !current.endsWith(".svg");

  if (alreadyRemote || alreadyLocalRaster) {
    report.push({
      title: book.title,
      slug: book.slug,
      status: "kept",
      cover: current,
    });
    console.log(`KEEP  ${book.slug} → ${current}`);
    continue;
  }

  try {
    const found = await findCover(book);
    if (!found) {
      report.push({
        title: book.title,
        slug: book.slug,
        status: "not_found",
        cover: current,
      });
      console.log(`MISS  ${book.slug}`);
      continue;
    }

    let localPath;
    try {
      localPath = await downloadCover(found.url, book.slug);
    } catch (e) {
      // Fall back to remote URL if download fails
      localPath = found.url;
      console.warn(`  download failed for ${book.slug}: ${e.message}; using URL`);
    }

    const { error: upErr } = await supabase
      .from("books")
      .update({ cover_public_id: localPath })
      .eq("id", book.id);

    if (upErr) throw upErr;

    report.push({
      title: book.title,
      slug: book.slug,
      status: "updated",
      source: found.source,
      cover: localPath,
      remote: found.url,
    });
    console.log(`OK    ${book.slug} ← ${found.source} → ${localPath}`);
  } catch (e) {
    report.push({
      title: book.title,
      slug: book.slug,
      status: "error",
      error: e.message,
    });
    console.error(`ERR   ${book.slug}: ${e.message}`);
  }
}

writeFileSync(
  resolve("scripts/cover-fetch-report.json"),
  JSON.stringify(report, null, 2)
);

const summary = report.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});
console.log("\nSummary:", summary);
