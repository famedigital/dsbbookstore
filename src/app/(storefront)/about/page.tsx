import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/shell";
import { JsonLd } from "@/components/storefront/json-ld";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { INSTITUTIONAL_SECTIONS } from "@/lib/storefront/institutional";
import { resolveInstitutional } from "@/lib/storefront/resolve-institutional";
import {
  GOOGLE_MAPS_URL,
  localBusinessJsonLd,
  SITE_URL,
  STORE_GEO,
} from "@/lib/storefront/seo";

export async function generateMetadata(): Promise<Metadata> {
  const section = await resolveInstitutional("/about");
  return {
    title: section?.title ?? "Our Story · DSB Books",
    description:
      section?.summary ??
      "Bhutan's oldest bookstore on Chang Lam, Thimphu — family story, milestones, and the shelves at Jojo's Shopping Complex.",
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
      title: "Our Story · DSB Books Thimphu",
      description:
        "From a Chang Lam bookshop to DSB Publications, schools, and a Bhutan–Australia bridge.",
      url: `${SITE_URL}/about`,
      images: [{ url: `${SITE_URL}/images/hero-dsb-exterior.jpg` }],
    },
  };
}

const GALLERY = [
  {
    src: "/images/hero-dsb-exterior.jpg",
    alt: "DSB Books storefront on Chang Lam, Thimphu",
    caption: "Outside — Chang Lam, near Clock Tower",
  },
  {
    src: "/images/hero-dsb-interior.jpg",
    alt: "Shelves inside DSB Books",
    caption: "Inside the shop — shelves of titles",
  },
  {
    src: "/images/hero-dsb-magazines.jpg",
    alt: "Magazines and periodicals at DSB Books",
    caption: "Magazines & newspapers — Lonely Planet favourite",
  },
  {
    src: "/images/hero-bookstore.jpg",
    alt: "Reading space at DSB Books",
    caption: "A place to browse before you buy",
  },
] as const;

const MILESTONES = [
  {
    year: "1992",
    title: "DSB Enterprises takes root",
    body: "LinkedIn and company records place DSB Enterprises in Thimphu from the early 1990s — retail and wholesale of books and stationery for Bhutan and beyond.",
  },
  {
    year: "1990s",
    title: "DSB Books Enterprise on the page",
    body: "Titles under DSB Books Enterprise already appear in Bhutan’s National Bibliography (e.g. folk and literary works from the mid–late 1990s) — publishing alongside the shop floor.",
  },
  {
    year: "2000s",
    title: "Chang Lam institution",
    body: "Travel guides begin calling out DSB as Bhutan’s oldest bookstore with the widest assortment — Buddhism, Bhutan, Himalaya, and English titles at Jojo’s Shopping Complex.",
  },
  {
    year: "2010s",
    title: "Readers, schools & the trade",
    body: "Proprietor B.P. Bhattarai and fellow Thimphu booksellers advocate for fair book imports so readers keep access to world literature — DSB stays open daily for students, visitors, and families.",
  },
  {
    year: "Today",
    title: "Shelf, imprint & bridge",
    body: "Live online catalogue of thousands of titles, DSB Publications, stationery, Digital Knowledge Lab, and the Bhutan–Australia Bridge — still the same Chang Lam address.",
  },
] as const;

