/** Browser IndexedDB catalogue for Counter — local-first like POS. */

export type CounterCatalogItem = {
  id: string;
  title: string;
  brand: string | null;
  barcode: string | null;
  isbn_13: string | null;
  cost_price_btn: number;
  price_btn: number;
  stock_qty: number;
  product_kind: string;
};

export type CounterCatalogMeta = {
  pulledAt: number;
  count: number;
  /** Max books.updated_at from last pull (ISO) for cheap freshness checks */
  maxUpdatedAt: string | null;
};

const DB_NAME = "dsb-counter";
const DB_VER = 1;
const CATALOG = "catalog";
const META = "meta";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("no indexedDB"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CATALOG)) {
        db.createObjectStore(CATALOG, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb open"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb tx"));
    tx.onabort = () => reject(tx.error ?? new Error("idb abort"));
  });
}

export async function readCounterCatalogMeta(): Promise<CounterCatalogMeta | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(META, "readonly");
      const req = tx.objectStore(META).get("catalog");
      req.onsuccess = () => {
        const row = req.result as (CounterCatalogMeta & { key: string }) | undefined;
        if (!row) {
          resolve(null);
          return;
        }
        const { key: _k, ...meta } = row;
        resolve(meta);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function readCounterCatalog(): Promise<CounterCatalogItem[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(CATALOG, "readonly");
      const req = tx.objectStore(CATALOG).getAll();
      req.onsuccess = () =>
        resolve((req.result as CounterCatalogItem[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function writeCounterCatalog(
  meta: CounterCatalogMeta,
  items: CounterCatalogItem[]
): Promise<void> {
  const db = await openDb();
  const tx = db.transaction([CATALOG, META], "readwrite");
  const cat = tx.objectStore(CATALOG);
  cat.clear();
  for (const item of items) {
    cat.put(item);
  }
  tx.objectStore(META).put({ key: "catalog", ...meta });
  await txDone(tx);
}

/** O(1) barcode / ISBN index for scan path. */
export function buildCounterBarcodeIndex(
  items: CounterCatalogItem[]
): Map<string, CounterCatalogItem> {
  const map = new Map<string, CounterCatalogItem>();
  for (const item of items) {
    for (const raw of [item.barcode, item.isbn_13]) {
      if (!raw) continue;
      const key = String(raw).trim().toLowerCase();
      if (key) map.set(key, item);
    }
  }
  return map;
}

/** Local substring search — no network. */
export function filterCounterCatalog(
  items: CounterCatalogItem[],
  query: string,
  opts?: { inStockOnly?: boolean; limit?: number }
): CounterCatalogItem[] {
  const inStockOnly = opts?.inStockOnly !== false;
  const limit = opts?.limit ?? 60;
  const q = query.trim().toLowerCase();

  let pool = inStockOnly ? items.filter((i) => i.stock_qty > 0) : items;

  if (!q) {
    return pool
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, limit);
  }

  const exact: CounterCatalogItem[] = [];
  const starts: CounterCatalogItem[] = [];
  const contains: CounterCatalogItem[] = [];

  for (const item of pool) {
    const title = item.title.toLowerCase();
    const brand = (item.brand || "").toLowerCase();
    const barcode = (item.barcode || "").toLowerCase();
    const isbn = (item.isbn_13 || "").toLowerCase();
    if (barcode === q || isbn === q) {
      exact.push(item);
      continue;
    }
    if (title.startsWith(q) || brand.startsWith(q)) {
      starts.push(item);
      continue;
    }
    if (
      title.includes(q) ||
      brand.includes(q) ||
      barcode.includes(q) ||
      isbn.includes(q)
    ) {
      contains.push(item);
    }
  }

  return [...exact, ...starts, ...contains].slice(0, limit);
}
