import type { AvailabilityStatus, Book } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export const CATALOGUE_PAGE_SIZE = 48;

export const CATALOGUE_AVAILABILITY: AvailabilityStatus[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "coming_soon",
  "enquire_only",
];

/** Proven ecommerce sorts — default "browse" walks the full catalogue (not the same recent titles). */
export const CATALOGUE_SORTS = {
  browse: { column: "slug", ascending: true },
  title: { column: "title", ascending: true },
  price_asc: { column: "price_btn", ascending: true },
  price_desc: { column: "price_btn", ascending: false },
  newest: { column: "created_at", ascending: false },
  featured: { column: "updated_at", ascending: false },
} as const;

export type CatalogueSortKey = keyof typeof CATALOGUE_SORTS;

export type CatalogueFilters = {
  q?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: number;
};

export type CatalogueBook = Pick<
  Book,
  | "id"
  | "title"
  | "slug"
  | "subtitle"
  | "brand"
  | "barcode"
  | "isbn_13"
  | "price_btn"
  | "stock_qty"
  | "availability_status"
  | "cover_public_id"
  | "format"
  | "description"
  | "seo_description"
  | "language"
>;

const SELECT_COLS =
  "id, title, slug, subtitle, brand, barcode, isbn_13, price_btn, stock_qty, availability_status, cover_public_id, format, description, seo_description, language";

export function resolveCatalogueSort(sort?: string): CatalogueSortKey {
  if (sort && sort in CATALOGUE_SORTS) return sort as CatalogueSortKey;
  return "browse";
}

export async function fetchCataloguePage(
  supabase: SupabaseClient,
  filters: CatalogueFilters,
  categories: { id: string; slug: string }[]
): Promise<{ books: CatalogueBook[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, filters.page || 1);
  const sortKey = resolveCatalogueSort(filters.sort);
  const { column, ascending } = CATALOGUE_SORTS[sortKey];
  const from = (page - 1) * CATALOGUE_PAGE_SIZE;
  const to = from + CATALOGUE_PAGE_SIZE - 1;
  const term = filters.q?.trim()?.replace(/%/g, "");
  const catRow = filters.category?.trim()
    ? categories.find((c) => c.slug === filters.category!.trim())
    : null;

  let query = catRow
    ? supabase
        .from("books")
        .select(`${SELECT_COLS}, book_categories!inner(category_id)`, {
          count: "exact",
        })
        .eq("book_categories.category_id", catRow.id)
    : supabase.from("books").select(SELECT_COLS, { count: "exact" });

  query = query
    .eq("is_published", true)
    .eq("product_kind", "book")
    .order(column, { ascending })
    .order("id", { ascending: true })
    .range(from, to);

  if (term) {
    query = query.or(
      `title.ilike.%${term}%,brand.ilike.%${term}%,isbn_13.ilike.%${term}%,barcode.ilike.%${term}%,subtitle.ilike.%${term}%`
    );
  }

  if (
    filters.availability?.trim() &&
    CATALOGUE_AVAILABILITY.includes(filters.availability as AvailabilityStatus)
  ) {
    query = query.eq("availability_status", filters.availability.trim());
  }

  const { data, count, error } = await query;
  if (error) {
    const { data: rows, count: c2 } = await supabase
      .from("books")
      .select(SELECT_COLS, { count: "exact" })
      .eq("is_published", true)
      .order(column, { ascending })
      .range(from, to);
    return {
      books: (rows as CatalogueBook[]) ?? [],
      total: c2 ?? 0,
      page,
      pageSize: CATALOGUE_PAGE_SIZE,
    };
  }

  return {
    books: (data as CatalogueBook[]) ?? [],
    total: count ?? 0,
    page,
    pageSize: CATALOGUE_PAGE_SIZE,
  };
}
