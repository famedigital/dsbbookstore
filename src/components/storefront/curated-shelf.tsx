import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn } from "@/lib/erp/format";

export type CuratedShelfBook = {
  id: string;
  title: string;
  slug: string;
  brand?: string | null;
  price_btn: number;
  cover_public_id: string | null;
  isbn_13?: string | null;
  barcode?: string | null;
};

/** Horizontal curated shelf — New arrivals / Staff picks / category strips. */
export function CuratedShelf({
  eyebrow,
  title,
  href,
  books,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  books: CuratedShelfBook[];
}) {
  if (!books.length) return null;

  return (
    <section className="bg-[color:var(--sf-bg)] py-7 md:py-12">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="sf-eyebrow">{eyebrow}</p>
            <h2 className="sf-title mt-2">{title}</h2>
          </div>
          {href ? (
            <Link
              href={href}
              className="sf-link-gilt text-sm font-semibold text-[color:var(--sf-accent)]"
            >
              View all →
            </Link>
          ) : null}
        </div>
        <ul className="mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-5 md:gap-5 md:overflow-visible">
          {books.map((book) => (
            <li
              key={book.id}
              className="w-[42vw] max-w-[11rem] shrink-0 sm:w-40 md:w-auto md:max-w-none"
            >
              <Link
                href={`/books/${book.slug}`}
                prefetch
                className="group block text-[color:var(--sf-ink)] no-underline"
              >
                <div className="sf-book-card__cover relative aspect-[2/3] overflow-hidden bg-[color:var(--sf-surface)]">
                  <BookCover
                    publicId={book.cover_public_id}
                    isbn={book.isbn_13}
                    barcode={book.barcode}
                    alt={book.title}
                    width={220}
                    height={330}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 42vw, 160px"
                  />
                </div>
                <h3 className="font-display mt-2.5 line-clamp-2 text-sm leading-snug group-hover:text-[color:var(--sf-accent)]">
                  {book.title}
                </h3>
                {book.brand ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--sf-muted)]">
                    {book.brand}
                  </p>
                ) : null}
                <p className="mt-1 text-sm font-semibold tabular-nums text-[color:var(--sf-accent)]">
                  {formatBtn(book.price_btn)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
