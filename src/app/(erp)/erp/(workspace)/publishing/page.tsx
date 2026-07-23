import { requireManager } from "@/lib/erp/auth";
import { createPublishingTitle } from "@/lib/erp/actions";
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
import type { PublishingStage, PublishingTitle } from "@/types/erp";

const STAGES: PublishingStage[] = [
  "idea",
  "editing",
  "design",
  "print",
  "published",
  "archived",
];

export default async function PublishingPage() {
  await requireManager();
  const supabase = await createClient();

  const [{ data: titles }, { data: books }] = await Promise.all([
    supabase
      .from("publishing_titles")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase.from("books").select("id, title").order("title"),
  ]);

  const titleList = (titles ?? []) as PublishingTitle[];
  const bookOptions = books ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Publishing
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          DSB Publication pipeline and editorial workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New publishing title</CardTitle>
          <CardDescription>Start tracking a manuscript or project</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPublishingTitle} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="working_title">Working title</Label>
              <Input id="working_title" name="working_title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <select
                id="stage"
                name="stage"
                defaultValue="idea"
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="book_id">Linked book (optional)</Label>
              <select
                id="book_id"
                name="book_id"
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                <option value="">None</option>
                {bookOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="editor_notes">Editor notes</Label>
              <Textarea id="editor_notes" name="editor_notes" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create title</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing pipeline</CardTitle>
          <CardDescription>{titleList.length} title(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Working title</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Target date</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {titleList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No publishing titles yet.
                  </TableCell>
                </TableRow>
              ) : (
                titleList.map((title) => (
                  <TableRow key={title.id}>
                    <TableCell className="font-medium">
                      {title.working_title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {title.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {title.target_publish_date
                        ? new Date(title.target_publish_date).toLocaleDateString(
                            "en-BT"
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(title.updated_at).toLocaleDateString("en-BT")}
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
