"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/erp/actions";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order, OrderStatus, PaymentMethod } from "@/types/erp";

export type OrderListRow = Order & {
  lines: {
    title: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  paymentMethod: PaymentMethod | string | null;
};

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

function payLabel(method: string | null | undefined) {
  if (!method) return "—";
  if (method === "bank_qr") return "Bank QR";
  if (method === "card") return "Card";
  if (method === "cash") return "Cash";
  return method.replace(/_/g, " ");
}

export function OrdersTable({
  orders,
  shopName = "DSB Books",
  shopAddress,
}: {
  orders: OrderListRow[];
  shopName?: string;
  shopAddress?: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = orders.find((o) => o.id === openId) ?? null;

  return (
    <>
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
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-muted-foreground">
                No orders yet.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setOpenId(order.id)}
                  >
                    {order.order_number}
                  </button>
                </TableCell>
                <TableCell className="capitalize">{order.channel}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(order.status)}
                    className="capitalize"
                  >
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenId(order.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setOpenId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Receipt {selected?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="border border-border bg-card px-4 py-5 text-foreground">
              <p className="text-center font-heading text-xl tracking-tight">
                {shopName}
              </p>
              {shopAddress ? (
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {shopAddress}
                </p>
              ) : null}
              <p className="mt-2 text-center text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase">
                Retail receipt
              </p>
              <hr className="my-3 border-border" />
              <div className="space-y-1.5 text-xs">
                <p className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Order</span>
                  <span className="font-mono">{selected.order_number}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {new Date(selected.created_at).toLocaleString("en-BT")}
                  </span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Party</span>
                  <span>{selected.customer_name || "Walk-in"}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="capitalize">{selected.channel}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">
                    {selected.status.replace("_", " ")}
                  </span>
                </p>
              </div>
              <hr className="my-3 border-border" />
              <ul className="space-y-2 text-sm">
                {selected.lines.length === 0 ? (
                  <li className="text-muted-foreground text-xs">No line items.</li>
                ) : (
                  selected.lines.map((line, i) => (
                    <li key={`${line.title}-${i}`} className="flex gap-2">
                      <span className="min-w-0 flex-1">{line.title}</span>
                      <span className="tabular-nums text-muted-foreground">
                        ×{line.qty}
                      </span>
                      <span className="w-20 text-right tabular-nums">
                        {formatBtn(line.lineTotal)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
              <hr className="my-3 border-foreground/40" />
              <p className="flex justify-between text-base font-semibold">
                <span>TOTAL</span>
                <span className="tabular-nums">
                  {formatBtn(selected.total_btn)}
                </span>
              </p>
              <p className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Paid</span>
                <span>{payLabel(selected.paymentMethod)}</span>
              </p>
              <div className="mt-5 flex justify-end gap-2 print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenId(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
