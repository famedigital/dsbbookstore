import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  OrdersTable,
  type OrderListRow,
} from "@/components/erp/orders-table";
import type { Order, PaymentMethod } from "@/types/erp";

export default async function OrdersPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: orders }, { data: store }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
        *,
        order_items ( title_snapshot, quantity, unit_price_btn, line_total_btn ),
        payments ( method )
      `
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("store_settings")
      .select("store_name, address_line1, city")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const list: OrderListRow[] = ((orders ?? []) as (Order & {
    order_items?: {
      title_snapshot: string;
      quantity: number;
      unit_price_btn: number;
      line_total_btn: number;
    }[];
    payments?: { method: PaymentMethod }[];
  })[]).map((row) => ({
    ...row,
    lines: (row.order_items ?? []).map((l) => ({
      title: l.title_snapshot,
      qty: Number(l.quantity),
      unitPrice: Number(l.unit_price_btn),
      lineTotal: Number(l.line_total_btn),
    })),
    paymentMethod: row.payments?.[0]?.method ?? null,
  }));

  const shop = store as {
    store_name?: string;
    address_line1?: string | null;
    city?: string | null;
  } | null;
  const shopAddress = [shop?.address_line1, shop?.city]
    .filter(Boolean)
    .join(", ");

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
          <OrdersTable
            orders={list}
            shopName={shop?.store_name ?? "DSB Books"}
            shopAddress={shopAddress || null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
