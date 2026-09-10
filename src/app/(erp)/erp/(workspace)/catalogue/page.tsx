import Link from "next/link";
import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
import { AvailabilityBadge } from "@/components/erp/availability-badge";
import { Button } from "@/components/ui/button";
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

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; imported?: string }>;
}) {
  await requireStaff();
  const { kind, imported } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("books").select("*").order("updated_at", {
    ascending: false,
  });
  if (kind === "book" || kind === "stationery" || kind === "other") {
    query = query.eq("product_kind", kind);
  }

  const { data: books } = await query;
  const list = (books ?? []) as Book[];

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Stock Register columns: Product, Brand, Pur Rate, Sal Rate, Opening,
            Closing, Clo Val, UPCEAN.
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

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (kind || "") === f.id;
          const href = f.id ? `/erp/catalogue?kind=${f.id}` : "/erp/catalogue";
          return (
            <Button
              key={f.id || "all"}
              asChild
              size="sm"
              variant={active ? "default" : "outline"}
            >
              <Link href={href}>{f.label}</Link>
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Register</CardTitle>
          <CardDescription>{list.length} product(s)</CardDescription>
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
                    No products yet. Import the Stock Register Excel to load the
                    shop catalogue.
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
        </CardContent>
      </Card>
    </div>
  );
}
