import { requireStaff } from "@/lib/erp/auth";
import { upsertCategory } from "@/lib/erp/actions";
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
import type { Category } from "@/types/erp";

export default async function CategoriesPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  const list = (categories ?? []) as Category[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Categories
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organise books into browseable categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add category</CardTitle>
          <CardDescription>Create a new book category</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertCategory} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="auto-generated if empty" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={0}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create category</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All categories</CardTitle>
          <CardDescription>{list.length} category(ies)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>
                      <form
                        action={upsertCategory}
                        className="grid gap-2 sm:grid-cols-2"
                      >
                        <input type="hidden" name="id" value={category.id} />
                        <div className="space-y-1">
                          <Label
                            htmlFor={`name-${category.id}`}
                            className="text-xs"
                          >
                            Name
                          </Label>
                          <Input
                            id={`name-${category.id}`}
                            name="name"
                            defaultValue={category.name}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`slug-${category.id}`}
                            className="text-xs"
                          >
                            Slug
                          </Label>
                          <Input
                            id={`slug-${category.id}`}
                            name="slug"
                            defaultValue={category.slug}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`sort-${category.id}`}
                            className="text-xs"
                          >
                            Sort order
                          </Label>
                          <Input
                            id={`sort-${category.id}`}
                            name="sort_order"
                            type="number"
                            defaultValue={category.sort_order}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label
                            htmlFor={`desc-${category.id}`}
                            className="text-xs"
                          >
                            Description
                          </Label>
                          <Textarea
                            id={`desc-${category.id}`}
                            name="description"
                            rows={2}
                            defaultValue={category.description ?? ""}
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
