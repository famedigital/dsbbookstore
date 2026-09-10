"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { History, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { createPosSale } from "@/lib/erp/actions";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Book } from "@/types/erp";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  CounterRecentSheet,
  type CounterRecentSale,
} from "@/components/erp/counter-recent-sheet";
import {
  CounterTenderSheet,
  type TenderResult,
} from "@/components/erp/counter-tender-sheet";

type PosItem = Pick<
  Book,
  | "id"
  | "title"
  | "price_btn"
  | "cost_price_btn"
  | "stock_qty"
  | "availability_status"
  | "format"
  | "isbn_13"
  | "barcode"
  | "product_kind"
>;

type CartLine = {
  bookId: string;
  title: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  stockQty: number;
};

export function CounterTill({
  items,
  canSeeCost,
  initialRecent = [],
  shopName = "DSB Books",
  bankQrImageUrl = null,
}: {
  items: PosItem[];
  canSeeCost: boolean;
  initialRecent?: CounterRecentSale[];
  shopName?: string;
  bankQrImageUrl?: string | null;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "Empty ticket · Alt+L items · Alt+S tender · PgUp recent"
  );

  const [picker, setPicker] = useState(false);
  const [pickQ, setPickQ] = useState("");
  const [pickAt, setPickAt] = useState(0);
  const pickRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const [scan, setScan] = useState("");

  const [tenderOpen, setTenderOpen] = useState(false);

  const [recent, setRecent] = useState<CounterRecentSale[]>(initialRecent);
  const [recentOpen, setRecentOpen] = useState(false);
  const [recentId, setRecentId] = useState<string | null>(
    initialRecent[0]?.id ?? null
  );
  const [printSale, setPrintSale] = useState<CounterRecentSale | null>(null);

  const filteredItems = useMemo(() => {
    const q = pickQ.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.isbn_13 ?? "").toLowerCase().includes(q) ||
        (i.barcode ?? "").toLowerCase().includes(q) ||
        (i.format ?? "").toLowerCase().includes(q) ||
        (i.product_kind ?? "").toLowerCase().includes(q)
    );
  }, [items, pickQ]);

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const qtyCount = cart.reduce((sum, line) => sum + line.qty, 0);

  function openPicker() {
    setTenderOpen(false);
    setPickQ("");
    setPickAt(0);
    setPicker(true);
    window.setTimeout(() => pickRef.current?.focus(), 0);
  }

  function closePicker() {
    setPicker(false);
    window.setTimeout(() => scanRef.current?.focus(), 0);
  }

  function openTender() {
    if (!cart.length || loading) return;
    setPicker(false);
    setRecentOpen(false);
    setTenderOpen(true);
  }

  function closeTender() {
    setTenderOpen(false);
    window.setTimeout(() => scanRef.current?.focus(), 0);
  }

  function addItem(item: PosItem) {
    setSuccessOrder(null);
    setError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.bookId === item.id);
      if (existing) {
        if (existing.qty >= item.stock_qty) {
          setStatus(`Max stock for ${item.title}`);
          return prev;
        }
        const next = prev.map((l) =>
          l.bookId === item.id ? { ...l, qty: l.qty + 1 } : l
        );
        setSelected(next.findIndex((l) => l.bookId === item.id));
        return next;
      }
      if (item.stock_qty <= 0) {
        setStatus("Out of stock");
        return prev;
      }
      const next = [
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
      setSelected(next.length - 1);
      return next;
    });
    setStatus(`Added · ${item.title}`);
  }

  function takePick(item: PosItem) {
    addItem(item);
    closePicker();
  }

  function updateQty(index: number, qty: number) {
    setCart((prev) =>
      prev
        .map((l, i) => {
          if (i !== index) return l;
          const next = Math.min(l.stockQty, Math.max(0, qty));
          if (next <= 0) return null;
          return { ...l, qty: next };
        })
        .filter(Boolean) as CartLine[]
    );
  }

  function removeLine(index: number) {
    setCart((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setSelected((s) => Math.max(0, Math.min(s, next.length - 1)));
      return next;
    });
  }

  function clearCart() {
    setCart([]);
    setSelected(0);
    setSuccessOrder(null);
    setError(null);
    setStatus("Empty ticket · Alt+L items · Alt+S tender · PgUp recent");
  }

  function openRecent() {
    setPicker(false);
    setTenderOpen(false);
    setRecentId((id) => id ?? recent[0]?.id ?? null);
    setRecentOpen(true);
  }

  function closeRecent() {
    setRecentOpen(false);
    window.setTimeout(() => scanRef.current?.focus(), 0);
  }

  function reprintSale(sale: CounterRecentSale) {
    setPrintSale(sale);
    setStatus(`Reprint ${sale.orderNumber}`);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrintSale(null), 400);
    }, 40);
  }

  function tryScan(code: string) {
    const raw = code.trim().toLowerCase();
    if (!raw) return;
    const exact =
      items.find((i) => (i.isbn_13 ?? "").toLowerCase() === raw) ||
      items.find((i) => (i.barcode ?? "").toLowerCase() === raw) ||
      items.find((i) => i.title.toLowerCase() === raw);
    if (exact) {
      addItem(exact);
      setScan("");
      return;
    }
    const hits = items.filter(
      (i) =>
        i.title.toLowerCase().includes(raw) ||
        (i.isbn_13 ?? "").toLowerCase().includes(raw) ||
        (i.barcode ?? "").toLowerCase().includes(raw)
    );
    if (hits.length === 1) {
      addItem(hits[0]);
      setScan("");
      return;
    }
    setPickQ(code.trim());
    setPickAt(0);
    setPicker(true);
    setScan("");
    window.setTimeout(() => pickRef.current?.focus(), 0);
  }

  async function checkout(pay: TenderResult) {
    if (!cart.length) return;
    setLoading(true);
    setError(null);
    setSuccessOrder(null);
    const soldLines = cart.map((l) => ({
      bookId: l.bookId,
      title: l.title,
      qty: l.qty,
      unitPrice: l.unitPrice,
      unitCost: l.unitCost,
      lineTotal: l.qty * l.unitPrice,
    }));
    const soldTotal = soldLines.reduce((s, l) => s + l.lineTotal, 0);
    try {
      const result = await createPosSale({
        items: soldLines.map((l) => ({
          bookId: l.bookId,
          title: l.title,
          qty: l.qty,
          unitPrice: l.unitPrice,
          unitCost: l.unitCost,
        })),
        paymentMethod: pay.paymentMethod,
        tendered: pay.tendered,
        paymentReference: pay.paymentReference,
      });
      const sale: CounterRecentSale = {
        id: result.orderId,
        orderNumber: result.orderNumber,
        total: soldTotal,
        paymentMethod: pay.paymentMethod,
        customerName: "Walk-in",
        createdAt: new Date().toISOString(),
        lines: soldLines.map((l) => ({
          title: l.title,
          qty: l.qty,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
        })),
      };
      setRecent((prev) => [sale, ...prev].slice(0, 40));
      setRecentId(sale.id);
      setSuccessOrder(result.orderNumber);
      setCart([]);
      setSelected(0);
      setTenderOpen(false);
      setStatus(`Sale ${result.orderNumber} · PgUp recent · Alt+L next`);
      if (pay.print) {
        reprintSale(sale);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (recentOpen || tenderOpen) return;

      // Capture Alt+L for items picker only — never let it bubble to ERP chrome.
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyL") {
        e.preventDefault();
        e.stopPropagation();
        setPicker((open) => {
          if (open) {
            window.setTimeout(() => scanRef.current?.focus(), 0);
            return false;
          }
          setPickQ("");
          setPickAt(0);
          window.setTimeout(() => pickRef.current?.focus(), 0);
          return true;
        });
        return;
      }

      // Alt+S opens tender (same as Charge).
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyS") {
        e.preventDefault();
        e.stopPropagation();
        openTender();
        return;
      }

      if (e.key === "PageUp") {
        e.preventDefault();
        e.stopPropagation();
        openRecent();
        return;
      }

      if (picker) {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          closePicker();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setPickAt((i) => Math.min(filteredItems.length - 1, i + 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setPickAt((i) => Math.max(0, i - 1));
          return;
        }
        if (e.key === "Enter" && filteredItems[pickAt]) {
          e.preventDefault();
          takePick(filteredItems[pickAt]);
          return;
        }
        return;
      }

      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing) return;

      if (e.key === "ArrowDown" && cart.length) {
        e.preventDefault();
        setSelected((i) => Math.min(cart.length - 1, i + 1));
      }
      if (e.key === "ArrowUp" && cart.length) {
        e.preventDefault();
        setSelected((i) => Math.max(0, i - 1));
      }
      if (e.key === "Delete" && cart.length) {
        e.preventDefault();
        removeLine(selected);
      }
      if (e.key === "F10") {
        e.preventDefault();
        openTender();
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    picker,
    tenderOpen,
    recentOpen,
    filteredItems,
    pickAt,
    cart.length,
    selected,
    loading,
    recent,
  ]);

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#f4f0e8]">
      {/* Scan / find bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#d6cdb8] bg-[#faf6ef] px-3 py-2">
        <Search className="size-4 shrink-0 text-[#6a6358]" />
        <Input
          ref={scanRef}
          value={scan}
          onChange={(e) => setScan(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tryScan(scan);
            }
            if (e.altKey && e.code === "KeyL") {
              e.preventDefault();
              openPicker();
            }
          }}
          placeholder="Scan or type · Enter add · Alt+L items"
          className="h-10 flex-1 border-[#d6cdb8] bg-white text-base shadow-none focus-visible:border-[#9c7a3e] focus-visible:ring-[#9c7a3e]/35"
          aria-label="Scan or search"
        />
        <Button
          type="button"
          variant="outline"
          className="hidden shrink-0 border-[#d6cdb8] sm:inline-flex"
          onClick={openRecent}
        >
          <History className="size-4" />
          Recent
          <kbd className="text-muted-foreground ml-1.5 text-[0.65rem]">PgUp</kbd>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hidden shrink-0 border-[#d6cdb8] sm:inline-flex"
          onClick={openPicker}
        >
          Items
          <kbd className="text-muted-foreground ml-2 text-[0.65rem]">Alt+L</kbd>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 border-[#d6cdb8] sm:hidden"
          aria-label="Recent transactions"
          onClick={openRecent}
        >
          <History className="size-4" />
        </Button>
      </div>

      {/* Ticket grid */}
      <div className="min-h-0 flex-1 overflow-auto">
        {successOrder ? (
          <div className="mx-3 mt-3 rounded-md border border-[#5c241c]/30 bg-[#5c241c]/5 px-3 py-2 text-sm">
            Sale complete · <span className="font-mono">{successOrder}</span>
          </div>
        ) : null}
        {error ? (
          <p className="text-destructive mx-3 mt-3 text-sm">{error}</p>
        ) : null}

        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[#ebe4d6] text-[0.7rem] tracking-wide text-[#6a6358] uppercase">
            <tr>
              <th className="w-10 px-3 py-2 text-left font-semibold">#</th>
              <th className="px-3 py-2 text-left font-semibold">Item</th>
              <th className="hidden w-24 px-3 py-2 text-right font-semibold sm:table-cell">
                Stock
              </th>
              <th className="w-28 px-3 py-2 text-right font-semibold">Qty</th>
              <th className="w-24 px-3 py-2 text-right font-semibold">Rate</th>
              <th className="w-28 px-3 py-2 text-right font-semibold">Amount</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-16 text-center">
                  <p className="font-heading text-lg text-[#14110f]">Empty ticket</p>
                  <p className="mt-2 text-sm text-[#6a6358]">
                    Press{" "}
                    <kbd className="rounded border border-[#d6cdb8] bg-white px-1.5 py-0.5 text-xs">
                      Alt+L
                    </kbd>{" "}
                    for books, stationery &amp; more — then{" "}
                    <kbd className="rounded border border-[#d6cdb8] bg-white px-1.5 py-0.5 text-xs">
                      Alt+S
                    </kbd>{" "}
                    to tender.
                  </p>
                </td>
              </tr>
            ) : (
              cart.map((line, i) => (
                <tr
                  key={line.bookId}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "border-b border-[#e5dccb] cursor-pointer",
                    i === selected ? "bg-[#5c241c]/8" : "hover:bg-white/70"
                  )}
                >
                  <td className="px-3 py-2.5 tabular-nums text-[#6a6358]">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-[#14110f]">{line.title}</p>
                    {canSeeCost ? (
                      <p className="text-[0.7rem] text-[#6a6358]">
                        cost {formatBtn(line.unitCost)}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right tabular-nums text-[#6a6358] sm:table-cell">
                    {line.stockQty}
                  </td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="size-7 border-[#d6cdb8] p-0"
                        onClick={() => updateQty(i, line.qty - 1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center tabular-nums font-medium">
                        {line.qty}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="size-7 border-[#d6cdb8] p-0"
                        onClick={() => updateQty(i, line.qty + 1)}
                        disabled={line.qty >= line.stockQty}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatBtn(line.unitPrice)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {formatBtn(line.qty * line.unitPrice)}
                  </td>
                  <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-[#6a6358]"
                      onClick={() => removeLine(i)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="shrink-0 border-t border-[#e5dccb] bg-[#ebe4d6] px-3 py-1.5 text-[0.7rem] text-[#6a6358]">
        {status}
        {cart.length ? ` · ${cart.length} lines · ${qtyCount} qty` : ""}
      </p>

      {/* Fixed charge footer — mop lives in tender modal */}
      <footer className="shrink-0 border-t border-[#d6cdb8] bg-[#14110f] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[#f7f2e8]">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.16em] text-white/45 uppercase">
              Amount
            </p>
            <p className="font-heading text-3xl tracking-tight">
              {formatBtn(subtotal)}
            </p>
          </div>
          <div className="flex gap-2">
            {cart.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="text-white/60 hover:bg-white/10 hover:text-white"
                onClick={clearCart}
              >
                Clear
              </Button>
            ) : null}
            <Button
              type="button"
              className="h-12 min-w-[9rem] bg-[#5c241c] text-base font-semibold tracking-wide hover:bg-[#3f1812]"
              disabled={!cart.length || loading}
              onClick={openTender}
            >
              Charge
              <kbd className="ml-2 text-[0.65rem] opacity-70">Alt+S</kbd>
            </Button>
          </div>
        </div>
      </footer>

      {/* Alt+L items list (POS-style picker) */}
      {picker ? (
        <div
          role="dialog"
          aria-label="Items"
          className="fixed inset-0 z-50 bg-black/35"
          onClick={closePicker}
        >
          <div
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#faf6ef] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#14110f] px-4 py-3 text-[#f7f2e8]">
              <div>
                <p className="font-heading text-xl tracking-tight">Items</p>
                <p className="text-[0.65rem] tracking-wide text-white/45 uppercase">
                  Books · stationery · other stock
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-sm p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={closePicker}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-[#d6cdb8] px-4 py-3">
              <Input
                ref={pickRef}
                autoFocus
                aria-label="Find item"
                placeholder="Name or code"
                value={pickQ}
                onChange={(e) => {
                  setPickQ(e.target.value);
                  setPickAt(0);
                }}
                className="h-11 border-[#d6cdb8] bg-white"
              />
            </div>
            <ul className="min-h-0 flex-1 overflow-auto">
              {filteredItems.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-baseline gap-3 px-4 py-2.5 text-left text-sm",
                      i === pickAt
                        ? "bg-[#5c241c]/12"
                        : "hover:bg-[#ebe4d6]/80"
                    )}
                    onClick={() => takePick(item)}
                    onMouseEnter={() => setPickAt(i)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-[#14110f]">{item.title}</span>
                      <span className="mt-0.5 block text-[11px] text-[#6a6358]">
                        {(item.product_kind || "book") +
                          " · " +
                          (item.isbn_13 || item.barcode || item.format || "SKU")}{" "}
                        · {item.stock_qty} on hand
                      </span>
                    </span>
                    <span className="tabular-nums font-semibold text-[#5c241c]">
                      {formatBtn(item.price_btn)}
                    </span>
                  </button>
                </li>
              ))}
              {filteredItems.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-[#6a6358]">
                  No items match
                </li>
              ) : null}
            </ul>
            <div className="flex items-center justify-between border-t border-[#d6cdb8] px-4 py-2 text-xs text-[#6a6358]">
              <span>↑↓ select · Enter add · Esc close</span>
              <Link href="/erp" className="font-medium text-[#5c241c] hover:underline">
                Office →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {tenderOpen ? (
        <CounterTenderSheet
          total={subtotal}
          bankQrImageUrl={bankQrImageUrl}
          busy={loading}
          onClose={closeTender}
          onSettle={(pay) => void checkout(pay)}
        />
      ) : null}

      {recentOpen ? (
        <CounterRecentSheet
          recent={recent}
          selectedId={recentId}
          shopName={shopName}
          onSelect={setRecentId}
          onClose={closeRecent}
          onReprint={(sale) => {
            closeRecent();
            reprintSale(sale);
          }}
        />
      ) : null}

      {printSale ? (
        <div id="counter-receipt" className="counter-receipt-print">
          <p className="text-center font-heading text-lg">{shopName}</p>
          <p className="mt-1 text-center text-xs">Retail receipt</p>
          <hr className="my-2" />
          <p className="flex justify-between text-xs">
            <span>Order</span>
            <span>{printSale.orderNumber}</span>
          </p>
          <p className="flex justify-between text-xs">
            <span>Party</span>
            <span>{printSale.customerName || "Walk-in"}</span>
          </p>
          <hr className="my-2" />
          {printSale.lines.map((line, i) => (
            <p key={`${line.title}-${i}`} className="flex gap-2 text-sm">
              <span className="min-w-0 flex-1">{line.title}</span>
              <span>×{line.qty}</span>
              <span className="w-16 text-right">{formatBtn(line.lineTotal)}</span>
            </p>
          ))}
          <hr className="my-2 border-black" />
          <p className="flex justify-between font-semibold">
            <span>TOTAL</span>
            <span>{formatBtn(printSale.total)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
