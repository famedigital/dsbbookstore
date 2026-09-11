/** Guest reading list — localStorage, no auth (Bookshop/LitRes pattern). */

export type ReadingListItem = {
  id: string;
  slug: string;
  title: string;
  price_btn: number;
  cover_public_id?: string | null;
  isbn_13?: string | null;
  barcode?: string | null;
  addedAt: number;
};

const KEY = "dsb-reading-list-v1";

export function readReadingList(): ReadingListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReadingListItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeReadingList(items: ReadingListItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 80)));
  window.dispatchEvent(new CustomEvent("dsb-reading-list"));
}

export function isInReadingList(id: string) {
  return readReadingList().some((i) => i.id === id);
}

export function toggleReadingListItem(
  item: Omit<ReadingListItem, "addedAt">
): ReadingListItem[] {
  const list = readReadingList();
  const exists = list.some((i) => i.id === item.id);
  const next = exists
    ? list.filter((i) => i.id !== item.id)
    : [{ ...item, addedAt: Date.now() }, ...list].slice(0, 80);
  writeReadingList(next);
  return next;
}
