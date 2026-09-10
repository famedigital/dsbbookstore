import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManager } from "@/lib/erp/auth";
import { getCmsPageById } from "@/lib/storefront/cms";
import { updateCmsPage, updateCmsSection } from "@/lib/erp/actions";
import { CoverUpload } from "@/components/media/cover-upload";
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

type PageProps = { params: Promise<{ id: string }> };

function bodyToEditor(body: unknown): string {
  if (!Array.isArray(body)) return "";
  if (body.every((x) => typeof x === "string")) {
    return (body as string[]).join("\n\n");
  }
  return JSON.stringify(body, null, 2);
}

export default async function ContentEditPage({ params }: PageProps) {
  await requireManager();
  const { id } = await params;
  const page = await getCmsPageById(id);
  if (!page) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Content
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {page.title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Slug: {page.slug}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/erp/content">All pages</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page settings</CardTitle>
          <CardDescription>SEO and publish status</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCmsPage} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={page.id} />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={page.title} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="seo_title">SEO title</Label>
              <Input
                id="seo_title"
                name="seo_title"
                defaultValue={page.seo_title ?? ""}
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
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={page.status}
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">Save page</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {page.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-base font-mono text-sm">
              Section · {section.key}
            </CardTitle>
            <CardDescription>
              Paragraphs: blank line between. Cards: JSON array of{" "}
              {`{ "title", "body" }`}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateCmsSection} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={section.id} />
              <input type="hidden" name="page_id" value={page.id} />
              <div className="space-y-2">
                <Label htmlFor={`eyebrow-${section.id}`}>Eyebrow</Label>
                <Input
                  id={`eyebrow-${section.id}`}
                  name="eyebrow"
                  defaultValue={section.eyebrow ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`heading-${section.id}`}>Heading</Label>
                <Input
                  id={`heading-${section.id}`}
                  name="heading"
                  defaultValue={section.heading ?? ""}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`summary-${section.id}`}>Summary</Label>
                <Textarea
                  id={`summary-${section.id}`}
                  name="summary"
                  rows={2}
                  defaultValue={section.summary ?? ""}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`body-${section.id}`}>Body</Label>
                <Textarea
                  id={`body-${section.id}`}
                  name="body"
                  rows={8}
                  className="font-mono text-xs"
                  defaultValue={bodyToEditor(section.body)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cta_label-${section.id}`}>CTA label</Label>
                <Input
                  id={`cta_label-${section.id}`}
                  name="cta_label"
                  defaultValue={section.cta_label ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cta_href-${section.id}`}>CTA href</Label>
                <Input
                  id={`cta_href-${section.id}`}
                  name="cta_href"
                  defaultValue={section.cta_href ?? ""}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Image</Label>
                <CoverUpload
                  value={section.image_url}
                  inputName="image_url"
                  folder="dsb/cms"
                  label="Upload image"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`image_alt-${section.id}`}>Image alt</Label>
                <Input
                  id={`image_alt-${section.id}`}
                  name="image_alt"
                  defaultValue={section.image_alt ?? ""}
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  name="is_visible"
                  defaultChecked={section.is_visible}
                  className="size-4 rounded border"
                />
                Visible on storefront
              </label>
              <div>
                <Button type="submit">Save section</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
