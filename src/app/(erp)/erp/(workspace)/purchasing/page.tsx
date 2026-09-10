import { requireManager } from "@/lib/erp/auth";
import { createSupplier } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { PurchaseBillForm } from "@/components/erp/purchase-bill-form";
import {
  PurchaseRegister,
  type PoListItem,
} from "@/components/erp/purchase-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Supplier } from "@/types/erp";

export default async function PurchasingPage() {
  await requireManager();
  const supabase = await createClient();

  const [{ data: suppliers }, { data: purchaseOrders }] = await Promise.all([
    supabase.from("suppliers").select("*").order("name"),
    supabase
      .from("purchase_orders")
      .select(
        "id, po_number, status, ordered_at, notes, suppliers(name), purchase_order_items(id, book_id, qty_ordered, qty_received, unit_cost_btn, books(title, barcode))"
      )
      .order("created_at", { ascending: false }),
  ]);

  const supplierList = (suppliers ?? []) as Supplier[];
  const poList = ((purchaseOrders ?? []) as Omit<PoListItem, "invoice_ref">[]).map(
    (po) => ({
      ...po,
      invoice_ref:
        po.notes?.match(/^Invoice:\s*(.+)$/m)?.[1]?.trim() ?? null,
    })
  ) as PoListItem[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Purchasing
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Multi-line supplier bills, partial goods receipt, stock via ledger.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add supplier</CardTitle>
            <CardDescription>Register a new vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createSupplier} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact name</Label>
                <Input id="contact_name" name="contact_name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" />
                </div>
              </div>
              <Button type="submit">Create supplier</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">New purchase bill</CardTitle>
            <CardDescription>
              Search products, add lines, set Pur Rate — then receive later
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseBillForm suppliers={supplierList} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase bills</CardTitle>
          <CardDescription>
            {poList.length} bill(s) · expand to partial-receive lines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PurchaseRegister orders={poList} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suppliers</CardTitle>
          <CardDescription>{supplierList.length} vendor(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No suppliers yet.
                  </TableCell>
                </TableRow>
              ) : (
                supplierList.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.contact_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.is_active ? "default" : "outline"}>
                        {s.is_active ? "Yes" : "No"}
                      </Badge>
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
