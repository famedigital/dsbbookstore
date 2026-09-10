import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";

export const metadata: Metadata = {
  title: "Bhutan–Australia Bridge",
  description:
    "Import, distribution, print-on-demand, education partnerships, and cultural programmes between Bhutan and Australia.",
};

const PILLARS = [
  {
    title: "Trade & distribution",
    body: "Legal import pathways for DSB titles into Australia, with wholesale and institutional fulfilment options.",
  },
  {
    title: "Print & production",
    body: "Australian printing and print-on-demand so schools and libraries can restock without long freight waits.",
  },
  {
    title: "Education partners",
    body: "Universities, schools, and libraries building Bhutanese collections and classroom resources.",
  },
  {
    title: "Culture & exchange",
    body: "Author visits, book events, and cultural programmes that keep Bhutanese stories present abroad.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us what you need",
    body: "Titles, quantities, audience, and timeline — school sets, library standing orders, or retail.",
  },
  {
    n: "02",
    title: "We confirm supply",
    body: "Availability from Thimphu stock, reprint options, or Australian print-on-demand where it fits.",
  },
  {
    n: "03",
    title: "Fulfil & stay in touch",
    body: "Shipping, licensing notes, and ongoing partnership for events or new releases.",
  },
];

export default async function AustraliaPage() {
  const theme = await getStorefrontTheme();

  return (
    <StorefrontShell active="/australia" theme={theme}>
      <section className="relative isolate min-h-[58vh] overflow-hidden md:min-h-[68vh]">
        <Image
          src="/images/hero-bookstore.jpg"
          alt="Bookstore shelves"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,17,15,0.92)_0%,rgba(20,17,15,0.55)_55%,rgba(20,17,15,0.25)_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[58vh] w-full max-w-6xl flex-col justify-end px-4 pb-10 pt-24 md:min-h-[68vh] md:px-6 md:pb-14">
          <p className="sf-eyebrow text-[color:var(--dsb-gilt)]">
            Bhutan–Australia Bridge
          </p>
          <h1 className="mt-3 max-w-3xl font-heading text-3xl tracking-[-0.02em] text-[color:var(--dsb-ivory)] md:text-5xl lg:text-6xl">
            Books, learning &amp; partnership across two countries
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--dsb-ivory)]/75 md:text-base">
            DSB connects Chang Lam publishing with Australian schools,
            universities, libraries, printers, and cultural partners.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/enquiry" className="sf-btn">
              Start a conversation
            </Link>
            <Link
              href="/books"
              className="sf-btn-outline !border-[color:var(--dsb-ivory)]/45 !text-[color:var(--dsb-ivory)] hover:!bg-[color:var(--dsb-ivory)] hover:!text-[color:var(--dsb-ink)]"
            >
              Browse titles
            </Link>
          </div>
        </div>
        <hr className="sf-dzong-rule absolute inset-x-0 bottom-0 z-10" />
      </section>

      <section className="sf-textile bg-[color:var(--sf-surface)] py-12 md:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:grid-cols-12 md:gap-12 md:px-6">
          <div className="md:col-span-5">
            <p className="sf-eyebrow">Why it matters</p>
            <h2 className="sf-title mt-3 text-2xl md:text-4xl">
              A living bridge for Bhutanese knowledge
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-[color:var(--sf-muted)] md:col-span-7 md:text-base">
            <p>
              The Bhutan–Australia Bridge is how DSB moves from a Thimphu
              storefront into classrooms, libraries, and cultural programmes in
              Australia — without losing the care of a family bookstore.
            </p>
            <p>
              We support legal trade in books, print-on-demand where freight is
              slow, and long-term relationships with educators and institutions
              who want authentic Bhutanese content.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--sf-bg)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <p className="sf-eyebrow">What we work on</p>
          <h2 className="sf-title mt-2 text-2xl md:text-4xl">Four pillars</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <li
                key={p.title}
                className="sf-card border-l-[3px] border-l-[color:var(--sf-accent)] p-5 md:p-6"
              >
                <h3 className="font-display text-lg md:text-xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--sf-muted)]">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative isolate min-h-[36vh] overflow-hidden md:min-h-[44vh]">
        <Image
          src="/images/hero-dsb-interior.jpg"
          alt="Inside DSB Books"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[color:var(--sf-pine)]/75" />
        <div className="relative z-10 mx-auto flex min-h-[36vh] w-full max-w-6xl items-end px-4 py-10 md:min-h-[44vh] md:px-6 md:py-14">
          <p className="max-w-2xl font-heading text-2xl text-[color:var(--dsb-ivory)] md:text-4xl">
            From Chang Lam shelves to Australian collections — one partnership
            at a time.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--sf-surface)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <p className="sf-eyebrow">How it works</p>
          <h2 className="sf-title mt-2 text-2xl md:text-4xl">
            Simple path for partners
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-[color:var(--sf-gilt)] pt-4">
                <p className="font-mono text-xs tracking-widest text-[color:var(--sf-accent)]">
                  {s.n}
                </p>
                <h3 className="mt-2 font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--sf-muted)]">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sf-pine-band sf-textile py-12 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-gilt)] uppercase">
              Next step
            </p>
            <h2 className="mt-2 font-heading text-2xl md:text-3xl">
              Ready to partner?
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Share your organisation, titles of interest, and timeline — we
              reply by email.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/enquiry"
              className="sf-btn !bg-[color:var(--sf-gilt)] !text-[color:var(--sf-ink)]"
            >
              Enquire
            </Link>
            <Link href="/digital-lab" className="sf-btn-outline !border-white/40 !text-white">
              Digital Lab
            </Link>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
