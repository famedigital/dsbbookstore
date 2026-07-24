import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Book } from "@/types/erp";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!isSupabaseConfigured()) {
    return { title: "Book" };
  }

  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("title, subtitle, seo_title, seo_description, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) {
    return { title: "Book not found" };
  }

  const title = data.seo_title || data.title;
  const description =
    data.seo_description ||
    data.subtitle ||
    (data.description ? data.description.slice(0, 160) : undefined);

  return {
    title,
    description,
  };
}

export default async function BookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  if (!isSupabaseConfigured()) notFound();

  const { slug } = await params;
  const { sent } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();
  const book = data as Book;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec,#eef2f8)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
        <Link href="/books" className="text-sm hover:text-primary">
          ← Catalogue
        </Link>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <BookCover
          publicId={book.cover_public_id}
          alt={book.title}
          width={640}
          height={960}
          className="w-full rounded-sm object-cover shadow-xl"
        />
        <div>
          <Badge variant="secondary">{availabilityLabel(book.availability_status)}</Badge>
          <h1 className="mt-4 font-heading text-4xl font-semibold md:text-5xl">
            {book.title}
          </h1>
          {book.subtitle ? (
            <p className="mt-3 text-lg text-muted-foreground">{book.subtitle}</p>
          ) : null}
          <p className="mt-6 text-2xl font-medium text-primary">
            {formatBtn(book.price_btn)}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">ISBN</dt>
              <dd>{book.isbn_13 ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Format</dt>
              <dd className="capitalize">{book.format ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Language</dt>
              <dd>{book.language ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Publisher</dt>
              <dd>{book.publisher_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">On hand</dt>
              <dd>{book.stock_qty}</dd>
            </div>
          </dl>
          {book.description ? (
            <p className="mt-8 whitespace-pre-wrap leading-relaxed text-foreground/90">
              {book.description}
            </p>
          ) : null}

          {sent === "1" ? (
            <Alert className="mt-10 border-primary/30 bg-white/90">
              <AlertDescription>
                Thank you — your enquiry has been sent. We will reply by email.
              </AlertDescription>
            </Alert>
          ) : (
            <form action={submitPublicEnquiry} className="mt-10 space-y-3 rounded-lg border bg-white/80 p-5">
              <h2 className="font-heading text-xl">Enquire about this book</h2>
              <input type="hidden" name="book_id" value={book.id} />
              <input type="hidden" name="book_slug" value={book.slug} />
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  defaultValue={`I would like to enquire about "${book.title}".`}
                />
              </div>
              <Button type="submit">Send enquiry</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
