import Link from "next/link";
import { requireManager } from "@/lib/erp/auth";
import { upsertCmsSection } from "@/lib/erp/actions";
import { listCmsSectionsAdmin } from "@/lib/cms/get-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ContentHomeSectionsPage() {
  await requireManager();
  const sections = await listCmsSectionsAdmin();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/erp/content" className="hover:text-primary">
            ← Content
          </Link>
        </p>
        <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
          Home sections
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Edit keyed copy slots used on the storefront home page.
        </p>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{section.label}</CardTitle>
              <CardDescription className="font-mono text-xs">
                {section.key}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={upsertCmsSection}
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="key" value={section.key} />
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`value-${section.id}`}>Value</Label>
                  <Input
                    id={`value-${section.id}`}
                    name="value_text"
                    defaultValue={section.value_text ?? ""}
                  />
                </div>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
