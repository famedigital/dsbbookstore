import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import {
  FeaturedHeroCarousel,
  type HeroSlide,
} from "@/components/storefront/featured-hero-carousel";
import {
  ShelfCategoryTabs,
  type ShelfBook,
  type ShelfCategory,
} from "@/components/storefront/shelf-category-tabs";
import { CuratedShelf } from "@/components/storefront/curated-shelf";
import { EventsStrip } from "@/components/storefront/events-strip";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { INSTITUTIONAL_SECTIONS } from "@/lib/storefront/institutional";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { Book } from "@/types/erp";

export default async function HomePage() {
  const theme = await getStorefrontTheme();
  let featured: Book[] = [];
  let newArrivals: Book[] = [];
  let staffPicks: Book[] = [];
  let heroSlides: HeroSlide[] = [];
  let settings: { store_name: string; opening_hours: string | null } | null =
    null;
  let shelfCategories: ShelfCategory[] = [];
  let shelfBooks: ShelfBook[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [
      { data: books, error },
      { data: store },
      { data: cats },
      { data: shelfRows },
      { data: arrivals },
      { data: inStock },
    ] = await Promise.all([
      supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .eq("product_kind", "book")
        .order("updated_at", { ascending: false })
        .limit(12),
      supabase
        .from("store_settings")
        .select("store_name, opening_hours")
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("categories")
        .select("id, name, slug, sort_order")
        .order("sort_order")
        .order("name"),
      supabase
        .from("books")
        .select(
          "id, title, slug, price_btn, cover_public_id, isbn_13, barcode, book_categories(category_id)"
        )
        .eq("is_published", true)
        .eq("product_kind", "book")
        .order("updated_at", { ascending: false })
        .limit(48),
      supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .eq("product_kind", "book")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .eq("product_kind", "book")
        .in("availability_status", ["in_stock", "low_stock"])
        .gt("stock_qty", 0)
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);

    let list = (books as Book[]) ?? [];
    if (error || list.length === 0) {
      const { data: fallback } = await supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(24);
      list = ((fallback as Book[]) ?? []).filter(
        (b) => !b.product_kind || b.product_kind === "book"
      );
    }

    featured = list.slice(0, 4);
    newArrivals = ((arrivals as Book[]) ?? []).slice(0, 5);
    staffPicks = ((inStock as Book[]) ?? [])
      .filter((b) => !newArrivals.some((n) => n.id === b.id))
      .slice(0, 5);
    if (staffPicks.length < 5) {
      staffPicks = [
        ...staffPicks,
        ...list
          .filter(
            (b) =>
              !staffPicks.some((s) => s.id === b.id) &&
              !newArrivals.some((n) => n.id === b.id)
          )
          .slice(0, 5 - staffPicks.length),
      ];
    }
    settings = store;

    const allCats = (cats ?? []) as ShelfCategory[];
    const recentShelf = (
      (shelfRows ?? []) as Array<{
        id: string;
        title: string;
        slug: string;
        price_btn: number;
        cover_public_id: string | null;
        isbn_13: string | null;
        barcode: string | null;
        book_categories: { category_id: string }[] | null;
      }>
    ).map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      price_btn: b.price_btn,
      cover_public_id: b.cover_public_id,
      isbn_13: b.isbn_13,
      barcode: b.barcode,
      categoryIds: (b.book_categories ?? []).map((c) => c.category_id),
    }));

    const namedCats = allCats.filter((c) => c.slug !== "general-interest");
    const byCat = await Promise.all(
      namedCats.map(async (c) => {
        const { data } = await supabase
          .from("book_categories")
          .select(
            "books(id, title, slug, subtitle, description, price_btn, cover_public_id, isbn_13, barcode, brand, publisher_name, published_at, is_published, product_kind)"
          )
          .eq("category_id", c.id)
          .limit(16);
        type CatBook = {
          id: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          description?: string | null;
          price_btn: number;
          cover_public_id: string | null;
          isbn_13?: string | null;
          barcode?: string | null;
          brand?: string | null;
          publisher_name?: string | null;
          published_at?: string | null;
          is_published?: boolean;
          product_kind?: string;
        };
        const booksInCat = (
          (data ?? []) as unknown as Array<{
            books: CatBook | CatBook[] | null;
          }>
        )
          .flatMap((row) => {
            const b = row.books;
            if (!b) return [];
            return Array.isArray(b) ? b : [b];
          })
          .filter(
            (b) =>
              b.is_published !== false &&
              (!b.product_kind || b.product_kind === "book")
          );

        return {
          cat: c,
          books: booksInCat.slice(0, 8).map((b) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            price_btn: b.price_btn,
            cover_public_id: b.cover_public_id,
            isbn_13: b.isbn_13 ?? null,
            barcode: b.barcode ?? null,
            categoryIds: [c.id],
          })),
          heroCandidate: booksInCat[0]
            ? ({
                id: booksInCat[0].id,
                title: booksInCat[0].title,
                slug: booksInCat[0].slug,
                subtitle: booksInCat[0].subtitle ?? null,
                description: booksInCat[0].description ?? null,
                price_btn: booksInCat[0].price_btn,
                cover_public_id: booksInCat[0].cover_public_id,
                isbn_13: booksInCat[0].isbn_13 ?? null,
                barcode: booksInCat[0].barcode ?? null,
                brand: booksInCat[0].brand ?? null,
                publisher_name: booksInCat[0].publisher_name ?? null,
                published_at: booksInCat[0].published_at ?? null,
                categoryName: c.name,
                categorySlug: c.slug,
              } satisfies HeroSlide)
            : null,
        };
      })
    );

    const merged = new Map<string, ShelfBook>();
    for (const b of recentShelf) merged.set(b.id, b);
    for (const group of byCat) {
      for (const b of group.books) {
        const prev = merged.get(b.id);
        if (prev) {
          merged.set(b.id, {
            ...prev,
            categoryIds: [...new Set([...prev.categoryIds, ...b.categoryIds])],
          });
        } else {
          merged.set(b.id, b);
        }
      }
    }
    shelfBooks = [...merged.values()];

    const used = new Set(shelfBooks.flatMap((b) => b.categoryIds));
    shelfCategories = namedCats.filter(
      (c) =>
        used.has(c.id) &&
        (byCat.find((g) => g.cat.id === c.id)?.books.length ?? 0) > 0
    );
    const general = allCats.find((c) => c.slug === "general-interest");
    if (general) {
      shelfCategories = [...shelfCategories, general];
    }

    const seenHero = new Set<string>();
    heroSlides = byCat
      .map((g) => g.heroCandidate)
      .filter((s): s is HeroSlide => {
        if (!s || seenHero.has(s.id)) return false;
        seenHero.add(s.id);
        return true;
      })
      .slice(0, 10);

    if (heroSlides.length === 0 && list[0]) {
      const b = list[0];
      heroSlides = [
        {
          id: b.id,
          title: b.title,
          slug: b.slug,
          subtitle: b.subtitle,
          description: b.description,
          price_btn: b.price_btn,
          cover_public_id: b.cover_public_id,
          isbn_13: b.isbn_13,
          barcode: b.barcode,
          brand: b.brand,
          publisher_name: b.publisher_name,
          published_at: b.published_at,
          categoryName: "Featured",
          categorySlug: "",
        },
      ];
    }
  }

  return (
    <StorefrontShell active="/" theme={theme}>
      {heroSlides.length > 0 ? (
        <FeaturedHeroCarousel slides={heroSlides} />
      ) : null}

      <CuratedShelf
        eyebrow="Just in"
        title="New arrivals"
        href="/books?sort=newest"
        books={newArrivals.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          brand: b.brand,
          price_btn: b.price_btn,
          cover_public_id: b.cover_public_id,
          isbn_13: b.isbn_13,
          barcode: b.barcode,
        }))}
      />

      <section className="bg-[color:var(--sf-surface)] py-7 md:py-18">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="sf-eyebrow">Catalogue</p>
              <h2 className="sf-title mt-2">Featured books</h2>
            </div>
            <Link
              href="/books"
              className="sf-link-gilt text-sm font-semibold text-[color:var(--sf-accent)]"
            >
              View all →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="mt-8 text-sm text-[color:var(--sf-muted)]">
              No published books yet.
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {featured.map((book) => (
                <li key={book.id}>
                  <Link
                    href={`/books/${book.slug}`}
                    className="sf-card sf-card-hover group block overflow-hidden p-2 md:p-3"
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-[color:var(--sf-bg)]">
                      <BookCover
                        publicId={book.cover_public_id}
                        isbn={book.isbn_13}
                        barcode={book.barcode}
                        alt={book.title}
                        width={320}
                        height={480}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="mt-3 text-[0.65rem] font-semibold tracking-wide text-[color:var(--sf-accent)] uppercase">
                      {availabilityLabel(book.availability_status)}
                    </p>
                    <h3 className="mt-1 font-display text-sm leading-snug group-hover:text-[color:var(--sf-accent)] md:text-lg">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold">
                      {formatBtn(book.price_btn)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CuratedShelf
        eyebrow="Staff shelf"
        title="Worth picking up"
        href="/books?availability=in_stock"
        books={staffPicks.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          brand: b.brand,
          price_btn: b.price_btn,
          cover_public_id: b.cover_public_id,
          isbn_13: b.isbn_13,
          barcode: b.barcode,
        }))}
      />

      <section className="bg-[color:var(--sf-bg)] py-7 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
          <div className="text-center">
            <p className="sf-eyebrow">Popular</p>
            <h2 className="sf-title mt-2">More from the shelf</h2>
          </div>
          <ShelfCategoryTabs
            categories={shelfCategories}
            books={shelfBooks}
          />
        </div>
      </section>

      <EventsStrip />

      <section className="bg-[color:var(--sf-surface)] py-7 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
          <p className="sf-eyebrow">Explore DSB</p>
          <h2 className="sf-title mt-2">Story, schools &amp; partnerships</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INSTITUTIONAL_SECTIONS.filter(
              (s) => s.href !== "/australia" && s.href !== "/digital-lab"
            )
              .slice(0, 4)
              .map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="sf-card sf-card-hover block h-full p-4"
                  >
                    <p className="text-[0.6rem] font-semibold tracking-wide text-[color:var(--sf-accent)] uppercase">
                      {s.label}
                    </p>
                    <p className="mt-2 font-display text-base leading-snug">
                      {s.title}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="sf-textile bg-[color:var(--sf-surface)] py-8 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 sm:px-4 md:flex-row md:items-end md:justify-between md:px-6">
          <div>
            <p className="sf-eyebrow">Visit</p>
            <h2 className="sf-title mt-2 max-w-lg">Find us on Chang Lam</h2>
            <p className="mt-3 max-w-md text-sm text-[color:var(--sf-muted)] md:text-base">
              Jojo&apos;s Shopping Complex near Clock Tower Square.
              {settings?.opening_hours
                ? ` ${settings.opening_hours}.`
                : " Open daily."}
            </p>
          </div>
          <Link href="/visit" className="sf-btn w-fit shrink-0">
            Store details
          </Link>
        </div>
        <hr className="sf-dzong-rule mx-auto mt-10 max-w-6xl" />
      </section>

      <section className="relative isolate overflow-hidden bg-[color:var(--sf-pine,#24352c)] py-10 text-[color:var(--sf-ivory,#f7f2e8)] md:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 0%, rgba(156,122,62,0.45), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(247,242,232,0.12), transparent 45%)",
          }}
        />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-12 md:items-center md:gap-10 md:px-6">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
              Beyond Thimphu
            </p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight text-[color:var(--sf-ivory,#f7f2e8)] md:text-4xl">
              How DSB reaches Australia — and the screen
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[color:var(--sf-ivory,#f7f2e8)]/80 md:text-base">
              The Chang Lam shop is only the start. Two programmes carry Bhutanese
              books and knowledge outward: one for partners in Australia, one for
              digitisation and learning platforms.
            </p>

            <ul className="mt-6 space-y-4">
              <li className="border-l-2 border-[color:var(--sf-gilt,#9c7a3e)] pl-4">
                <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
                  Australia Bridge
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--sf-ivory,#f7f2e8)]/75">
                  Legal trade, print-on-demand, and school or library supply so
                  Bhutanese titles can reach Australian classrooms and collections
                  without long freight waits from Thimphu alone.
                </p>
              </li>
              <li className="border-l-2 border-[color:var(--sf-gilt,#9c7a3e)]/55 pl-4">
                <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
                  Digital Knowledge Lab
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--sf-ivory,#f7f2e8)]/75">
                  Scan, catalogue, and package Bhutanese content as e-books,
                  audio, archives, and LMS-ready courses — for institutions that
                  need screens as well as shelves.
                </p>
              </li>
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/australia"
                className="sf-btn !bg-[color:var(--sf-gilt,#9c7a3e)] !text-[color:var(--sf-ink,#14110f)] hover:!bg-[color:var(--sf-ivory,#f7f2e8)]"
              >
                Australia Bridge
              </Link>
              <Link
                href="/digital-lab"
                className="inline-flex items-center justify-center border border-[color:var(--sf-ivory,#f7f2e8)]/55 bg-transparent px-4 py-2.5 text-[0.72rem] font-semibold tracking-[0.08em] text-[color:var(--sf-ivory,#f7f2e8)] uppercase transition hover:bg-[color:var(--sf-ivory,#f7f2e8)] hover:text-[color:var(--sf-pine,#24352c)]"
                style={{ borderRadius: "var(--sf-btn-radius, 0)" }}
              >
                Digital Lab
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-7">
            <div className="relative aspect-[5/4] overflow-hidden border border-white/15 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] md:aspect-[4/3]">
              <Image
                src="/images/hero-dsb-exterior.jpg"
                alt="DSB Books storefront on Chang Lam — starting point for Australia Bridge and Digital Lab"
                fill
                className="object-cover object-[center_28%]"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--sf-pine,#24352c)]/85 via-transparent to-black/20" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
                  From this doorway
                </p>
                <p className="mt-1 max-w-sm text-sm leading-snug text-[color:var(--sf-ivory,#f7f2e8)]/90">
                  Jojo&apos;s Shopping Complex, Chang Lam — the same shop that
                  stocks the shelves now partners abroad and builds digital
                  editions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
