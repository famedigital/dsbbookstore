"use client";

import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { PaymentMethod } from "@/types/erp";

export type CounterRecentLine = {
  title: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type CounterRecentSale = {
  id: string;
  orderNumber: string;
  total: number;
  paymentMethod: PaymentMethod | string;
  customerName: string;
  createdAt: string;
  lines: CounterRecentLine[];
};

function payLabel(method: string) {
  if (method === "bank_qr") return "Bank QR";
  if (method === "card") return "Card";
  if (method === "cash") return "Cash";
  return method.replace(/_/g, " ");
}

function timeLabel(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-BT", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export function CounterRecentSheet({
  recent,
  selectedId,
  shopName,
  onSelect,
  onClose,
  onReprint,
}: {
  recent: CounterRecentSale[];
  selectedId: string | null;
  shopName: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onReprint: (sale: CounterRecentSale) => void;
}) {
  const [viewing, setViewing] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = recent.find((row) => row.id === selectedId) ?? null;

  function move(delta: number) {
    if (!recent.length) return;
    const i = recent.findIndex((row) => row.id === selectedId);
    const from = i < 0 ? 0 : i;
    const next = recent[Math.min(recent.length - 1, Math.max(0, from + delta))];
    if (next) onSelect(next.id);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (viewing) setViewing(false);
        else onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        move(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        move(-1);
        return;
      }
      if (e.key === "Enter" && selected && !viewing) {
        e.preventDefault();
        e.stopPropagation();
        setViewing(true);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  useEffect(() => {
    if (viewing || !selectedId) return;
    const row = listRef.current?.querySelector(
      `[data-recent-id="${selectedId}"]`
    );
    if (row instanceof HTMLElement) row.scrollIntoView({ block: "nearest" });
  }, [selectedId, viewing]);

  return (
    <div
      role="dialog"
      aria-label="Recent transactions"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/35"
      onClick={onClose}
    >
      <div
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#faf6ef] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between bg-[#14110f] px-4 py-3 text-[#f7f2e8]">
          <div>
            <p className="text-[0.65rem] tracking-[0.16em] text-[#c9a227] uppercase">
              Recent
            </p>
            <p className="mt-1 font-heading text-xl tracking-tight">
              {viewing && selected
                ? selected.orderNumber
                : "Recent transactions"}
            </p>
            <p className="mt-1 text-[0.7rem] text-white/50">
              {viewing
                ? "↑↓ other · Esc back"
                : "Page Up · ↑↓ select · Enter view · Esc close"}
            </p>
          </div>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => (viewing ? setViewing(false) : onClose())}
          >
            Esc
          </button>
        </header>

        {viewing && selected ? (
          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            <div className="mx-auto max-w-[20rem] border border-[#d6cdb8] bg-white px-3 py-4 text-[#14110f]">
              <p className="text-center font-heading text-lg">{shopName}</p>
              <p className="mt-1 text-center text-[0.7rem] text-[#6a6358]">
                Retail receipt
              </p>
              <hr className="my-3 border-[#d6cdb8]" />
              <p className="flex justify-between text-xs">
                <span>Order</span>
                <span className="font-mono">{selected.orderNumber}</span>
              </p>
              <p className="mt-1 flex justify-between text-xs">
                <span>Date</span>
                <span>{timeLabel(selected.createdAt)}</span>
              </p>
              <p className="mt-1 flex justify-between text-xs">
                <span>Party</span>
                <span>{selected.customerName || "Walk-in"}</span>
              </p>
              <hr className="my-3 border-[#d6cdb8]" />
              <ul className="space-y-2 text-sm">
                {selected.lines.map((line, i) => (
                  <li key={`${line.title}-${i}`} className="flex gap-2">
                    <span className="min-w-0 flex-1">{line.title}</span>
                    <span className="tabular-nums text-[#6a6358]">
                      ×{line.qty}
                    </span>
                    <span className="w-16 text-right tabular-nums">
                      {formatBtn(line.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <hr className="my-3 border-[#14110f]" />
              <p className="flex justify-between font-semibold">
                <span>TOTAL</span>
                <span className="tabular-nums">{formatBtn(selected.total)}</span>
              </p>
              <p className="mt-1 flex justify-between text-xs text-[#6a6358]">
                <span>Paid</span>
                <span>{payLabel(String(selected.paymentMethod))}</span>
              </p>
            </div>
          </div>
        ) : (
          <ul ref={listRef} className="min-h-0 flex-1 overflow-auto">
            {recent.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-[#6a6358]">
                No Counter sales yet today.
              </li>
            ) : (
              recent.map((row) => {
                const active = row.id === selectedId;
                return (
                  <li key={row.id} className="border-b border-[#e5dccb]">
                    <button
                      type="button"
                      data-recent-id={row.id}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm",
                        active ? "bg-[#5c241c]/10 text-[#14110f]" : "text-[#6a6358]"
                      )}
                      onClick={() => {
                        onSelect(row.id);
                        setViewing(true);
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block font-medium text-[#14110f]">
                          {row.orderNumber}
                          <span className="ml-2 font-normal text-[#6a6358]">
                            · {row.customerName || "Walk-in"}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums">
                          {payLabel(String(row.paymentMethod))} ·{" "}
                          {timeLabel(row.createdAt)}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums font-semibold text-[#5c241c]">
                        {formatBtn(row.total)}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-[#d6cdb8] px-4 py-3">
          {viewing ? (
            <Button
              type="button"
              variant="outline"
              className="border-[#d6cdb8]"
              onClick={() => setViewing(false)}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border-[#d6cdb8]"
              disabled={!selected}
              onClick={() => setViewing(true)}
            >
              View
            </Button>
          )}
          <Button
            type="button"
            className="bg-[#5c241c] hover:bg-[#3f1812]"
            disabled={!selected}
            onClick={() => selected && onReprint(selected)}
          >
            Reprint
          </Button>
        </div>
      </div>
    </div>
  );
}
