import Link from "next/link";
import { cn } from "@/lib/utils";

export type CatalogueCat = { id: string; name: string; slug: string };

function href(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `/books?${q}` : "/books";
}

const STOCK = [
  { id: "", label: "Any" },
  { id: "in_stock", label: "In stock" },
  { id: "low_stock", label: "Low" },
  { id: "out_of_stock", label: "Out" },
] as const;

const SORT = [
  { id: "browse", label: "Browse" },
  { id: "title", label: "A–Z" },
  { id: "price_asc", label: "Price ↑" },
  { id: "price_desc", label: "Price ↓" },
  { id: "newest", label: "New" },
] as const;

const scrollRow =
  "flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** Chip filters only — search lives in the site header next to the logo. */
export function CatalogueFilterBar({
  categories,
  q,
  category,
  availability,
  sort,
  total,
}: {
  categories: CatalogueCat[];
  q?: string;
  category?: string;
  availability?: string;
  sort: string;
  total?: number;
}) {
  const base = {
    q: q?.trim() || undefined,
    category: category || undefined,
    availability: availability || undefined,
    sort: sort !== "browse" ? sort : undefined,
  };

  return (
    <div className="sticky top-[3.25rem] z-30 border-b border-[color:var(--sf-line)] bg-[color:var(--sf-bg)]/95 backdrop-blur-md sm:top-12">
      <div className="mx-auto max-w-6xl space-y-1.5 px-3 py-1.5 sm:px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className={cn(scrollRow, "min-w-0 flex-1")} aria-label="Categories">
            <Chip
              href={href({ ...base, category: undefined, page: undefined })}
              active={!category}
            >
              All
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.id}
                href={href({
                  ...base,
                  category: c.slug,
                  page: undefined,
                })}
                active={category === c.slug}
              >
                {c.name}
              </Chip>
            ))}
          </div>
          {typeof total === "number" ? (
            <p className="hidden shrink-0 text-[0.7rem] text-[color:var(--sf-muted)] md:block">
              {total.toLocaleString("en-BT")}
            </p>
          ) : null}
        </div>

        <div className={cn(scrollRow, "pb-0.5")} aria-label="Stock and sort">
          {STOCK.map((s) => (
            <Chip
              key={s.id || "any"}
              href={href({
                ...base,
                availability: s.id || undefined,
                page: undefined,
              })}
              active={(availability || "") === s.id}
              tone="muted"
            >
              {s.label}
            </Chip>
          ))}
          <span
            className="mx-0.5 w-px shrink-0 self-stretch bg-[color:var(--sf-line)]"
            aria-hidden
          />
          {SORT.map((s) => (
            <Chip
              key={s.id}
              href={href({
                ...base,
                sort: s.id === "browse" ? undefined : s.id,
                page: undefined,
              })}
              active={sort === s.id}
              tone="muted"
            >
              {s.label}
            </Chip>
          ))}
          {(q || category || availability || sort !== "browse") && (
            <Link
              href="/books"
              className="shrink-0 self-center px-1.5 text-[0.7rem] font-medium text-[color:var(--sf-accent)] hover:underline"
            >
              Clear
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  href: to,
  active,
  children,
  tone = "default",
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <Link
      href={to}
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium whitespace-nowrap transition-colors",
        active
          ? "border-[color:var(--sf-accent)] bg-[color:var(--sf-accent)] text-white"
          : tone === "muted"
            ? "border-[color:var(--sf-line)] bg-transparent text-[color:var(--sf-muted)]"
            : "border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] text-[color:var(--sf-ink)]"
      )}
    >
      {children}
    </Link>
  );
}
