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
};

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

  const { data: exact } = await supabase
    .from("books")
    .select(
      "id, title, slug, brand, price_btn, cover_public_id, isbn_13, barcode, availability_status, product_kind"
    )
    .eq("is_published", true)
    .or(`barcode.eq."${safe}",isbn_13.eq."${safe}"`)
    .limit(4);

  const { data: fuzzy } = await supabase
    .from("books")
    .select(
      "id, title, slug, brand, price_btn, cover_public_id, isbn_13, barcode, availability_status, product_kind"
    )
    .eq("is_published", true)
    .or(
      `title.ilike."${like}",brand.ilike."${like}",subtitle.ilike."${like}",barcode.ilike."${like}",isbn_13.ilike."${like}"`
    )
    .order("title")
    .limit(12);

  const seen = new Set<string>();
  const hits: StorefrontSearchHit[] = [];
  for (const row of [...(exact ?? []), ...(fuzzy ?? [])]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    hits.push(row as StorefrontSearchHit);
    if (hits.length >= 8) break;
  }

  return NextResponse.json(
    { hits },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    }
  );
}
