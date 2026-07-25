import Link from "next/link";
import { requireStaff } from "@/lib/erp/auth";
import {
  assignEnquiry,
  convertEnquiryToCustomer,
  convertEnquiryToOrder,
  updateEnquiryStatus,
} from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Enquiry, EnquiryStatus, Profile } from "@/types/erp";
import { STAFF_ROLES } from "@/types/erp";

const ENQUIRY_STATUSES: EnquiryStatus[] = ["new", "in_progress", "closed"];

type EnquiryRow = Enquiry & {
  books: { title: string; slug: string } | null;
  customers: { id: string; full_name: string } | null;
};

function enquiryVariant(
  status: EnquiryStatus
): "default" | "secondary" | "outline" {
  switch (status) {
    case "new":
      return "default";
    case "in_progress":
      return "secondary";
    case "closed":
      return "outline";
    default:
      return "outline";
  }
}

export default async function EnquiriesPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: enquiries }, { data: staff }] = await Promise.all([
    supabase
      .from("enquiries")
      .select("*, books(title, slug), customers(id, full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", STAFF_ROLES)
      .eq("is_active", true)
      .order("full_name"),
  ]);

  const list = (enquiries ?? []) as EnquiryRow[];
  const staffList = (staff ?? []) as Pick<
    Profile,
    "id" | "full_name" | "email" | "role"
  >[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Enquiries
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customer messages from the storefront and catalogue.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All enquiries</CardTitle>
          <CardDescription>{list.length} message(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {list.length === 0 ? (
            <p className="text-muted-foreground text-sm">No enquiries yet.</p>
          ) : (
            list.map((enquiry) => (
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
                    {enquiry.books?.title ? (
                      <p className="mt-1 text-sm">
                        Book:{" "}
                        <span className="font-medium">{enquiry.books.title}</span>
                      </p>
                    ) : null}
                    {enquiry.customers ? (
                      <p className="mt-1 text-sm">
                        Customer:{" "}
                        <Link
                          href={`/erp/customers/${enquiry.customers.id}`}
                          className="font-medium hover:underline"
                        >
                          {enquiry.customers.full_name}
                        </Link>
                      </p>
                    ) : enquiry.customer_id ? (
                      <p className="mt-1 text-sm">
                        Customer:{" "}
                        <Link
                          href={`/erp/customers/${enquiry.customer_id}`}
                          className="font-medium hover:underline"
                        >
                          View linked customer
                        </Link>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={enquiryVariant(enquiry.status)}
                      className="capitalize"
                    >
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

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <form action={convertEnquiryToCustomer}>
                    <input type="hidden" name="id" value={enquiry.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Convert to customer
                    </Button>
                  </form>
                  <form action={convertEnquiryToOrder} className="flex gap-2">
                    <input type="hidden" name="id" value={enquiry.id} />
                    <input type="hidden" name="qty" value="1" />
                    <Button type="submit" size="sm" variant="outline">
                      Convert to order
                    </Button>
                  </form>
                </div>

                <form
                  action={assignEnquiry}
                  className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"
                >
                  <input type="hidden" name="id" value={enquiry.id} />
                  <div className="space-y-1">
                    <Label htmlFor={`assign-${enquiry.id}`} className="text-xs">
                      Assign to
                    </Label>
                    <select
                      id={`assign-${enquiry.id}`}
                      name="assigned_to"
                      defaultValue={enquiry.assigned_to ?? ""}
                      className="border-input bg-background h-8 w-full rounded-lg border px-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {staffList.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.full_name || profile.email || profile.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" size="sm" variant="secondary">
                      Assign
                    </Button>
                  </div>
                </form>

                <form
                  action={updateEnquiryStatus}
                  className="mt-3 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-[auto_1fr_auto]"
                >
                  <input type="hidden" name="id" value={enquiry.id} />
                  <div className="space-y-1">
                    <Label htmlFor={`status-${enquiry.id}`} className="text-xs">
                      Status
                    </Label>
                    <select
                      id={`status-${enquiry.id}`}
                      name="status"
                      defaultValue={enquiry.status}
                      className="border-input bg-background h-8 w-full rounded-lg border px-2 text-sm"
                    >
                      {ENQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`notes-${enquiry.id}`} className="text-xs">
                      Admin notes
                    </Label>
                    <Textarea
                      id={`notes-${enquiry.id}`}
                      name="admin_notes"
                      defaultValue={enquiry.admin_notes ?? ""}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" size="sm">
                      Update
                    </Button>
                  </div>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
