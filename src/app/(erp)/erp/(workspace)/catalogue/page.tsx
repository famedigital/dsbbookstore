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
import type { Book } from "@/types/erp";

export default async function CataloguePage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (books ?? []) as Book[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Catalogue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage books, pricing, and publication status.
          </p>
        </div>
        <Button asChild>
          <Link href="/erp/catalogue/new">Add book</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All books</CardTitle>
          <CardDescription>{list.length} title(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>ISBN</TableHead>
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
                    No books in catalogue.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {book.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {book.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {book.isbn_13 ?? "—"}
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
