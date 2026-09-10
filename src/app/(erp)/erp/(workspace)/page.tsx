import Link from "next/link";
import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
import { MANAGER_ROLES } from "@/types/erp";
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
import type { Enquiry, Order } from "@/types/erp";

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function ErpDashboardPage() {
  const { profile } = await requireStaff();
  const supabase = await createClient();
  const todayIso = startOfTodayIso();

  const [
    booksRes,
    lowStockRes,
    enquiriesRes,
    todayOrdersRes,
    recentOrdersRes,
    recentEnquiriesRes,
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("availability_status", "low_stock"),
    supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("total_btn")
      .gte("created_at", todayIso),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const todayOrders = todayOrdersRes.data ?? [];
  const todayCount = todayOrders.length;
  const todaySum = todayOrders.reduce(
    (sum, o) => sum + Number(o.total_btn),
    0
  );
  const recentOrders = (recentOrdersRes.data ?? []) as Order[];
  const recentEnquiries = (recentEnquiriesRes.data ?? []) as Enquiry[];
  const showMarginNote = MANAGER_ROLES.includes(profile.role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of catalogue, sales, and enquiries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Books in catalogue</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {booksRes.count ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low stock titles</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {lowStockRes.count ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open enquiries</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {enquiriesRes.count ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today&apos;s sales</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{todayCount}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {formatBtn(todaySum)} total
            </p>
          </CardHeader>
        </Card>
      </div>

      {showMarginNote ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              Margin and profitability details are available on the{" "}
              <Link href="/erp/reports" className="text-primary underline-offset-4 hover:underline">
                Reports
              </Link>{" "}
              page for managers and owners.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent sales</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No sales yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBtn(order.total_btn)}
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
            <CardTitle className="text-base">Recent enquiries</CardTitle>
            <CardDescription>Last 5 customer messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No enquiries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell>{enquiry.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enquiry.status === "new" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {enquiry.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(enquiry.created_at).toLocaleDateString(
                          "en-BT"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
