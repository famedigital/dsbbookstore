import Link from "next/link";
import { requireManager } from "@/lib/erp/auth";
import { listCmsPages } from "@/lib/storefront/cms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Content" };

export default async function ContentListPage() {
  await requireManager();
  const pages = await listCmsPages();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Content
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Edit storefront page copy, CTAs, and images. Layouts stay in code.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pages</CardTitle>
          <CardDescription>
            {pages.length} page(s) — open a page to edit sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {pages.map((page) => (
              <li
                key={page.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{page.title}</p>
                  <p className="text-muted-foreground text-xs">
                    /{page.slug === "home" ? "" : page.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      page.status === "published" ? "default" : "secondary"
                    }
                  >
                    {page.status}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/erp/content/${page.id}`}>Edit</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
