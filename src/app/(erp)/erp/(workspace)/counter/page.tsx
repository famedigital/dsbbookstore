import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { CounterTill } from "@/components/erp/counter-till";
import type { CounterRecentSale } from "@/components/erp/counter-recent-sheet";
import type { PaymentMethod } from "@/types/erp";

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

  // Free-tier: do NOT load 6k SKUs — CounterTill typeaheads via searchProducts.
  const [{ data: recentOrders }, { data: store }] = await Promise.all([
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
        canSeeCost={canSeeCost(profile.role)}
        initialRecent={recent}
        shopName={shop?.store_name ?? "DSB Books"}
        bankQrImageUrl={shop?.bank_qr_image_url ?? null}
      />
    </div>
  );
}
