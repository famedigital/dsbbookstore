import { requireOwner } from "@/lib/erp/auth";
import { updateStaffRole } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
import type { Profile, UserRole } from "@/types/erp";
import { STAFF_ROLES } from "@/types/erp";

const ROLES: UserRole[] = ["owner", "manager", "staff"];

export default async function StaffPage() {
  await requireOwner();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("role", STAFF_ROLES)
    .order("role")
    .order("full_name");

  const list = (profiles ?? []) as Profile[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Staff
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage team roles and access levels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team members</CardTitle>
          <CardDescription>{list.length} staff account(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current role</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No staff profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.full_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                        {!member.is_active ? " (inactive)" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <form
                        action={updateStaffRole}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="id" value={member.id} />
                        <select
                          name="role"
                          defaultValue={member.role}
                          className="border-input bg-background h-8 rounded-lg border px-2 text-xs"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id={`active-${member.id}`}
                            name="is_active"
                            defaultChecked={member.is_active}
                            className="size-4 rounded border border-input"
                          />
                          <Label
                            htmlFor={`active-${member.id}`}
                            className="text-xs font-normal"
                          >
                            Active
                          </Label>
                        </div>
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
    </div>
  );
}
