"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import {
  readReadingList,
  writeReadingList,
  type ReadingListItem,
} from "@/lib/storefront/reading-list";
import { useHoldBag } from "@/components/storefront/hold-bag";
import { formatBtn } from "@/lib/erp/format";
import { bookWhatsAppHref, whatsappUrl } from "@/lib/storefront/whatsapp";

export default function ReadingListPage() {
  return (
    <StorefrontShell active="/list">
      <ReadingListContent />
    </StorefrontShell>
  );
}

function ReadingListContent() {
  const [items, setItems] = useState<ReadingListItem[]>([]);
  const { add } = useHoldBag();

  useEffect(() => {
    setItems(readReadingList());
    function sync() {
      setItems(readReadingList());
    }
    window.addEventListener("dsb-reading-list", sync);
    return () => window.removeEventListener("dsb-reading-list", sync);
  }, []);

  const shareWa = whatsappUrl(
    items.length
      ? `Hi DSB Books — my reading list:\n${items
          .map((i) => `• ${i.title}`)
          .join("\n")}\n\nCan you check stock for pickup?`
      : "Hi DSB Books — I'd like help building a reading list."
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-8 sm:px-4 md:px-6 md:py-12">
      <p className="sf-eyebrow">Guest list</p>
      <h1 className="sf-title mt-2 text-2xl md:text-4xl">Reading list</h1>
      <p className="mt-3 max-w-lg text-sm text-[color:var(--sf-muted)]">
        Saved on this device — bring it to Chang Lam or WhatsApp us. No account
        needed.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 border border-dashed border-[color:var(--sf-line)] px-6 py-14 text-center">
          <p className="text-[color:var(--sf-muted)]">
            Nothing saved yet. Tap the bookmark on any book.
          </p>
          <Link href="/books" className="sf-btn mt-4 inline-flex text-sm">
            Browse books
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={shareWa}
              target="_blank"
              rel="noopener noreferrer"
              className="sf-btn-pine text-sm"
            >
              WhatsApp list
            </a>
            <button
              type="button"
              className="sf-btn text-sm"
              onClick={() => {
                for (const i of items) {
                  add({
                    id: i.id,
                    slug: i.slug,
                    title: i.title,
                    price_btn: i.price_btn,
                    stock_qty: 99,
                    cover_public_id: i.cover_public_id,
                    isbn_13: i.isbn_13,
                    barcode: i.barcode,
                  });
                }
              }}
            >
              Move all to hold bag
            </button>
            <button
              type="button"
              className="sf-btn-outline text-sm"
              onClick={() => {
                writeReadingList([]);
                setItems([]);
              }}
            >
              Clear list
            </button>
          </div>
          <ul className="mt-8 divide-y divide-[color:var(--sf-line)] border-y border-[color:var(--sf-line)]">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <Link
                  href={`/books/${item.slug}`}
                  className="relative h-24 w-16 shrink-0 overflow-hidden bg-[color:var(--sf-surface)]"
                >
                  <BookCover
                    publicId={item.cover_public_id}
                    isbn={item.isbn_13}
                    barcode={item.barcode}
                    alt=""
                    width={64}
                    height={96}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/books/${item.slug}`}
                    className="font-display text-lg text-[color:var(--sf-ink)] hover:text-[color:var(--sf-accent)]"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-[color:var(--sf-accent)]">
                    {formatBtn(item.price_btn)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold tracking-wide text-[color:var(--sf-accent)] uppercase hover:underline"
                      onClick={() =>
                        add({
                          id: item.id,
                          slug: item.slug,
                          title: item.title,
                          price_btn: item.price_btn,
                          stock_qty: 99,
                          cover_public_id: item.cover_public_id,
                          isbn_13: item.isbn_13,
                          barcode: item.barcode,
                        })
                      }
                    >
                      Hold
                    </button>
                    <a
                      href={bookWhatsAppHref({
                        title: item.title,
                        slug: item.slug,
                        isbn: item.isbn_13 || item.barcode,
                        price: item.price_btn,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold tracking-wide text-[color:var(--sf-pine)] uppercase hover:underline"
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      className="text-xs tracking-wide text-[color:var(--sf-muted)] uppercase hover:text-[color:var(--sf-accent)]"
                      onClick={() => {
                        const next = items.filter((i) => i.id !== item.id);
                        writeReadingList(next);
                        setItems(next);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
