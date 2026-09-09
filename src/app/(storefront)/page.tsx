import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { Book } from "@/types/erp";

export default async function HomePage() {
  let featured: Book[] = [];
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
        .limit(8),
      supabase
        .from("store_settings")
        .select("store_name, opening_hours")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    featured = (books as Book[]) ?? [];
    settings = store;
  }

  return (
    <StorefrontShell active="/">
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-[color:var(--dsb-ink)]">
        <Image
          src="/images/hero-dsb-interior.jpg"
          alt="Inside DSB Books, Thimphu — Bhutan Books shelves at Jojo's Shopping Complex, Chang Lam"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center dsb-fade"
        />
        {/* Keep the real store photo visible — soft left wash only for type */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,17,15,0.82)_0%,rgba(20,17,15,0.45)_38%,rgba(20,17,15,0.18)_68%,rgba(20,17,15,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,17,15,0.55)_0%,transparent_42%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-end px-6 pb-20 pt-28">
          <div className="dsb-rise max-w-xl text-[color:var(--dsb-ivory)]">
            <p className="text-[0.7rem] tracking-[0.34em] text-[color:var(--dsb-gilt)] uppercase">
              Chang Lam · Thimphu
            </p>
            <h1 className="mt-5 font-heading text-6xl leading-[0.95] font-semibold tracking-[-0.03em] md:text-7xl lg:text-8xl">
              {settings?.store_name ?? "DSB Books"}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--dsb-ivory)]/85 md:text-lg">
              Bhutan&apos;s oldest bookstore — photographed on Chang Lam.
              Browse the live catalogue of DSB Publication and what&apos;s on
              the shelf.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-[color:var(--dsb-gilt)] px-7 text-[color:var(--dsb-ink)] hover:bg-[#b8924f]"
              >
                <Link href="/books">Browse catalogue</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-none border-[color:var(--dsb-ivory)]/40 bg-transparent px-7 text-[color:var(--dsb-ivory)] hover:bg-[color:var(--dsb-ivory)]/10"
              >
                <Link href="/visit">Visit the store</Link>
              </Button>
            </div>
            {settings?.opening_hours ? (
              <p className="mt-8 text-xs tracking-[0.18em] text-[color:var(--dsb-ivory)]/55 uppercase">
                Open · {settings.opening_hours}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-[color:var(--dsb-line)] bg-[color:var(--dsb-ink)] text-[color:var(--dsb-ivory)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-3 md:gap-12">
          {[
            {
              label: "Publisher & store",
              body: "DSB Publication imprint with retail shelves on Chang Lam.",
            },
            {
              label: "Live availability",
              body: "Know what is in stock before you walk into the store.",
            },
            {
              label: "Bhutanese voices",
              body: "Folklore, history, children’s stories, and local scholarship.",
            },
          ].map((item) => (
            <div key={item.label} className="dsb-rise">
              <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
                {item.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--dsb-ivory)]/70">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
              Featured from the shelves
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              On the shelf
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            className="rounded-none tracking-[0.14em] uppercase"
          >
            <Link href="/books">View all</Link>
          </Button>
        </div>

        {!isSupabaseConfigured() ? (
          <p className="border border-dashed border-[color:var(--dsb-line)] bg-[color:var(--dsb-stone)]/40 p-8 text-sm text-muted-foreground">
            Connect Supabase to load the live catalogue.
          </p>
        ) : featured.length === 0 ? (
          <p className="border border-dashed border-[color:var(--dsb-line)] bg-[color:var(--dsb-stone)]/40 p-8 text-sm text-muted-foreground">
            No published books yet. Staff can add titles in the ERP catalogue.
          </p>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((book, index) => (
              <li
                key={book.id}
                className="dsb-rise group"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Link href={`/books/${book.slug}`} className="block">
                  <div className="overflow-hidden bg-[color:var(--dsb-stone)]">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-5 text-[0.65rem] tracking-[0.2em] text-[color:var(--dsb-gilt)] uppercase">
                    {availabilityLabel(book.availability_status)}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl leading-snug font-medium tracking-[-0.01em] transition-colors group-hover:text-[color:var(--dsb-lacquer)]">
                    {book.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatBtn(book.price_btn)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-[color:var(--dsb-line)] bg-[color:var(--dsb-stone)]/45">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
              Visit
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Find us on Chang Lam
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Look for the blue DSB BOOKS sign beside Druk Hotel, near Clock
              Tower Square — ground floor of Jojo&apos;s Shopping Complex.
            </p>
            <Button
              asChild
              className="mt-8 rounded-none bg-[color:var(--dsb-lacquer)] px-7 hover:bg-[#4a1c16]"
            >
              <Link href="/visit">Store details</Link>
            </Button>
          </div>
          <div className="grid gap-3">
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--dsb-ink)]">
              <Image
                src="/images/hero-dsb-exterior.jpg"
                alt="DSB BOOKS exterior sign on Chang Lam, Thimphu"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[16/9] overflow-hidden bg-[color:var(--dsb-ink)]">
              <Image
                src="/images/hero-dsb-magazines.jpg"
                alt="Magazine and periodical shelves inside DSB Books"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
