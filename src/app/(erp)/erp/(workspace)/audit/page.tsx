import { requireManager } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
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
import type { AuditLog } from "@/types/erp";

type AuditRow = AuditLog & {
  actor: { full_name: string | null; email: string | null } | null;
};

function shortId(id: string | null) {
  if (!id) return "—";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-BT", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatMeta(meta: Record<string, unknown> | null) {
  if (!meta || Object.keys(meta).length === 0) return "—";
  const raw = JSON.stringify(meta);
  return raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;
}

function actorLabel(actor: AuditRow["actor"], actorId: string | null) {
  if (!actor) return actorId ? shortId(actorId) : "—";
  return actor.full_name || actor.email || (actorId ? shortId(actorId) : "—");
}

export default async function AuditPage() {
  await requireManager();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_id, action, entity_type, entity_id, meta, created_at, actor:profiles!actor_id(full_name, email)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (data ?? []) as unknown as AuditRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Audit
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Recent staff actions across catalogue, POS, purchasing, and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>
            Latest 100 audit log entries (managers and owners)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive text-sm">
              Could not load audit logs: {error.message}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No audit entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm tabular-nums">
                        {formatWhen(log.created_at)}
                      </TableCell>
                      <TableCell className="max-w-[10rem] truncate text-sm">
                        {actorLabel(log.actor, log.actor_id)}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.entity_type}
                      </TableCell>
                      <TableCell
                        className="font-mono text-xs tabular-nums"
                        title={log.entity_id ?? undefined}
                      >
                        {shortId(log.entity_id)}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground max-w-[14rem] truncate font-mono text-xs"
                        title={
                          log.meta ? JSON.stringify(log.meta) : undefined
                        }
                      >
                        {formatMeta(log.meta)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
