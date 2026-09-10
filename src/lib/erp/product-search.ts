"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/erp/auth";

export type ProductSearchHit = {
  id: string;
  title: string;
  brand: string | null;
  barcode: string | null;
  isbn_13: string | null;
  cost_price_btn: number;
  price_btn: number;
  stock_qty: number;
  opening_qty: number;
  product_kind: string;
};

/** Typeahead for catalogue (~6k SKUs) — title, brand, barcode, ISBN. */
export async function searchProducts(query: string): Promise<ProductSearchHit[]> {
  await requireStaff();
  const q = query.trim();
  if (q.length < 1) return [];

  const supabase = await createClient();
  const safe = q.replace(/[%_,.()]/g, " ").trim();
  if (!safe) return [];
  const like = `%${safe}%`;

  const { data: exact } = await supabase
    .from("books")
    .select(
      "id, title, brand, barcode, isbn_13, cost_price_btn, price_btn, stock_qty, opening_qty, product_kind"
    )
    .or(`barcode.eq."${safe}",isbn_13.eq."${safe}"`)
    .limit(5);

  const { data: fuzzy } = await supabase
    .from("books")
    .select(
      "id, title, brand, barcode, isbn_13, cost_price_btn, price_btn, stock_qty, opening_qty, product_kind"
    )
    .or(
      `title.ilike."${like}",brand.ilike."${like}",barcode.ilike."${like}",isbn_13.ilike."${like}"`
    )
    .order("title")
    .limit(25);

  const seen = new Set<string>();
  const out: ProductSearchHit[] = [];
  for (const row of [...(exact ?? []), ...(fuzzy ?? [])]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row as ProductSearchHit);
    if (out.length >= 25) break;
  }
  return out;
}
