import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getStoreSettingsPublic } from "@/lib/cms/get-page";
import {
  CartView,
  type CartBook,
} from "@/components/storefront/cart-view";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your DSB Books cart.",
};

async function booksFromCookie(): Promise<CartBook[]> {
  if (!isSupabaseConfigured()) return [];
  const cookieStore = await cookies();
  const raw = cookieStore.get("dsb_cart")?.value;
  if (!raw) return [];
  let lines: { bookId: string; qty: number }[] = [];
  try {
    lines = JSON.parse(decodeURIComponent(raw)) as {
      bookId: string;
      qty: number;
    }[];
  } catch {
    try {
      lines = JSON.parse(raw) as { bookId: string; qty: number }[];
    } catch {
      return [];
    }
  }
  const ids = [...new Set(lines.map((l) => l.bookId).filter(Boolean))];
  if (!ids.length) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("id, title, slug, price_btn, stock_qty, cover_public_id")
    .in("id", ids)
    .eq("is_published", true);

  return (data ?? []) as CartBook[];
}

export default async function CartPage() {
  const settings = await getStoreSettingsPublic();
  if (!settings.online_checkout_enabled) {
    redirect("/books");
  }

  const books = await booksFromCookie();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 pb-20">
      <p className="text-muted-foreground text-sm">
        <Link href="/books" className="hover:text-primary">
          ← Catalogue
        </Link>
      </p>
      <h1 className="font-heading mt-2 text-4xl font-semibold">Cart</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Review titles before checkout. Prices in Bhutanese Ngultrum (BTN).
      </p>
      <div className="mt-10">
        <CartView books={books} />
      </div>
    </div>
  );
}
