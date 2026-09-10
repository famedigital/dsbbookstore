"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import {
  searchProducts,
  type ProductSearchHit,
} from "@/lib/erp/product-search";
import { formatBtn } from "@/lib/erp/format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ProductPicker({
  onPick,
  placeholder = "Search title, brand, barcode…",
  className,
}: {
  onPick: (hit: ProductSearchHit) => void;
  placeholder?: string;
  className?: string;
}) {
  const listId = useId();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ProductSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pending, start] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function runSearch(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    if (!value.trim()) {
      setHits([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(() => {
      start(async () => {
        const rows = await searchProducts(value);
        setHits(rows);
        setActive(0);
        setOpen(true);
      });
    }, 180);
  }

  function choose(hit: ProductSearchHit) {
    onPick(hit);
    setQ("");
    setHits([]);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => runSearch(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || !hits.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(hits[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className="pl-9"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="bg-popover absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border shadow-md"
        >
          {pending && !hits.length ? (
            <li className="text-muted-foreground px-3 py-2 text-sm">
              Searching…
            </li>
          ) : null}
          {!pending && hits.length === 0 ? (
            <li className="text-muted-foreground px-3 py-2 text-sm">
              No products
            </li>
          ) : null}
          {hits.map((hit, i) => (
            <li key={hit.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={cn(
                  "hover:bg-muted flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm",
                  i === active && "bg-muted"
                )}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(hit)}
              >
                <span className="font-medium">{hit.title}</span>
                <span className="text-muted-foreground text-xs">
                  {[hit.brand, hit.barcode || hit.isbn_13, `Closing ${hit.stock_qty}`, formatBtn(hit.price_btn)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
