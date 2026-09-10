"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createPurchaseOrder } from "@/lib/erp/actions";
import type { ProductSearchHit } from "@/lib/erp/product-search";
import { formatBtn } from "@/lib/erp/format";
import { ProductPicker } from "@/components/erp/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Supplier } from "@/types/erp";

type DraftLine = {
  key: string;
  book_id: string;
  title: string;
  barcode: string | null;
  qty_ordered: number;
  unit_cost_btn: number;
};

export function PurchaseBillForm({ suppliers }: { suppliers: Supplier[] }) {
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function addLine(hit: ProductSearchHit) {
    setLines((prev) => {
      const existing = prev.find((l) => l.book_id === hit.id);
      if (existing) {
        return prev.map((l) =>
          l.book_id === hit.id
            ? { ...l, qty_ordered: l.qty_ordered + 1 }
            : l
        );
      }
      return [
        ...prev,
        {
          key: `${hit.id}-${Date.now()}`,
          book_id: hit.id,
          title: hit.title,
          barcode: hit.barcode || hit.isbn_13,
          qty_ordered: 1,
          unit_cost_btn: Number(hit.cost_price_btn) || 0,
        },
      ];
    });
  }

  function submit(formData: FormData) {
    setError(null);
    if (!lines.length) {
      setError("Add at least one product line");
      return;
    }
    formData.set(
      "lines",
      JSON.stringify(
        lines.map((l) => ({
          book_id: l.book_id,
          qty_ordered: l.qty_ordered,
          unit_cost_btn: l.unit_cost_btn,
        }))
      )
    );
    start(async () => {
      try {
        await createPurchaseOrder(formData);
        setLines([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create bill");
      }
    });
  }

  const total = lines.reduce(
    (s, l) => s + l.qty_ordered * l.unit_cost_btn,
    0
  );

  return (
    <form action={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplier_id">Supplier</Label>
          <select
            id="supplier_id"
            name="supplier_id"
            className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
          >
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_ref">Invoice / bill #</Label>
          <Input id="invoice_ref" name="invoice_ref" placeholder="Optional" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Add product</Label>
        <ProductPicker onPick={addLine} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 font-semibold">Product</th>
              <th className="px-3 py-2 font-semibold text-right">Qty</th>
              <th className="px-3 py-2 font-semibold text-right">Pur Rate</th>
              <th className="px-3 py-2 font-semibold text-right">Line</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-3 py-6 text-center"
                >
                  Search and add lines — multi-line bills like POS.
                </td>
              </tr>
            ) : (
              lines.map((l) => (
                <tr key={l.key} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-medium">{l.title}</div>
                    <div className="text-muted-foreground font-mono text-xs">
                      {l.barcode || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      type="number"
                      min={1}
                      value={l.qty_ordered}
                      onChange={(e) => {
                        const n = Math.max(1, Number(e.target.value) || 1);
                        setLines((prev) =>
                          prev.map((x) =>
                            x.key === l.key ? { ...x, qty_ordered: n } : x
                          )
                        );
                      }}
                      className="ml-auto h-8 w-20 text-right"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={l.unit_cost_btn}
                      onChange={(e) => {
                        const n = Number(e.target.value) || 0;
                        setLines((prev) =>
                          prev.map((x) =>
                            x.key === l.key ? { ...x, unit_cost_btn: n } : x
                          )
                        );
                      }}
                      className="ml-auto h-8 w-28 text-right"
                    />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatBtn(l.qty_ordered * l.unit_cost_btn)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setLines((prev) => prev.filter((x) => x.key !== l.key))
                      }
                      aria-label="Remove line"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {lines.length} line(s) · {formatBtn(total)}
        </p>
        <Button type="submit" disabled={pending || !lines.length}>
          <Plus className="mr-1.5 size-4" />
          {pending ? "Saving…" : "Create bill"}
        </Button>
      </div>
    </form>
  );
}
