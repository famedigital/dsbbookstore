import { requireManager } from "@/lib/erp/auth";
import {
  createPurchaseOrder,
  createSupplier,
  receivePurchaseOrder,
} from "@/lib/erp/actions";
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
import type { PurchaseOrder, Supplier } from "@/types/erp";

type PoRow = PurchaseOrder & {
  suppliers: { name: string } | null;
};

export default async function PurchasingPage() {
  await requireManager();
  const supabase = await createClient();

  const [{ data: suppliers }, { data: books }, { data: purchaseOrders }] =
    await Promise.all([
      supabase.from("suppliers").select("*").order("name"),
      supabase.from("books").select("id, title").order("title"),
      supabase
        .from("purchase_orders")
        .select("*, suppliers(name)")
        .order("created_at", { ascending: false }),
    ]);

  const supplierList = (suppliers ?? []) as Supplier[];
  const bookOptions = books ?? [];
  const poList = (purchaseOrders ?? []) as PoRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Purchasing
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Suppliers, purchase orders, and goods receipt.
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
            <CardTitle className="text-base">Create purchase order</CardTitle>
            <CardDescription>Order stock from a supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createPurchaseOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Supplier</Label>
                <select
                  id="supplier_id"
                  name="supplier_id"
                  className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                >
                  <option value="">No supplier</option>
                  {supplierList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="book_id">Book</Label>
                <select
                  id="book_id"
                  name="book_id"
                  required
                  className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                >
                  <option value="">Select a book…</option>
                  {bookOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qty_ordered">Quantity</Label>
                  <Input
                    id="qty_ordered"
                    name="qty_ordered"
                    type="number"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_cost_btn">Unit cost (BTN)</Label>
                  <Input
                    id="unit_cost_btn"
                    name="unit_cost_btn"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              <Button type="submit">Create PO</Button>
            </form>
          </CardContent>
        </Card>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase orders</CardTitle>
          <CardDescription>{poList.length} PO(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No purchase orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                poList.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">
                      {po.po_number}
                    </TableCell>
                    <TableCell>{po.suppliers?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {po.ordered_at
                        ? new Date(po.ordered_at).toLocaleDateString("en-BT")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {po.status !== "received" ? (
                        <form action={receivePurchaseOrder}>
                          <input
                            type="hidden"
                            name="purchase_order_id"
                            value={po.id}
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Receive
                          </Button>
                        </form>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Received
                        </span>
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
  );
}
