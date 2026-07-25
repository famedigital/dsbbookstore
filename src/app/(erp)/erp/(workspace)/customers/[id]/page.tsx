import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/erp/auth";
import { upsertCustomer } from "@/lib/erp/actions";
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
import type { Customer, Enquiry, Order } from "@/types/erp";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireStaff();
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const customerData = customer as Customer;
  const email = customerData.email?.trim() || null;
  const phone = customerData.phone?.trim() || null;

  const { data: linkedOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  let softOrders: Order[] = [];
  if (email || phone) {
    const quote = (value: string) => `"${value.replace(/"/g, '\\"')}"`;
    const orParts: string[] = [];
    if (email) orParts.push(`customer_email.eq.${quote(email)}`);
    if (phone) orParts.push(`customer_phone.eq.${quote(phone)}`);
    const { data: soft } = await supabase
      .from("orders")
      .select("*")
      .is("customer_id", null)
      .or(orParts.join(","))
      .order("created_at", { ascending: false });
    softOrders = (soft ?? []) as Order[];
  }

  const orderMap = new Map<string, Order>();
  for (const order of [...((linkedOrders ?? []) as Order[]), ...softOrders]) {
    orderMap.set(order.id, order);
  }
  const orders = Array.from(orderMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const { data: linkedEnquiries } = await supabase
    .from("enquiries")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  let emailEnquiries: Enquiry[] = [];
  if (email) {
    const { data: byEmail } = await supabase
      .from("enquiries")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });
    emailEnquiries = (byEmail ?? []) as Enquiry[];
  }

  const enquiryMap = new Map<string, Enquiry>();
  for (const enquiry of [
    ...((linkedEnquiries ?? []) as Enquiry[]),
    ...emailEnquiries,
  ]) {
    enquiryMap.set(enquiry.id, enquiry);
  }
  const enquiryList = Array.from(enquiryMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {customerData.full_name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Customer profile and purchase history
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/erp/customers">Back to customers</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit customer</CardTitle>
          <CardDescription>Update CRM details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertCustomer} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={customerData.id} />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={customerData.full_name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customerData.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customerData.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                defaultValue={customerData.organization ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_type">Type</Label>
              <select
                id="customer_type"
                name="customer_type"
                defaultValue={customerData.customer_type || "individual"}
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
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={customerData.notes ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save customer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase history</CardTitle>
          <CardDescription>
            {orders.length} order(s) — linked by customer id
            {email || phone ? ", plus unmatched email/phone matches" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/erp/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      {!order.customer_id ? (
                        <span className="text-muted-foreground ml-2 text-xs">
                          (soft match)
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="capitalize">{order.channel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatBtn(order.total_btn)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.created_at).toLocaleString("en-BT")}
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
          <CardTitle className="text-base">Related enquiries</CardTitle>
          <CardDescription>{enquiryList.length} message(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {enquiryList.length === 0 ? (
            <p className="text-muted-foreground text-sm">No related enquiries.</p>
          ) : (
            enquiryList.map((enquiry) => (
              <article
                key={enquiry.id}
                className="rounded-lg border border-border/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{enquiry.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {enquiry.email}
                      {enquiry.phone ? ` · ${enquiry.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {enquiry.status.replace("_", " ")}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {new Date(enquiry.created_at).toLocaleString("en-BT")}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {enquiry.message}
                </p>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
