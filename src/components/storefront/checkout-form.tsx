"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/components/storefront/cart-provider";
import { placeOnlineOrder } from "@/lib/commerce/actions";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ShippingZone } from "@/types/erp";

type CheckoutBook = {
  id: string;
  title: string;
  price_btn: number;
  stock_qty: number;
};

function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function CheckoutForm({
  books,
  zones,
  stripeEnabled,
  btnPerUsd,
  cancelled,
}: {
  books: CheckoutBook[];
  zones: ShippingZone[];
  stripeEnabled: boolean;
  btnPerUsd: number;
  cancelled?: boolean;
}) {
  const { lines, ready } = useCart();
  const [zoneCode, setZoneCode] = useState(zones[0]?.code ?? "pickup");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "transfer" | "card">(
    "cod"
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const effectivePayment =
    zoneCode === "international" ? "card" : paymentMethod;

  const bookMap = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books]
  );

  const rows = lines
    .map((line) => {
      const book = bookMap.get(line.bookId);
      if (!book) return null;
      return { line, book };
    })
    .filter(Boolean) as {
    line: { bookId: string; qty: number };
    book: CheckoutBook;
  }[];

  const zone = zones.find((z) => z.code === zoneCode);
  const subtotal = rows.reduce(
    (s, r) => s + r.book.price_btn * r.line.qty,
    0
  );
  const shipping = Number(zone?.fee_btn ?? 0);
  const total = subtotal + shipping;
  const usdApprox = btnPerUsd > 0 ? total / btnPerUsd : 0;

  if (!ready) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!rows.length) {
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
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("cart_json", JSON.stringify(lines));
        fd.set("zone_code", zoneCode);
        fd.set("payment_method", effectivePayment);
        startTransition(async () => {
          try {
            await placeOnlineOrder(fd);
          } catch (err) {
            if (isNextRedirectError(err)) throw err;
            setError(err instanceof Error ? err.message : "Checkout failed");
          }
        });
      }}
    >
      {cancelled ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Card payment was cancelled. You can try again or choose another method.
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <fieldset className="space-y-3">
        <legend className="font-heading text-lg font-medium">Contact</legend>
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-heading text-lg font-medium">Fulfilment</legend>
        {zones.map((z) => (
          <label key={z.id} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="zone_ui"
              className="mt-1"
              checked={zoneCode === z.code}
              onChange={() => {
                setZoneCode(z.code);
                if (z.code === "international") setPaymentMethod("card");
              }}
            />
            <span>
              <span className="font-medium">{z.label}</span>
              <span className="text-muted-foreground">
                {" "}
                — {formatBtn(z.fee_btn)}
              </span>
              {z.notes_md ? (
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {z.notes_md}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </fieldset>

      {zoneCode !== "pickup" ? (
        <fieldset className="space-y-3">
          <legend className="font-heading text-lg font-medium">
            Shipping address
          </legend>
          <div className="space-y-1">
            <Label htmlFor="address_line1">Address line 1</Label>
            <Input
              id="address_line1"
              name="address_line1"
              required={zoneCode === "international"}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input id="address_line2" name="address_line2" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                required={zoneCode === "international"}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" name="postcode" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              defaultValue={zoneCode === "bhutan" ? "Bhutan" : ""}
              required={zoneCode === "international"}
            />
          </div>
        </fieldset>
      ) : null}

      <fieldset className="space-y-3">
        <legend className="font-heading text-lg font-medium">Payment</legend>
        {zoneCode !== "international" ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payment_method_ui"
                checked={effectivePayment === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on delivery / pickup
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payment_method_ui"
                checked={effectivePayment === "transfer"}
                onChange={() => setPaymentMethod("transfer")}
              />
              Bank transfer / QR
            </label>
          </>
        ) : null}
        {stripeEnabled ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payment_method_ui"
              checked={effectivePayment === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            Card (Stripe)
            {zoneCode === "international" ? " — required" : ""}
          </label>
        ) : zoneCode === "international" ? (
          <p className="text-muted-foreground text-sm">
            International card checkout is not enabled. Please{" "}
            <Link href="/enquiry?topic=international" className="underline">
              enquire
            </Link>{" "}
            instead.
          </p>
        ) : null}
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="notes">Order notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <div className="rounded-lg border border-border/80 bg-white/70 p-4 text-sm">
        <ul className="space-y-1">
          {rows.map(({ line, book }) => (
            <li key={book.id} className="flex justify-between gap-4">
              <span>
                {book.title} × {line.qty}
              </span>
              <span>{formatBtn(book.price_btn * line.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-border/60 pt-3">
          <span>Shipping</span>
          <span>{formatBtn(shipping)}</span>
        </p>
        <p className="mt-2 flex justify-between text-base font-medium">
          <span>Total</span>
          <span className="text-primary">{formatBtn(total)}</span>
        </p>
        {effectivePayment === "card" || zoneCode === "international" ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Card charge ≈ USD {usdApprox.toFixed(2)} at {btnPerUsd} BTN/USD
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={
          pending ||
          (zoneCode === "international" && !stripeEnabled) ||
          rows.some((r) => r.line.qty > r.book.stock_qty)
        }
        className="w-full sm:w-auto"
      >
        {pending
          ? "Placing order…"
          : effectivePayment === "card"
            ? "Pay with card"
            : "Place order"}
      </Button>
    </form>
  );
}
