import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn } from "@/lib/erp/format";

export type RelatedBook = {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  price_btn: number;
  cover_public_id: string | null;
  isbn_13: string | null;
  barcode: string | null;
};

export function RelatedBooks({
  books,
  heading = "You might also like",
}: {
  books: RelatedBook[];
  heading?: string;
}) {
  if (!books.length) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-4 md:px-6 md:py-14">
      <div className="sf-dzong-rule mb-2" />
      <p className="sf-eyebrow">Also on the shelf</p>
      <h2 className="font-display mt-2 text-2xl text-[color:var(--sf-ink)] md:text-3xl">
        {heading}
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              href={`/books/${book.slug}`}
              className="group block text-[color:var(--sf-ink)] no-underline"
            >
              <div className="sf-book-card__cover relative aspect-[2/3] overflow-hidden bg-[color:var(--sf-surface)]">
                <BookCover
                  publicId={book.cover_public_id}
                  isbn={book.isbn_13}
                  barcode={book.barcode}
                  alt={book.title}
                  width={200}
                  height={300}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width:640px) 45vw, 160px"
                />
              </div>
              <h3 className="font-display mt-2.5 line-clamp-2 text-sm leading-snug group-hover:text-[color:var(--sf-accent)]">
                {book.title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--sf-muted)]">
                {book.brand || "\u00a0"}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-[color:var(--sf-accent)]">
                {formatBtn(book.price_btn)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
