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
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { INSTITUTIONAL_SECTIONS } from "@/lib/storefront/institutional";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { Book } from "@/types/erp";

export default async function HomePage() {
  const theme = await getStorefrontTheme();
  let featured: Book[] = [];
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
            "books(id, title, slug, subtitle, description, price_btn, cover_public_id, isbn_13, barcode, is_published, product_kind)"
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

      <section className="bg-[color:var(--sf-bg)] py-7 md:py-18">
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

      <section className="bg-[color:var(--sf-surface)] py-7 md:py-16">
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

      <section className="bg-[color:var(--sf-bg)] py-7 md:py-16">
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

      <section className="sf-pine-band sf-textile py-8 md:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-center md:gap-12 md:px-6">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-gilt)] uppercase">
              Beyond Thimphu
            </p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
              Australia Bridge &amp; Digital Lab
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              Partnerships for publishing, education, and digitisation —
              connecting Bhutanese books with Australian institutions and
              digital learning.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/australia"
                className="sf-btn !bg-[color:var(--sf-gilt)] !text-[color:var(--sf-ink)] hover:!bg-[color:var(--dsb-ivory)]"
              >
                Australia
              </Link>
              <Link
                href="/digital-lab"
                className="sf-btn-outline !border-white/40 !text-white hover:!bg-white hover:!text-[color:var(--sf-pine)]"
              >
                Digital Lab
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden border border-white/10">
            <Image
              src="/images/hero-dsb-magazines.jpg"
              alt="Periodicals and titles at DSB Books"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
