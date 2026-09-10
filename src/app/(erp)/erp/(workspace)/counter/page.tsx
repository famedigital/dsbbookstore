import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { CounterTill } from "@/components/erp/counter-till";
import type { CounterRecentSale } from "@/components/erp/counter-recent-sheet";
import type { Book, PaymentMethod } from "@/types/erp";

export const metadata = { title: "Counter" };

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function CounterPage() {
  const { profile } = await requireStaff();
  const supabase = await createClient();
  const todayIso = startOfTodayIso();

  const [{ data: items, error: itemsError }, { data: recentOrders }, { data: store }] =
    await Promise.all([
      supabase
        .from("books")
        .select(
          "id, title, price_btn, cost_price_btn, stock_qty, availability_status, format, isbn_13, barcode, product_kind"
        )
        .gt("stock_qty", 0)
        .order("title"),
      supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          total_btn,
          customer_name,
          created_at,
          order_items ( title_snapshot, quantity, unit_price_btn, line_total_btn ),
          payments ( method )
        `
        )
        .eq("channel", "pos")
        .gte("created_at", todayIso)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("store_settings")
        .select("store_name, bank_qr_image_url")
        .eq("id", 1)
        .maybeSingle(),
    ]);

  // Fallback if product_kind / barcode columns are missing (migration not applied).
  let stockRows = items;
  if (itemsError || !stockRows) {
    const { data: fallback } = await supabase
      .from("books")
      .select(
        "id, title, price_btn, cost_price_btn, stock_qty, availability_status, format, isbn_13"
      )
      .gt("stock_qty", 0)
      .order("title");
    stockRows = fallback;
  }

  const itemList = ((stockRows ?? []) as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    price_btn: Number(row.price_btn),
    cost_price_btn: Number(row.cost_price_btn),
    stock_qty: Number(row.stock_qty),
    availability_status: row.availability_status as Book["availability_status"],
    format: (row.format as string) ?? null,
    isbn_13: (row.isbn_13 as string) ?? null,
    barcode: (row.barcode as string) ?? null,
    product_kind: (row.product_kind as Book["product_kind"]) ?? "book",
  }));

  const recent: CounterRecentSale[] = (recentOrders ?? []).map((row) => {
    const payments = row.payments as { method: PaymentMethod }[] | null;
    const lines = (row.order_items ?? []) as {
      title_snapshot: string;
      quantity: number;
      unit_price_btn: number;
      line_total_btn: number;
    }[];
    return {
      id: row.id as string,
      orderNumber: row.order_number as string,
      total: Number(row.total_btn),
      paymentMethod: payments?.[0]?.method ?? "cash",
      customerName: (row.customer_name as string) || "Walk-in",
      createdAt: row.created_at as string,
      lines: lines.map((l) => ({
        title: l.title_snapshot,
        qty: Number(l.quantity),
        unitPrice: Number(l.unit_price_btn),
        lineTotal: Number(l.line_total_btn),
      })),
    };
  });

  const shop = store as {
    store_name?: string;
    bank_qr_image_url?: string | null;
  } | null;

  return (
    <div className="flex min-h-[calc(100dvh-2.75rem)] flex-col">
      <CounterTill
        items={itemList}
        canSeeCost={canSeeCost(profile.role)}
        initialRecent={recent}
        shopName={shop?.store_name ?? "DSB Books"}
        bankQrImageUrl={shop?.bank_qr_image_url ?? null}
      />
    </div>
  );
}
