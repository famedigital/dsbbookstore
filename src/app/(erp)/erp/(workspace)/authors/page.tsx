import { requireStaff } from "@/lib/erp/auth";
import { upsertAuthor } from "@/lib/erp/actions";
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
import type { Author } from "@/types/erp";

export default async function AuthorsPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: authors } = await supabase
    .from("authors")
    .select("*")
    .order("name");

  const list = (authors ?? []) as Author[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Authors
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage author profiles for catalogue titles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add author</CardTitle>
          <CardDescription>Create a new author profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertAuthor} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="auto-generated if empty" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create author</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All authors</CardTitle>
          <CardDescription>{list.length} author(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No authors yet.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {author.slug}
                    </TableCell>
                    <TableCell>
                      <form
                        action={upsertAuthor}
                        className="grid gap-2 sm:grid-cols-2"
                      >
                        <input type="hidden" name="id" value={author.id} />
                        <div className="space-y-1">
                          <Label htmlFor={`name-${author.id}`} className="text-xs">
                            Name
                          </Label>
                          <Input
                            id={`name-${author.id}`}
                            name="name"
                            defaultValue={author.name}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`slug-${author.id}`} className="text-xs">
                            Slug
                          </Label>
                          <Input
                            id={`slug-${author.id}`}
                            name="slug"
                            defaultValue={author.slug}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor={`bio-${author.id}`} className="text-xs">
                            Bio
                          </Label>
                          <Textarea
                            id={`bio-${author.id}`}
                            name="bio"
                            rows={2}
                            defaultValue={author.bio ?? ""}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Button type="submit" size="sm" variant="outline">
                            Save
                          </Button>
                        </div>
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
