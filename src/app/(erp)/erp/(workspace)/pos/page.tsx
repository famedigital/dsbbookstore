import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { openPosSession, closePosSession } from "@/lib/erp/actions";
import { PosClient } from "@/components/erp/pos-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBtn } from "@/lib/erp/format";
import type { Book } from "@/types/erp";

export default async function PosPage() {
  const { userId, profile } = await requireStaff();
  const supabase = await createClient();

  const [{ data: books }, { data: openSession }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, price_btn, cost_price_btn, stock_qty, availability_status")
      .order("title"),
    supabase
      .from("pos_sessions")
      .select("*")
      .eq("opened_by", userId)
      .is("closed_at", null)
      .maybeSingle(),
  ]);

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

      {!openSession ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Open POS session</CardTitle>
            <CardDescription>
              Start a cash session before taking sales. Enter the opening float
              in the till.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={openPosSession} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="opening_float">Opening float (Nu.)</Label>
                <Input
                  id="opening_float"
                  name="opening_float"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  required
                />
              </div>
              <Button type="submit">Open session</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base">Session open</CardTitle>
              <CardDescription>
                Opened {new Date(openSession.opened_at).toLocaleString()} ·
                float {formatBtn(openSession.opening_float_btn)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={closePosSession} className="space-y-4">
                <input type="hidden" name="session_id" value={openSession.id} />
                <div className="space-y-1">
                  <Label htmlFor="closing_cash">Closing cash (Nu.)</Label>
                  <Input
                    id="closing_cash"
                    name="closing_cash"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
                <Button type="submit" variant="outline">
                  Close session
                </Button>
              </form>
            </CardContent>
          </Card>

          <PosClient books={bookList} canSeeCost={canSeeCost(profile.role)} />
        </>
      )}
    </div>
  );
}
