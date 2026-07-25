import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { bookCoverProps } from "@/lib/media/book-cover-props";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { AvailabilityStatus, Book } from "@/types/erp";
import type { MediaAsset } from "@/types/media";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StorefrontHeader } from "@/components/storefront/storefront-header";

type BookWithCover = Book & { cover?: MediaAsset | null };

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
  let books: BookWithCover[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { column, ascending } = SORTS[sortKey];
    let query = supabase
      .from("books")
      .select("*, cover:media_assets!cover_media_id(*)")
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
    books = (data as BookWithCover[]) ?? [];
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(165deg,#f3f6fb_0%,#f7f4ec_55%,#eef5f1_100%)]">
      <StorefrontHeader />

      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 md:px-8">
        <p className="text-xs tracking-[0.22em] text-primary/70 uppercase">
          Live stock
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">
          Catalogue
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          DSB Publication titles and international favourites — search and check
          what&apos;s on the Thimphu shelf today.
        </p>

        <form className="mt-8 space-y-4">
          <div className="flex max-w-xl gap-2">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Title, ISBN, or keyword"
              className="bg-white/90"
            />
            <Button type="submit">Search</Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Format</span>
              <select
                name="format"
                defaultValue={format ?? ""}
                className="border-input flex h-9 rounded-md border bg-white/90 px-3 text-sm"
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
                className="border-input flex h-9 rounded-md border bg-white/90 px-3 text-sm"
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
                className="border-input flex h-9 rounded-md border bg-white/90 px-3 text-sm"
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
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <li key={book.id}>
                <Link href={`/books/${book.slug}`} className="group block">
                  <div className="overflow-hidden shadow-[0_18px_40px_-28px_rgba(11,61,145,0.5)] transition duration-500 group-hover:-translate-y-1">
                    <BookCover
                      {...bookCoverProps(book)}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <h2 className="mt-3 font-heading text-base leading-snug group-hover:text-primary md:text-lg">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.publisher_name}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground/85">
                    {formatBtn(book.price_btn)} ·{" "}
                    {availabilityLabel(book.availability_status)}
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
    </div>
  );
}
