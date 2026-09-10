import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { fetchCataloguePage } from "@/lib/storefront/catalogue-query";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ books: [], total: 0, page: 1, pageSize: 48 });
  }

  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug");

  const result = await fetchCataloguePage(
    supabase,
    {
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      availability: searchParams.get("availability") || undefined,
      sort: searchParams.get("sort") || undefined,
      page: Math.max(1, Number(searchParams.get("page")) || 1),
    },
    (cats ?? []) as { id: string; slug: string }[]
  );

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
