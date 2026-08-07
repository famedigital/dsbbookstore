import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { orderNumber } from "@/lib/erp/format";
import type {
  FulfillmentType,
  Order,
  PaymentMethod,
} from "@/types/erp";

export type OnlineCartLine = {
  bookId: string;
  qty: number;
};

export type OnlineOrderContact = {
  name: string;
  email: string;
  phone?: string;
};

export type ShippingAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
};

function zoneToFulfillment(zoneCode: string): FulfillmentType {
  switch (zoneCode) {
    case "pickup":
      return "pickup";
    case "bhutan":
      return "nationwide";
    case "international":
      return "international";
    default:
      return "pickup";
  }
}

async function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createSupabaseAdmin(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createClient();
}

export async function createOnlineOrder(input: {
  lines: OnlineCartLine[];
  contact: OnlineOrderContact;
  zoneCode: string;
  paymentMethod: PaymentMethod;
  shippingAddress?: ShippingAddress | null;
  notes?: string | null;
}): Promise<Order> {
  if (!input.lines.length) throw new Error("Cart is empty");

  const supabase = await getDbClient();

  const bookIds = input.lines.map((l) => l.bookId);
  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("id, title, price_btn, cost_price_btn, stock_qty, is_published")
    .in("id", bookIds);

  if (booksError) throw new Error(booksError.message);
  if (!books?.length) throw new Error("No books found for cart");

  const bookMap = new Map(books.map((b) => [b.id, b]));

  for (const line of input.lines) {
    const book = bookMap.get(line.bookId);
    if (!book || !book.is_published) {
      throw new Error("One or more titles are unavailable");
    }
    if (line.qty <= 0) throw new Error("Invalid quantity");
    if (book.stock_qty < line.qty) {
      throw new Error(`Insufficient stock for “${book.title}”`);
    }
  }

  const { data: zone } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("code", input.zoneCode)
    .eq("is_active", true)
    .maybeSingle();

  const shippingFee = Number(zone?.fee_btn ?? 0);
  const fulfillmentType = zoneToFulfillment(input.zoneCode);

  const orderLines = input.lines.map((line) => {
    const book = bookMap.get(line.bookId)!;
    return {
      book_id: book.id,
      title_snapshot: book.title as string,
      quantity: line.qty,
      unit_price_btn: Number(book.price_btn),
      unit_cost_btn: Number(book.cost_price_btn ?? 0),
      line_total_btn: line.qty * Number(book.price_btn),
    };
  });

  const subtotal = orderLines.reduce((s, l) => s + l.line_total_btn, 0);
  const total = subtotal + shippingFee;
  const number = orderNumber();

  const isCard = input.paymentMethod === "card";
  const status =
    input.paymentMethod === "cod"
      ? "cod_pending"
      : isCard
        ? "confirmed"
        : "confirmed";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: number,
      channel: "online",
      status,
      customer_name: input.contact.name,
      customer_email: input.contact.email,
      customer_phone: input.contact.phone || null,
      fulfillment_type: fulfillmentType,
      shipping_address: input.shippingAddress ?? null,
      subtotal_btn: subtotal,
      shipping_fee_btn: shippingFee,
      total_btn: total,
      notes: input.notes || null,
    })
    .select("*")
    .single();

  if (orderError) throw new Error(orderError.message);

  const items = orderLines.map((l) => ({
    ...l,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw new Error(itemsError.message);

  const { error: payError } = await supabase.from("payments").insert({
    order_id: order.id,
    method: input.paymentMethod,
    status: "pending",
    amount_btn: total,
    reference: null,
  });
  if (payError) throw new Error(payError.message);

  // Stock is decremented on payment completion (Stripe webhook or staff confirm)
  // for card/COD/transfer — except we still hold inventory integrity via stock checks.
  // For non-card local methods, decrement now so stock reflects the sale.
  if (!isCard) {
    for (const line of input.lines) {
      const book = bookMap.get(line.bookId)!;
      const { error: stockError } = await supabase.from("stock_movements").insert({
        book_id: line.bookId,
        movement_type: "sale_out",
        qty_delta: -line.qty,
        reason: `Online order ${number}`,
        reference_type: "order",
        reference_id: order.id,
      });
      if (stockError) throw new Error(stockError.message);
      void book;
    }
  }

  return order as Order;
}
