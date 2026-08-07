import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getStoreSettingsPublic,
  listShippingZones,
} from "@/lib/cms/get-page";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your DSB Books order.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const settings = await getStoreSettingsPublic();
  if (!settings.online_checkout_enabled) {
    redirect("/books");
  }

  const { cancelled } = await searchParams;
  const zones = await listShippingZones();

  let books: {
    id: string;
    title: string;
    price_btn: number;
    stock_qty: number;
  }[] = [];

  if (isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const raw = cookieStore.get("dsb_cart")?.value;
    if (raw) {
      let lines: { bookId: string; qty: number }[] = [];
      try {
        lines = JSON.parse(decodeURIComponent(raw));
      } catch {
        try {
          lines = JSON.parse(raw);
        } catch {
          lines = [];
        }
      }
      const ids = [...new Set(lines.map((l) => l.bookId).filter(Boolean))];
      if (ids.length) {
        const supabase = await createClient();
        const { data } = await supabase
          .from("books")
          .select("id, title, price_btn, stock_qty")
          .in("id", ids)
          .eq("is_published", true);
        books = data ?? [];
      }
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12 pb-20">
      <p className="text-muted-foreground text-sm">
        <Link href="/cart" className="hover:text-primary">
          ← Cart
        </Link>
      </p>
      <h1 className="font-heading mt-2 text-4xl font-semibold">Checkout</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Pickup in Thimphu, delivery within Bhutan, or international shipping.
      </p>
      <div className="mt-10">
        <CheckoutForm
          books={books}
          zones={zones}
          stripeEnabled={Boolean(settings.stripe_enabled)}
          btnPerUsd={Number(settings.btn_per_usd ?? 84)}
          cancelled={cancelled === "1"}
        />
      </div>
    </div>
  );
}
