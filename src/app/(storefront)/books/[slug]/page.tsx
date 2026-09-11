import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { JsonLd } from "@/components/storefront/json-ld";
import { RelatedBooks } from "@/components/storefront/related-books";
import {
  BookPurchaseActions,
  StockAlertForm,
} from "@/components/storefront/book-purchase-actions";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GOOGLE_MAPS_URL,
  localBusinessJsonLd,
  productJsonLd,
  SITE_URL,
} from "@/lib/storefront/seo";
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
    .select(
      "title, subtitle, seo_title, seo_description, description, brand, price_btn, cover_public_id, isbn_13, barcode"
    )
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
    (data.description ? data.description.slice(0, 160) : undefined) ||
    `Buy ${data.title} at DSB Books, Thimphu — Nu. ${Number(data.price_btn || 0).toFixed(0)}.`;

  const ogImage =
    data.cover_public_id?.startsWith("http") ||
    data.cover_public_id?.startsWith("/")
      ? data.cover_public_id.startsWith("/")
        ? `${SITE_URL}${data.cover_public_id}`
        : data.cover_public_id
      : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/books/${slug}` },
    openGraph: {
      title: `${title} · DSB Books`,
      description,
      url: `${SITE_URL}/books/${slug}`,
      type: "book",
      locale: "en_BT",
      siteName: "DSB Books",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
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
  const canBuy =
    book.availability_status === "in_stock" ||
    book.availability_status === "low_stock";

  const [{ data: authorRows }, { data: catRows }] = await Promise.all([
    supabase
      .from("book_authors")
      .select("authors(id, name, slug)")
      .eq("book_id", book.id)
      .limit(4),
    supabase
      .from("book_categories")
      .select("category_id")
      .eq("book_id", book.id)
      .limit(3),
  ]);

  const authors = (authorRows ?? [])
    .map((r) => {
      const a = r.authors as unknown as
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null;
      if (!a) return null;
      return Array.isArray(a) ? a[0] : a;
    })
    .filter(Boolean) as { id: string; name: string; slug: string }[];

  const categoryIds = (catRows ?? []).map((c) => c.category_id as string);
  let related: Array<{
    id: string;
    title: string;
    slug: string;
    brand: string | null;
    price_btn: number;
    cover_public_id: string | null;
    isbn_13: string | null;
    barcode: string | null;
  }> = [];

  if (categoryIds.length) {
    const { data: relatedRows } = await supabase
      .from("book_categories")
      .select(
        "books(id, title, slug, brand, price_btn, cover_public_id, isbn_13, barcode, is_published, product_kind)"
      )
      .in("category_id", categoryIds)
      .limit(24);
    const seen = new Set<string>([book.id]);
    for (const row of relatedRows ?? []) {
      const b = row.books as unknown as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | null;
      const list = !b ? [] : Array.isArray(b) ? b : [b];
      for (const item of list) {
        if (!item || seen.has(item.id as string)) continue;
        if (item.is_published === false) continue;
        if (item.product_kind && item.product_kind !== "book") continue;
        seen.add(item.id as string);
        related.push({
          id: item.id as string,
          title: item.title as string,
          slug: item.slug as string,
          brand: (item.brand as string | null) ?? null,
          price_btn: Number(item.price_btn) || 0,
          cover_public_id: (item.cover_public_id as string | null) ?? null,
          isbn_13: (item.isbn_13 as string | null) ?? null,
          barcode: (item.barcode as string | null) ?? null,
        });
        if (related.length >= 5) break;
      }
      if (related.length >= 5) break;
    }
  }

  if (related.length < 5 && authors[0]) {
    const { data: byAuthor } = await supabase
      .from("book_authors")
      .select(
        "books(id, title, slug, brand, price_btn, cover_public_id, isbn_13, barcode, is_published)"
      )
      .eq("author_id", authors[0].id)
      .limit(12);
    const seen = new Set(related.map((r) => r.id).concat(book.id));
    for (const row of byAuthor ?? []) {
      const b = row.books as unknown as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | null;
      const list = !b ? [] : Array.isArray(b) ? b : [b];
      for (const item of list) {
        if (!item || seen.has(item.id as string) || item.is_published === false)
          continue;
        seen.add(item.id as string);
        related.push({
          id: item.id as string,
          title: item.title as string,
          slug: item.slug as string,
          brand: (item.brand as string | null) ?? null,
          price_btn: Number(item.price_btn) || 0,
          cover_public_id: (item.cover_public_id as string | null) ?? null,
          isbn_13: (item.isbn_13 as string | null) ?? null,
          barcode: (item.barcode as string | null) ?? null,
        });
        if (related.length >= 5) break;
      }
      if (related.length >= 5) break;
    }
  }

  const blurb =
    book.subtitle ||
    (book.description ? book.description.slice(0, 220) : null) ||
    "Live stock at DSB Books on Chang Lam — hold for pickup or WhatsApp us.";

  return (
    <StorefrontShell active="/books" theme={theme}>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...productJsonLd(book),
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-3 py-6 sm:px-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-12 md:px-6 md:py-12">
        <div className="mx-auto w-full max-w-[240px] md:mx-0 md:max-w-none">
          <div className="sf-book-card__cover overflow-hidden">
            <BookCover
              publicId={book.cover_public_id}
              isbn={book.isbn_13}
              barcode={book.barcode}
              alt={book.title}
              width={640}
              height={960}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
        <div>
          <p className="sf-eyebrow">
            {availabilityLabel(book.availability_status)}
            {canBuy && typeof book.stock_qty === "number"
              ? ` · ${book.stock_qty} on shelf`
              : ""}
          </p>
          <h1 className="sf-title mt-2 text-2xl md:text-4xl">{book.title}</h1>
          {authors.length ? (
            <p className="mt-2 text-sm text-[color:var(--sf-muted)] md:text-base">
              {authors.map((a, i) => (
                <span key={a.id}>
                  {i > 0 ? ", " : null}
                  <Link
                    href={`/authors/${a.slug}`}
                    className="text-[color:var(--sf-accent)] hover:underline"
                  >
                    {a.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : book.brand ? (
            <p className="mt-2 text-sm text-[color:var(--sf-muted)] md:text-base">
              {book.brand}
            </p>
          ) : null}
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--sf-muted)] md:text-base">
            {blurb}
            {book.description && book.description.length > 220 ? "…" : ""}
          </p>
          <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-[color:var(--sf-accent)] md:mt-6 md:text-3xl">
            {formatBtn(book.price_btn)}
          </p>
          <p className="mt-2 text-xs text-[color:var(--sf-muted)]">
            Pickup at Jojo&apos;s Shopping Complex, Chang Lam ·{" "}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[color:var(--sf-accent)] hover:underline"
            >
              Google Maps
            </a>
          </p>

          <BookPurchaseActions book={book} canBuy={canBuy} />
          {!canBuy ? (
            <StockAlertForm bookId={book.id} title={book.title} />
          ) : null}

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[color:var(--sf-line)] py-4 text-sm md:mt-8 md:gap-x-6 md:py-6">
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                ISBN
              </dt>
              <dd className="mt-1">{book.isbn_13 ?? book.barcode ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                Format
              </dt>
              <dd className="mt-1 capitalize">{book.format ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                Language
              </dt>
              <dd className="mt-1">{book.language ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                Publisher
              </dt>
              <dd className="mt-1">{book.publisher_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                Published
              </dt>
              <dd className="mt-1">
                {book.published_at
                  ? String(book.published_at).slice(0, 10)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                Pages
              </dt>
              <dd className="mt-1">{book.page_count ?? "—"}</dd>
            </div>
          </dl>
          {book.description ? (
            <div className="mt-5 md:mt-8">
              <h2 className="font-display text-lg md:text-xl">About this book</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
                {book.description}
              </p>
            </div>
          ) : null}

          {sent === "1" ? (
            <Alert
              id="enquire"
              className="mt-6 rounded-none border-[color:var(--sf-accent)]/40 bg-[color:var(--sf-surface)] md:mt-10"
            >
              <AlertDescription>
                Thank you — your enquiry has been sent. We will reply by email.
              </AlertDescription>
            </Alert>
          ) : (
            <form
              id="enquire"
              action={submitPublicEnquiry}
              className="mt-6 space-y-3 border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4 md:mt-10 md:p-6"
            >
              <h2 className="font-display text-xl md:text-2xl">
                Enquire about this book
              </h2>
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
              <Button type="submit" className="sf-btn !rounded-none">
                Send enquiry
              </Button>
            </form>
          )}
        </div>
      </div>

      <RelatedBooks books={related} />
    </StorefrontShell>
  );
}
