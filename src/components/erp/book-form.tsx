"use client";

import { useMemo, useState } from "react";
import { upsertBook, importProductsCsv } from "@/lib/erp/actions";
import { CoverField } from "@/components/erp/cover-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Book, ProductKind } from "@/types/erp";
import { cn } from "@/lib/utils";

type BookFormProps = {
  book: Book | null;
  showCost: boolean;
};

const KINDS: { value: ProductKind; label: string }[] = [
  { value: "book", label: "Book" },
  { value: "stationery", label: "Stationery" },
  { value: "other", label: "Other" },
];

export function BookForm({ book, showCost }: BookFormProps) {
  const isEdit = Boolean(book);
  const [kind, setKind] = useState<ProductKind>(
    book?.product_kind ?? "book"
  );
  const isBook = kind === "book";

  return (
    <form action={upsertBook} className="grid gap-4 sm:grid-cols-2">
      {book ? <input type="hidden" name="id" value={book.id} /> : null}

      <div className="space-y-2 sm:col-span-2">
        <Label>Product kind</Label>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                kind === k.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="product_kind" value={kind} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="title">{isBook ? "Title" : "Product name"}</Label>
        <Input
          id="title"
          name="title"
          defaultValue={book?.title ?? ""}
          required
        />
      </div>

      {isBook ? (
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            name="subtitle"
            defaultValue={book?.subtitle ?? ""}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="sku_code">SKU code</Label>
          <Input
            id="sku_code"
            name="sku_code"
            defaultValue={book?.sku_code ?? ""}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={book?.slug ?? ""} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={book?.description ?? ""}
        />
      </div>

      {isBook ? (
        <div className="space-y-2">
          <Label htmlFor="isbn_13">ISBN-13</Label>
          <Input
            id="isbn_13"
            name="isbn_13"
            defaultValue={book?.isbn_13 ?? ""}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            name="barcode"
            defaultValue={book?.barcode ?? ""}
          />
        </div>
      )}

      {isBook ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              name="language"
              defaultValue={book?.language ?? "English"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Input
              id="format"
              name="format"
              defaultValue={book?.format ?? "paperback"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publisher_name">Publisher</Label>
            <Input
              id="publisher_name"
              name="publisher_name"
              defaultValue={book?.publisher_name ?? "DSB Publication"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_count">Page count</Label>
            <Input
              id="page_count"
              name="page_count"
              type="number"
              min="0"
              defaultValue={book?.page_count ?? ""}
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="format">Unit / format</Label>
          <Input
            id="format"
            name="format"
            defaultValue={book?.format ?? "unit"}
            placeholder="unit, pack, set…"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="price_btn">Price (BTN)</Label>
        <Input
          id="price_btn"
          name="price_btn"
          type="number"
          min="0"
          step="0.01"
          defaultValue={book?.price_btn ?? 0}
          required
        />
      </div>

      {showCost ? (
        <div className="space-y-2">
          <Label htmlFor="cost_price_btn">Cost price (BTN)</Label>
          <Input
            id="cost_price_btn"
            name="cost_price_btn"
            type="number"
            min="0"
            step="0.01"
            defaultValue={book?.cost_price_btn ?? 0}
          />
        </div>
      ) : null}

      {!isEdit ? (
        <div className="space-y-2">
          <Label htmlFor="stock_qty">Opening stock</Label>
          <Input
            id="stock_qty"
            name="stock_qty"
            type="number"
            min="0"
            defaultValue={0}
          />
        </div>
      ) : null}

      <div className="space-y-2 sm:col-span-2">
        <CoverField defaultValue={book?.cover_public_id} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          name="is_published"
          defaultChecked={book?.is_published ?? false}
          className="size-4 rounded border border-input"
        />
        <Label htmlFor="is_published">Published on storefront</Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          defaultChecked={book?.is_featured ?? false}
          className="size-4 rounded border border-input"
        />
        <Label htmlFor="is_featured">Featured</Label>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">{isEdit ? "Update product" : "Create product"}</Button>
      </div>
    </form>
  );
}

type Row = {
  title: string;
  product_kind: ProductKind;
  barcode: string;
  price_btn: string;
  cost_price_btn: string;
  stock_qty: string;
};

const emptyRow = (): Row => ({
  title: "",
  product_kind: "stationery",
  barcode: "",
  price_btn: "",
  cost_price_btn: "",
  stock_qty: "0",
});

export function ProductAddWorkspace({ showCost }: { showCost: boolean }) {
  const [mode, setMode] = useState<"form" | "table" | "excel">("form");
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [csvText, setCsvText] = useState("");

  const tableCsv = useMemo(() => {
    const header = "title,product_kind,barcode,isbn_13,price_btn,cost_price_btn,stock_qty,is_published";
    const body = rows
      .filter((r) => r.title.trim())
      .map((r) =>
        [
          r.title,
          r.product_kind,
          r.barcode,
          r.product_kind === "book" ? r.barcode : "",
          r.price_btn || "0",
          r.cost_price_btn || "0",
          r.stock_qty || "0",
          "false",
        ].join(",")
      );
    return [header, ...body].join("\n");
  }, [rows]);

  const templateCsv = `title,product_kind,barcode,isbn_13,price_btn,cost_price_btn,stock_qty,is_published,description,format,language,publisher_name
A History of Bhutan,book,,9789993612345,450,200,10,true,Sample book,paperback,English,DSB Publication
Blue Ballpoint Pen,stationery,8901001000012,,25,10,100,true,Pack of pens,unit,,
Gift Bag Large,other,BAG-L,,80,35,20,false,Carry bag,unit,,`;

  function downloadTemplate() {
    const blob = new Blob([templateCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dsb-products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-md border border-border p-0.5 text-sm font-medium">
        {(
          [
            ["form", "Form"],
            ["table", "Table"],
            ["excel", "Upload Excel"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "rounded-sm px-3 py-1.5 transition-colors",
              mode === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "form" ? <BookForm book={null} showCost={showCost} /> : null}

      {mode === "table" ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Quick-add several products, then save all rows at once.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Kind</th>
                  <th className="px-3 py-2 font-semibold">Barcode / ISBN</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                  {showCost ? (
                    <th className="px-3 py-2 font-semibold">Cost</th>
                  ) : null}
                  <th className="px-3 py-2 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.title}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, title: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Product name"
                        className="h-8"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={row.product_kind}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i
                                ? {
                                    ...r,
                                    product_kind: e.target.value as ProductKind,
                                  }
                                : r
                            )
                          )
                        }
                        className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
                      >
                        {KINDS.map((k) => (
                          <option key={k.value} value={k.value}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.barcode}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, barcode: e.target.value } : r
                            )
                          )
                        }
                        className="h-8"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price_btn}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, price_btn: e.target.value } : r
                            )
                          )
                        }
                        className="h-8"
                      />
                    </td>
                    {showCost ? (
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.cost_price_btn}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r, j) =>
                                j === i
                                  ? { ...r, cost_price_btn: e.target.value }
                                  : r
                              )
                            )
                          }
                          className="h-8"
                        />
                      </td>
                    ) : null}
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min="0"
                        value={row.stock_qty}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, stock_qty: e.target.value } : r
                            )
                          )
                        }
                        className="h-8"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
            >
              Add row
            </Button>
            <form action={importProductsCsv}>
              <input type="hidden" name="csv" value={tableCsv} />
              <Button type="submit" disabled={!rows.some((r) => r.title.trim())}>
                Save products
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {mode === "excel" ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Download the CSV template, fill rows in Excel, then paste the file
            contents below (or export as CSV and paste).
          </p>
          <Button type="button" variant="outline" onClick={downloadTemplate}>
            Download template
          </Button>
          <form action={importProductsCsv} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCsvText(await file.text());
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv">CSV content</Label>
              <Textarea
                id="csv"
                name="csv"
                rows={10}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={templateCsv.split("\n").slice(0, 2).join("\n")}
                required
              />
            </div>
            <Button type="submit">Import products</Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
