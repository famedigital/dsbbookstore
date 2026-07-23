import { requireManager } from "@/lib/erp/auth";
import { createExpense } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Expense, Payment } from "@/types/erp";

export default async function FinancePage() {
  await requireManager();
  const supabase = await createClient();

  const [{ data: payments }, { data: expenses }] = await Promise.all([
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false }),
  ]);

  const paymentList = (payments ?? []) as Payment[];
  const expenseList = (expenses ?? []) as Expense[];

  const completedPaymentsSum = paymentList
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount_btn), 0);

  const expensesSum = expenseList.reduce(
    (sum, e) => sum + Number(e.amount_btn),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Finance
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Payments, expenses, and cash flow overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed payments (recent 50)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatBtn(completedPaymentsSum)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total expenses</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatBtn(expensesSum)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record expense</CardTitle>
          <CardDescription>Log operational spending</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createExpense} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount_btn">Amount (BTN)</Label>
              <Input
                id="amount_btn"
                name="amount_btn"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date">Date</Label>
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add expense</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent payments</CardTitle>
            <CardDescription>Last 50 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No payments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentList.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="capitalize">
                        {payment.method.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "failed"
                                ? "destructive"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBtn(payment.amount_btn)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(
                          payment.paid_at ?? payment.created_at
                        ).toLocaleDateString("en-BT")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses</CardTitle>
            <CardDescription>{expenseList.length} record(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No expenses yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseList.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.category}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-muted-foreground text-xs">
                        {expense.description ?? "—"}
                      </TableCell>
                      <TableCell>{formatBtn(expense.amount_btn)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(expense.expense_date).toLocaleDateString(
                          "en-BT"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
