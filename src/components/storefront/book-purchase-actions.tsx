"use client";

import { useState, useTransition } from "react";
import { useHoldBag } from "@/components/storefront/hold-bag";
import { ReadingListToggle } from "@/components/storefront/reading-list-toggle";
import { useWhatsApp } from "@/components/storefront/storefront-providers";
import { submitStockAlert } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BookBits = {
  id: string;
  slug: string;
  title: string;
  price_btn: number;
  stock_qty: number;
  cover_public_id: string | null;
  isbn_13: string | null;
  barcode: string | null;
  availability_status: string;
};

export function BookPurchaseActions({
  book,
  canBuy,
}: {
  book: BookBits;
  canBuy: boolean;
}) {
  const { add } = useHoldBag();
  const { bookHref } = useWhatsApp();
  const wa = bookHref({
    title: book.title,
    slug: book.slug,
    isbn: book.isbn_13 || book.barcode,
    price: book.price_btn,
  });

  return (
    <div className="mt-5 flex flex-wrap gap-2.5">
      {canBuy ? (
        <button
          type="button"
          className="sf-btn text-sm"
          onClick={() =>
            add({
              id: book.id,
              slug: book.slug,
              title: book.title,
              price_btn: book.price_btn,
              stock_qty: book.stock_qty,
              cover_public_id: book.cover_public_id,
              isbn_13: book.isbn_13,
              barcode: book.barcode,
            })
          }
        >
          Hold for pickup
        </button>
      ) : (
        <a href="#enquire" className="sf-btn text-sm">
          Enquire
        </a>
      )}
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="sf-btn-pine text-sm"
      >
        WhatsApp
      </a>
      <ReadingListToggle
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
      <a href="#enquire" className="sf-btn-outline text-sm">
        Email enquire
      </a>
    </div>
  );
}

export function StockAlertForm({ bookId, title }: { bookId: string; title: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="mt-4 text-sm text-[color:var(--sf-pine)]">
        We&apos;ll email you when “{title}” is back on the shelf.
      </p>
    );
  }

  return (
    <form
      className="mt-5 space-y-2 border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4"
      action={(fd) => {
        startTransition(async () => {
          try {
            await submitStockAlert(fd);
            setSent(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save alert");
          }
        });
      }}
    >
      <input type="hidden" name="book_id" value={bookId} />
      <p className="text-sm font-medium text-[color:var(--sf-ink)]">
        Out of stock — get a back-in-stock email
      </p>
      <div className="flex flex-wrap gap-2">
        <div className="min-w-[12rem] flex-1 space-y-1">
          <Label htmlFor="alert-email" className="sr-only">
            Email
          </Label>
          <Input
            id="alert-email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="rounded-none"
          />
        </div>
        <Button type="submit" className="sf-btn" disabled={pending}>
          {pending ? "Saving…" : "Notify me"}
        </Button>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </form>
  );
}
