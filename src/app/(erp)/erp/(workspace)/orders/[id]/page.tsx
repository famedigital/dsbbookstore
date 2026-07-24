import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/erp/auth";
import { markPaymentCompleted, updateOrderStatus } from "@/lib/erp/actions";
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
import type { Order, OrderItem, OrderStatus, Payment } from "@/types/erp";

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireStaff();
  const supabase = await createClient();

  const [
    { data: order },
    { data: items },
    { data: payments },
  ] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase
      .from("payments")
      .select("*")
      .eq("order_id", id)
      .order("created_at"),
  ]);

  if (!order) notFound();

  const orderData = order as Order;
  const itemList = (items ?? []) as OrderItem[];
  const paymentList = (payments ?? []) as Payment[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Order {orderData.order_number}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {orderData.customer_name ?? "No customer name"} ·{" "}
            {new Date(orderData.created_at).toLocaleString("en-BT")}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/erp/orders">Back to orders</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-base capitalize">
              <Badge variant={statusVariant(orderData.status)}>
                {orderData.status.replace("_", " ")}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Channel</CardDescription>
            <CardTitle className="text-base capitalize">
              {orderData.channel}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-base">
              {formatBtn(orderData.total_btn)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer</CardDescription>
            <CardTitle className="text-base">
              {orderData.customer_name ?? "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update status</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateOrderStatus} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={orderData.id} />
            <select
              name="status"
              defaultValue={orderData.status}
              className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Save status
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
          <CardDescription>{itemList.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No line items.
                  </TableCell>
                </TableRow>
              ) : (
                itemList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.title_snapshot}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatBtn(item.unit_price_btn)}</TableCell>
                    <TableCell>{formatBtn(item.line_total_btn)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments</CardTitle>
          <CardDescription>{paymentList.length} payment(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No payments recorded.
                  </TableCell>
                </TableRow>
              ) : (
                paymentList.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="capitalize">
                      {payment.method.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatBtn(payment.amount_btn)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleString("en-BT")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {payment.status === "pending" ? (
                        <form action={markPaymentCompleted}>
                          <input type="hidden" name="id" value={payment.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Mark completed
                          </Button>
                        </form>
                      ) : null}
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
