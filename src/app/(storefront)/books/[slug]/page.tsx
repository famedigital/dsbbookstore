import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Book } from "@/types/erp";

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
  const theme = await getStorefrontTheme();

  return (
    <StorefrontShell active="/books" theme={theme}>
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:py-20">
        <div className="bg-[color:var(--dsb-stone)] p-3 md:p-5">
          <BookCover
            publicId={book.cover_public_id}
            alt={book.title}
            width={640}
            height={960}
            className="w-full object-cover"
          />
        </div>
        <div>
          <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
            {availabilityLabel(book.availability_status)}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
            {book.title}
          </h1>
          {book.subtitle ? (
            <p className="mt-4 text-lg text-muted-foreground">{book.subtitle}</p>
          ) : null}
          <p className="mt-8 font-heading text-3xl text-[color:var(--dsb-lacquer)]">
            {formatBtn(book.price_btn)}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[color:var(--dsb-line)] py-6 text-sm">
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                ISBN
              </dt>
              <dd className="mt-1">{book.isbn_13 ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                Format
              </dt>
              <dd className="mt-1 capitalize">{book.format ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                Language
              </dt>
              <dd className="mt-1">{book.language ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                Publisher
              </dt>
              <dd className="mt-1">{book.publisher_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                On hand
              </dt>
              <dd className="mt-1">{book.stock_qty}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                Pages
              </dt>
              <dd className="mt-1">{book.page_count ?? "—"}</dd>
            </div>
          </dl>
          {book.description ? (
            <p className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {book.description}
            </p>
          ) : null}

          {sent === "1" ? (
            <Alert className="mt-10 rounded-none border-[color:var(--dsb-gilt)]/40 bg-[color:var(--dsb-stone)]/50">
              <AlertDescription>
                Thank you — your enquiry has been sent. We will reply by email.
              </AlertDescription>
            </Alert>
          ) : (
            <form
              action={submitPublicEnquiry}
              className="mt-10 space-y-3 border border-[color:var(--dsb-line)] bg-[color:var(--dsb-stone)]/35 p-6"
            >
              <h2 className="font-heading text-2xl">Enquire about this book</h2>
              <input type="hidden" name="book_id" value={book.id} />
              <input type="hidden" name="book_slug" value={book.slug} />
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="rounded-none" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="rounded-none"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" className="rounded-none" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  className="rounded-none"
                  defaultValue={`I would like to enquire about "${book.title}".`}
                />
              </div>
              <Button
                type="submit"
                className="rounded-none bg-[color:var(--dsb-lacquer)] hover:bg-[#4a1c16]"
              >
                Send enquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </StorefrontShell>
  );
}
