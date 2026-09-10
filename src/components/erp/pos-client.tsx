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
import { cn } from "@/lib/utils";

type PosItem = Pick<
  Book,
  | "id"
  | "title"
  | "price_btn"
  | "cost_price_btn"
  | "stock_qty"
  | "availability_status"
  | "format"
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

const COUNTER_PAYMENTS = PAYMENT_METHODS.filter((m) => m.value !== "cod");

export function PosClient({
  books,
  canSeeCost,
  variant = "office",
}: {
  books: PosItem[];
  canSeeCost: boolean;
  variant?: "office" | "counter";
}) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCounter = variant === "counter";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.format ?? "").toLowerCase().includes(q)
    );
  }, [books, query]);

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);

  function addToCart(item: PosItem) {
    setSuccessOrder(null);
    setError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.bookId === item.id);
      if (existing) {
        if (existing.qty >= item.stock_qty) return prev;
        return prev.map((l) =>
          l.bookId === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      if (item.stock_qty <= 0) return prev;
      return [
        ...prev,
        {
          bookId: item.id,
          title: item.title,
          qty: 1,
          unitPrice: Number(item.price_btn),
          unitCost: Number(item.cost_price_btn),
          stockQty: item.stock_qty,
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

  function clearCart() {
    setCart([]);
    setSuccessOrder(null);
    setError(null);
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

  if (isCounter) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        {/* Catalog picker */}
        <div className="shrink-0 space-y-2 border-b border-border p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search books, pens, stationery…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 rounded-md pl-9 text-base"
              autoFocus
            />
          </div>
          <div className="flex max-h-[28vh] gap-2 overflow-x-auto pb-1 md:max-h-[32vh] md:flex-wrap md:overflow-y-auto md:overflow-x-hidden">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addToCart(item)}
                disabled={item.stock_qty <= 0}
                className="min-w-[9.5rem] shrink-0 rounded-md border border-border bg-card p-2.5 text-left transition-colors hover:bg-muted/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 md:min-w-0 md:flex-1 md:basis-[calc(25%-0.5rem)]"
              >
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {item.title}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {formatBtn(item.price_btn)}
                </p>
                <p className="text-muted-foreground text-[0.65rem]">
                  {item.stock_qty > 0 ? `${item.stock_qty} left` : "Out"}
                </p>
              </button>
            ))}
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-4 text-sm">No items found.</p>
            ) : null}
          </div>
        </div>

        {/* Ticket — empty initially; scrolls as lines grow */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {successOrder ? (
            <div className="mb-3 rounded-md border border-primary/30 bg-primary/5 p-3">
              <p className="font-medium text-primary">Sale complete</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Order <span className="font-mono">{successOrder}</span>
              </p>
            </div>
          ) : null}
          {error ? (
            <p className="text-destructive mb-3 text-sm">{error}</p>
          ) : null}

          {cart.length === 0 ? (
            <div className="flex h-full min-h-[8rem] flex-col items-center justify-center text-center">
              <p className="text-muted-foreground text-sm">No items yet</p>
              <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                Tap books, pens, stationery, or other stock above to build the
                ticket.
              </p>
            </div>
          ) : (
            <ul className="space-y-0">
              {cart.map((line) => (
                <li
                  key={line.bookId}
                  className="flex items-center justify-between gap-3 border-b border-border/70 py-3"
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
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => updateQty(line.bookId, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-7 text-center text-sm font-medium">
                      {line.qty}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => updateQty(line.bookId, 1)}
                      disabled={line.qty >= line.stockQty}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <span className="w-20 text-right text-sm font-semibold">
                    {formatBtn(line.qty * line.unitPrice)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground size-8 shrink-0 p-0"
                    onClick={() => removeLine(line.bookId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fixed charge footer */}
        <footer className="shrink-0 border-t border-border bg-card px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-3 flex gap-1.5">
            {COUNTER_PAYMENTS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPaymentMethod(m.value)}
                className={cn(
                  "flex-1 rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
                  paymentMethod === m.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">
                Amount
              </p>
              <p className="font-heading text-2xl font-semibold tracking-tight">
                {formatBtn(subtotal)}
              </p>
            </div>
            {cart.length > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            className="h-12 w-full text-base font-semibold tracking-wide"
            disabled={!cart.length || loading}
            onClick={checkout}
          >
            {loading ? "Processing…" : "Charge"}
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
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
          <p className="text-muted-foreground text-sm">No items match your search.</p>
        ) : null}
      </section>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Cart</CardTitle>
          <CardDescription>
            {cart.length
              ? `${cart.length} line(s)`
              : "Add items from the catalogue"}
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
