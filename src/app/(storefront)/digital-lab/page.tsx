import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";

export const metadata: Metadata = {
  title: "Digital Knowledge Lab",
  description:
    "Digitisation, e-books, audiobooks, LMS, archives, and technology services for Bhutanese content.",
};

const SERVICES = [
  {
    title: "Digitisation",
    body: "Scan and preserve Bhutanese books, manuscripts, and institutional documents with care for metadata and access.",
  },
  {
    title: "E-books & audio",
    body: "Produce readable and listen-friendly editions for diaspora readers, schools, and travellers.",
  },
  {
    title: "Learning platforms",
    body: "Course packaging and LMS-ready materials for classrooms that need Bhutanese context online.",
  },
  {
    title: "Archives",
    body: "Digital collections for cultural organisations that want search, backup, and controlled sharing.",
  },
  {
    title: "Multilingual tech",
    body: "Workflows that respect Dzongkha and English publishing — not one-size-fits-all translation dumps.",
  },
  {
    title: "Export & partners",
    body: "Package Bhutanese digital services for schools, publishers, and partners abroad.",
  },
];

export default async function DigitalLabPage() {
  const theme = await getStorefrontTheme();

  return (
    <StorefrontShell active="/digital-lab" theme={theme}>
      <section className="relative isolate min-h-[58vh] overflow-hidden md:min-h-[68vh]">
        <Image
          src="/images/hero-dsb-exterior.jpg"
          alt="DSB Books on Chang Lam — home of the Digital Knowledge Lab"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(26,36,48,0.94)_0%,rgba(20,17,15,0.72)_48%,rgba(36,53,44,0.55)_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[58vh] w-full max-w-6xl flex-col justify-end px-4 pb-10 pt-24 md:min-h-[68vh] md:px-6 md:pb-14">
          <p className="sf-eyebrow text-[color:var(--dsb-gilt,#9c7a3e)]">
            Digital Knowledge Lab
          </p>
          <h1 className="mt-3 max-w-3xl font-heading text-3xl tracking-[-0.02em] text-[color:var(--dsb-ivory,#f7f2e8)] md:text-5xl lg:text-6xl">
            From shelf to screen — Bhutanese knowledge, carefully digitised
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--dsb-ivory,#f7f2e8)]/80 md:text-base">
            The Lab extends DSB beyond Chang Lam: heritage scans, e-editions,
            learning platforms, and archives rooted in Bhutanese content — so
            schools and partners can teach from screens as well as shelves.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/enquiry" className="sf-btn">
              Discuss a project
            </Link>
            <Link
              href="/australia"
              className="inline-flex items-center justify-center border border-[color:var(--dsb-ivory,#f7f2e8)]/55 px-4 py-2.5 text-[0.72rem] font-semibold tracking-[0.08em] text-[color:var(--dsb-ivory,#f7f2e8)] uppercase transition hover:bg-[color:var(--dsb-ivory,#f7f2e8)] hover:text-[color:var(--dsb-ink,#14110f)]"
              style={{ borderRadius: "var(--sf-btn-radius, 0)" }}
            >
              Australia Bridge
            </Link>
          </div>
        </div>
        <hr className="sf-dzong-rule absolute inset-x-0 bottom-0 z-10" />
      </section>

      <section className="bg-[color:var(--sf-surface)] py-12 md:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-center md:gap-12 md:px-6">
          <div>
            <p className="sf-eyebrow">Approach</p>
            <h2 className="sf-title mt-3 text-2xl md:text-4xl">
              Technology with a bookstore&apos;s patience
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--sf-muted)] md:text-base">
              We don&apos;t treat digitisation as a race. Rights, language,
              and cultural context sit beside file formats — so schools and
              institutions get materials they can actually teach and keep.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden border border-[color:var(--sf-line)]">
            <Image
              src="/images/hero-dsb-interior.jpg"
              alt="Shelves inside DSB Books"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="sf-textile bg-[color:var(--sf-bg)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <p className="sf-eyebrow">Services</p>
          <h2 className="sf-title mt-2 text-2xl md:text-4xl">
            What the Lab can build with you
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.title} className="sf-card p-5">
                <h3 className="font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--sf-muted)]">
                  {s.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-14 md:py-20">
        <div className="absolute inset-0 bg-[color:var(--sf-night)]" />
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/hero-dsb-exterior.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
          <p className="sf-eyebrow text-[color:var(--dsb-gilt)]">Who it&apos;s for</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Schools & universities needing digital Bhutanese resources",
              "Publishers and cultural bodies building searchable archives",
              "Australia Bridge partners packaging content for distance learners",
            ].map((t) => (
              <p
                key={t}
                className="border border-white/15 bg-black/25 p-5 text-sm leading-relaxed text-[color:var(--dsb-ivory)]/85 backdrop-blur-sm"
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--sf-surface)] py-12 md:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-12 md:px-6">
          <div className="md:col-span-7">
            <p className="sf-eyebrow">Start</p>
            <h2 className="sf-title mt-2 text-2xl md:text-4xl">
              Bring a collection or a course brief
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--sf-muted)] md:text-base">
              Tell us what you already hold (print, scans, rights) and what
              learners need. We reply with a practical next step — not a
              generic tech pitch.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 md:col-span-5 md:items-end">
            <Link href="/enquiry" className="sf-btn w-fit">
              Send an enquiry
            </Link>
            <Link href="/publications" className="sf-btn-outline w-fit">
              DSB Publications
            </Link>
          </div>
        </div>
        <hr className="sf-dzong-rule mx-auto mt-12 max-w-6xl" />
      </section>
    </StorefrontShell>
  );
}
