import { requireStaff } from "@/lib/erp/auth";
import { adjustStock } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityBadge } from "@/components/erp/availability-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Book, StockMovement, StockMovementType } from "@/types/erp";

type MovementRow = StockMovement & {
  books: { title: string } | null;
};

const ADJUSTMENT_TYPES: StockMovementType[] = [
  "adjustment",
  "damage",
  "return_in",
  "return_out",
];

export default async function InventoryPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: lowStock }, { data: books }, { data: movements }] =
    await Promise.all([
      supabase
        .from("books")
        .select("*")
        .eq("availability_status", "low_stock")
        .order("stock_qty", { ascending: true }),
      supabase.from("books").select("id, title").order("title"),
      supabase
        .from("stock_movements")
        .select("*, books(title)")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const lowStockBooks = (lowStock ?? []) as Book[];
  const bookOptions = books ?? [];
  const movementRows = (movements ?? []) as MovementRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Inventory
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Stock levels, adjustments, and movement history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adjust stock</CardTitle>
          <CardDescription>
            Record manual adjustments, damage, or returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={adjustStock} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="book_id">Book</Label>
              <select
                id="book_id"
                name="book_id"
                required
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                <option value="">Select a book…</option>
                {bookOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty_delta">Quantity change</Label>
              <Input
                id="qty_delta"
                name="qty_delta"
                type="number"
                required
                placeholder="e.g. -2 or 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement_type">Movement type</Label>
              <select
                id="movement_type"
                name="movement_type"
                required
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                defaultValue="adjustment"
              >
                {ADJUSTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" required rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Record movement</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Low stock</CardTitle>
          <CardDescription>
            Titles at or below threshold ({lowStockBooks.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No low-stock titles.
                  </TableCell>
                </TableRow>
              ) : (
                lowStockBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.stock_qty}</TableCell>
                    <TableCell>{book.low_stock_threshold ?? "—"}</TableCell>
                    <TableCell>
                      <AvailabilityBadge status={book.availability_status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent movements</CardTitle>
          <CardDescription>Last 30 ledger entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movementRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No stock movements yet.
                  </TableCell>
                </TableRow>
              ) : (
                movementRows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(m.created_at).toLocaleString("en-BT")}
                    </TableCell>
                    <TableCell>{m.books?.title ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {m.movement_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        m.qty_delta < 0 ? "text-destructive" : "text-primary"
                      }
                    >
                      {m.qty_delta > 0 ? `+${m.qty_delta}` : m.qty_delta}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                      {m.reason ?? "—"}
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
