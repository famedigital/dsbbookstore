import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { AvailabilityStatus, Book } from "@/types/erp";

export const metadata = { title: "Stationery" };

const AVAILABILITY: AvailabilityStatus[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "coming_soon",
  "enquire_only",
];
const SORTS = {
  newest: { column: "created_at", ascending: false },
  title: { column: "title", ascending: true },
  price: { column: "price_btn", ascending: true },
} as const;

const selectClass =
  "h-10 shrink-0 border-0 border-r border-[color:var(--sf-line)] bg-transparent px-2.5 text-xs text-[color:var(--sf-ink)] outline-none focus:bg-[color:var(--sf-bg)] md:px-3 md:text-sm";

export default async function StationeryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    availability?: string;
    sort?: string;
  }>;
}) {
  const { q, availability, sort } = await searchParams;
  const sortKey = sort && sort in SORTS ? (sort as keyof typeof SORTS) : "title";
  const theme = await getStorefrontTheme();
  let items: Book[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { column, ascending } = SORTS[sortKey];
    let query = supabase
      .from("books")
      .select("*")
      .eq("is_published", true)
      .eq("product_kind", "stationery")
      .order(column, { ascending });

    if (q?.trim()) {
      query = query.or(
        `title.ilike.%${q.trim()}%,barcode.ilike.%${q.trim()}%,sku_code.ilike.%${q.trim()}%`
      );
    }

    if (
      availability?.trim() &&
      AVAILABILITY.includes(availability as AvailabilityStatus)
    ) {
      query = query.eq("availability_status", availability.trim());
    }

    const { data } = await query;
    items = (data as Book[]) ?? [];
  }

  const hasFilters = Boolean(q?.trim() || availability?.trim());

  return (
    <StorefrontShell active="/stationery" theme={theme}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <p className="sf-eyebrow">Shop</p>
        <h1 className="sf-title mt-2 text-2xl md:mt-3 md:text-4xl">
          Stationery
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[color:var(--sf-muted)] md:mt-3">
          Pens, paper, and desk supplies from the Chang Lam shop. Browse{" "}
          <Link
            href="/books"
            className="text-[color:var(--sf-accent)] hover:underline"
          >
            Books
          </Link>{" "}
          separately.
        </p>

        <form className="mt-5 md:mt-8">
          <div className="flex overflow-x-auto rounded-[var(--sf-btn-radius)] border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] shadow-[var(--sf-card-shadow)]">
            <select
              name="availability"
              defaultValue={availability ?? ""}
              aria-label="Availability"
              className={`${selectClass} min-w-[8rem] rounded-l-[var(--sf-btn-radius)]`}
            >
              <option value="">Any status</option>
              {AVAILABILITY.map((a) => (
                <option key={a} value={a}>
                  {availabilityLabel(a)}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sortKey}
              aria-label="Sort"
              className={`${selectClass} min-w-[7rem]`}
            >
              <option value="newest">Newest</option>
              <option value="title">Name</option>
              <option value="price">Price</option>
            </select>

            <input
              name="q"
              defaultValue={q}
              placeholder="Name or barcode"
              aria-label="Search stationery"
              className="h-10 min-w-[10rem] flex-1 border-0 bg-transparent px-3 text-sm text-[color:var(--sf-ink)] outline-none placeholder:text-[color:var(--sf-muted)]"
            />

            <button
              type="submit"
              className="sf-btn shrink-0 !rounded-none !rounded-r-[var(--sf-btn-radius)] !px-4"
            >
              Search
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[color:var(--sf-muted)]">
            <p>
              {isSupabaseConfigured()
                ? `${items.length} result${items.length === 1 ? "" : "s"}`
                : "Catalogue unavailable"}
            </p>
            {hasFilters ? (
              <Link
                href="/stationery"
                className="font-medium text-[color:var(--sf-accent)] hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>

        {!isSupabaseConfigured() ? (
          <p className="mt-8 text-sm text-[color:var(--sf-muted)]">
            Supabase is not connected — catalogue unavailable.
          </p>
        ) : items.length === 0 ? (
          <p className="mt-8 text-sm text-[color:var(--sf-muted)]">
            No stationery listed yet.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-8 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="group">
                <Link href={`/books/${item.slug}`} className="block">
                  <div className="sf-card sf-card-hover overflow-hidden p-1.5 md:p-2">
                    <BookCover
                      publicId={item.cover_public_id}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="aspect-square w-full rounded-[calc(var(--sf-radius)-0.35rem)] object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-2 text-[0.6rem] font-semibold tracking-[0.18em] text-[color:var(--sf-accent)] uppercase md:mt-3 md:text-[0.65rem]">
                    {availabilityLabel(item.availability_status)}
                  </p>
                  <h2 className="mt-1 font-display text-sm leading-snug group-hover:text-[color:var(--sf-accent)] md:text-lg">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold tracking-wide text-[color:var(--sf-ink)]">
                    {formatBtn(item.price_btn)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StorefrontShell>
  );
}
