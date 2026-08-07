"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = { bookId: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  addItem: (bookId: string, qty?: number) => void;
  setQty: (bookId: string, qty: number) => void;
  removeItem: (bookId: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const COOKIE_KEY = "dsb_cart";

function readCookie(): CartLine[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_KEY}=`));
  if (!match) return [];
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => l.bookId && l.qty > 0) : [];
  } catch {
    return [];
  }
}

function writeCookie(lines: CartLine[]) {
  const value = encodeURIComponent(JSON.stringify(lines));
  const maxAge = 60 * 60 * 24 * 14;
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readCookie());
    setReady(true);
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    writeCookie(next);
  }, []);

  const addItem = useCallback(
    (bookId: string, qty = 1) => {
      persist(
        (() => {
          const existing = lines.find((l) => l.bookId === bookId);
          if (existing) {
            return lines.map((l) =>
              l.bookId === bookId ? { ...l, qty: l.qty + qty } : l
            );
          }
          return [...lines, { bookId, qty }];
        })()
      );
    },
    [lines, persist]
  );

  const setQty = useCallback(
    (bookId: string, qty: number) => {
      if (qty <= 0) {
        persist(lines.filter((l) => l.bookId !== bookId));
        return;
      }
      persist(
        lines.map((l) => (l.bookId === bookId ? { ...l, qty } : l))
      );
    },
    [lines, persist]
  );

  const removeItem = useCallback(
    (bookId: string) => {
      persist(lines.filter((l) => l.bookId !== bookId));
    },
    [lines, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      lines,
      itemCount: lines.reduce((n, l) => n + l.qty, 0),
      addItem,
      setQty,
      removeItem,
      clear,
      ready,
    }),
    [lines, addItem, setQty, removeItem, clear, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      lines: [] as CartLine[],
      itemCount: 0,
      addItem: () => {},
      setQty: () => {},
      removeItem: () => {},
      clear: () => {},
      ready: false,
    };
  }
  return ctx;
}
