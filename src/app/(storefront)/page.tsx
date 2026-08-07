import type { Metadata } from "next";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import { getCmsSections, getStoreSettingsPublic } from "@/lib/cms/get-page";
import type { Book } from "@/types/erp";
import { getSiteUrl } from "@/lib/storefront/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettingsPublic();
  return {
    title: {
      absolute: `${settings.store_name ?? "DSB Books"} · Thimphu`,
    },
    description:
      "Bhutan's oldest bookstore in Thimphu — digital catalogue of DSB publications, institutional programmes, and international orders.",
    alternates: { canonical: getSiteUrl() },
    openGraph: {
      title: `${settings.store_name ?? "DSB Books"} · Thimphu`,
      description:
        "Bhutan's oldest bookstore — browse DSB publications and visit Chang Lam.",
      url: getSiteUrl(),
      type: "website",
    },
  };
}

type BookWithAuthors = Book & {
  book_authors?: { authors: { name: string } | null }[] | null;
};

export default async function HomePage() {
  const sections = await getCmsSections("home.");
  let featured: BookWithAuthors[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: books } = await supabase
      .from("books")
      .select("*, book_authors(authors(name))")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(8);
    featured = (books as BookWithAuthors[]) ?? [];
  }

  const headline =
    sections["home.hero.headline"] ||
    sections["home.hero.store_name"] ||
    "DSB Books";

  return (
    <>
      <section className="relative mx-auto grid min-h-[78vh] w-full max-w-6xl items-end overflow-hidden px-6 pb-16 pt-10">
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_30%_20%,#0b3d91_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,#0f6b4c_0%,transparent_45%),linear-gradient(135deg,#071a3a,#0b3d91_50%,#0a4a38)] motion-safe:animate-in motion-safe:fade-in" />
        <div className="absolute inset-0 -z-10 rounded-[2rem] opacity-40 [background-image:url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 60L60 0M30 60L60 30M0 30L30 0%27 stroke=%27%23ffffff%27 stroke-opacity=%270.06%27 fill=%27none%27/%3E%3C/svg%3E')]" />
        <div className="max-w-xl text-white">
          <p className="text-xs tracking-[0.28em] text-[#e6c76a] uppercase">
            {sections["home.hero.eyebrow"] || "Thimphu · Chang Lam"}
          </p>
          <h1 className="mt-4 font-heading text-5xl leading-[1.05] font-semibold md:text-6xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-md text-base text-white/85 md:text-lg">
            {sections["home.hero.support"] ||
              "Bhutan's oldest bookstore — a living digital catalogue of DSB publications."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#e6c76a] text-[#2a2108] hover:bg-[#f0d789]"
            >
              <Link href="/books">
                {sections["home.hero.cta_primary_label"] || "Browse catalogue"}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/visit">
                {sections["home.hero.cta_secondary_label"] || "Visit the store"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              {sections["home.shelf.heading"] || "On the shelf"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {sections["home.shelf.support"] ||
                "Live availability from the Thimphu store inventory."}
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/books">View all</Link>
          </Button>
        </div>

        {!isSupabaseConfigured() ? (
          <p className="rounded-lg border border-dashed border-primary/30 bg-white/60 p-8 text-sm text-muted-foreground">
            Connect Supabase to load the live catalogue. No mock titles are shown.
          </p>
        ) : featured.length === 0 ? (
          <p className="rounded-lg border border-dashed border-primary/30 bg-white/60 p-8 text-sm text-muted-foreground">
            No published books yet. Staff can add titles in the ERP catalogue.
          </p>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((book) => {
              const authors =
                book.book_authors
                  ?.map((ba) => ba.authors?.name)
                  .filter(Boolean)
                  .join(", ") || null;
              return (
                <li key={book.id}>
                  <Link href={`/books/${book.slug}`} className="group block">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full rounded-sm object-cover shadow-md transition duration-500 group-hover:scale-[1.02]"
                    />
                    <h3 className="mt-3 font-heading text-lg leading-snug group-hover:text-primary">
                      {book.title}
                    </h3>
                    {authors ? (
                      <p className="mt-1 text-sm text-muted-foreground">{authors}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatBtn(book.price_btn)} ·{" "}
                      {availabilityLabel(book.availability_status)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0b3d91,#0a4a38)] px-8 py-12 text-white motion-safe:animate-in motion-safe:fade-in">
          <h2 className="font-heading text-3xl font-semibold">
            {sections["home.about.heading"] || "About DSB"}
          </h2>
          <p className="mt-3 max-w-xl text-white/85">
            {sections["home.about.support"] ||
              "A family bookstore and DSB Publication imprint — bridging Bhutan and Australia through books, education, and digital knowledge."}
          </p>
          <Button
            asChild
            className="mt-6 bg-[#e6c76a] text-[#2a2108] hover:bg-[#f0d789]"
          >
            <Link href="/about">
              {sections["home.about.cta_label"] || "Our story"}
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h2 className="font-heading text-3xl font-semibold">
          {sections["home.visit.heading"] || "Visit the store"}
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {sections["home.visit.support"] ||
            "Find us on Chang Lam in Thimphu — browse the shelves and speak with our team."}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/visit">
            {sections["home.visit.cta_label"] || "Store details"}
          </Link>
        </Button>
      </section>
    </>
  );
}
