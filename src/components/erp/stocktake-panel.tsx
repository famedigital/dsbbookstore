"use client";

import { useMemo, useState, useTransition } from "react";
import { commitStocktake } from "@/lib/erp/actions";
import type { ProductSearchHit } from "@/lib/erp/product-search";
import { ProductPicker } from "@/components/erp/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

type CountLine = {
  bookId: string;
  title: string;
  barcode: string | null;
  systemQty: number;
  physicalQty: number;
};

export function StocktakePanel() {
  const [lines, setLines] = useState<CountLine[]>([]);
  const [note, setNote] = useState("Stock count");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function add(hit: ProductSearchHit) {
    setOk(null);
    setLines((prev) => {
      if (prev.some((l) => l.bookId === hit.id)) return prev;
      return [
        ...prev,
        {
          bookId: hit.id,
          title: hit.title,
          barcode: hit.barcode || hit.isbn_13,
          systemQty: hit.stock_qty,
          physicalQty: hit.stock_qty,
        },
      ];
    });
  }

  const variances = useMemo(
    () =>
      lines.filter((l) => Math.round(l.physicalQty) !== Math.round(l.systemQty)),
    [lines]
  );

  function commit() {
    setError(null);
    setOk(null);
    if (!lines.length) {
      setError("Add products to count");
      return;
    }
    start(async () => {
      try {
        const result = await commitStocktake({
          note,
          lines: lines.map((l) => ({
            bookId: l.bookId,
            physicalQty: l.physicalQty,
            systemQty: l.systemQty,
          })),
        });
        setOk(
          result.posted
            ? `Posted ${result.posted} count adjustment(s)`
            : "No variances — nothing posted"
        );
        setLines([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Stocktake failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Find product</Label>
        <ProductPicker
          onPick={add}
          placeholder="Scan or search to add to count…"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 font-semibold">Product</th>
              <th className="px-3 py-2 text-right font-semibold">System</th>
              <th className="px-3 py-2 text-right font-semibold">Physical</th>
              <th className="px-3 py-2 text-right font-semibold">Delta</th>
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
                  Add titles, enter physical Closing, then commit variances.
                </td>
              </tr>
            ) : (
              lines.map((l) => {
                const delta =
                  Math.round(l.physicalQty) - Math.round(l.systemQty);
                return (
                  <tr key={l.bookId} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="font-medium">{l.title}</div>
                      <div className="text-muted-foreground font-mono text-xs">
                        {l.barcode || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {l.systemQty}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        min={0}
                        value={l.physicalQty}
                        onChange={(e) => {
                          const n = Math.max(0, Number(e.target.value) || 0);
                          setLines((prev) =>
                            prev.map((x) =>
                              x.bookId === l.bookId
                                ? { ...x, physicalQty: n }
                                : x
                            )
                          );
                        }}
                        className="ml-auto h-8 w-24 text-right"
                      />
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums font-medium ${
                        delta < 0
                          ? "text-destructive"
                          : delta > 0
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter((x) => x.bookId !== l.bookId)
                          )
                        }
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stocktake_note">Reason</Label>
        <Input
          id="stocktake_note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? <p className="text-sm text-primary">{ok}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {lines.length} counted · {variances.length} variance(s)
        </p>
        <Button
          type="button"
          disabled={pending || !lines.length}
          onClick={commit}
        >
          {pending ? "Posting…" : "Commit stocktake"}
        </Button>
      </div>
    </div>
  );
}
