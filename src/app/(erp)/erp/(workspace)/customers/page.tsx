import { requireStaff } from "@/lib/erp/auth";
import { upsertCustomer } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
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
import type { Customer } from "@/types/erp";

export default async function CustomersPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (customers ?? []) as Customer[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Customers
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          CRM records for repeat buyers and organisations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add customer</CardTitle>
          <CardDescription>Create a new CRM record</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertCustomer} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" name="organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_type">Type</Label>
              <select
                id="customer_type"
                name="customer_type"
                defaultValue="individual"
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                <option value="individual">Individual</option>
                <option value="school">School</option>
                <option value="business">Business</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create customer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All customers</CardTitle>
          <CardDescription>{list.length} record(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Organization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {customer.customer_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.organization ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
