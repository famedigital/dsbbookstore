import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { INSTITUTIONAL_SECTIONS } from "@/lib/storefront/institutional";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { Book } from "@/types/erp";

export default async function HomePage() {
  const theme = await getStorefrontTheme();
  let featured: Book[] = [];
  let popular: Book[] = [];
  let spotlight: Book | null = null;
  let settings: { store_name: string; opening_hours: string | null } | null =
    null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: books, error }, { data: store }] = await Promise.all([
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
    popular = list.slice(0, 8);
    spotlight = list.find((b) => b.is_featured) ?? list[0] ?? null;
    settings = store;
  }

  const heroTitle = spotlight?.title ?? "From the Chang Lam shelves";
  const heroDescription =
    (spotlight?.subtitle ||
      spotlight?.description?.slice(0, 160) ||
      "DSB Publication titles and trusted reads — browse live stock from Bhutan's oldest bookstore.") +
    (spotlight?.description && spotlight.description.length > 160 ? "…" : "");

  return (
    <StorefrontShell active="/" theme={theme}>
      {spotlight ? (
        <section className="sf-textile bg-[color:var(--sf-surface)] pb-8 pt-6 md:pb-20 md:pt-14">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-[1.1fr_0.75fr] items-center gap-4 px-3 sm:gap-6 sm:px-4 md:grid-cols-2 md:gap-14 md:px-6">
            <div className="sf-rise min-w-0">
              <p className="sf-eyebrow">Featured title</p>
              <h1 className="sf-title mt-2 md:mt-3">{heroTitle}</h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--sf-muted)] md:mt-4 md:text-base">
                {heroDescription}
              </p>
              <p className="mt-3 font-heading text-xl text-[color:var(--sf-accent)] md:mt-5 md:text-2xl">
                {formatBtn(spotlight.price_btn)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 md:mt-6 md:gap-3">
                <Link href={`/books/${spotlight.slug}`} className="sf-btn">
                  View book
                </Link>
                <Link href="/books" className="sf-btn-pine">
                  All books
                </Link>
              </div>
            </div>
            <div className="sf-rise-delay w-full max-w-[140px] justify-self-end sm:max-w-[180px] md:max-w-sm md:justify-self-auto">
              <div className="sf-card relative aspect-[2/3] overflow-hidden p-1.5 md:p-3">
                <BookCover
                  publicId={spotlight.cover_public_id}
                  alt={spotlight.title}
                  width={480}
                  height={720}
                  priority
                  className="h-full w-full rounded-[calc(var(--sf-radius)-0.35rem)] object-cover"
                />
              </div>
            </div>
          </div>
        </section>
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
          <ul className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {popular.map((book) => (
              <li key={`pop-${book.id}`}>
                <Link href={`/books/${book.slug}`} className="group block text-center">
                  <div className="sf-card mx-auto aspect-[2/3] w-full max-w-[200px] overflow-hidden p-2">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={320}
                      height={480}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-sm group-hover:text-[color:var(--sf-accent)] md:text-lg">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--sf-accent)]">
                    {formatBtn(book.price_btn)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[color:var(--sf-bg)] py-7 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
          <p className="sf-eyebrow">Explore DSB</p>
          <h2 className="sf-title mt-2">Story, schools &amp; partnerships</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INSTITUTIONAL_SECTIONS.filter(
              (s) =>
                s.href !== "/australia" && s.href !== "/digital-lab"
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
