import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { AvailabilityStatus, Book } from "@/types/erp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Catalogue" };

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
  let books: Book[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { column, ascending } = SORTS[sortKey];
    let query = supabase
      .from("books")
      .select("*")
      .eq("is_published", true)
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

    const { data } = await query;
    books = (data as Book[]) ?? [];
  }

  return (
    <StorefrontShell active="/books">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
          Living catalogue
        </p>
        <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-0.02em] md:text-6xl">
          Catalogue
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Search DSB Publication titles and check live shelf availability in
          Thimphu.
        </p>

        <form className="mt-10 space-y-5 border-y border-[color:var(--dsb-line)] py-6">
          <div className="flex max-w-xl gap-2">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Title, ISBN, or keyword"
              className="rounded-none border-[color:var(--dsb-line)] bg-[color:var(--dsb-ivory)]"
            />
            <Button
              type="submit"
              className="rounded-none bg-[color:var(--dsb-lacquer)] hover:bg-[#4a1c16]"
            >
              Search
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
                Format
              </span>
              <select
                name="format"
                defaultValue={format ?? ""}
                className="border-input flex h-9 w-full min-w-[9rem] rounded-none border bg-[color:var(--dsb-ivory)] px-3 text-sm"
              >
                <option value="">All formats</option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
                Availability
              </span>
              <select
                name="availability"
                defaultValue={availability ?? ""}
                className="border-input flex h-9 w-full min-w-[9rem] rounded-none border bg-[color:var(--dsb-ivory)] px-3 text-sm"
              >
                <option value="">Any status</option>
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {availabilityLabel(a)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
                Sort
              </span>
              <select
                name="sort"
                defaultValue={sortKey}
                className="border-input flex h-9 w-full min-w-[9rem] rounded-none border bg-[color:var(--dsb-ivory)] px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
              </select>
            </label>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="rounded-none"
            >
              Apply
            </Button>
          </div>
        </form>

        {!isSupabaseConfigured() ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Supabase is not connected — catalogue unavailable.
          </p>
        ) : (
          <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book) => (
              <li key={book.id} className="group">
                <Link href={`/books/${book.slug}`} className="block">
                  <div className="overflow-hidden bg-[color:var(--dsb-stone)]">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-5 text-[0.65rem] tracking-[0.2em] text-[color:var(--dsb-gilt)] uppercase">
                    {availabilityLabel(book.availability_status)}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl leading-snug font-medium group-hover:text-[color:var(--dsb-lacquer)]">
                    {book.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatBtn(book.price_btn)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isSupabaseConfigured() && books.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No books found.</p>
        ) : null}
      </div>
    </StorefrontShell>
  );
}
