import type { Metadata } from "next";
import Link from "next/link";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getStripe } from "@/lib/commerce/stripe";
import { ClearCartOnMount } from "@/components/storefront/clear-cart-on-mount";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order received",
  description: "Thank you for your DSB Books order.",
};

async function resolveOrderLabel(orderParam: string | undefined) {
  if (!orderParam) return null;

  // Stripe success_url may pass session id
  if (orderParam.startsWith("cs_")) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(orderParam);
      const orderId = session.metadata?.order_id;
      if (orderId && isSupabaseConfigured()) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const admin = createSupabaseAdmin(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data } = await admin
          .from("orders")
          .select("order_number")
          .eq("id", orderId)
          .maybeSingle();
        return data?.order_number ?? null;
      }
    } catch {
      return null;
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("orders")
        .select("order_number")
        .eq("order_number", orderParam)
        .maybeSingle();
      return data?.order_number ?? orderParam;
    } catch {
      return orderParam;
    }
  }

  return orderParam;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = await resolveOrderLabel(order);

  return (
    <div className="mx-auto max-w-lg px-6 py-16 pb-24 text-center">
      <ClearCartOnMount />
      <h1 className="font-heading text-4xl font-semibold">Thank you</h1>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        Your order has been received
        {orderNumber ? (
          <>
            {" "}
            as{" "}
            <span className="text-foreground font-medium">{orderNumber}</span>
          </>
        ) : null}
        . We will confirm fulfilment by email.
      </p>
      <p className="text-muted-foreground mt-3 text-sm">
        Card payments may take a moment to finalise — if you paid by card, stock
        updates when Stripe confirms the charge.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/books">Continue browsing</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
