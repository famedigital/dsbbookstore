import Link from "next/link";
import { requireManager } from "@/lib/erp/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { storefrontPathForSlug } from "@/lib/cms/get-page";
import { FALLBACK_CMS_PAGES } from "@/lib/cms/fallback-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { CmsPage } from "@/types/erp";

export default async function ContentPagesPage() {
  await requireManager();

  let pages: CmsPage[] = [];
  let tableMissing = false;

  if (!isSupabaseConfigured()) {
    pages = FALLBACK_CMS_PAGES;
    tableMissing = true;
  } else {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .order("sort_order");
      if (error) {
        tableMissing = true;
        pages = FALLBACK_CMS_PAGES;
      } else {
        pages = (data ?? []) as CmsPage[];
        if (!pages.length) {
          pages = FALLBACK_CMS_PAGES;
        }
      }
    } catch {
      tableMissing = true;
      pages = FALLBACK_CMS_PAGES;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Content
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Edit storefront pages and home sections.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/erp/content/home">Home sections</Link>
        </Button>
      </div>

      {tableMissing ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          CMS tables are not available yet (run the cms_commerce migration). Showing
          fallback page list — edits will fail until Supabase is migrated.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CMS pages</CardTitle>
          <CardDescription>{pages.length} page(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No CMS pages found.
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {page.slug}
                    </TableCell>
                    <TableCell className="capitalize">{page.template}</TableCell>
                    <TableCell>
                      <Badge
                        variant={page.is_published ? "default" : "outline"}
                      >
                        {page.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(page.updated_at).toLocaleDateString("en-BT")}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/erp/content/${page.id}`}>Edit</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={storefrontPathForSlug(page.slug)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Preview
                        </Link>
                      </Button>
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
