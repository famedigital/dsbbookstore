/** Hold-for-pickup bag — localStorage until submitted (Waterstones-style). */

export type HoldBagItem = {
  id: string;
  slug: string;
  title: string;
  price_btn: number;
  stock_qty: number;
  cover_public_id?: string | null;
  isbn_13?: string | null;
  barcode?: string | null;
  qty: number;
};

const KEY = "dsb-hold-bag-v1";

export function readHoldBag(): HoldBagItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HoldBagItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHoldBag(items: HoldBagItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 40)));
  window.dispatchEvent(new CustomEvent("dsb-hold-bag"));
}

export function addToHoldBag(
  item: Omit<HoldBagItem, "qty">,
  qty = 1
): HoldBagItem[] {
  const list = readHoldBag();
  const existing = list.find((i) => i.id === item.id);
  let next: HoldBagItem[];
  if (existing) {
    const max = Math.max(1, item.stock_qty || existing.stock_qty || 1);
    next = list.map((i) =>
      i.id === item.id
        ? { ...i, qty: Math.min(max, i.qty + qty), stock_qty: item.stock_qty }
        : i
    );
  } else {
    next = [
      { ...item, qty: Math.min(Math.max(1, qty), Math.max(1, item.stock_qty || 1)) },
      ...list,
    ].slice(0, 40);
  }
  writeHoldBag(next);
  return next;
}

export function updateHoldQty(id: string, qty: number): HoldBagItem[] {
  const list = readHoldBag()
    .map((i) => {
      if (i.id !== id) return i;
      const next = Math.min(i.stock_qty || 99, Math.max(0, qty));
      if (next <= 0) return null;
      return { ...i, qty: next };
    })
    .filter(Boolean) as HoldBagItem[];
  writeHoldBag(list);
  return list;
}

export function removeFromHoldBag(id: string): HoldBagItem[] {
  const next = readHoldBag().filter((i) => i.id !== id);
  writeHoldBag(next);
  return next;
}

export function clearHoldBag() {
  writeHoldBag([]);
}
