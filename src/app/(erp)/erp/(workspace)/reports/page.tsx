import Link from "next/link";
import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
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

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function ReportsPage() {
  const { profile } = await requireStaff();
  const showCost = canSeeCost(profile.role);
  const supabase = await createClient();
  const since = daysAgoIso(30);

  const [
    recentOrdersRes,
    lowStockRes,
    enquiriesTotalRes,
    enquiriesClosedRes,
    orderItemsRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total_btn")
      .gte("created_at", since)
      .neq("status", "cancelled"),
    supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("availability_status", "low_stock"),
    supabase.from("enquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "closed"),
    supabase
      .from("order_items")
      .select(
        "book_id, title_snapshot, quantity, line_total_btn, unit_cost_btn, orders!inner(created_at, status)"
      )
      .gte("orders.created_at", since)
      .neq("orders.status", "cancelled"),
  ]);

  const recentOrders = recentOrdersRes.data ?? [];
  const salesTotal = recentOrders.reduce(
    (sum, o) => sum + Number(o.total_btn),
    0
  );
  const orderCount = recentOrders.length;

  const items = orderItemsRes.data ?? [];
  const topBooksMap = new Map<
    string,
    { title: string; qty: number; revenue: number; cost: number }
  >();
  let revenueFromItems = 0;
  let costFromItems = 0;

  for (const item of items) {
    const bookId = item.book_id as string;
    const title = item.title_snapshot as string;
    const qty = Number(item.quantity);
    const revenue = Number(item.line_total_btn);
    const cost = qty * Number(item.unit_cost_btn);
    revenueFromItems += revenue;
    costFromItems += cost;

    const existing = topBooksMap.get(bookId);
    if (existing) {
      existing.qty += qty;
      existing.revenue += revenue;
      existing.cost += cost;
    } else {
      topBooksMap.set(bookId, { title, qty, revenue, cost });
    }
  }

  const topBooks = [...topBooksMap.entries()]
    .map(([bookId, data]) => ({
      bookId,
      ...data,
      margin: data.revenue - data.cost,
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  const enquiriesTotal = enquiriesTotalRes.count ?? 0;
  const enquiriesClosed = enquiriesClosedRes.count ?? 0;
  const conversionRate =
    enquiriesTotal > 0
      ? Math.round((enquiriesClosed / enquiriesTotal) * 100)
      : 0;

  const roughMargin = revenueFromItems - costFromItems;
  const topColSpan = showCost ? 3 : 2;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sales, inventory, and enquiry metrics for the last 30 days.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/erp/reports/export?type=sales">Export sales CSV</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/erp/reports/export?type=low_stock">
              Export low stock CSV
            </Link>
          </Button>
          {showCost ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/erp/reports/export?type=margin">
                Export margin CSV
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sales (30 days)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatBtn(salesTotal)}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {orderCount} order(s), excl. cancelled
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low stock titles</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {lowStockRes.count ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total enquiries</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {enquiriesTotal}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enquiry close rate</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {conversionRate}%
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {enquiriesClosed} closed of {enquiriesTotal}
            </p>
          </CardHeader>
        </Card>
      </div>

      {showCost ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>Rough margin (30 days, line items)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatBtn(roughMargin)}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Revenue {formatBtn(revenueFromItems)} − cost{" "}
              {formatBtn(costFromItems)} from order line items
            </p>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">
              Sales total for the period: {formatBtn(salesTotal)}. Margin
              details are available to managers and owners.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top books by quantity sold</CardTitle>
          <CardDescription>Last 30 days, non-cancelled orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Units sold</TableHead>
                {showCost ? (
                  <TableHead className="text-right">Margin</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {topBooks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={topColSpan}
                    className="text-muted-foreground"
                  >
                    No sales data for this period.
                  </TableCell>
                </TableRow>
              ) : (
                topBooks.map((book) => (
                  <TableRow key={book.bookId}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {book.qty}
                    </TableCell>
                    {showCost ? (
                      <TableCell className="text-right tabular-nums">
                        {formatBtn(book.margin)}
                      </TableCell>
                    ) : null}
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
