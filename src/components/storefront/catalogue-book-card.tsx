"use client";

import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { ReadingListToggle } from "@/components/storefront/reading-list-toggle";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { bookWhatsAppHref } from "@/lib/storefront/whatsapp";
import type { CatalogueBook } from "@/lib/storefront/catalogue-query";

function yearFrom(publishedAt?: string | null) {
  if (!publishedAt) return null;
  const y = String(publishedAt).slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

function blurb(book: CatalogueBook) {
  const text =
    book.description?.trim() ||
    book.seo_description?.trim() ||
    book.subtitle?.trim() ||
    "";
  if (!text) return null;
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

export function CatalogueBookCard({ book }: { book: CatalogueBook }) {
  const canBuy =
    book.availability_status === "in_stock" ||
    book.availability_status === "low_stock";
  const year = yearFrom(book.published_at);
  const summary = blurb(book);
  const metaBits = [
    book.publisher_name &&
    book.publisher_name !== "DSB Publication" &&
    book.publisher_name !== "DSB Enterprises"
      ? book.publisher_name
      : null,
    year,
    book.page_count ? `${book.page_count} pp` : null,
  ].filter(Boolean);
  const wa = bookWhatsAppHref({
    title: book.title,
    slug: book.slug,
    isbn: book.isbn_13 || book.barcode,
    price: book.price_btn,
  });

  return (
    <li className="group relative flex min-w-0 flex-col">
      <Link
        href={`/books/${book.slug}`}
        prefetch
        className="flex min-w-0 flex-1 flex-col text-left text-[color:var(--sf-ink)] no-underline"
      >
        <div className="sf-book-card__cover relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-[color:var(--sf-surface)]">
          <BookCover
            publicId={book.cover_public_id}
            isbn={book.isbn_13}
            barcode={book.barcode}
            alt={book.title}
            width={220}
            height={330}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            sizes="(max-width:640px) 45vw, (max-width:1024px) 18vw, 140px"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden bg-gradient-to-t from-black/90 via-black/65 to-transparent p-2.5 pt-10 opacity-0 transition-opacity duration-250 md:block md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            aria-hidden
          >
            {metaBits.length > 0 ? (
              <p className="text-[0.65rem] leading-snug tracking-wide text-white/80">
                {metaBits.join(" · ")}
              </p>
            ) : null}
            {summary ? (
              <p className="mt-1 line-clamp-4 text-[0.7rem] leading-snug text-white/95">
                {summary}
              </p>
            ) : (
              <p className="mt-1 text-[0.7rem] text-white/70">
                Hold for pickup at Chang Lam · or WhatsApp us.
              </p>
            )}
          </div>
        </div>
        <h2 className="font-display mt-2.5 line-clamp-2 min-h-[2.5rem] text-sm leading-snug group-hover:text-[color:var(--sf-accent)]">
          {book.title}
        </h2>
        <p className="mt-0.5 line-clamp-1 min-h-[1rem] text-xs capitalize text-[color:var(--sf-muted)]">
          {book.brand || "\u00a0"}
        </p>
      </Link>

      <div className="mt-auto flex min-w-0 flex-col pt-2">
        <p className="text-sm font-semibold tracking-tight tabular-nums text-[color:var(--sf-accent)]">
          {formatBtn(book.price_btn)}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-[color:var(--sf-muted)]">
          {availabilityLabel(book.availability_status)}
          {typeof book.stock_qty === "number" && canBuy
            ? ` · ${book.stock_qty}`
            : ""}
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Link
            href={`/books/${book.slug}`}
            prefetch
            className={
              canBuy
                ? "sf-btn flex flex-1 items-center justify-center !px-2 !py-1.5 text-[0.65rem]"
                : "sf-btn-outline flex flex-1 items-center justify-center !px-2 !py-1.5 text-[0.65rem]"
            }
          >
            {canBuy ? "View" : "Enquire"}
          </Link>
          <ReadingListToggle
            compact
            book={{
              id: book.id,
              slug: book.slug,
              title: book.title,
              price_btn: book.price_btn,
              cover_public_id: book.cover_public_id,
              isbn_13: book.isbn_13,
              barcode: book.barcode,
            }}
          />
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] text-[0.6rem] font-semibold tracking-wide text-[color:var(--sf-pine)] uppercase hover:border-[color:var(--sf-accent)]"
            aria-label="WhatsApp about this book"
            onClick={(e) => e.stopPropagation()}
          >
            WA
          </a>
        </div>
      </div>
    </li>
  );
}
