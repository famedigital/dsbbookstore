import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe } from "@/lib/commerce/stripe";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service role is required for Stripe webhooks");
  }
  return createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function markOrderPaid(orderId: string, sessionId: string) {
  const supabase = getAdminClient();

  const { data: existing } = await supabase
    .from("payments")
    .select("id, status, reference")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Idempotent: already completed with this session reference
  if (
    existing?.status === "completed" &&
    existing.reference === sessionId
  ) {
    return;
  }

  // Another webhook already completed with a different reference — skip stock
  if (existing?.status === "completed") {
    return;
  }

  const paidAt = new Date().toISOString();

  if (existing?.id) {
    const { error } = await supabase
      .from("payments")
      .update({
        status: "completed",
        method: "card",
        reference: sessionId,
        paid_at: paidAt,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { data: order } = await supabase
      .from("orders")
      .select("total_btn")
      .eq("id", orderId)
      .single();
    const { error } = await supabase.from("payments").insert({
      order_id: orderId,
      method: "card",
      status: "completed",
      amount_btn: Number(order?.total_btn ?? 0),
      reference: sessionId,
      paid_at: paidAt,
    });
    if (error) throw new Error(error.message);
  }

  await supabase
    .from("orders")
    .update({ status: "paid", updated_at: paidAt })
    .eq("id", orderId);

  // Idempotent stock: skip if sale_out already recorded for this order
  const { data: priorMoves } = await supabase
    .from("stock_movements")
    .select("id")
    .eq("reference_type", "order")
    .eq("reference_id", orderId)
    .eq("movement_type", "sale_out")
    .limit(1);

  if (priorMoves?.length) return;

  const { data: items } = await supabase
    .from("order_items")
    .select("book_id, quantity")
    .eq("order_id", orderId);

  const { data: orderRow } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  for (const item of items ?? []) {
    await supabase.from("stock_movements").insert({
      book_id: item.book_id,
      movement_type: "sale_out",
      qty_delta: -Number(item.quantity),
      reason: `Online Stripe order ${orderRow?.order_number ?? orderId}`,
      reference_type: "order",
      reference_id: orderId,
    });
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      try {
        await markOrderPaid(orderId, session.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Webhook failed";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
