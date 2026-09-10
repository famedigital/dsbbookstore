"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/erp/auth";
import type { CounterCatalogItem } from "@/lib/erp/counter-local-catalog";

const PAGE = 1000;

export type CounterCatalogPull = {
  items: CounterCatalogItem[];
  count: number;
  maxUpdatedAt: string | null;
  pulledAt: number;
};

/**
 * Slim full-catalogue pull for Counter IndexedDB seed.
 * Paged server-side so free-tier payloads stay manageable.
 */
export async function pullCounterCatalog(): Promise<CounterCatalogPull> {
  await requireStaff();
  const supabase = await createClient();

  const items: CounterCatalogItem[] = [];
  let maxUpdatedAt: string | null = null;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("books")
      .select(
        "id, title, brand, barcode, isbn_13, cost_price_btn, price_btn, stock_qty, product_kind, updated_at"
      )
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) throw new Error(error.message);
    const rows = data ?? [];
    for (const row of rows) {
      items.push({
        id: row.id as string,
        title: row.title as string,
        brand: (row.brand as string | null) ?? null,
        barcode: (row.barcode as string | null) ?? null,
        isbn_13: (row.isbn_13 as string | null) ?? null,
        cost_price_btn: Number(row.cost_price_btn) || 0,
        price_btn: Number(row.price_btn) || 0,
        stock_qty: Number(row.stock_qty) || 0,
        product_kind: (row.product_kind as string) || "book",
      });
      const u = row.updated_at as string | null;
      if (u && (!maxUpdatedAt || u > maxUpdatedAt)) maxUpdatedAt = u;
    }
    if (rows.length < PAGE) break;
    from += PAGE;
  }

  return {
    items,
    count: items.length,
    maxUpdatedAt,
    pulledAt: Date.now(),
  };
}

/** Cheap freshness probe — compare to local maxUpdatedAt. */
export async function getCounterCatalogStamp(): Promise<{
  count: number;
  maxUpdatedAt: string | null;
}> {
  await requireStaff();
  const supabase = await createClient();
  const [{ count }, { data: newest }] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase
      .from("books")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    count: count ?? 0,
    maxUpdatedAt: (newest?.updated_at as string | null) ?? null,
  };
}