export default async function AboutPage() {
  const theme = await getStorefrontTheme();
  const section = (await resolveInstitutional("/about"))!;

  return (
    <StorefrontShell active="/about" theme={theme}>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Our Founder and Family Story · DSB Books",
          url: `${SITE_URL}/about`,
          isPartOf: { "@id": `${SITE_URL}/#bookstore` },
          about: { "@id": `${SITE_URL}/#bookstore` },
          description: section.summary,
        }}
      />

      {/* Full-bleed story hero */}
      <section className="relative min-h-[42svh] overflow-hidden md:min-h-[52svh]">
        <Image
          src="/images/hero-dsb-exterior.jpg"
          alt="DSB Books on Chang Lam"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
        <div className="relative mx-auto flex min-h-[42svh] w-full max-w-6xl flex-col justify-end px-4 pb-8 pt-20 md:min-h-[52svh] md:px-6 md:pb-12">
          <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-white/70 uppercase">
            {section.eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-white md:text-5xl">
            {section.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            Bhutan&apos;s oldest bookstore — a family shop on Chang Lam where
            readers, students, and travellers still meet the printed page.
          </p>
        </div>
      </section>

      {/* Personal story */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-6 md:py-16">
        <div>
          <p className="sf-eyebrow">On Chang Lam</p>
          <h2 className="sf-title mt-2 text-2xl md:text-3xl">
            A bookshop that grew with Thimphu
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
            <p>
              Walk into Jojo&apos;s Shopping Complex off Chang Lam and you find
              what travel writers still call the country&apos;s oldest bookstore —
              and often its most complete: Bhutan and Himalaya, Buddhism and
              dharma, textbooks, fiction, children&apos;s shelves, magazines and
              newspapers.
            </p>
            <p>
              DSB Books is the public face of{" "}
              <strong>DSB Enterprises</strong>, rooted in Thimphu since the early
              1990s. The same house that stocks the shop also publishes under{" "}
              <strong>DSB Publication</strong> — titles that show up in national
              bibliographies and on Open Library — and supplies schools,
              libraries, and partners across Bhutan.
            </p>
            <p>
              Proprietor <strong>B.P. Bhattarai</strong> has spoken for Thimphu
              booksellers when import rules threatened the quality of books on
              local shelves. That instinct — keep reading possible — is still the
              heart of the store: open daily, prices in Ngultrum, staff who know
              where a title sits.
            </p>
            <p>
              Today the family story stretches beyond the counter: a Digital
              Knowledge Lab, school and university supply, and a Bhutan–Australia
              Bridge for publishing, culture, and learning — without leaving the
              Chang Lam address that visitors and locals already know.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sf-btn !rounded-full text-sm"
            >
              Open in Google Maps
            </a>
            <Link href="/visit" className="sf-btn-outline !rounded-full text-sm">
              Visit details
            </Link>
            <Link href="/books" className="sf-btn-pine !rounded-full text-sm">
              Browse live stock
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--sf-radius)+0.25rem)] bg-[color:var(--sf-surface)]">
            <Image
              src="/images/hero-dsb-interior.jpg"
              alt="Inside DSB Books"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 40vw"
            />
          </div>
          <dl className="grid grid-cols-2 gap-3 border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4 text-sm">
            <div>
              <dt className="text-[0.65rem] tracking-[0.14em] text-[color:var(--sf-muted)] uppercase">
                Address
              </dt>
              <dd className="mt-1">{STORE_GEO.address}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.14em] text-[color:var(--sf-muted)] uppercase">
                City
              </dt>
              <dd className="mt-1">{STORE_GEO.city}, Bhutan</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.14em] text-[color:var(--sf-muted)] uppercase">
                Phone
              </dt>
              <dd className="mt-1">02 326275</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.14em] text-[color:var(--sf-muted)] uppercase">
                Hours
              </dt>
              <dd className="mt-1">Daily · ~9:00–20:00</dd>
            </div>
          </dl>
          <p className="text-xs leading-relaxed text-[color:var(--sf-muted)]">
            Photos on this page are from the DSB storefront archive used on the
            site. For more customer photos, search{" "}
            <strong>DSB Books Thimphu</strong> on Google Maps and Facebook —
            then send favourites to the shop and we can add them to the gallery.
          </p>
        </aside>
      </section>

      {/* Milestones */}
      <section className="border-y border-[color:var(--sf-line)] bg-[color:var(--sf-surface)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <p className="sf-eyebrow">Timeline</p>
          <h2 className="sf-title mt-2 text-2xl md:text-3xl">
            Milestones on the shelf
          </h2>
          <ol className="mt-8 space-y-0">
            {MILESTONES.map((m, i) => (
              <li
                key={m.year}
                className="grid gap-2 border-t border-[color:var(--sf-line)] py-5 md:grid-cols-[6.5rem_1fr] md:gap-8"
              >
                <p className="font-display text-lg font-semibold text-[color:var(--sf-accent)] md:text-xl">
                  {m.year}
                </p>
                <div>
                  <h3 className="font-display text-base font-semibold md:text-lg">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--sf-muted)] md:text-[0.95rem]">
                    {m.body}
                  </p>
                  {i === MILESTONES.length - 1 ? null : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="sf-eyebrow">From the shop</p>
            <h2 className="sf-title mt-2 text-2xl md:text-3xl">
              Life at DSB Books
            </h2>
          </div>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[color:var(--sf-accent)] hover:underline"
          >
            More photos on Google Maps →
          </a>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {GALLERY.map((shot) => (
            <li key={shot.src} className="group">
              <figure className="overflow-hidden bg-[color:var(--sf-surface)]">
                <div className="relative aspect-[4/5] md:aspect-[3/4]">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </div>
                <figcaption className="px-1 py-2 text-[0.7rem] text-[color:var(--sf-muted)] md:text-xs">
                  {shot.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src="/brand/dsb-enterprises-original.jpg"
              alt="DSB Enterprises crest"
              fill
              className="object-contain bg-[color:var(--sf-surface)] p-6"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-5 md:p-8">
            <p className="sf-eyebrow">The crest</p>
            <h3 className="mt-2 font-display text-xl md:text-2xl">
              DSB Enterprises
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--sf-muted)]">
              The seal you see on the site is the authentic DSB Enterprises crest —
              the same mark that represents the bookstore, publishing imprint, and
              trading house behind the Chang Lam shelves.
            </p>
          </div>
        </div>
      </section>

      {/* What DSB covers */}
      <section className="border-t border-[color:var(--sf-line)] bg-[color:var(--sf-bg)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <p className="sf-eyebrow">Explore DSB</p>
          <h2 className="sf-title mt-2 text-xl md:text-3xl">
            Story, schools &amp; partnerships
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INSTITUTIONAL_SECTIONS.filter((s) => s.href !== "/about").map(
              (s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="flex h-full flex-col border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4 transition hover:border-[color:var(--sf-accent)]"
                  >
                    <p className="text-[0.65rem] font-semibold tracking-wide text-[color:var(--sf-accent)] uppercase">
                      {s.eyebrow}
                    </p>
                    <p className="mt-2 font-display text-base leading-snug">
                      {s.title}
                    </p>
                    <p className="mt-2 flex-1 text-xs text-[color:var(--sf-muted)]">
                      {s.summary}
                    </p>
                  </Link>
                </li>
              )
            )}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/enquiry" className="sf-btn !rounded-full">
              Partner or enquire
            </Link>
            <Link href="/publications" className="sf-btn-outline !rounded-full">
              DSB Publications
            </Link>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
