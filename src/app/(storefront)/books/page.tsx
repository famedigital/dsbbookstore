import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { AvailabilityStatus, Book } from "@/types/erp";

export const metadata = { title: "Books" };

const FORMATS = ["paperback", "hardcover", "ebook", "audiobook"] as const;
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

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    format?: string;
    availability?: string;
    sort?: string;
  }>;
}) {
  const { q, format, availability, sort } = await searchParams;
  const sortKey = sort && sort in SORTS ? (sort as keyof typeof SORTS) : "title";
  const theme = await getStorefrontTheme();
  let books: Book[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { column, ascending } = SORTS[sortKey];
    let query = supabase
      .from("books")
      .select("*")
      .eq("is_published", true)
      .eq("product_kind", "book")
      .order(column, { ascending });

    if (q?.trim()) {
      query = query.or(
        `title.ilike.%${q.trim()}%,isbn_13.ilike.%${q.trim()}%,subtitle.ilike.%${q.trim()}%`
      );
    }

    if (format?.trim()) {
      query = query.eq("format", format.trim());
    }

    if (
      availability?.trim() &&
      AVAILABILITY.includes(availability as AvailabilityStatus)
    ) {
      query = query.eq("availability_status", availability.trim());
    }

    const { data, error } = await query;
    if (error) {
      // Column missing: show published titles until product_kind migration is applied.
      let fallback = supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order(column, { ascending });
      if (q?.trim()) {
        fallback = fallback.or(
          `title.ilike.%${q.trim()}%,isbn_13.ilike.%${q.trim()}%,subtitle.ilike.%${q.trim()}%`
        );
      }
      const { data: rows } = await fallback;
      books = (rows as Book[]) ?? [];
    } else {
      books = (data as Book[]) ?? [];
    }
  }

  const hasFilters = Boolean(q?.trim() || format?.trim() || availability?.trim());

  return (
    <StorefrontShell active="/books" theme={theme}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <p className="sf-eyebrow">Books</p>
        <h1 className="sf-title mt-2 text-2xl md:mt-3 md:text-4xl">Books</h1>
        <p className="mt-2 max-w-xl text-sm text-[color:var(--sf-muted)] md:mt-3">
          Search DSB Publication titles and check live shelf availability in
          Thimphu. For pens and paper see{" "}
          <Link href="/stationery" className="text-[color:var(--sf-accent)] hover:underline">
            Stationery
          </Link>
          .
        </p>

        <form className="mt-5 md:mt-8">
          <div className="flex overflow-x-auto rounded-[var(--sf-btn-radius)] border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] shadow-[var(--sf-card-shadow)]">
            <select
              name="format"
              defaultValue={format ?? ""}
              aria-label="Format"
              className={`${selectClass} min-w-[7.5rem] rounded-l-[var(--sf-btn-radius)]`}
            >
              <option value="">All formats</option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>

            <select
              name="availability"
              defaultValue={availability ?? ""}
              aria-label="Availability"
              className={`${selectClass} min-w-[8rem]`}
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
              <option value="title">Title</option>
              <option value="price">Price</option>
            </select>

            <input
              name="q"
              defaultValue={q}
              placeholder="Title, ISBN, or keyword"
              aria-label="Search catalogue"
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
                ? `${books.length} result${books.length === 1 ? "" : "s"}`
                : "Catalogue unavailable"}
              {q?.trim() ? (
                <span>
                  {" "}
                  for &ldquo;{q.trim()}&rdquo;
                </span>
              ) : null}
            </p>
            {hasFilters ? (
              <Link
                href="/books"
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
        ) : books.length === 0 ? (
          <p className="mt-8 text-sm text-[color:var(--sf-muted)]">No books found.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-8 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
            {books.map((book) => (
              <li key={book.id} className="group">
                <Link href={`/books/${book.slug}`} className="block">
                  <div className="sf-card sf-card-hover overflow-hidden p-1.5 md:p-2">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full rounded-[calc(var(--sf-radius)-0.35rem)] object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-2 text-[0.6rem] font-semibold tracking-[0.18em] text-[color:var(--sf-accent)] uppercase md:mt-3 md:text-[0.65rem]">
                    {availabilityLabel(book.availability_status)}
                  </p>
                  <h2 className="mt-1 font-display text-sm leading-snug group-hover:text-[color:var(--sf-accent)] md:text-lg">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold tracking-wide text-[color:var(--sf-ink)]">
                    {formatBtn(book.price_btn)}
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
