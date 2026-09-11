import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type StorefrontSearchHit = {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  price_btn: number;
  cover_public_id: string | null;
  isbn_13: string | null;
  barcode: string | null;
  availability_status: string;
  product_kind: string | null;
  stock_qty: number | null;
  author_names: string[];
};

const SELECT =
  "id, title, slug, brand, price_btn, cover_public_id, isbn_13, barcode, availability_status, product_kind, stock_qty";

/** Public typeahead — tiny payloads, free-tier friendly. */
export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ hits: [] });
  }

  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") || "").trim();
  if (raw.length < 2) {
    return NextResponse.json({ hits: [] });
  }

  const safe = raw.replace(/[%_,.()"'\\]/g, " ").trim();
  if (!safe) return NextResponse.json({ hits: [] });

  const like = `%${safe}%`;
  const supabase = await createClient();

  const [{ data: exact }, { data: fuzzy }, { data: authorHits }] =
    await Promise.all([
      supabase
        .from("books")
        .select(SELECT)
        .eq("is_published", true)
        .or(`barcode.eq."${safe}",isbn_13.eq."${safe}"`)
        .limit(4),
      supabase
        .from("books")
        .select(SELECT)
        .eq("is_published", true)
        .or(
          `title.ilike."${like}",brand.ilike."${like}",subtitle.ilike."${like}",barcode.ilike."${like}",isbn_13.ilike."${like}"`
        )
        .order("title")
        .limit(12),
      supabase
        .from("authors")
        .select("id, name")
        .ilike("name", like)
        .limit(4),
    ]);

  const authorBookIds: string[] = [];
  if (authorHits?.length) {
    const { data: links } = await supabase
      .from("book_authors")
      .select("book_id")
      .in(
        "author_id",
        authorHits.map((a) => a.id)
      )
      .limit(16);
    for (const row of links ?? []) {
      if (row.book_id) authorBookIds.push(row.book_id as string);
    }
  }

  let authorBooks: typeof exact = [];
  if (authorBookIds.length) {
    const { data } = await supabase
      .from("books")
      .select(SELECT)
      .eq("is_published", true)
      .in("id", [...new Set(authorBookIds)].slice(0, 8));
    authorBooks = data ?? [];
  }

  const seen = new Set<string>();
  const rawHits: Array<Record<string, unknown>> = [];
  for (const row of [
    ...(exact ?? []),
    ...(authorBooks ?? []),
    ...(fuzzy ?? []),
  ]) {
    if (seen.has(row.id as string)) continue;
    seen.add(row.id as string);
    rawHits.push(row as Record<string, unknown>);
    if (rawHits.length >= 8) break;
  }

  const ids = rawHits.map((h) => h.id as string);
  const authorByBook = new Map<string, string[]>();
  if (ids.length) {
    const { data: ba } = await supabase
      .from("book_authors")
      .select("book_id, authors(name)")
      .in("book_id", ids)
      .limit(40);
    for (const row of ba ?? []) {
      const a = row.authors as unknown as
        | { name: string }
        | { name: string }[]
        | null;
      const name = !a
        ? null
        : Array.isArray(a)
          ? a[0]?.name
          : a.name;
      if (!name) continue;
      const list = authorByBook.get(row.book_id as string) ?? [];
      list.push(name);
      authorByBook.set(row.book_id as string, list);
    }
  }

  const hits: StorefrontSearchHit[] = rawHits.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    brand: (row.brand as string | null) ?? null,
    price_btn: Number(row.price_btn) || 0,
    cover_public_id: (row.cover_public_id as string | null) ?? null,
    isbn_13: (row.isbn_13 as string | null) ?? null,
    barcode: (row.barcode as string | null) ?? null,
    availability_status: String(row.availability_status || ""),
    product_kind: (row.product_kind as string | null) ?? null,
    stock_qty:
      typeof row.stock_qty === "number" ? (row.stock_qty as number) : null,
    author_names: authorByBook.get(row.id as string) ?? [],
  }));

  return NextResponse.json(
    { hits },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    }
  );
}
