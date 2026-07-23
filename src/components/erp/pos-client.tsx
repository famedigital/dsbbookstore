"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { createPosSale } from "@/lib/erp/actions";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Book, PaymentMethod } from "@/types/erp";

type PosBook = Pick<
  Book,
  "id" | "title" | "price_btn" | "cost_price_btn" | "stock_qty" | "availability_status"
>;

type CartLine = {
  bookId: string;
  title: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  stockQty: number;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_qr", label: "Bank QR" },
  { value: "card", label: "Card" },
  { value: "cod", label: "COD" },
];

export function PosClient({
  books,
  canSeeCost,
}: {
  books: PosBook[];
  canSeeCost: boolean;
}) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }, [books, query]);

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);

  function addToCart(book: PosBook) {
    setSuccessOrder(null);
    setError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.bookId === book.id);
      if (existing) {
        if (existing.qty >= book.stock_qty) return prev;
        return prev.map((l) =>
          l.bookId === book.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      if (book.stock_qty <= 0) return prev;
      return [
        ...prev,
        {
          bookId: book.id,
          title: book.title,
          qty: 1,
          unitPrice: Number(book.price_btn),
          unitCost: Number(book.cost_price_btn),
          stockQty: book.stock_qty,
        },
      ];
    });
  }

  function updateQty(bookId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.bookId !== bookId) return l;
          const next = l.qty + delta;
          if (next <= 0) return null;
          if (next > l.stockQty) return l;
          return { ...l, qty: next };
        })
        .filter(Boolean) as CartLine[]
    );
  }

  function removeLine(bookId: string) {
    setCart((prev) => prev.filter((l) => l.bookId !== bookId));
  }

  async function checkout() {
    if (!cart.length) return;
    setLoading(true);
    setError(null);
    setSuccessOrder(null);
    try {
      const result = await createPosSale({
        items: cart.map((l) => ({
          bookId: l.bookId,
          title: l.title,
          qty: l.qty,
          unitPrice: l.unitPrice,
          unitCost: l.unitCost,
        })),
        paymentMethod,
        customerName: customerName.trim() || undefined,
      });
      setSuccessOrder(result.orderNumber);
      setCart([]);
      setCustomerName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => addToCart(book)}
              disabled={book.stock_qty <= 0}
              className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p className="line-clamp-2 font-medium">{book.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatBtn(book.price_btn)}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                Stock: {book.stock_qty}
              </p>
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No books match your search.</p>
        ) : null}
      </section>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Cart</CardTitle>
          <CardDescription>
            {cart.length ? `${cart.length} line(s)` : "Add books from the catalogue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successOrder ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="font-medium text-primary">Sale complete</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Order <span className="font-mono">{successOrder}</span>
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : null}

          <ul className="space-y-3">
            {cart.map((line) => (
              <li
                key={line.bookId}
                className="flex items-start justify-between gap-2 border-b border-border/60 pb-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatBtn(line.unitPrice)} each
                    {canSeeCost ? (
                      <span className="ml-2">
                        · cost {formatBtn(line.unitCost)}
                      </span>
                    ) : null}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="size-7 p-0"
                      onClick={() => updateQty(line.bookId, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="size-7 p-0"
                      onClick={() => updateQty(line.bookId, 1)}
                      disabled={line.qty >= line.stockQty}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-medium">
                    {formatBtn(line.qty * line.unitPrice)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground size-7 p-0"
                    onClick={() => removeLine(line.bookId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {cart.length === 0 ? (
            <p className="text-muted-foreground text-sm">Cart is empty.</p>
          ) : null}

          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <Badge variant="secondary" className="text-sm">
                {formatBtn(subtotal)}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment method</Label>
              <select
                id="payment_method"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer name (optional)</Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in"
              />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={!cart.length || loading}
              onClick={checkout}
            >
              {loading ? "Processing…" : "Complete sale"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
