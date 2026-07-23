import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { upsertBook } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
import { AvailabilityBadge } from "@/components/erp/availability-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { profile } = await requireStaff();
  const showCost = canSeeCost(profile.role);
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (books ?? []) as Book[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Catalogue
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage books, pricing, and publication status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add book</CardTitle>
          <CardDescription>Create a new catalogue entry</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertBook} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" name="subtitle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn_13">ISBN-13</Label>
              <Input id="isbn_13" name="isbn_13" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_btn">Price (BTN)</Label>
              <Input
                id="price_btn"
                name="price_btn"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            {showCost ? (
              <div className="space-y-2">
                <Label htmlFor="cost_price_btn">Cost price (BTN)</Label>
                <Input
                  id="cost_price_btn"
                  name="cost_price_btn"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="cover_public_id">Cover public ID</Label>
              <Input id="cover_public_id" name="cover_public_id" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                className="size-4 rounded border border-input"
              />
              <Label htmlFor="is_published">Published on storefront</Label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create book</Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No books in catalogue.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {book.id.slice(0, 8)}
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
