import Link from "next/link";
import { requireManager } from "@/lib/erp/auth";
import {
  createPurchaseOrder,
  upsertSupplier,
} from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { PoLineEditor } from "@/components/erp/po-line-editor";
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
  const bookOptions = (books ?? []) as { id: string; title: string }[];
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
            <form action={upsertSupplier} className="space-y-4">
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
                  {supplierList
                    .filter((s) => s.is_active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <PoLineEditor books={bookOptions} />
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
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
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
                    <TableCell>
                      <form
                        action={upsertSupplier}
                        className="flex flex-col gap-2 sm:min-w-[16rem]"
                      >
                        <input type="hidden" name="id" value={s.id} />
                        <Input
                          name="name"
                          defaultValue={s.name}
                          required
                          aria-label="Supplier name"
                        />
                        <Input
                          name="contact_name"
                          defaultValue={s.contact_name ?? ""}
                          placeholder="Contact"
                          aria-label="Contact name"
                        />
                        <input
                          type="hidden"
                          name="email"
                          value={s.email ?? ""}
                        />
                        <input
                          type="hidden"
                          name="phone"
                          value={s.phone ?? ""}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={s.is_active}
                          />
                          Active
                        </label>
                        <Button type="submit" size="sm" variant="outline">
                          Save
                        </Button>
                      </form>
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
                      <Link
                        href={`/erp/purchasing/${po.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {po.po_number}
                      </Link>
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
                      {po.status === "ordered" || po.status === "partial" ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/erp/purchasing/${po.id}`}>Open</Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/erp/purchasing/${po.id}`}>View</Link>
                        </Button>
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
