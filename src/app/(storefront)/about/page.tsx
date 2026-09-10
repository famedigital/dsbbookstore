import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { INSTITUTIONAL_SECTIONS } from "@/lib/storefront/institutional";
import { resolveInstitutional } from "@/lib/storefront/resolve-institutional";

export async function generateMetadata(): Promise<Metadata> {
  const section = await resolveInstitutional("/about");
  return {
    title: section?.title ?? "Our Story",
    description: section?.summary,
  };
}

export default async function AboutPage() {
  const theme = await getStorefrontTheme();
  const section = (await resolveInstitutional("/about"))!;

  return (
    <StorefrontShell active="/about" theme={theme}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <p className="sf-eyebrow">{section.eyebrow}</p>
        <h1 className="sf-title mt-2 text-2xl md:mt-3 md:text-4xl">
          {section.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--sf-muted)] md:mt-4 md:text-base">
          {section.summary}
        </p>
        <div className="mt-8 max-w-2xl space-y-4 text-sm leading-relaxed md:mt-10 md:text-base">
          {section.body.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </div>

        <section className="mt-12 md:mt-16">
          <p className="sf-eyebrow">Explore DSB</p>
          <h2 className="sf-title mt-2 text-xl md:text-3xl">
            Everything the website covers
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
        </section>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link href="/enquiry" className="sf-btn">
            Partner or enquire
          </Link>
          <Link href="/books" className="sf-btn-outline">
            Browse catalogue
          </Link>
        </div>
      </div>
    </StorefrontShell>
  );
}
