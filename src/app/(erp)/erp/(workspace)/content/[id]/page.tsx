import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManager } from "@/lib/erp/auth";
import { upsertCmsPage } from "@/lib/erp/actions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { storefrontPathForSlug } from "@/lib/cms/get-page";
import { FALLBACK_CMS_PAGES } from "@/lib/cms/fallback-content";
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
import type { CmsPage, CmsPageTemplate } from "@/types/erp";

const TEMPLATES: CmsPageTemplate[] = ["hub", "article", "legal", "simple"];

export default async function EditCmsPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManager();
  const { id } = await params;

  let page: CmsPage | null = null;

  if (!isSupabaseConfigured()) {
    page = FALLBACK_CMS_PAGES.find((p) => p.id === id || p.slug === id) ?? null;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    page = (data as CmsPage | null) ?? null;
    if (!page) {
      page =
        FALLBACK_CMS_PAGES.find((p) => p.id === id || p.slug === id) ?? null;
    }
  }

  if (!page) notFound();

  const previewHref = storefrontPathForSlug(page.slug);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            <Link href="/erp/content" className="hover:text-primary">
              ← Content
            </Link>
          </p>
          <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
            Edit page
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {page.slug}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={previewHref} target="_blank" rel="noreferrer">
            Preview live
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{page.title}</CardTitle>
          <CardDescription>
            Markdown body and SEO fields. Required pages cannot be unpublished.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertCmsPage} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={page.id} />
            <input type="hidden" name="slug" value={page.slug} />
            {page.is_required ? (
              <input type="hidden" name="is_required" value="on" />
            ) : null}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={page.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nav_label">Nav label</Label>
              <Input
                id="nav_label"
                name="nav_label"
                defaultValue={page.nav_label ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <select
                id="template"
                name="template"
                defaultValue={page.template}
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={page.subtitle ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="body_md">Body (Markdown)</Label>
              <Textarea
                id="body_md"
                name="body_md"
                rows={16}
                defaultValue={page.body_md}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO title</Label>
              <Input
                id="seo_title"
                name="seo_title"
                defaultValue={page.seo_title ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={page.sort_order}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="seo_description">SEO description</Label>
              <Textarea
                id="seo_description"
                name="seo_description"
                rows={2}
                defaultValue={page.seo_description ?? ""}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="show_enquire_cta"
                name="show_enquire_cta"
                defaultChecked={page.show_enquire_cta}
                className="size-4 rounded border"
              />
              <Label htmlFor="show_enquire_cta">Show enquire CTA</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enquire_topic">Enquire topic</Label>
              <Input
                id="enquire_topic"
                name="enquire_topic"
                defaultValue={page.enquire_topic ?? ""}
                placeholder="general"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                defaultChecked={page.is_published}
                disabled={page.is_required}
                className="size-4 rounded border disabled:opacity-50"
              />
              <Label htmlFor="is_published">
                Published
                {page.is_required ? " (required page)" : ""}
              </Label>
              {page.is_required ? (
                <input type="hidden" name="is_published" value="on" />
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save page</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
