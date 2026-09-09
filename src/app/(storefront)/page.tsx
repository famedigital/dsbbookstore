import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
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
    const [{ data: books }, { data: store }] = await Promise.all([
      supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(12),
      supabase
        .from("store_settings")
        .select("store_name, opening_hours")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    const list = (books as Book[]) ?? [];
    featured = list.slice(0, 4);
    popular = list.slice(0, 8);
    spotlight = list[0] ?? null;
    settings = store;
  }

  return (
    <StorefrontShell active="/" theme={theme}>
      <section
        className="overflow-hidden"
        style={{ background: "var(--sf-hero)" }}
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="sf-eyebrow">Featured this week</p>
            <h1 className="sf-title mt-4 text-5xl md:text-6xl">
              {spotlight?.title ?? settings?.store_name ?? "DSB Books"}
            </h1>
            <p className="mt-5 max-w-md text-[color:var(--sf-muted)]">
              {spotlight?.subtitle ||
                spotlight?.description?.slice(0, 140) ||
                "Bhutan's oldest bookstore on Chang Lam — browse DSB Publication and live shelf stock."}
              {spotlight?.description && spotlight.description.length > 140
                ? "…"
                : null}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={spotlight ? `/books/${spotlight.slug}` : "/books"}
                className="sf-btn"
              >
                {spotlight ? "View book" : "Browse catalogue"}
              </Link>
              <Link href="/visit" className="sf-btn-outline">
                Visit store
              </Link>
            </div>
          </div>
          <div className="sf-card relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden p-3">
            {spotlight ? (
              <BookCover
                publicId={spotlight.cover_public_id}
                alt={spotlight.title}
                width={480}
                height={640}
                className="h-full w-full rounded-[calc(var(--sf-radius)-0.4rem)] object-cover"
              />
            ) : (
              <Image
                src="/images/hero-dsb-interior.jpg"
                alt="Inside DSB Books, Thimphu"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--sf-surface)] py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="sf-eyebrow">Catalogue</p>
              <h2 className="sf-title mt-2 text-3xl md:text-4xl">Featured books</h2>
            </div>
            <Link href="/books" className="text-sm font-semibold text-[color:var(--sf-accent)]">
              View all →
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="mt-10 text-sm text-[color:var(--sf-muted)]">
              No published books yet.
            </p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((book) => (
                <li key={book.id}>
                  <Link href={`/books/${book.slug}`} className="sf-card group block overflow-hidden p-3 transition hover:-translate-y-1">
                    <div className="aspect-[2/3] overflow-hidden rounded-[calc(var(--sf-radius)-0.35rem)] bg-[color:var(--sf-bg)]">
                      <BookCover
                        publicId={book.cover_public_id}
                        alt={book.title}
                        width={320}
                        height={480}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="mt-4 text-[0.7rem] font-semibold tracking-wide text-[color:var(--sf-accent)] uppercase">
                      {availabilityLabel(book.availability_status)}
                    </p>
                    <h3 className="mt-1 font-display text-lg leading-snug group-hover:text-[color:var(--sf-accent)]">
                      {book.title}
                    </h3>
                    <p className="mt-2 font-semibold text-[color:var(--sf-ink)]">
                      {formatBtn(book.price_btn)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {spotlight ? (
        <section className="bg-[color:var(--sf-bg)] py-16 md:py-20">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
            <div className="sf-card relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden p-3">
              <BookCover
                publicId={spotlight.cover_public_id}
                alt={spotlight.title}
                width={420}
                height={560}
                className="h-full w-full rounded-[calc(var(--sf-radius)-0.4rem)] object-cover"
              />
            </div>
            <div>
              <p className="sf-eyebrow">Best seller</p>
              <h2 className="sf-title mt-3 text-4xl md:text-5xl">{spotlight.title}</h2>
              <p className="mt-5 max-w-md text-[color:var(--sf-muted)]">
                {spotlight.description?.slice(0, 180) ||
                  spotlight.subtitle ||
                  "Available from the Thimphu shelves."}
                {spotlight.description && spotlight.description.length > 180
                  ? "…"
                  : null}
              </p>
              <p className="mt-6 text-2xl font-semibold text-[color:var(--sf-accent)]">
                {formatBtn(spotlight.price_btn)}
              </p>
              <Link href={`/books/${spotlight.slug}`} className="sf-btn mt-6">
                Shop it now
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[color:var(--sf-surface)] py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="text-center">
            <p className="sf-eyebrow">Popular</p>
            <h2 className="sf-title mt-2 text-3xl md:text-4xl">More from the shelf</h2>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((book) => (
              <li key={`pop-${book.id}`}>
                <Link href={`/books/${book.slug}`} className="group block text-center">
                  <div className="sf-card mx-auto aspect-[2/3] w-full max-w-[220px] overflow-hidden p-2">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={320}
                      height={480}
                      className="h-full w-full rounded-[calc(var(--sf-radius)-0.5rem)] object-cover"
                    />
                  </div>
                  <h3 className="mt-4 font-display text-lg group-hover:text-[color:var(--sf-accent)]">
                    {book.title}
                  </h3>
                  <p className="mt-1 font-semibold text-[color:var(--sf-accent)]">
                    {formatBtn(book.price_btn)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[color:var(--sf-accent-soft)] py-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <p className="sf-eyebrow">Visit</p>
            <h2 className="sf-title mt-3 text-4xl">Find us on Chang Lam</h2>
            <p className="mt-5 max-w-md text-[color:var(--sf-muted)]">
              Jojo&apos;s Shopping Complex near Clock Tower Square.
              {settings?.opening_hours
                ? ` Open ${settings.opening_hours}.`
                : " Open daily."}
            </p>
            <Link href="/visit" className="sf-btn mt-8">
              Store details
            </Link>
          </div>
          <div className="sf-card relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/hero-dsb-interior.jpg"
              alt="DSB Books interior"
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
