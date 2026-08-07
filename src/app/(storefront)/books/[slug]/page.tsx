import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { getStoreSettingsPublic } from "@/lib/cms/get-page";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { JsonLd } from "@/components/storefront/json-ld";
import type { Book } from "@/types/erp";
import { Badge } from "@/components/ui/badge";
import { getSiteUrl } from "@/lib/storefront/site";

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
    openGraph: { title, description: description ?? undefined },
  };
}

type AuthorLink = { authors: { id: string; name: string; slug: string } | null };

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
    .select("*, book_authors(authors(id, name, slug))")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();
  const book = data as Book & { book_authors?: AuthorLink[] | null };
  const settings = await getStoreSettingsPublic();
  const canAddToCart =
    Boolean(settings.online_checkout_enabled) &&
    book.stock_qty > 0 &&
    book.availability_status !== "enquire_only" &&
    book.availability_status !== "out_of_stock" &&
    book.availability_status !== "coming_soon";

  const authors =
    book.book_authors
      ?.map((ba) => ba.authors)
      .filter((a): a is NonNullable<typeof a> => !!a) ?? [];

  const { data: relatedRaw } = await supabase
    .from("books")
    .select("*")
    .eq("is_published", true)
    .neq("id", book.id)
    .order("updated_at", { ascending: false })
    .limit(4);
  const related = (relatedRaw as Book[]) ?? [];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 pb-20 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          description: book.description ?? book.subtitle ?? undefined,
          isbn: book.isbn_13 ?? undefined,
          url: `${getSiteUrl()}/books/${book.slug}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "BTN",
            price: book.price_btn,
            availability:
              book.stock_qty > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }}
      />
      <BookCover
        publicId={book.cover_public_id}
        alt={book.title}
        width={640}
        height={960}
        className="w-full rounded-sm object-cover shadow-xl"
      />
      <div>
        <Link href="/books" className="text-sm text-muted-foreground hover:text-primary">
          ← Catalogue
        </Link>
        <Badge variant="secondary" className="mt-4">
          {availabilityLabel(book.availability_status)}
        </Badge>
        <h1 className="mt-4 font-heading text-4xl font-semibold md:text-5xl">
          {book.title}
        </h1>
        {book.subtitle ? (
          <p className="mt-3 text-lg text-muted-foreground">{book.subtitle}</p>
        ) : null}
        {authors.length ? (
          <p className="mt-3 text-sm">
            {authors.map((a, i) => (
              <span key={a.id}>
                {i > 0 ? ", " : ""}
                <Link href={`/authors/${a.slug}`} className="text-primary hover:underline">
                  {a.name}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
        <p className="mt-6 text-2xl font-medium text-primary">
          {formatBtn(book.price_btn)}
        </p>
        {canAddToCart ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AddToCartButton bookId={book.id} />
            <Button asChild variant="outline">
              <Link href="/cart">View cart</Link>
            </Button>
          </div>
        ) : null}
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
          <form
            action={submitPublicEnquiry}
            className="mt-10 space-y-3 rounded-lg border bg-white/80 p-5"
          >
            <h2 className="font-heading text-xl">Enquire about this book</h2>
            <input type="hidden" name="book_id" value={book.id} />
            <input type="hidden" name="book_slug" value={book.slug} />
            <input type="hidden" name="topic" value="title" />
            <div className="absolute -left-[9999px] opacity-0" aria-hidden>
              <Label htmlFor="company_website">Company website</Label>
              <Input
                id="company_website"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
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
                minLength={10}
                defaultValue={`I would like to enquire about "${book.title}".`}
              />
            </div>
            <Button type="submit">Send enquiry</Button>
          </form>
        )}

        {related.length ? (
          <div className="mt-14">
            <h2 className="font-heading text-2xl font-semibold">Related titles</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/books/${r.slug}`} className="group flex gap-4">
                    <BookCover
                      publicId={r.cover_public_id}
                      alt={r.title}
                      width={120}
                      height={180}
                      className="h-24 w-16 shrink-0 rounded-sm object-cover shadow"
                    />
                    <div>
                      <p className="font-heading group-hover:text-primary">{r.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatBtn(r.price_btn)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
