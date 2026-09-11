"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn } from "@/lib/erp/format";
import { useWhatsApp } from "@/components/storefront/storefront-providers";
import type { StorefrontSearchHit } from "@/app/api/search/route";

type ListItem = {
  id: string;
  title: string;
  slug: string;
  price_btn: number;
  cover_public_id: string | null;
  isbn_13: string | null;
  barcode: string | null;
  qty: number;
};

const STORAGE_KEY = "dsb-school-list";

function readList(): ListItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ListItem[]) : [];
  } catch {
    return [];
  }
}

function writeList(items: ListItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function SchoolListBuilder() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<StorefrontSearchHit[]>([]);
  const [items, setItems] = useState<ListItem[]>([]);
  const [org, setOrg] = useState("");
  const [contact, setContact] = useState("");
  const [pending, startTransition] = useTransition();
  const { url } = useWhatsApp();

  useEffect(() => {
    setItems(readList());
  }, []);

  const persist = useCallback((next: ListItem[]) => {
    setItems(next);
    writeList(next);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
          if (!res.ok) return;
          const data = (await res.json()) as { hits: StorefrontSearchHit[] };
          setHits(data.hits ?? []);
        } catch {
          setHits([]);
        }
      });
    }, 220);
    return () => window.clearTimeout(t);
  }, [q]);

  function addHit(hit: StorefrontSearchHit) {
    const existing = items.find((i) => i.id === hit.id);
    if (existing) {
      persist(
        items.map((i) =>
          i.id === hit.id ? { ...i, qty: Math.min(99, i.qty + 1) } : i
        )
      );
    } else {
      persist([
        ...items,
        {
          id: hit.id,
          title: hit.title,
          slug: hit.slug,
          price_btn: hit.price_btn,
          cover_public_id: hit.cover_public_id,
          isbn_13: hit.isbn_13,
          barcode: hit.barcode,
          qty: 1,
        },
      ]);
    }
    setQ("");
    setHits([]);
  }

  const total = items.reduce((s, i) => s + i.qty * i.price_btn, 0);
  const wa = url(
    [
      `Hi DSB Books — school / reading list enquiry`,
      org ? `Organisation: ${org}` : null,
      contact ? `Contact: ${contact}` : null,
      "",
      ...items.map(
        (i) =>
          `• ${i.title}${i.isbn_13 || i.barcode ? ` (${i.isbn_13 || i.barcode})` : ""} ×${i.qty}`
      ),
      "",
      `Est. total Nu. ${total.toFixed(0)} — please confirm stock & quote for pickup.`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  const enquiryBody = encodeURIComponent(
    [
      org ? `Organisation: ${org}` : "",
      contact ? `Contact: ${contact}` : "",
      "",
      "Reading / school list:",
      ...items.map((i) => `• ${i.title} ×${i.qty}`),
      "",
      `Est. Nu. ${total.toFixed(0)}`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return (
    <section className="mt-10 border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4 md:p-6">
      <p className="sf-eyebrow">List builder</p>
      <h2 className="sf-title mt-2 text-xl md:text-2xl">
        Build a school reading list
      </h2>
      <p className="mt-2 max-w-xl text-sm text-[color:var(--sf-muted)]">
        Search titles, set quantities, then WhatsApp or enquire — we confirm
        stock and prepare pickup at Chang Lam.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[0.65rem] tracking-wide text-[color:var(--sf-muted)] uppercase">
            School / organisation
          </span>
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="mt-1 w-full rounded-none border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] px-3 py-2 text-sm outline-none focus:border-[color:var(--sf-accent)]"
            placeholder="e.g. Yangchenphug HSS"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[0.65rem] tracking-wide text-[color:var(--sf-muted)] uppercase">
            Contact name / phone
          </span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 w-full rounded-none border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] px-3 py-2 text-sm outline-none focus:border-[color:var(--sf-accent)]"
            placeholder="Teacher name · phone"
          />
        </label>
      </div>

      <div className="relative mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Add a title — search catalogue…"
          className="w-full rounded-none border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--sf-accent)]"
          aria-label="Search titles to add"
        />
        {hits.length > 0 ? (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] shadow-lg">
            {hits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[color:var(--sf-surface)]"
                  onClick={() => addHit(hit)}
                >
                  <span className="relative h-10 w-7 shrink-0 overflow-hidden bg-[color:var(--sf-surface)]">
                    <BookCover
                      publicId={hit.cover_public_id}
                      isbn={hit.isbn_13}
                      barcode={hit.barcode}
                      alt=""
                      width={56}
                      height={84}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 font-medium">{hit.title}</span>
                    <span className="mt-0.5 block text-xs text-[color:var(--sf-muted)]">
                      {formatBtn(hit.price_btn)}
                      {pending ? " · …" : ""}
                    </span>
                  </span>
                  <span className="text-[0.65rem] font-semibold tracking-wide text-[color:var(--sf-accent)] uppercase">
                    Add
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[color:var(--sf-muted)]">
          No titles yet — search above to start the list.
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-[color:var(--sf-line)] border-y border-[color:var(--sf-line)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <Link
                  href={`/books/${item.slug}`}
                  className="relative h-14 w-10 shrink-0 overflow-hidden bg-[color:var(--sf-bg)]"
                >
                  <BookCover
                    publicId={item.cover_public_id}
                    isbn={item.isbn_13}
                    barcode={item.barcode}
                    alt=""
                    width={80}
                    height={120}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/books/${item.slug}`}
                    className="line-clamp-1 text-sm font-medium hover:text-[color:var(--sf-accent)]"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[color:var(--sf-muted)]">
                    {formatBtn(item.price_btn)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="h-8 w-8 border border-[color:var(--sf-line)] text-sm"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      persist(
                        items
                          .map((i) =>
                            i.id === item.id
                              ? { ...i, qty: Math.max(1, i.qty - 1) }
                              : i
                          )
                          .filter((i) => i.qty > 0)
                      )
                    }
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    className="h-8 w-8 border border-[color:var(--sf-line)] text-sm"
                    aria-label="Increase quantity"
                    onClick={() =>
                      persist(
                        items.map((i) =>
                          i.id === item.id
                            ? { ...i, qty: Math.min(99, i.qty + 1) }
                            : i
                        )
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs text-[color:var(--sf-muted)] hover:text-[color:var(--sf-accent)]"
                  onClick={() => persist(items.filter((i) => i.id !== item.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold tabular-nums">
            Est. {formatBtn(total)} · {items.reduce((s, i) => s + i.qty, 0)}{" "}
            copies
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="sf-btn-pine text-sm">
              WhatsApp list
            </a>
            <Link
              href={`/enquiry?message=${enquiryBody}`}
              className="sf-btn text-sm"
            >
              Send enquiry
            </Link>
            <button
              type="button"
              className="sf-btn-outline text-sm"
              onClick={() => persist([])}
            >
              Clear list
            </button>
          </div>
        </>
      )}
    </section>
  );
}
