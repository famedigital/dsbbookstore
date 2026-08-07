import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
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
  type BookRow = Book & {
    book_authors?: { authors: { name: string } | null }[] | null;
  };
  let books: BookRow[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { column, ascending } = SORTS[sortKey];
    let query = supabase
      .from("books")
      .select("*, book_authors(authors(name))")
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
    books = (data as BookRow[]) ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 pb-16">
        <h1 className="font-heading text-4xl font-semibold">Catalogue</h1>
        <p className="mt-2 text-muted-foreground">
          Search DSB publications and check live shelf availability.
        </p>

        <form className="mt-8 space-y-4">
          <div className="flex max-w-xl gap-2">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Title, ISBN, or keyword"
              className="bg-white"
            />
            <Button type="submit">Search</Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Format</span>
              <select
                name="format"
                defaultValue={format ?? ""}
                className="border-input bg-white flex h-9 rounded-md border px-3 text-sm"
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
              <span className="text-muted-foreground">Availability</span>
              <select
                name="availability"
                defaultValue={availability ?? ""}
                className="border-input bg-white flex h-9 rounded-md border px-3 text-sm"
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
              <span className="text-muted-foreground">Sort</span>
              <select
                name="sort"
                defaultValue={sortKey}
                className="border-input bg-white flex h-9 rounded-md border px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
              </select>
            </label>
            <Button type="submit" variant="secondary" size="sm">
              Apply
            </Button>
          </div>
        </form>

        {!isSupabaseConfigured() ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Supabase is not connected — catalogue unavailable (no mock data).
          </p>
        ) : (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book) => {
              const authors =
                book.book_authors
                  ?.map((ba) => ba.authors?.name)
                  .filter(Boolean)
                  .join(", ") || null;
              return (
              <li key={book.id}>
                <Link href={`/books/${book.slug}`} className="group block">
                  <BookCover
                    publicId={book.cover_public_id}
                    alt={book.title}
                    width={400}
                    height={600}
                    className="aspect-[2/3] w-full rounded-sm object-cover shadow-md"
                  />
                  <h2 className="mt-3 font-heading text-lg group-hover:text-primary">
                    {book.title}
                  </h2>
                  {authors ? (
                    <p className="text-sm text-muted-foreground">{authors}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {formatBtn(book.price_btn)} ·{" "}
                    {availabilityLabel(book.availability_status)}
                  </p>
                </Link>
              </li>
              );
            })}
          </ul>
        )}

        {isSupabaseConfigured() && books.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No books found.</p>
        ) : null}
    </div>
  );
}
