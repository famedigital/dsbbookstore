import Link from "next/link";
import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
import { AvailabilityBadge } from "@/components/erp/availability-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Book, ProductKind } from "@/types/erp";

const PAGE_SIZE = 50;

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    imported?: string;
    q?: string;
    page?: string;
  }>;
}) {
  await requireStaff();
  const { kind, imported, q, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const term = q?.trim()?.replace(/%/g, "");

  let query = supabase
    .from("books")
    .select(
      "id, title, brand, barcode, isbn_13, cost_price_btn, price_btn, opening_qty, stock_qty, clo_val_btn, availability_status, product_kind",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (kind === "book" || kind === "stationery" || kind === "other") {
    query = query.eq("product_kind", kind);
  }
  if (term) {
    query = query.or(
      `title.ilike.%${term}%,brand.ilike.%${term}%,barcode.ilike.%${term}%,isbn_13.ilike.%${term}%`
    );
  }

  const { data: books, count } = await query;
  const list = (books ?? []) as Book[];
  const total = count ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filters: { id: string; label: string }[] = [
    { id: "", label: "All" },
    { id: "book", label: "Books" },
    { id: "stationery", label: "Stationery" },
    { id: "other", label: "Other" },
  ];

  function kindLabel(k: ProductKind | undefined) {
    if (k === "stationery") return "Stationery";
    if (k === "other") return "Other";
    return "Book";
  }

  function href(extra: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = {
      kind: kind || undefined,
      q: term || undefined,
      page: page > 1 ? String(page) : undefined,
      ...extra,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return qs ? `/erp/catalogue?${qs}` : "/erp/catalogue";
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Stock Register columns · paginated for free-tier safety (
            {PAGE_SIZE}/page).
          </p>
        </div>
        <Button asChild>
          <Link href="/erp/catalogue/new">Add product</Link>
        </Button>
      </div>

      {imported ? (
        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          Imported {imported} product(s).
        </p>
      ) : null}

      <form
        action="/erp/catalogue"
        method="get"
        className="flex flex-wrap items-center gap-2"
      >
        {kind ? <input type="hidden" name="kind" value={kind} /> : null}
        <Input
          name="q"
          defaultValue={term}
          placeholder="Search title, brand, barcode…"
          className="max-w-sm"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
        {term ? (
          <Button asChild size="sm" variant="outline">
            <Link href={href({ q: undefined, page: undefined })}>Clear</Link>
          </Button>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (kind || "") === f.id;
          return (
            <Button
              key={f.id || "all"}
              asChild
              size="sm"
              variant={active ? "default" : "outline"}
            >
              <Link
                href={href({
                  kind: f.id || undefined,
                  page: undefined,
                })}
              >
                {f.label}
              </Link>
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Register</CardTitle>
          <CardDescription>
            Showing {list.length} of {total.toLocaleString("en-BT")} · page{" "}
            {page}/{totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Pur Rate</TableHead>
                <TableHead className="text-right">Sal Rate</TableHead>
                <TableHead className="text-right">Opening</TableHead>
                <TableHead className="text-right">Closing</TableHead>
                <TableHead className="text-right">Clo Val</TableHead>
                <TableHead>UPCEAN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-muted-foreground">
                    No products match. Try another search or clear filters.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate font-medium">{book.title}</div>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {kindLabel(book.product_kind)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[140px] truncate text-sm">
                      {book.brand || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatBtn(book.cost_price_btn)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatBtn(book.price_btn)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {book.opening_qty ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {book.stock_qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatBtn(
                        book.clo_val_btn ??
                          Number(book.stock_qty) * Number(book.price_btn)
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {book.barcode || book.isbn_13 || "—"}
                    </TableCell>
                    <TableCell>
                      <AvailabilityBadge status={book.availability_status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/erp/catalogue/${book.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={href({
                      page: page - 1 > 1 ? String(page - 1) : undefined,
                    })}
                  >
                    Previous
                  </Link>
                </Button>
              ) : null}
              <span className="text-muted-foreground text-xs">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={href({ page: String(page + 1) })}>Next</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
