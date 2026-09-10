import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityBadge } from "@/components/erp/availability-badge";
import { StocktakePanel } from "@/components/erp/stocktake-panel";
import { InventoryAdjustForm } from "@/components/erp/inventory-adjust-form";
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
import type { Book, StockMovement } from "@/types/erp";

type MovementRow = StockMovement & {
  books: { title: string; barcode: string | null } | null;
};

type LowRow = Pick<
  Book,
  | "id"
  | "title"
  | "brand"
  | "barcode"
  | "stock_qty"
  | "availability_status"
>;

export default async function InventoryPage() {
  await requireStaff();
  const supabase = await createClient();

  const [
    { data: lowStock },
    { count: outOfStockCount },
    { data: movements },
  ] = await Promise.all([
    supabase
      .from("books")
      .select(
        "id, title, brand, barcode, stock_qty, availability_status"
      )
      .eq("availability_status", "low_stock")
      .order("stock_qty", { ascending: true })
      .limit(50),
    supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("availability_status", "out_of_stock"),
    supabase
      .from("stock_movements")
      .select("*, books(title, barcode)")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const lowStockBooks = (lowStock ?? []) as LowRow[];
  const movementRows = (movements ?? []) as MovementRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Inventory
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Stocktake, journal adjustments, and movement history. Closing stock
          always moves through the ledger.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low stock (shown)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {lowStockBooks.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Out of stock</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {outOfStockCount ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recent ledger</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {movementRows.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stocktake</CardTitle>
          <CardDescription>
            Physical vs system Closing — commit posts count_adjust movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StocktakePanel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal adjust</CardTitle>
          <CardDescription>
            Damage, returns, or manual adjustment (search product)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryAdjustForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Low stock</CardTitle>
          <CardDescription>
            Titles at or below threshold (up to 50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>UPCEAN</TableHead>
                <TableHead className="text-right">Closing</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No low-stock titles.
                  </TableCell>
                </TableRow>
              ) : (
                lowStockBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {book.brand || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {book.barcode || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {book.stock_qty}
                    </TableCell>
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
          <CardDescription>Last 40 ledger entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
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
                    <TableCell>
                      <div>{m.books?.title ?? "—"}</div>
                      <div className="text-muted-foreground font-mono text-xs">
                        {m.books?.barcode || ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {m.movement_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        m.qty_delta < 0 ? "text-destructive" : "text-primary"
                      }`}
                    >
                      {m.qty_delta > 0 ? `+${m.qty_delta}` : m.qty_delta}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate text-xs">
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
