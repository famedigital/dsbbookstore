import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { PosClient } from "@/components/erp/pos-client";
import type { Book } from "@/types/erp";

export default async function PosPage() {
  const { profile } = await requireStaff();
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("id, title, price_btn, cost_price_btn, stock_qty, availability_status")
    .order("title");

  const bookList = (books ?? []) as Pick<
    Book,
    "id" | "title" | "price_btn" | "cost_price_btn" | "stock_qty" | "availability_status"
  >[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Point of Sale
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          In-store checkout for walk-in customers.
        </p>
      </div>

      <PosClient books={bookList} canSeeCost={canSeeCost(profile.role)} />
    </div>
  );
}
