"use client";

import { useEffect, useState } from "react";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/types/erp";
import { cn } from "@/lib/utils";

export type TenderResult = {
  paymentMethod: PaymentMethod;
  tendered?: number;
  paymentReference?: string;
  print: boolean;
};

const NOTES = [10, 20, 50, 100, 500, 1000];

function roundNu(n: number) {
  return Math.round(n * 100) / 100;
}

export function CounterTenderSheet({
  total,
  bankQrImageUrl,
  busy,
  onClose,
  onSettle,
}: {
  total: number;
  bankQrImageUrl?: string | null;
  busy?: boolean;
  onClose: () => void;
  onSettle: (pay: TenderResult) => void;
}) {
  const [mode, setMode] = useState<"cash" | "bank_qr" | "card">("cash");
  const [tendered, setTendered] = useState(total);
  const [cashDraft, setCashDraft] = useState(String(total));
  const [reference, setReference] = useState("");

  const change = roundNu(Math.max(0, tendered - total));
  const cashShort = mode === "cash" && tendered + 0.001 < total;

  useEffect(() => {
    setTendered(total);
    setCashDraft(String(total));
  }, [total]);

  function applyCash(n: number) {
    const v = roundNu(Math.max(0, n));
    setTendered(v);
    setCashDraft(String(v));
  }

  function settle(print: boolean) {
    if (busy || cashShort) return;
    const paymentMethod: PaymentMethod =
      mode === "bank_qr" ? "bank_qr" : mode === "card" ? "card" : "cash";
    onSettle({
      paymentMethod,
      tendered: paymentMethod === "cash" ? tendered : undefined,
      paymentReference: reference.trim() || undefined,
      print,
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "F10" && !cashShort && !busy) {
        e.preventDefault();
        e.stopPropagation();
        settle(true);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return (
    <div
      role="dialog"
      aria-label="Tender"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-[#faf6ef] shadow-2xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between bg-[#14110f] px-4 py-3 text-[#f7f2e8]">
          <div>
            <p className="text-[0.65rem] tracking-[0.16em] text-[#c9a227] uppercase">
              Tender
            </p>
            <p className="mt-1 font-heading text-2xl tracking-tight">
              {formatBtn(total)}
            </p>
            <p className="mt-1 text-[0.7rem] text-white/50">
              Alt+S / Charge · Esc close · F10 save &amp; print
            </p>
          </div>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            Esc
          </button>
        </header>

        <div className="flex gap-1.5 border-b border-[#d6cdb8] px-4 py-3">
          {(
            [
              ["cash", "Cash"],
              ["bank_qr", "Bhutan QR"],
              ["card", "Card"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                if (id === "cash") applyCash(total);
              }}
              className={cn(
                "flex-1 rounded-sm px-2 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                mode === id
                  ? "bg-[#c9a227] text-[#14110f]"
                  : "bg-[#ebe4d6] text-[#6a6358] hover:bg-[#e0d6c4]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {mode === "cash" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="tender-cash-in">Cash in</Label>
                <Input
                  id="tender-cash-in"
                  inputMode="decimal"
                  aria-label="Cash in"
                  value={cashDraft}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCashDraft(raw);
                    const n = Number(raw);
                    if (Number.isFinite(n) && n >= 0) setTendered(roundNu(n));
                  }}
                  onBlur={() => applyCash(tendered)}
                  className="h-11 border-[#d6cdb8] bg-white text-lg tabular-nums"
                  autoFocus
                />
              </div>
              <p className="text-sm text-[#6a6358]">
                Change{" "}
                <span className="font-semibold tabular-nums text-[#14110f]">
                  {formatBtn(change)}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-sm border border-[#d6cdb8] bg-white px-2.5 py-1.5 text-xs font-medium"
                  onClick={() => applyCash(total)}
                >
                  Exact
                </button>
                {NOTES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="rounded-sm border border-[#d6cdb8] bg-white px-2.5 py-1.5 text-xs font-medium tabular-nums"
                    onClick={() => applyCash(tendered + n)}
                  >
                    +{n}
                  </button>
                ))}
              </div>
              {cashShort ? (
                <p className="text-sm text-[#5c241c]">
                  Need cash to cover the due.
                </p>
              ) : null}
            </div>
          ) : null}

          {mode === "bank_qr" ? (
            <div className="space-y-3">
              <p className="text-sm text-[#6a6358]">
                Ask the customer to pay{" "}
                <span className="font-semibold text-[#14110f]">
                  {formatBtn(total)}
                </span>{" "}
                via Bhutan QR.
              </p>
              {bankQrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bankQrImageUrl}
                  alt="Shop Bhutan QR"
                  className="mx-auto max-h-48 rounded-md border border-[#d6cdb8] bg-white p-2"
                />
              ) : (
                <p className="rounded-md border border-dashed border-[#d6cdb8] px-3 py-6 text-center text-xs text-[#6a6358]">
                  Add a Bhutan QR image URL in Settings to show it here.
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="tender-rrn">RRN / journal ref</Label>
                <Input
                  id="tender-rrn"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Optional bank reference"
                  className="border-[#d6cdb8] bg-white"
                />
              </div>
            </div>
          ) : null}

          {mode === "card" ? (
            <div className="space-y-3">
              <p className="text-sm text-[#6a6358]">
                Charge{" "}
                <span className="font-semibold text-[#14110f]">
                  {formatBtn(total)}
                </span>{" "}
                on the card terminal.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="tender-card-ref">Card / approval ref</Label>
                <Input
                  id="tender-card-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Optional approval code"
                  className="border-[#d6cdb8] bg-white"
                  autoFocus
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[#d6cdb8] px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-[#d6cdb8]"
            disabled={busy || cashShort}
            onClick={() => settle(false)}
          >
            {busy ? "…" : "Tender"}
          </Button>
          <Button
            type="button"
            className="flex-1 bg-[#5c241c] hover:bg-[#3f1812]"
            disabled={busy || cashShort}
            onClick={() => settle(true)}
          >
            {busy ? "…" : "Save & Print"}
          </Button>
        </div>
      </div>
    </div>
  );
}
