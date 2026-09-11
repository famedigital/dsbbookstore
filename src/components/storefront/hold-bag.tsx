"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  addToHoldBag,
  clearHoldBag,
  readHoldBag,
  removeFromHoldBag,
  updateHoldQty,
  type HoldBagItem,
} from "@/lib/storefront/hold-bag";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPickupHold } from "@/lib/erp/actions";
import { cn } from "@/lib/utils";

type HoldCtx = {
  items: HoldBagItem[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<HoldBagItem, "qty">, qty?: number) => void;
  refresh: () => void;
};

const Ctx = createContext<HoldCtx | null>(null);

export function useHoldBag() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHoldBag requires HoldBagProvider");
  return ctx;
}

export function HoldBagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<HoldBagItem[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => setItems(readHoldBag()), []);

  useEffect(() => {
    refresh();
    function sync() {
      refresh();
    }
    window.addEventListener("dsb-hold-bag", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dsb-hold-bag", sync);
      window.removeEventListener("storage", sync);
    };
  }, [refresh]);

  const value = useMemo<HoldCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      open,
      setOpen,
      add: (item, qty = 1) => {
        addToHoldBag(item, qty);
        refresh();
        setOpen(true);
      },
      refresh,
    }),
    [items, open, refresh]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <HoldBagDrawer />
    </Ctx.Provider>
  );
}

function HoldBagDrawer() {
  const { items, open, setOpen, refresh, count } = useHoldBag();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const total = items.reduce((s, i) => s + i.qty * i.price_btn, 0);

  async function submit() {
    if (!items.length) return;
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("name", name.trim());
      fd.set("phone", phone.trim());
      fd.set("email", email.trim());
      fd.set("note", note.trim());
      fd.set(
        "items_json",
        JSON.stringify(
          items.map((i) => ({
            book_id: i.id,
            title: i.title,
            slug: i.slug,
            qty: i.qty,
            price_btn: i.price_btn,
            isbn: i.isbn_13 || i.barcode || null,
          }))
        )
      );
      await submitPickupHold(fd);
      clearHoldBag();
      refresh();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit hold");
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Hold for pickup"
      className="fixed inset-0 z-50 bg-black/40"
      onClick={() => setOpen(false)}
    >
      <div
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[color:var(--sf-bg)] shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--sf-line)] bg-[color:var(--sf-night)] px-4 py-3 text-[color:var(--sf-ivory)]">
          <div>
            <p className="font-display text-xl tracking-tight">Hold for pickup</p>
            <p className="text-[0.65rem] tracking-[0.14em] text-white/50 uppercase">
              Jojo&apos;s · Chang Lam · 48 hours
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-2xl text-[color:var(--sf-ink)]">
              Hold requested
            </p>
            <p className="max-w-sm text-sm text-[color:var(--sf-muted)]">
              We&apos;ll confirm by phone or WhatsApp and keep titles at the
              counter for 48 hours.
            </p>
            <Button
              type="button"
              className="sf-btn mt-2"
              onClick={() => {
                setDone(false);
                setOpen(false);
              }}
            >
              Continue browsing
            </Button>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 overflow-auto">
              {items.length === 0 ? (
                <li className="px-4 py-12 text-center text-sm text-[color:var(--sf-muted)]">
                  Your hold bag is empty — add titles from a book page.
                </li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 border-b border-[color:var(--sf-line)] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/books/${item.slug}`}
                        className="font-medium text-[color:var(--sf-ink)] hover:text-[color:var(--sf-accent)]"
                        onClick={() => setOpen(false)}
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-[color:var(--sf-muted)]">
                        {formatBtn(item.price_btn)} · {item.stock_qty} on shelf
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex size-7 items-center justify-center border border-[color:var(--sf-line)]"
                          onClick={() => {
                            updateHoldQty(item.id, item.qty - 1);
                            refresh();
                          }}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          className="inline-flex size-7 items-center justify-center border border-[color:var(--sf-line)]"
                          disabled={item.qty >= item.stock_qty}
                          onClick={() => {
                            updateHoldQty(item.id, item.qty + 1);
                            refresh();
                          }}
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          className="ml-2 p-1.5 text-[color:var(--sf-muted)] hover:text-[color:var(--sf-accent)]"
                          onClick={() => {
                            removeFromHoldBag(item.id);
                            refresh();
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-[color:var(--sf-accent)]">
                      {formatBtn(item.qty * item.price_btn)}
                    </p>
                  </li>
                ))
              )}
            </ul>

            {items.length > 0 ? (
              <div className="space-y-3 border-t border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4">
                <p className="flex justify-between font-display text-lg">
                  <span>Estimated</span>
                  <span className="text-[color:var(--sf-accent)]">
                    {formatBtn(total)}
                  </span>
                </p>
                <p className="text-xs text-[color:var(--sf-muted)]">
                  Pay at the counter · held 48 hours after we confirm stock.
                </p>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="hold-name">Name</Label>
                    <Input
                      id="hold-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-none"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hold-phone">Phone</Label>
                    <Input
                      id="hold-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-none"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hold-email">Email (optional)</Label>
                    <Input
                      id="hold-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-none"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hold-note">Note (optional)</Label>
                    <Input
                      id="hold-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="rounded-none"
                      placeholder="Pickup time preference…"
                    />
                  </div>
                </div>
                {error ? (
                  <p className="text-destructive text-xs">{error}</p>
                ) : null}
                <Button
                  type="button"
                  className="sf-btn w-full"
                  disabled={pending}
                  onClick={() => void submit()}
                >
                  {pending
                    ? "Sending…"
                    : `Request hold · ${count} item${count === 1 ? "" : "s"}`}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function HoldBagButton({ className }: { className?: string }) {
  const { count, setOpen } = useHoldBag();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "relative inline-flex items-center gap-1.5 border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] px-2.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.08em] text-[color:var(--sf-ink)] uppercase transition hover:border-[color:var(--sf-accent)]",
        className
      )}
      style={{ borderRadius: "var(--sf-btn-radius)" }}
      aria-label={`Hold bag, ${count} items`}
    >
      <ShoppingBag className="size-3.5" />
      Hold
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center bg-[color:var(--sf-accent)] text-[0.6rem] text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </button>
  );
}
