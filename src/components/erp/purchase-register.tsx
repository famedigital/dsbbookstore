"use client";

import { Fragment, useState, useTransition } from "react";
import { receivePurchaseOrder } from "@/lib/erp/actions";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PoStatus } from "@/types/erp";

export type PoListItem = {
  id: string;
  po_number: string;
  invoice_ref: string | null;
  status: PoStatus;
  ordered_at: string | null;
  notes: string | null;
  suppliers: { name: string } | null;
  purchase_order_items: {
    id: string;
    book_id: string;
    qty_ordered: number;
    qty_received: number;
    unit_cost_btn: number;
    books: { title: string; barcode: string | null } | null;
  }[];
};

export function PurchaseRegister({ orders }: { orders: PoListItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function open(po: PoListItem) {
    setOpenId(po.id);
    setError(null);
    const next: Record<string, number> = {};
    for (const item of po.purchase_order_items) {
      const rem = item.qty_ordered - item.qty_received;
      next[item.id] = rem > 0 ? rem : 0;
    }
    setQtyMap(next);
  }

  function receive(po: PoListItem, allRemaining: boolean) {
    setError(null);
    const lines = po.purchase_order_items
      .map((item) => {
        const remaining = item.qty_ordered - item.qty_received;
        const qty = allRemaining
          ? remaining
          : Math.min(remaining, Math.max(0, qtyMap[item.id] ?? 0));
        return { item_id: item.id, qty };
      })
      .filter((l) => l.qty > 0);

    if (!lines.length) {
      setError("Enter qty to receive on at least one line");
      return;
    }

    const fd = new FormData();
    fd.set("purchase_order_id", po.id);
    fd.set("lines", JSON.stringify(lines));
    start(async () => {
      try {
        await receivePurchaseOrder(fd);
        setOpenId(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Receive failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO #</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Lines</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ordered</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground">
                No purchase bills yet.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((po) => {
              const expanded = openId === po.id;
              const canReceive =
                po.status !== "received" && po.status !== "cancelled";
              return (
                <Fragment key={po.id}>
                  <TableRow>
                    <TableCell className="font-mono text-xs">
                      {po.po_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {po.invoice_ref || "—"}
                    </TableCell>
                    <TableCell>{po.suppliers?.name ?? "—"}</TableCell>
                    <TableCell>{po.purchase_order_items.length}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {po.ordered_at
                        ? new Date(po.ordered_at).toLocaleDateString("en-BT")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => (expanded ? setOpenId(null) : open(po))}
                      >
                        {expanded ? "Close" : canReceive ? "Receive" : "Lines"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/20">
                        <div className="space-y-3 py-2">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted-foreground text-left text-xs">
                                <th className="py-1 pr-2 font-medium">Product</th>
                                <th className="py-1 pr-2 text-right font-medium">
                                  Ordered
                                </th>
                                <th className="py-1 pr-2 text-right font-medium">
                                  Received
                                </th>
                                <th className="py-1 pr-2 text-right font-medium">
                                  Pur Rate
                                </th>
                                <th className="py-1 text-right font-medium">
                                  Receive now
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {po.purchase_order_items.map((item) => {
                                const rem =
                                  item.qty_ordered - item.qty_received;
                                return (
                                  <tr
                                    key={item.id}
                                    className="border-t border-border/60"
                                  >
                                    <td className="py-2 pr-2">
                                      <div className="font-medium">
                                        {item.books?.title ?? "—"}
                                      </div>
                                      <div className="text-muted-foreground font-mono text-xs">
                                        {item.books?.barcode || "—"}
                                      </div>
                                    </td>
                                    <td className="py-2 pr-2 text-right tabular-nums">
                                      {item.qty_ordered}
                                    </td>
                                    <td className="py-2 pr-2 text-right tabular-nums">
                                      {item.qty_received}
                                    </td>
                                    <td className="py-2 pr-2 text-right tabular-nums">
                                      {formatBtn(item.unit_cost_btn)}
                                    </td>
                                    <td className="py-2 text-right">
                                      {canReceive && rem > 0 ? (
                                        <Input
                                          type="number"
                                          min={0}
                                          max={rem}
                                          value={qtyMap[item.id] ?? 0}
                                          onChange={(e) =>
                                            setQtyMap((m) => ({
                                              ...m,
                                              [item.id]: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                              ),
                                            }))
                                          }
                                          className="ml-auto h-8 w-20 text-right"
                                        />
                                      ) : (
                                        <span className="text-muted-foreground text-xs">
                                          —
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {error && openId === po.id ? (
                            <p className="text-destructive text-sm">{error}</p>
                          ) : null}
                          {canReceive ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                disabled={pending}
                                onClick={() => receive(po, false)}
                              >
                                {pending ? "Posting…" : "Receive entered qty"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={pending}
                                onClick={() => receive(po, true)}
                              >
                                Receive all remaining
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
