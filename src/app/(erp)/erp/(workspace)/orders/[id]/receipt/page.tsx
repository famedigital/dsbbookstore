import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/erp/print-button";
import type { Order, OrderItem, Payment, StoreSettings } from "@/types/erp";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: payments }, { data: store }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", id),
      supabase.from("payments").select("*").eq("order_id", id),
      supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  if (!order) notFound();
  const o = order as Order;
  const lines = (items ?? []) as OrderItem[];
  const pays = (payments ?? []) as Payment[];
  const s = store as StoreSettings | null;

  return (
    <div className="mx-auto max-w-md space-y-6 print:max-w-none">
      <div className="flex gap-2 print:hidden">
        <Button asChild variant="outline" size="sm">
          <Link href="/erp/pos">← POS</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/erp/orders/${o.id}`}>Order</Link>
        </Button>
        <PrintButton />
      </div>

      <article className="rounded-lg border bg-white p-6 text-sm shadow-sm print:border-0 print:shadow-none">
        <header className="border-b pb-4 text-center">
          <p className="font-heading text-xl font-semibold">
            {s?.store_name ?? "DSB Books"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {s?.address_line1}
            {s?.city ? `, ${s.city}` : ""}
          </p>
          {s?.phone ? (
            <p className="text-muted-foreground text-xs">{s.phone}</p>
          ) : null}
        </header>

        <div className="mt-4 space-y-1 text-xs">
          <p>
            <span className="text-muted-foreground">Receipt</span>{" "}
            {o.order_number}
          </p>
          <p>
            <span className="text-muted-foreground">Date</span>{" "}
            {new Date(o.created_at).toLocaleString()}
          </p>
          <p>
            <span className="text-muted-foreground">Customer</span>{" "}
            {o.customer_name ?? "Walk-in"}
          </p>
          <p className="capitalize">
            <span className="text-muted-foreground">Channel</span> {o.channel}
          </p>
        </div>

        <table className="mt-4 w-full text-xs">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-dashed">
                <td className="py-2 pr-2">{line.title_snapshot}</td>
                <td className="py-2">{line.quantity}</td>
                <td className="py-2 text-right">
                  {formatBtn(line.line_total_btn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBtn(o.subtotal_btn)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatBtn(o.total_btn)}</span>
          </div>
        </div>

        <div className="text-muted-foreground mt-4 space-y-1 border-t pt-4 text-xs">
          {pays.map((p) => (
            <p key={p.id} className="capitalize">
              Paid via {p.method.replace("_", " ")} — {formatBtn(p.amount_btn)}{" "}
              ({p.status})
            </p>
          ))}
          {s?.receipt_footer ? (
            <p className="pt-2 text-center">{s.receipt_footer}</p>
          ) : (
            <p className="pt-2 text-center">Thank you for shopping at DSB Books</p>
          )}
        </div>
      </article>
    </div>
  );
}
