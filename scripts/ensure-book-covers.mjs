/**
 * Ensures every published book has a local raster cover image.
 * Missing titles get a premium generated jacket; remote URLs are downloaded.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

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

const OUT = resolve("public/covers");
mkdirSync(OUT, { recursive: true });

const PALETTES = [
  ["#1a1510", "#5c241c", "#9c7a3e"],
  ["#0f1f1a", "#1f4d3a", "#c9a227"],
  ["#14101c", "#3d2a5c", "#b8a06a"],
  ["#1c1410", "#6b3a1f", "#d4a574"],
  ["#101820", "#1e3a5f", "#c4b59a"],
  ["#1a1008", "#4a2818", "#e8d5a3"],
];

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title, maxLen = 16) {
  const words = title.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxLen && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 5);
}

function jacketSvg(title, subtitle, palette) {
  const [ink, lacquer, gilt] = palette;
  const lines = wrapTitle(title, 14);
  const titleBlock = lines
    .map(
      (line, i) =>
        `<text x="200" y="${280 + i * 42}" text-anchor="middle" fill="#f7f2e8" font-family="Georgia, serif" font-size="34" font-weight="600">${escapeXml(line)}</text>`
    )
    .join("\n");
  const subY = 280 + lines.length * 42 + 28;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ink}"/>
      <stop offset="55%" stop-color="${lacquer}"/>
      <stop offset="100%" stop-color="${ink}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#g)"/>
  <rect width="400" height="600" fill="url(#shine)"/>
  <rect x="28" y="28" width="344" height="544" fill="none" stroke="${gilt}" stroke-width="1.5" opacity="0.85"/>
  <rect x="36" y="36" width="328" height="528" fill="none" stroke="${gilt}" stroke-width="0.5" opacity="0.45"/>
  <text x="200" y="90" text-anchor="middle" fill="${gilt}" font-family="Georgia, serif" font-size="11" letter-spacing="4">DSB PUBLICATION</text>
  <line x1="120" y1="110" x2="280" y2="110" stroke="${gilt}" stroke-width="1" opacity="0.7"/>
  ${titleBlock}
  ${
    subtitle
      ? `<text x="200" y="${subY}" text-anchor="middle" fill="#f7f2e8" font-family="Georgia, serif" font-size="14" opacity="0.7">${escapeXml(subtitle)}</text>`
      : ""
  }
  <text x="200" y="540" text-anchor="middle" fill="${gilt}" font-family="Georgia, serif" font-size="12" letter-spacing="3">THIMPHU · BHUTAN</text>
</svg>`;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function downloadToJpg(url, slug) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) throw new Error("tiny file");
  const dest = resolve(OUT, `${slug}.jpg`);
  await sharp(buf)
    .resize(600, 900, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toFile(dest);
  return `/covers/${slug}.jpg`;
}

async function generateJacket(book, index) {
  const palette = PALETTES[index % PALETTES.length];
  const svg = jacketSvg(book.title, book.subtitle || "DSB Books", palette);
  const dest = resolve(OUT, `${book.slug}.jpg`);
  await sharp(Buffer.from(svg))
    .resize(600, 900)
    .jpeg({ quality: 90 })
    .toFile(dest);
  return `/covers/${book.slug}.jpg`;
}

const { data: books, error } = await supabase
  .from("books")
  .select("id, title, subtitle, slug, cover_public_id")
  .eq("is_published", true)
  .order("title");

if (error) {
  console.error(error);
  process.exit(1);
}

let i = 0;
for (const book of books) {
  const current = book.cover_public_id || "";
  const localJpg = resolve(OUT, `${book.slug}.jpg`);
  const hasLocalJpg = existsSync(localJpg);

  try {
    let path;
    if (hasLocalJpg) {
      path = `/covers/${book.slug}.jpg`;
      console.log(`HAVE  ${book.slug}`);
    } else if (current.startsWith("http")) {
      path = await downloadToJpg(current, book.slug);
      console.log(`DL    ${book.slug}`);
    } else {
      path = await generateJacket(book, i);
      console.log(`MAKE  ${book.slug}`);
    }

    if (current !== path) {
      const { error: upErr } = await supabase
        .from("books")
        .update({ cover_public_id: path })
        .eq("id", book.id);
      if (upErr) throw upErr;
      console.log(`  → DB ${path}`);
    }
  } catch (e) {
    const path = await generateJacket(book, i);
    await supabase
      .from("books")
      .update({ cover_public_id: path })
      .eq("id", book.id);
    console.log(`FALL  ${book.slug}: ${e.message} → ${path}`);
  }
  i += 1;
}

console.log("Done — all published books have /covers/*.jpg");
