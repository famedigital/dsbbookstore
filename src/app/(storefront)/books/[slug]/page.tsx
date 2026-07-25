import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { bookCoverProps } from "@/lib/media/book-cover-props";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { BookDetailHero } from "@/components/storefront/book-detail-hero";
import {
  FadeIn,
  Stagger,
  StaggerItem,
} from "@/components/storefront/motion";
import type { Author, Book } from "@/types/erp";
import type { MediaAsset } from "@/types/media";

type BookWithRelations = Book & {
  cover?: MediaAsset | null;
  book_authors?: { authors: Pick<Author, "name" | "slug"> | null }[];
};

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
    .select(
      "*, cover:media_assets!cover_media_id(*), book_authors(authors(name, slug))"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();
  const book = data as BookWithRelations;
  const authors =
    book.book_authors
      ?.map((row) => row.authors)
      .filter((a): a is Pick<Author, "name" | "slug"> => Boolean(a)) ?? [];

  const { data: relatedRows } = await supabase
    .from("books")
    .select("*, cover:media_assets!cover_media_id(*)")
    .eq("is_published", true)
    .neq("id", book.id)
    .order("is_featured", { ascending: false })
    .limit(4);

  const related =
    (relatedRows as (Book & { cover?: MediaAsset | null })[]) ?? [];

  return (
    <div className="min-h-screen bg-[linear-gradient(165deg,#f3f6fb_0%,#f7f4ec_50%,#eef5f1_100%)]">
      <StorefrontHeader />

      <div className="mx-auto w-full max-w-6xl px-5 pt-6 md:px-8">
        <Link
          href="/books"
          className="text-sm text-muted-foreground transition hover:text-primary"
        >
          ← Back to catalogue
        </Link>
      </div>

      <div className="pt-8 md:pt-12">
        <BookDetailHero
          cover={
            <BookCover
              {...bookCoverProps(book)}
              alt={book.title}
              width={720}
              height={1080}
              className="aspect-[2/3] w-full object-cover"
            />
          }
          body={
            <div>
              <p className="text-xs tracking-[0.2em] text-secondary uppercase">
                {availabilityLabel(book.availability_status)}
                {book.stock_qty > 0 ? ` · ${book.stock_qty} on hand` : ""}
              </p>
              <h1 className="mt-3 font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {book.title}
              </h1>
              {book.subtitle ? (
                <p className="mt-3 text-lg text-muted-foreground md:text-xl">
                  {book.subtitle}
                </p>
              ) : null}

              {authors.length > 0 ? (
                <p className="mt-5 text-base text-foreground/85">
                  by{" "}
                  {authors.map((author, i) => (
                    <span key={author.slug}>
                      {i > 0 ? ", " : ""}
                      <Link
                        href={`/authors/${author.slug}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {author.name}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}

              <p className="mt-8 font-heading text-3xl font-semibold text-primary md:text-4xl">
                {formatBtn(book.price_btn)}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-primary/10 py-6 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Publisher</dt>
                  <dd className="mt-1 font-medium">
                    {book.publisher_name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="mt-1 font-medium capitalize">
                    {book.format ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Language</dt>
                  <dd className="mt-1 font-medium">{book.language ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pages</dt>
                  <dd className="mt-1 font-medium">
                    {book.page_count ?? "—"}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-muted-foreground">ISBN</dt>
                  <dd className="mt-1 font-mono text-xs font-medium md:text-sm">
                    {book.isbn_13 ?? "—"}
                  </dd>
                </div>
              </dl>

              {book.description ? (
                <div className="mt-8">
                  <h2 className="font-heading text-xl font-semibold">
                    About this book
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90 md:text-lg md:leading-8">
                    {book.description}
                  </p>
                </div>
              ) : null}

              <div className="mt-10 hidden md:block">
                {sent === "1" ? (
                  <Alert className="border-primary/30 bg-white/90">
                    <AlertDescription>
                      Thank you — your enquiry has been sent. We will reply by
                      email.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <EnquiryForm book={book} />
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Mobile sticky enquire */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-primary/15 bg-[#f7f4ec]/95 p-3 pb-safe backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold">
              {book.title}
            </p>
            <p className="text-sm text-primary">{formatBtn(book.price_btn)}</p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <a href="#enquire">Enquire</a>
          </Button>
        </div>
      </div>

      <div id="enquire" className="mx-auto w-full max-w-6xl px-5 pb-10 md:hidden md:px-8">
        {sent === "1" ? (
          <Alert className="border-primary/30 bg-white/90">
            <AlertDescription>
              Thank you — your enquiry has been sent. We will reply by email.
            </AlertDescription>
          </Alert>
        ) : (
          <EnquiryForm book={book} />
        )}
      </div>

      {related.length > 0 ? (
        <section className="border-t border-primary/10 bg-white/35 py-14 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            <FadeIn y={10}>
              <h2 className="font-heading text-2xl font-semibold md:text-3xl">
                You may also like
              </h2>
            </FadeIn>
            <Stagger className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
              {related.map((item) => (
                <StaggerItem key={item.id}>
                  <Link href={`/books/${item.slug}`} className="group block">
                    <BookCover
                      {...bookCoverProps(item)}
                      alt={item.title}
                      width={360}
                      height={540}
                      className="aspect-[2/3] w-full object-cover shadow-md transition duration-500 group-hover:scale-[1.02]"
                    />
                    <h3 className="mt-3 font-heading text-sm leading-snug group-hover:text-primary md:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatBtn(item.price_btn)}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function EnquiryForm({ book }: { book: Pick<Book, "id" | "slug" | "title"> }) {
  return (
    <form
      action={submitPublicEnquiry}
      className="space-y-4 border border-primary/10 bg-white/80 p-5 shadow-[0_20px_50px_-40px_rgba(11,61,145,0.45)] md:p-6"
    >
      <div>
        <h2 className="font-heading text-xl font-semibold md:text-2xl">
          Enquire about this book
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll confirm availability and reply by email.
        </p>
      </div>
      <input type="hidden" name="book_id" value={book.id} />
      <input type="hidden" name="book_slug" value={book.slug} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" autoComplete="tel" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={3}
          defaultValue={`I would like to enquire about "${book.title}".`}
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Send enquiry
      </Button>
    </form>
  );
}
