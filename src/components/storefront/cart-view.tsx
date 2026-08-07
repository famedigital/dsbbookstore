"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/storefront/cart-provider";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CartBook = {
  id: string;
  title: string;
  slug: string;
  price_btn: number;
  stock_qty: number;
  cover_public_id: string | null;
};

export function CartView({ books }: { books: CartBook[] }) {
  const { lines, setQty, removeItem, ready, itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !ready) {
    return (
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Loading cart…
      </p>
    );
  }

  const bookMap = new Map(books.map((b) => [b.id, b]));
  const rows = lines
    .map((line) => {
      const book = bookMap.get(line.bookId);
      if (!book) return null;
      return { line, book };
    })
    .filter(Boolean) as { line: { bookId: string; qty: number }; book: CartBook }[];

  const subtotal = rows.reduce(
    (sum, r) => sum + r.book.price_btn * r.line.qty,
    0
  );

  if (!itemCount || rows.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Your cart is empty.</p>
        <Button asChild variant="outline">
          <Link href="/books">Browse catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-border/70 border-y border-border/70">
        {rows.map(({ line, book }) => {
          const overStock = line.qty > book.stock_qty;
          return (
            <li
              key={book.id}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/books/${book.slug}`}
                  className="font-heading text-lg font-medium hover:text-primary"
                >
                  {book.title}
                </Link>
                <p className="text-muted-foreground mt-1 text-sm">
                  {formatBtn(book.price_btn)}
                  {overStock ? (
                    <span className="ml-2 text-destructive">
                      Only {book.stock_qty} in stock
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`qty-${book.id}`}>
                  Quantity for {book.title}
                </label>
                <Input
                  id={`qty-${book.id}`}
                  type="number"
                  min={1}
                  max={Math.max(1, book.stock_qty)}
                  value={line.qty}
                  onChange={(e) =>
                    setQty(book.id, Number(e.target.value) || 1)
                  }
                  className="w-20"
                />
                <p className="min-w-[5rem] text-right text-sm font-medium">
                  {formatBtn(book.price_btn * line.qty)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(book.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-medium">
          Subtotal{" "}
          <span className="text-primary">{formatBtn(subtotal)}</span>
        </p>
        <Button asChild>
          <Link href="/checkout">Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
