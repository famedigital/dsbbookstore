"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn } from "@/lib/erp/format";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/erp";

export type ShelfCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ShelfBook = Pick<
  Book,
  "id" | "title" | "slug" | "price_btn" | "cover_public_id" | "isbn_13" | "barcode"
> & {
  categoryIds: string[];
};

export function ShelfCategoryTabs({
  categories,
  books,
}: {
  categories: ShelfCategory[];
  books: ShelfBook[];
}) {
  const tabs = useMemo(
    () => [{ id: "all", name: "All", slug: "all" }, ...categories],
    [categories]
  );
  const [active, setActive] = useState("all");

  const visible = useMemo(() => {
    if (active === "all") return books.slice(0, 8);
    return books
      .filter((b) => b.categoryIds.includes(active))
      .slice(0, 8);
  }, [active, books]);

  if (!books.length) {
    return (
      <p className="mt-8 text-center text-sm text-[color:var(--sf-muted)]">
        No titles on the shelf yet.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div
        className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Book categories"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "border-[color:var(--sf-accent)] bg-[color:var(--sf-accent)] text-white"
                  : "border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] text-[color:var(--sf-ink)] hover:border-[color:var(--sf-accent)]"
              )}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[color:var(--sf-muted)]">
          No books in this category yet.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {visible.map((book) => (
            <li key={`pop-${book.id}`}>
              <Link
                href={`/books/${book.slug}`}
                className="group block text-center"
              >
                <div className="sf-card mx-auto aspect-[2/3] w-full max-w-[200px] overflow-hidden p-2">
                  <BookCover
                    publicId={book.cover_public_id}
                    isbn={book.isbn_13}
                    barcode={book.barcode}
                    alt={book.title}
                    width={320}
                    height={480}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-3 font-display text-sm group-hover:text-[color:var(--sf-accent)] md:text-lg">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[color:var(--sf-accent)]">
                  {formatBtn(book.price_btn)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
