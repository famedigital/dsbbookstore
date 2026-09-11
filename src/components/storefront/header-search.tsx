"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { cn } from "@/lib/utils";
import type { StorefrontSearchHit } from "@/app/api/search/route";

const DEBOUNCE_MS = 220;
const RECENT_KEY = "dsb-recent-searches";
const MAX_RECENT = 6;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function pushRecent(term: string) {
  const t = term.trim();
  if (t.length < 2) return;
  const next = [t, ...readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(
    0,
    MAX_RECENT
  );
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function stockBadge(hit: StorefrontSearchHit) {
  const st = hit.availability_status;
  if (st === "in_stock" || st === "low_stock") {
    const qty =
      typeof hit.stock_qty === "number" && hit.stock_qty > 0
        ? ` · ${hit.stock_qty}`
        : "";
    return { label: `In stock${qty}`, tone: "ok" as const };
  }
  if (st === "preorder") return { label: "Pre-order", tone: "muted" as const };
  return { label: availabilityLabel(st) || "Ask us", tone: "muted" as const };
}

export function HeaderSearch({
  defaultQuery = "",
  className,
}: {
  defaultQuery?: string;
  className?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, StorefrontSearchHit[]>>(new Map());
  const [q, setQ] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<StorefrontSearchHit[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQ(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const runSearch = useCallback((term: string) => {
    abortRef.current?.abort();
    const trimmed = term.trim();
    if (trimmed.length < 2) {
      setHits([]);
      return;
    }
    const cached = cacheRef.current.get(trimmed.toLowerCase());
    if (cached) {
      setHits(cached);
      setOpen(true);
      setActive(-1);
      return;
    }
    const ac = new AbortController();
    abortRef.current = ac;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ac.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { hits: StorefrontSearchHit[] };
        if (ac.signal.aborted) return;
        const next = data.hits ?? [];
        cacheRef.current.set(trimmed.toLowerCase(), next);
        setHits(next);
        setOpen(true);
        setActive(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setHits([]);
      }
    });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => runSearch(q), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [q, runSearch]);

  function goCatalogue(e?: React.FormEvent) {
    e?.preventDefault();
    const term = q.trim();
    if (term) {
      pushRecent(term);
      setRecent(readRecent());
    }
    setOpen(false);
    router.push(term ? `/books?q=${encodeURIComponent(term)}` : "/books");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const showRecent = open && q.trim().length < 2 && recent.length > 0;
    const listLen = showRecent ? recent.length : hits.length;

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (hits.length || recent.length) setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, listLen - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      if (showRecent && recent[active]) {
        setQ(recent[active]);
        pushRecent(recent[active]);
        setOpen(false);
        router.push(`/books?q=${encodeURIComponent(recent[active])}`);
        return;
      }
      if (hits[active]) {
        pushRecent(q.trim());
        setOpen(false);
        router.push(`/books/${hits[active].slug}`);
      }
    }
  }

  const showRecentPanel = open && q.trim().length < 2 && recent.length > 0;
  const showHits = open && q.trim().length >= 2;

  return (
    <div ref={rootRef} className={cn("relative min-w-0 flex-1", className)}>
      <form
        action="/books"
        method="get"
        role="search"
        className="flex items-center gap-1.5"
        onSubmit={goCatalogue}
      >
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (q.trim().length >= 2 && hits.length) setOpen(true);
            else if (recent.length) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Title, author, ISBN…"
          aria-label="Search books"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-none border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] px-3.5 text-sm outline-none focus:border-[color:var(--sf-accent)]"
        />
        <button
          type="submit"
          className="sf-btn !h-9 !shrink-0 !rounded-none !px-3.5 !py-0 text-[0.65rem]"
        >
          Find
        </button>
      </form>

      {showRecentPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+0.35rem)] left-0 z-50 w-full min-w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-none border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] shadow-[0_18px_40px_-16px_rgba(15,23,42,0.35)] md:min-w-[28rem]"
        >
          <p className="px-3 pt-2.5 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] text-[color:var(--sf-muted)] uppercase">
            Recent
          </p>
          <ul className="pb-1">
            {recent.map((term, i) => (
              <li key={term} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors",
                    i === active
                      ? "bg-[color:var(--sf-accent-soft,#e8dfd0)]"
                      : "hover:bg-[color:var(--sf-surface)]"
                  )}
                  onClick={() => {
                    setQ(term);
                    pushRecent(term);
                    setOpen(false);
                    router.push(`/books?q=${encodeURIComponent(term)}`);
                  }}
                >
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showHits ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+0.35rem)] left-0 z-50 w-full min-w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-none border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] shadow-[0_18px_40px_-16px_rgba(15,23,42,0.35)] md:min-w-[28rem]"
        >
          {pending && hits.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[color:var(--sf-muted)]">
              Searching…
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[color:var(--sf-muted)]">
              No matches — press Find for full catalogue search.
            </p>
          ) : (
            <ul className="max-h-[min(70vh,24rem)] overflow-y-auto py-1">
              {hits.map((hit, i) => {
                const badge = stockBadge(hit);
                const authors = hit.author_names?.length
                  ? hit.author_names.slice(0, 2).join(", ")
                  : hit.brand;
                return (
                  <li key={hit.id} role="option" aria-selected={i === active}>
                    <Link
                      href={`/books/${hit.slug}`}
                      onClick={() => {
                        pushRecent(q.trim());
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-2.5 py-2 transition-colors",
                        i === active
                          ? "bg-[color:var(--sf-accent-soft,#e8dfd0)]"
                          : "hover:bg-[color:var(--sf-surface)]"
                      )}
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden bg-[color:var(--sf-surface)]">
                        <BookCover
                          publicId={hit.cover_public_id}
                          isbn={hit.isbn_13}
                          barcode={hit.barcode}
                          alt=""
                          width={72}
                          height={108}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-[color:var(--sf-ink)]">
                          {hit.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--sf-muted)]">
                          {[authors, formatBtn(hit.price_btn)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[0.6rem] font-semibold tracking-wide uppercase",
                          badge.tone === "ok"
                            ? "text-[color:var(--sf-pine)]"
                            : "text-[color:var(--sf-muted)]"
                        )}
                      >
                        {badge.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/books?q=${encodeURIComponent(q.trim())}`}
            onClick={() => {
              pushRecent(q.trim());
              setOpen(false);
            }}
            className="block border-t border-[color:var(--sf-line)] px-3 py-2.5 text-center text-xs font-semibold text-[color:var(--sf-accent)] hover:bg-[color:var(--sf-surface)]"
          >
            See all results for “{q.trim()}”
          </Link>
        </div>
      ) : null}
    </div>
  );
}
