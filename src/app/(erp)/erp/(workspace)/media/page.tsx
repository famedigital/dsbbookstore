import { requireStaff } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import {
  uploadMediaToSupabase,
  generateAiCover,
  migrateMediaToCloudinary,
  attachMediaToBook,
  deleteMediaAsset,
} from "@/lib/erp/media-actions";
import { BookCover } from "@/components/media/book-cover";
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
import { Badge } from "@/components/ui/badge";
import type { MediaAsset } from "@/types/media";
import type { Book } from "@/types/erp";

export default async function MediaPage() {
  const { profile } = await requireStaff();
  const supabase = await createClient();
  const canMigrate =
    profile.role === "owner" || profile.role === "manager";

  const [{ data: media }, { data: books }] = await Promise.all([
    supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("books").select("id, title").order("title"),
  ]);

  const assets = (media ?? []) as MediaAsset[];
  const bookOptions = (books ?? []) as Pick<Book, "id" | "title">[];
  const aiConfigured = Boolean(process.env.AI_IMAGE_API_KEY);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Media
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload covers to Supabase, generate with AI, attach to books, and
          migrate to Cloudinary when ready.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload file</CardTitle>
            <CardDescription>
              Stored in the public <code>media</code> Supabase bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={uploadMediaToSupabase} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title (optional)</Label>
                <Input id="title" name="title" placeholder="Cover title" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="file">Image file</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  required
                />
              </div>
              <input type="hidden" name="kind" value="cover" />
              <Button type="submit">Upload to Supabase</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate AI cover</CardTitle>
            <CardDescription>
              {aiConfigured
                ? "Uses OpenAI images API, then saves to Supabase"
                : "AI_IMAGE_API_KEY not configured — upload only"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={generateAiCover} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ai_title">Book title (optional)</Label>
                <Input id="ai_title" name="title" placeholder="Title" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  rows={3}
                  required
                  disabled={!aiConfigured}
                  placeholder="Quiet Himalayan bookstore at dusk, painterly cover…"
                />
              </div>
              <Button type="submit" disabled={!aiConfigured}>
                Generate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Library</CardTitle>
          <CardDescription>{assets.length} asset(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No media yet. Upload a cover or generate one with AI.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <div className="overflow-hidden rounded-md bg-muted">
                    <BookCover
                      asset={asset}
                      alt={asset.title ?? "Media asset"}
                      width={400}
                      height={560}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="truncate text-sm font-medium">
                      {asset.title ?? "Untitled"}
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {asset.storage_provider}
                    </Badge>
                  </div>

                  <form action={attachMediaToBook} className="space-y-2">
                    <input type="hidden" name="media_id" value={asset.id} />
                    <Label
                      htmlFor={`book_${asset.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Attach to book
                    </Label>
                    <select
                      id={`book_${asset.id}`}
                      name="book_id"
                      required
                      className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select book…
                      </option>
                      {bookOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="secondary">
                      Attach
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {canMigrate &&
                    asset.storage_provider === "supabase" ? (
                      <form action={migrateMediaToCloudinary}>
                        <input
                          type="hidden"
                          name="media_id"
                          value={asset.id}
                        />
                        <Button type="submit" size="sm" variant="outline">
                          Migrate
                        </Button>
                      </form>
                    ) : null}
                    <form action={deleteMediaAsset}>
                      <input
                        type="hidden"
                        name="media_id"
                        value={asset.id}
                      />
                      <Button type="submit" size="sm" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
