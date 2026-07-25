import { NextResponse } from "next/server";
import { canSeeCost, getSessionProfile } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { STAFF_ROLES } from "@/types/erp";

export const dynamic = "force-dynamic";

type ExportType = "sales" | "margin" | "low_stock";

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ].join("\n");
}

function csvResponse(filename: string, body: string) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const session = await getSessionProfile();
  if (!session || !STAFF_ROLES.includes(session.profile.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ExportType | null;

  if (type !== "sales" && type !== "margin" && type !== "low_stock") {
    return NextResponse.json(
      { error: "Invalid type. Use sales, margin, or low_stock." },
      { status: 400 }
    );
  }

  if (type === "margin" && !canSeeCost(session.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const since = daysAgoIso(30);
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "sales") {
    const { data, error } = await supabase
      .from("orders")
      .select("order_number, channel, status, customer_name, total_btn, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []).map((o) => [
      o.order_number,
      o.channel,
      o.status,
      o.customer_name,
      o.total_btn,
      o.created_at,
    ]);

    return csvResponse(
      `dsb-sales-30d-${stamp}.csv`,
      toCsv(
        [
          "order_number",
          "channel",
          "status",
          "customer_name",
          "total_btn",
          "created_at",
        ],
        rows
      )
    );
  }

  if (type === "margin") {
    const { data, error } = await supabase
      .from("order_items")
      .select(
        "title_snapshot, book_id, quantity, unit_price_btn, unit_cost_btn, line_total_btn, orders!inner(order_number, created_at, status)"
      )
      .gte("orders.created_at", since)
      .neq("orders.status", "cancelled")
      .order("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []).map((item) => {
      const order = item.orders as unknown as {
        order_number: string;
        created_at: string;
        status: string;
      };
      const qty = Number(item.quantity);
      const unitCost = Number(item.unit_cost_btn);
      const lineTotal = Number(item.line_total_btn);
      const lineMargin = lineTotal - qty * unitCost;

      return [
        order.order_number,
        item.title_snapshot,
        item.book_id,
        qty,
        item.unit_price_btn,
        item.unit_cost_btn,
        item.line_total_btn,
        lineMargin,
        order.created_at,
      ];
    });

    return csvResponse(
      `dsb-margin-30d-${stamp}.csv`,
      toCsv(
        [
          "order_number",
          "title",
          "book_id",
          "quantity",
          "unit_price_btn",
          "unit_cost_btn",
          "line_total_btn",
          "line_margin_btn",
          "created_at",
        ],
        rows
      )
    );
  }

  // low_stock
  const { data, error } = await supabase
    .from("books")
    .select("title, isbn_13, stock_qty, price_btn")
    .eq("availability_status", "low_stock")
    .order("stock_qty", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((b) => [
    b.title,
    b.isbn_13,
    b.stock_qty,
    b.price_btn,
  ]);

  return csvResponse(
    `dsb-low-stock-${stamp}.csv`,
    toCsv(["title", "isbn_13", "stock_qty", "price_btn"], rows)
  );
}
