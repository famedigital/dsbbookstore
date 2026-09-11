"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CatalogueBookCard } from "@/components/storefront/catalogue-book-card";
import type { CatalogueBook } from "@/lib/storefront/catalogue-query";

type Props = {
  initialBooks: CatalogueBook[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  q?: string;
  category?: string;
  availability?: string;
  sort: string;
};

function pageHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/books?${qs}` : "/books";
}

export function CatalogueResults({
  initialBooks,
  initialTotal,
  initialPage,
  pageSize,
  q,
  category,
  availability,
  sort,
}: Props) {
  const [books, setBooks] = useState(initialBooks);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const filterKey = `${q ?? ""}|${category ?? ""}|${availability ?? ""}|${sort}`;

  useEffect(() => {
    setBooks(initialBooks);
    setPage(initialPage);
    setTotal(initialTotal);
    setError(null);
  }, [filterKey, initialBooks, initialPage, initialTotal]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = page < totalPages;
  const fromItem = total === 0 ? 0 : 1;
  const toItem = books.length;

  const baseParams = {
    q: q?.trim() || undefined,
    category: category || undefined,
    availability: availability || undefined,
    sort: sort !== "browse" ? sort : undefined,
  };

  const loadNext = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    const next = page + 1;
    startTransition(async () => {
      try {
        const sp = new URLSearchParams();
        if (q?.trim()) sp.set("q", q.trim());
        if (category) sp.set("category", category);
        if (availability) sp.set("availability", availability);
        if (sort && sort !== "browse") sp.set("sort", sort);
        sp.set("page", String(next));
        const res = await fetch(`/api/catalogue?${sp.toString()}`);
        if (!res.ok) throw new Error("Could not load more titles");
        const data = (await res.json()) as {
          books: CatalogueBook[];
          total: number;
          page: number;
        };
        setBooks((prev) => {
          const seen = new Set(prev.map((b) => b.id));
          const merged = [...prev];
          for (const b of data.books) {
            if (!seen.has(b.id)) merged.push(b);
          }
          return merged;
        });
        setTotal(data.total);
        setPage(data.page);
        setError(null);
        if (typeof window !== "undefined" && window.history?.replaceState) {
          const url = pageHref({
            ...baseParams,
            page: data.page > 1 ? String(data.page) : undefined,
          });
          window.history.replaceState(null, "", url);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        loadingRef.current = false;
      }
    });
  }, [hasMore, page, q, category, availability, sort, baseParams]);

  // Lazy load next batch when sentinel enters view (category browse pattern)
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadNext();
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, loadNext, books.length]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[color:var(--sf-muted)]">
        <p>
          {total === 0
            ? "No titles match"
            : `Showing ${fromItem}–${toItem.toLocaleString("en-BT")} of ${total.toLocaleString("en-BT")}`}
          {q?.trim() ? (
            <>
              {" "}
              for “
              <span className="text-[color:var(--sf-ink)]">{q.trim()}</span>”
            </>
          ) : null}
        </p>
        {totalPages > 1 ? (
          <p className="text-xs">
            Batch {page} · {totalPages} total · scroll or Load more
          </p>
        ) : null}
      </div>

      {books.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[color:var(--sf-line)] px-6 py-16 text-center">
          <p className="text-[color:var(--sf-muted)]">
            Nothing here yet — try another category or clear filters.
          </p>
          <Link href="/books" className="sf-btn mt-4 inline-flex text-sm">
            View all books
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <CatalogueBookCard key={book.id} book={book} />
          ))}
        </ul>
      )}

      {error ? (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      ) : null}

      {hasMore ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
          <button
            type="button"
            onClick={loadNext}
            disabled={pending}
            className="sf-btn !rounded-none !px-6 text-sm disabled:opacity-60"
          >
            {pending
              ? "Loading…"
              : `Load more (+${Math.min(pageSize, total - books.length)})`}
          </button>
          {pending ? (
            <ul
              className="mt-2 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              aria-hidden
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex flex-col gap-2">
                  <div className="sf-skel aspect-[2/3] w-full" />
                  <div className="sf-skel h-3 w-3/4" />
                  <div className="sf-skel h-3 w-1/2" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : books.length > 0 ? (
        <p className="mt-8 text-center text-sm text-[color:var(--sf-muted)]">
          End of results — {total.toLocaleString("en-BT")} titles with these
          filters.
        </p>
      ) : null}

      {/* Crawlable pagination fallback (Google / SEO) */}
      {totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-[color:var(--sf-line)] pt-6"
          aria-label="Catalogue pages"
        >
          {page > 1 ? (
            <Link
              href={pageHref({
                ...baseParams,
                page: page - 1 > 1 ? String(page - 1) : undefined,
              })}
              className="sf-btn-outline !rounded-none !px-3 !py-1.5 text-xs"
            >
              Previous
            </Link>
          ) : null}
          <span className="px-2 text-xs text-[color:var(--sf-muted)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref({ ...baseParams, page: String(page + 1) })}
              className="sf-btn-outline !rounded-none !px-3 !py-1.5 text-xs"
              rel="next"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
