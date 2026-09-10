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
            Books, stationery, and other stock for Counter and the website.
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
          <CardTitle className="text-base">Catalogue</CardTitle>
          <CardDescription>{list.length} product(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kind</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {kindLabel(book.product_kind)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {book.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {book.isbn_13 || book.barcode || book.sku_code || "—"}
                    </TableCell>
                    <TableCell>{formatBtn(book.price_btn)}</TableCell>
                    <TableCell>{book.stock_qty}</TableCell>
                    <TableCell>
                      <AvailabilityBadge status={book.availability_status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={book.is_published ? "default" : "outline"}>
                        {book.is_published ? "Yes" : "No"}
                      </Badge>
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
