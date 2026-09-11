import Link from "next/link";
import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { updatePickupHoldStatus } from "@/lib/erp/actions";
import { formatBtn } from "@/lib/erp/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Pickup holds" };

type HoldRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  status: string;
  items: Array<{ title: string; qty: number; price_btn: number; isbn?: string | null }>;
  total_btn: number;
  created_at: string;
};

export default async function HoldsPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data } = await supabase
    .from("pickup_holds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);

  const holds = (data ?? []) as HoldRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Pickup holds
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Storefront reserve requests — confirm stock, mark ready, collect at
          Counter.
        </p>
      </div>

      <div className="grid gap-4">
        {holds.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-sm">
              No holds yet. They appear when customers request pickup on the
              website.
            </CardContent>
          </Card>
        ) : (
          holds.map((h) => (
            <Card key={h.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{h.name}</CardTitle>
                  <CardDescription>
                    {h.phone}
                    {h.email ? ` · ${h.email}` : ""} ·{" "}
                    {new Date(h.created_at).toLocaleString("en-BT")}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="uppercase">
                  {h.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-sm">
                  {(h.items || []).map((item, i) => (
                    <li key={`${item.title}-${i}`}>
                      {item.title} ×{item.qty}
                      {item.isbn ? (
                        <span className="text-muted-foreground"> · {item.isbn}</span>
                      ) : null}
                      <span className="float-right tabular-nums">
                        {formatBtn(item.qty * item.price_btn)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold tabular-nums">
                  Est. {formatBtn(h.total_btn)}
                </p>
                {h.note ? (
                  <p className="text-muted-foreground text-sm">Note: {h.note}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {(["new", "ready", "collected", "cancelled"] as const).map(
                    (status) => (
                      <form key={status} action={updatePickupHoldStatus}>
                        <input type="hidden" name="id" value={h.id} />
                        <input type="hidden" name="status" value={status} />
                        <Button
                          type="submit"
                          size="sm"
                          variant={h.status === status ? "default" : "outline"}
                        >
                          {status}
                        </Button>
                      </form>
                    )
                  )}
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/erp/counter">Open Counter</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
