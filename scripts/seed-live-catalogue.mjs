/**
 * Seed live DSB catalogue + generated cover images into Supabase Storage.
 * Usage: node --env-file=.env.local scripts/seed-live-catalogue.mjs
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ownerEmail = process.env.SEED_OWNER_EMAIL || "dsb.owner@gmail.com";
const ownerPassword = process.env.SEED_OWNER_PASSWORD || "DsbOwner2026!";

if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, anon);

const AUTHORS = [
  {
    name: "Chador Wangmo",
    slug: "chador-wangmo",
    bio: "Bhutanese author of children's stories and folklore published with DSB Publication.",
  },
  {
    name: "D. B. Gurung",
    slug: "d-b-gurung",
    bio: "Writer associated with DSB Publication titles on culture and society.",
  },
  {
    name: "Sonam Kinga",
    slug: "sonam-kinga",
    bio: "Scholar and author writing on Bhutanese governance, culture, and history.",
  },
  {
    name: "Tandin Wangchuk",
    slug: "tandin-wangchuk",
    bio: "Author of travel and pilgrimage writing connected to Bhutanese sacred landscapes.",
  },
  {
    name: "Dawn A. Murray",
    slug: "dawn-a-murray",
    bio: "Researcher documenting Himalayan medicinal plant knowledge among the Monpa.",
  },
  {
    name: "Singye Namgyel",
    slug: "singye-namgyel",
    bio: "Bhutanese author published under DSB Publication.",
  },
];

const CATEGORIES = [
  { name: "Bhutanese Fiction", slug: "bhutanese-fiction", sort_order: 1 },
  { name: "Folklore", slug: "folklore", sort_order: 2 },
  { name: "Buddhism", slug: "buddhism", sort_order: 3 },
  { name: "History", slug: "history", sort_order: 4 },
  { name: "Children", slug: "children", sort_order: 5 },
  { name: "Nature & Environment", slug: "nature-environment", sort_order: 6 },
  { name: "Travel", slug: "travel", sort_order: 7 },
];

const COLLECTIONS = [
  {
    title: "New from DSB",
    slug: "new-from-dsb",
    description: "Recent titles from DSB Publication.",
    is_featured: true,
    sort_order: 1,
  },
  {
    title: "Stories for Young Readers",
    slug: "young-readers",
    description: "Children's books and folk tales.",
    is_featured: true,
    sort_order: 2,
  },
  {
    title: "Himalayan Knowledge",
    slug: "himalayan-knowledge",
    description: "Nature, medicine, and cultural knowledge from the Himalayas.",
    is_featured: false,
    sort_order: 3,
  },
];

/** @type {Array<Record<string, unknown>>} */
const BOOKS = [
  {
    title: "Monpa Medicinal Plants",
    subtitle: "Indigenous Knowledge From A Himalayan Healer",
    slug: "monpa-medicinal-plants",
    description:
      "A study of Monpa medicinal plants and the intimate relationships between healers, land, and cultural practice in the Himalayas. Published by DSB Publication.",
    isbn_13: "9789993612872",
    language: "English",
    format: "hardcover",
    page_count: 44,
    publisher_name: "DSB Publication",
    price_btn: 2800,
    cost_price_btn: 1600,
    stock_qty: 12,
    is_featured: true,
    authors: ["dawn-a-murray"],
    categories: ["nature-environment", "history"],
    collections: ["new-from-dsb", "himalayan-knowledge"],
    color: ["#0b3d91", "#0f6b4c"],
  },
  {
    title: "Bhutanese Folktales for Children",
    subtitle: "Stories from the Land of the Thunder Dragon",
    slug: "bhutanese-folktales-for-children",
    description:
      "A curated collection of Bhutanese children's stories drawing on oral tradition, tricksters, and mountain spirits — for young readers and families.",
    isbn_13: null,
    language: "English",
    format: "paperback",
    page_count: 96,
    publisher_name: "DSB Publication",
    price_btn: 650,
    cost_price_btn: 350,
    stock_qty: 25,
    is_featured: true,
    authors: ["chador-wangmo"],
    categories: ["children", "folklore"],
    collections: ["young-readers", "new-from-dsb"],
    color: ["#c9a227", "#0b3d91"],
  },
  {
    title: "Tales from the Dragon Kingdom",
    subtitle: "Folklore of Bhutan",
    slug: "tales-from-the-dragon-kingdom",
    description:
      "Classic Bhutanese folklore retold for contemporary readers — monkeys, monsters, and mountain legends that shaped village storytelling.",
    language: "English",
    format: "paperback",
    page_count: 128,
    publisher_name: "DSB Publication",
    price_btn: 750,
    cost_price_btn: 400,
    stock_qty: 18,
    is_featured: true,
    authors: ["chador-wangmo", "singye-namgyel"],
    categories: ["folklore", "bhutanese-fiction"],
    collections: ["young-readers"],
    color: ["#0f6b4c", "#c9a227"],
  },
  {
    title: "Whispers of the Himalayas",
    subtitle: "Short Fiction from Bhutan",
    slug: "whispers-of-the-himalayas",
    description:
      "Contemporary Bhutanese short fiction exploring identity, migration, and the quiet tensions between tradition and modern Thimphu life.",
    language: "English",
    format: "paperback",
    page_count: 176,
    publisher_name: "DSB Publication",
    price_btn: 890,
    cost_price_btn: 480,
    stock_qty: 14,
    is_featured: true,
    authors: ["d-b-gurung"],
    categories: ["bhutanese-fiction"],
    collections: ["new-from-dsb"],
    color: ["#0b3d91", "#1a1a2e"],
  },
  {
    title: "Pathways to Singye Dzong",
    subtitle: "A Pilgrim's Companion",
    slug: "pathways-to-singye-dzong",
    description:
      "A guide to the sacred pilgrimage routes toward Singye Dzong, blending landscape description, ritual context, and traveler notes.",
    language: "English",
    format: "paperback",
    page_count: 112,
    publisher_name: "DSB Publication",
    price_btn: 950,
    cost_price_btn: 520,
    stock_qty: 9,
    is_featured: false,
    authors: ["tandin-wangchuk"],
    categories: ["buddhism", "travel"],
    collections: ["himalayan-knowledge"],
    color: ["#2d5016", "#0b3d91"],
  },
  {
    title: "Democratic Transitions in Bhutan",
    subtitle: "Essays on Governance and Culture",
    slug: "democratic-transitions-in-bhutan",
    description:
      "Essays examining Bhutan's political transformation, cultural continuity, and the institutions that shape modern civic life.",
    language: "English",
    format: "paperback",
    page_count: 220,
    publisher_name: "DSB Publication",
    price_btn: 1200,
    cost_price_btn: 700,
    stock_qty: 7,
    is_featured: false,
    authors: ["sonam-kinga"],
    categories: ["history"],
    collections: ["new-from-dsb"],
    color: ["#1e3a5f", "#c9a227"],
  },
  {
    title: "Orchids of the Eastern Himalaya",
    subtitle: "A Field Companion",
    slug: "orchids-of-the-eastern-himalaya",
    description:
      "An illustrated field companion to orchids found across Bhutan's eastern Himalayan forests — for naturalists and curious travelers.",
    language: "English",
    format: "paperback",
    page_count: 160,
    publisher_name: "DSB Publication",
    price_btn: 1100,
    cost_price_btn: 600,
    stock_qty: 11,
    is_featured: true,
    authors: ["dawn-a-murray", "d-b-gurung"],
    categories: ["nature-environment"],
    collections: ["himalayan-knowledge"],
    color: ["#6b2d5c", "#0f6b4c"],
  },
  {
    title: "The Clever Monkey and Other Tales",
    subtitle: "Bhutanese Stories for Children",
    slug: "the-clever-monkey-and-other-tales",
    description:
      "Playful animal tales and moral stories for children, rooted in Bhutanese oral storytelling traditions.",
    language: "English",
    format: "paperback",
    page_count: 72,
    publisher_name: "DSB Publication",
    price_btn: 480,
    cost_price_btn: 250,
    stock_qty: 30,
    is_featured: true,
    authors: ["chador-wangmo"],
    categories: ["children", "folklore"],
    collections: ["young-readers"],
    color: ["#e07a3d", "#0b3d91"],
  },
  {
    title: "Thimphu Notebook",
    subtitle: "Essays from the Capital",
    slug: "thimphu-notebook",
    description:
      "Literary sketches of Chang Lam, weekend markets, monsoon light, and the everyday poetry of Bhutan's capital city.",
    language: "English",
    format: "paperback",
    page_count: 140,
    publisher_name: "DSB Publication",
    price_btn: 820,
    cost_price_btn: 430,
    stock_qty: 16,
    is_featured: false,
    authors: ["d-b-gurung", "sonam-kinga"],
    categories: ["bhutanese-fiction", "travel"],
    collections: ["new-from-dsb"],
    color: ["#0b3d91", "#4a6741"],
  },
  {
    title: "Lamp of the Mountain",
    subtitle: "Buddhist Reflections from Bhutan",
    slug: "lamp-of-the-mountain",
    description:
      "Accessible reflections on Buddhist practice, compassion, and the rhythms of monastic and lay life in Bhutan.",
    language: "English",
    format: "paperback",
    page_count: 154,
    publisher_name: "DSB Publication",
    price_btn: 980,
    cost_price_btn: 540,
    stock_qty: 13,
    is_featured: true,
    authors: ["tandin-wangchuk", "singye-namgyel"],
    categories: ["buddhism"],
    collections: ["himalayan-knowledge"],
    color: ["#8b6914", "#1a1a2e"],
  },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title, maxLen = 18) {
  const words = title.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxLen && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

async function makeCoverPng(title, colors) {
  const [c1, c2] = colors;
  const lines = wrapTitle(title);
  const textSvg = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${42 + i * 7}%" text-anchor="middle" fill="#f7f4ec" font-family="Georgia, serif" font-size="42" font-weight="600">${escapeXml(line)}</text>`
    )
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="1200" viewBox="0 0 800 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1200" fill="url(#g)"/>
  <rect x="48" y="48" width="704" height="1104" fill="none" stroke="#e6c76a" stroke-opacity="0.55" stroke-width="2"/>
  <text x="50%" y="18%" text-anchor="middle" fill="#e6c76a" font-family="Georgia, serif" font-size="22" letter-spacing="8">DSB PUBLICATION</text>
  ${textSvg}
  <text x="50%" y="88%" text-anchor="middle" fill="#f7f4ec" fill-opacity="0.85" font-family="Georgia, serif" font-size="24">Thimphu · Bhutan</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function upsertBySlug(table, row, slugField = "slug") {
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq(slugField, row[slugField])
    .maybeSingle();
  if (existing?.id) {
    const { data, error } = await supabase
      .from(table)
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  console.log("Signing in as owner…");
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: ownerEmail,
    password: ownerPassword,
  });
  if (authErr) throw authErr;
  console.log("Signed in:", auth.user.email);

  const authorIds = {};
  for (const a of AUTHORS) {
    authorIds[a.slug] = await upsertBySlug("authors", a);
    console.log("author", a.slug);
  }

  const categoryIds = {};
  for (const c of CATEGORIES) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", c.slug)
      .maybeSingle();
    if (existing?.id) {
      categoryIds[c.slug] = existing.id;
      await supabase.from("categories").update(c).eq("id", existing.id);
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert(c)
        .select("id")
        .single();
      if (error) throw error;
      categoryIds[c.slug] = data.id;
    }
    console.log("category", c.slug);
  }

  const collectionIds = {};
  for (const c of COLLECTIONS) {
    const { data: existing } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", c.slug)
      .maybeSingle();
    if (existing?.id) {
      collectionIds[c.slug] = existing.id;
      await supabase.from("collections").update(c).eq("id", existing.id);
    } else {
      const { data, error } = await supabase
        .from("collections")
        .insert(c)
        .select("id")
        .single();
      if (error) throw error;
      collectionIds[c.slug] = data.id;
    }
    console.log("collection", c.slug);
  }

  for (const book of BOOKS) {
    const png = await makeCoverPng(book.title, book.color);
    const path = `covers/${book.slug}-${randomUUID().slice(0, 8)}.png`;

    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, png, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    const supabaseUrl = pub.publicUrl;

    const { data: media, error: mediaErr } = await supabase
      .from("media_assets")
      .insert({
        kind: "cover",
        title: `${book.title} cover`,
        prompt: `DSB Publication cover for ${book.title}`,
        storage_provider: "supabase",
        supabase_path: path,
        supabase_url: supabaseUrl,
        width: 800,
        height: 1200,
        bytes: png.length,
        mime_type: "image/png",
        created_by: auth.user.id,
      })
      .select("id")
      .single();
    if (mediaErr) throw mediaErr;

    const bookRow = {
      title: book.title,
      subtitle: book.subtitle,
      slug: book.slug,
      description: book.description,
      isbn_13: book.isbn_13 ?? null,
      language: book.language,
      format: book.format,
      page_count: book.page_count,
      publisher_name: book.publisher_name,
      price_btn: book.price_btn,
      cost_price_btn: book.cost_price_btn,
      stock_qty: book.stock_qty,
      is_featured: book.is_featured,
      is_published: true,
      cover_media_id: media.id,
      availability_status:
        book.stock_qty <= 0
          ? "out_of_stock"
          : book.stock_qty <= 3
            ? "low_stock"
            : "in_stock",
    };

    const { data: existingBook } = await supabase
      .from("books")
      .select("id")
      .eq("slug", book.slug)
      .maybeSingle();

    let bookId;
    if (existingBook?.id) {
      // Preserve stock ledger: update metadata but set stock via movement if needed
      const { data, error } = await supabase
        .from("books")
        .update({
          ...bookRow,
          stock_qty: undefined, // don't fight trigger; set below carefully
        })
        .eq("id", existingBook.id)
        .select("id, stock_qty")
        .single();
      if (error) {
        // retry without stripping stock
        const { data: d2, error: e2 } = await supabase
          .from("books")
          .update({
            title: bookRow.title,
            subtitle: bookRow.subtitle,
            description: bookRow.description,
            isbn_13: bookRow.isbn_13,
            language: bookRow.language,
            format: bookRow.format,
            page_count: bookRow.page_count,
            publisher_name: bookRow.publisher_name,
            price_btn: bookRow.price_btn,
            cost_price_btn: bookRow.cost_price_btn,
            is_featured: bookRow.is_featured,
            is_published: true,
            cover_media_id: media.id,
          })
          .eq("id", existingBook.id)
          .select("id, stock_qty")
          .single();
        if (e2) throw e2;
        bookId = d2.id;
        const delta = book.stock_qty - d2.stock_qty;
        if (delta !== 0) {
          await supabase.from("stock_movements").insert({
            book_id: bookId,
            movement_type: "adjustment",
            qty_delta: delta,
            reason: "Seed catalogue restock",
            created_by: auth.user.id,
          });
        }
      } else {
        bookId = data.id;
        const delta = book.stock_qty - data.stock_qty;
        if (delta !== 0) {
          await supabase.from("stock_movements").insert({
            book_id: bookId,
            movement_type: "adjustment",
            qty_delta: delta,
            reason: "Seed catalogue restock",
            created_by: auth.user.id,
          });
        }
      }
    } else {
      const { data, error } = await supabase
        .from("books")
        .insert({ ...bookRow, stock_qty: 0 })
        .select("id")
        .single();
      if (error) throw error;
      bookId = data.id;
      if (book.stock_qty > 0) {
        const { error: stockErr } = await supabase.from("stock_movements").insert({
          book_id: bookId,
          movement_type: "purchase_in",
          qty_delta: book.stock_qty,
          reason: "Initial seed stock",
          created_by: auth.user.id,
        });
        if (stockErr) throw stockErr;
      }
    }

    await supabase.from("book_authors").delete().eq("book_id", bookId);
    await supabase.from("book_categories").delete().eq("book_id", bookId);
    await supabase.from("collection_books").delete().eq("book_id", bookId);

    await supabase.from("book_authors").insert(
      book.authors.map((slug, i) => ({
        book_id: bookId,
        author_id: authorIds[slug],
        sort_order: i,
      }))
    );
    await supabase.from("book_categories").insert(
      book.categories.map((slug) => ({
        book_id: bookId,
        category_id: categoryIds[slug],
      }))
    );
    await supabase.from("collection_books").insert(
      book.collections.map((slug, i) => ({
        book_id: bookId,
        collection_id: collectionIds[slug],
        sort_order: i,
      }))
    );

    console.log("book", book.slug, "→", supabaseUrl);
  }

  const { count } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);
  console.log("Done. Published books:", count);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
