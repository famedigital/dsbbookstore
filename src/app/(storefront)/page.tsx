import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/media/book-cover";
import { bookCoverProps } from "@/lib/media/book-cover-props";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import {
  FadeIn,
  Stagger,
  StaggerItem,
} from "@/components/storefront/motion";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import type { Author, Book } from "@/types/erp";
import type { MediaAsset } from "@/types/media";

type BookWithCover = Book & {
  cover?: MediaAsset | null;
  book_authors?: { authors: Pick<Author, "name" | "slug"> | null }[];
};

export default async function HomePage() {
  let featured: BookWithCover[] = [];
  let arrivals: BookWithCover[] = [];
  let authors: Pick<Author, "id" | "name" | "slug">[] = [];
  let storeName = "DSB Books";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [
      { data: featuredRows },
      { data: arrivalRows },
      { data: authorRows },
      { data: store },
    ] = await Promise.all([
      supabase
        .from("books")
        .select(
          "*, cover:media_assets!cover_media_id(*), book_authors(authors(name, slug))"
        )
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("books")
        .select(
          "*, cover:media_assets!cover_media_id(*), book_authors(authors(name, slug))"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("authors")
        .select("id, name, slug")
        .order("name")
        .limit(8),
      supabase
        .from("store_settings")
        .select("store_name")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    featured = (featuredRows as BookWithCover[]) ?? [];
    arrivals = (arrivalRows as BookWithCover[]) ?? [];
    authors = authorRows ?? [];
    if (store?.store_name) storeName = store.store_name;
  }

  const shelf = featured.length > 0 ? featured : arrivals;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f6fb_0%,#eef5f1_48%,#f7f4ec_100%)]">
      {/* Full-bleed hero — one composition */}
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <Image
          src="/images/hero-bookstore.jpg"
          alt="DSB Books — shelves and Himalayan light in Thimphu"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,20,48,0.82)_0%,rgba(11,61,145,0.55)_48%,rgba(7,20,48,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(15,107,76,0.25),transparent_55%)]" />

        <StorefrontHeader variant="overHero" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-5 pb-24 pt-28 md:px-8 md:pb-28">
          <FadeIn className="max-w-2xl text-white" y={22}>
            <p className="font-heading text-4xl leading-none font-semibold tracking-tight sm:text-5xl md:text-7xl">
              {storeName}
            </p>
            <h1 className="mt-5 max-w-xl font-heading text-2xl leading-snug font-medium text-white/95 md:text-3xl">
              Books for Thimphu — and the world beyond the mountains.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
              Bhutan&apos;s landmark bookstore on Chang Lam. Browse live stock,
              discover Himalayan voices, and find international favourites on the
              shelf today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#e6c76a] text-[#2a2108] hover:bg-[#f0d789]"
              >
                <Link href="/books">Browse the catalogue</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/45 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/visit">Visit Chang Lam</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured shelf */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <FadeIn className="mb-10 flex items-end justify-between gap-4" y={12}>
          <div>
            <p className="text-xs tracking-[0.22em] text-primary/70 uppercase">
              On the shelf
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Featured titles
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
              A living selection from DSB Publication and popular books you can
              enquire about in store.
            </p>
          </div>
          <Button asChild variant="ghost" className="shrink-0">
            <Link href="/books">View all</Link>
          </Button>
        </FadeIn>

        {!isSupabaseConfigured() ? (
          <p className="border border-dashed border-primary/25 bg-white/50 px-6 py-10 text-sm text-muted-foreground">
            Connect Supabase to load the live catalogue.
          </p>
        ) : shelf.length === 0 ? (
          <p className="border border-dashed border-primary/25 bg-white/50 px-6 py-10 text-sm text-muted-foreground">
            No published books yet. Staff can add titles in the ERP catalogue.
          </p>
        ) : (
          <Stagger className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {shelf.map((book) => {
              const authorName =
                book.book_authors?.[0]?.authors?.name ?? null;
              return (
                <StaggerItem key={book.id}>
                  <Link href={`/books/${book.slug}`} className="group block">
                    <div className="overflow-hidden bg-[#0b1f3f]/[0.03] shadow-[0_18px_40px_-28px_rgba(11,61,145,0.55)] transition duration-500 group-hover:-translate-y-1">
                      <BookCover
                        {...bookCoverProps(book)}
                        alt={book.title}
                        width={480}
                        height={720}
                        className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <h3 className="mt-4 font-heading text-base leading-snug font-semibold group-hover:text-primary md:text-lg">
                      {book.title}
                    </h3>
                    {authorName ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {authorName}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-foreground/80">
                      {formatBtn(book.price_btn)}
                      <span className="text-muted-foreground">
                        {" "}
                        · {availabilityLabel(book.availability_status)}
                      </span>
                    </p>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>

      {/* New arrivals strip */}
      {arrivals.length > 0 ? (
        <section className="border-y border-primary/10 bg-white/40 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            <FadeIn className="mb-8" y={10}>
              <p className="text-xs tracking-[0.22em] text-secondary uppercase">
                Just in
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
                New arrivals
              </h2>
            </FadeIn>
            <Stagger className="flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible">
              {arrivals.slice(0, 4).map((book) => (
                <StaggerItem
                  key={book.id}
                  className="w-[42vw] shrink-0 sm:w-48 md:w-auto"
                >
                  <Link href={`/books/${book.slug}`} className="group block">
                    <BookCover
                      {...bookCoverProps(book)}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full object-cover shadow-md transition duration-500 group-hover:scale-[1.02]"
                    />
                    <h3 className="mt-3 font-heading text-base leading-snug group-hover:text-primary">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatBtn(book.price_btn)}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Authors */}
      {authors.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <FadeIn className="mb-8 flex items-end justify-between" y={10}>
            <div>
              <h2 className="font-heading text-3xl font-semibold md:text-4xl">
                Authors in the catalogue
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                From Himalayan voices to international favourites.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/authors">All authors</Link>
            </Button>
          </FadeIn>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {authors.map((author) => (
              <li key={author.id}>
                <Link
                  href={`/authors/${author.slug}`}
                  className="font-heading text-lg text-primary underline-offset-4 transition hover:underline md:text-xl"
                >
                  {author.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Visit */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#071a3a_0%,#0b3d91_55%,#0f6b4c_100%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-16 text-white md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
          <FadeIn y={12}>
            <p className="text-xs tracking-[0.22em] text-[#e6c76a] uppercase">
              Thimphu · Chang Lam
            </p>
            <h2 className="mt-3 max-w-xl font-heading text-3xl font-semibold md:text-4xl">
              Come browse the shelves in person.
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/80 md:text-base">
              Ask our staff about stock, special orders, and DSB Publication
              titles you won&apos;t find elsewhere.
            </p>
          </FadeIn>
          <FadeIn delay={0.1} y={10}>
            <Button
              asChild
              size="lg"
              className="bg-[#e6c76a] text-[#2a2108] hover:bg-[#f0d789]"
            >
              <Link href="/visit">Plan your visit</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
