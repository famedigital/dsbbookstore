"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/lib/erp/actions";
import type { ProductSearchHit } from "@/lib/erp/product-search";
import { ProductPicker } from "@/components/erp/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StockMovementType } from "@/types/erp";

const ADJUSTMENT_TYPES: StockMovementType[] = [
  "adjustment",
  "damage",
  "return_in",
  "return_out",
];

export function InventoryAdjustForm() {
  const [picked, setPicked] = useState<ProductSearchHit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setOk(null);
    if (!picked) {
      setError("Pick a product first");
      return;
    }
    formData.set("book_id", picked.id);
    start(async () => {
      try {
        await adjustStock(formData);
        setOk(`Recorded for ${picked.title}`);
        setPicked(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Adjust failed");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>Product</Label>
        <ProductPicker
          onPick={(hit) => {
            setPicked(hit);
            setOk(null);
          }}
        />
        {picked ? (
          <p className="text-muted-foreground text-xs">
            Selected: <span className="text-foreground font-medium">{picked.title}</span>
            {" · "}Closing {picked.stock_qty}
            {picked.barcode ? ` · ${picked.barcode}` : ""}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="qty_delta">Quantity change</Label>
        <Input
          id="qty_delta"
          name="qty_delta"
          type="number"
          required
          placeholder="e.g. -2 or 5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="movement_type">Movement type</Label>
        <select
          id="movement_type"
          name="movement_type"
          required
          className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
          defaultValue="adjustment"
        >
          {ADJUSTMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" name="reason" required rows={2} />
      </div>
      {error ? (
        <p className="text-destructive text-sm sm:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? <p className="text-primary text-sm sm:col-span-2">{ok}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending || !picked}>
          {pending ? "Saving…" : "Record movement"}
        </Button>
      </div>
    </form>
  );
}
