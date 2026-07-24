import Link from "next/link";
import { requireStaff } from "@/lib/erp/auth";
import { updateOrderStatus } from "@/lib/erp/actions";
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
import { Badge } from "@/components/ui/badge";
import type { Order, OrderStatus } from "@/types/erp";

const ORDER_STATUSES: OrderStatus[] = [
  "draft",
  "confirmed",
  "paid",
  "cod_pending",
  "fulfilled",
  "cancelled",
  "refunded",
];

function statusVariant(
  status: OrderStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
    case "fulfilled":
      return "default";
    case "cancelled":
    case "refunded":
      return "destructive";
    case "cod_pending":
      return "secondary";
    default:
      return "outline";
  }
}

export default async function OrdersPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (orders ?? []) as Order[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Orders
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          POS and online sales across all channels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All orders</CardTitle>
          <CardDescription>{list.length} order(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Update status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/erp/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">{order.channel}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)} className="capitalize">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.customer_name ?? "—"}</TableCell>
                    <TableCell>{formatBtn(order.total_btn)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleString("en-BT")}
                    </TableCell>
                    <TableCell>
                      <form
                        action={updateOrderStatus}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={order.id} />
                        <select
                          name="status"
                          defaultValue={order.status}
                          className="border-input bg-background h-8 rounded-lg border px-2 text-xs"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="outline">
                          Save
                        </Button>
                      </form>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/erp/orders/${order.id}`}>View</Link>
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
