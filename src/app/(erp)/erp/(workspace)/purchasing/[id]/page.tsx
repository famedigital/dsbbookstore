import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManager } from "@/lib/erp/auth";
import { receivePurchaseOrder } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
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
import type { PurchaseOrder, PurchaseOrderItem, PoStatus } from "@/types/erp";

type PageProps = {
  params: Promise<{ id: string }>;
};

type PoItemRow = PurchaseOrderItem & {
  books: { title: string } | null;
};

type PoDetail = PurchaseOrder & {
  suppliers: { name: string } | null;
};

export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireManager();
  const supabase = await createClient();

  const [{ data: po }, { data: items }] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("*, suppliers(name)")
      .eq("id", id)
      .single(),
    supabase
      .from("purchase_order_items")
      .select("*, books(title)")
      .eq("purchase_order_id", id)
      .order("id"),
  ]);

  if (!po) notFound();

  const order = po as PoDetail;
  const itemList = (items ?? []) as PoItemRow[];
  const canReceive =
    order.status === "ordered" || order.status === "partial";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {order.po_number}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {order.suppliers?.name ?? "No supplier"} ·{" "}
            {order.ordered_at
              ? new Date(order.ordered_at).toLocaleString("en-BT")
              : "Not ordered"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/erp/purchasing">Back to purchasing</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-base">
              <Badge variant="outline" className="capitalize">
                {order.status as PoStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lines</CardDescription>
            <CardTitle className="text-base">{itemList.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Notes</CardDescription>
            <CardTitle className="text-base font-normal">
              {order.notes || "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
          <CardDescription>
            Ordered vs received quantities and unit cost
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canReceive ? (
            <form action={receivePurchaseOrder} className="space-y-4">
              <input type="hidden" name="purchase_order_id" value={order.id} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Unit cost</TableHead>
                    <TableHead>Receive now</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No line items.
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemList.map((item) => {
                      const remaining = Math.max(
                        0,
                        item.qty_ordered - item.qty_received
                      );
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.books?.title ?? "—"}
                          </TableCell>
                          <TableCell>{item.qty_ordered}</TableCell>
                          <TableCell>{item.qty_received}</TableCell>
                          <TableCell>{remaining}</TableCell>
                          <TableCell>
                            {formatBtn(item.unit_cost_btn)}
                          </TableCell>
                          <TableCell>
                            {remaining > 0 ? (
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`receive_${item.id}`}
                                  className="sr-only"
                                >
                                  Receive qty for {item.books?.title ?? item.id}
                                </Label>
                                <Input
                                  id={`receive_${item.id}`}
                                  name={`receive_${item.id}`}
                                  type="number"
                                  min="0"
                                  max={remaining}
                                  placeholder="0"
                                  className="w-24"
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Complete
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <Button type="submit">Receive selected quantities</Button>
            </form>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Unit cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  itemList.map((item) => {
                    const remaining = Math.max(
                      0,
                      item.qty_ordered - item.qty_received
                    );
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.books?.title ?? "—"}
                        </TableCell>
                        <TableCell>{item.qty_ordered}</TableCell>
                        <TableCell>{item.qty_received}</TableCell>
                        <TableCell>{remaining}</TableCell>
                        <TableCell>{formatBtn(item.unit_cost_btn)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
