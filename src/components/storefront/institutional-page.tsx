import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/shell";
import type { StorefrontThemeId } from "@/lib/storefront/themes";
import {
  INSTITUTIONAL_SECTIONS,
  type InstitutionalSection,
} from "@/lib/storefront/institutional";

export function InstitutionalPage({
  section,
  theme,
  related,
}: {
  section: InstitutionalSection;
  theme: StorefrontThemeId;
  related?: boolean;
}) {
  return (
    <StorefrontShell active={section.href} theme={theme}>
      <div
        className="border-b border-[color:var(--sf-line)]"
        style={{ background: "var(--sf-hero)" }}
      >
        <div className="sf-rise mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-16">
          <p className="sf-eyebrow">{section.eyebrow}</p>
          <h1 className="sf-title mt-3 max-w-3xl text-2xl md:text-5xl">
            {section.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--sf-muted)] md:text-base">
            {section.summary}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
          {section.body.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </div>

        {section.bullets?.length ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-10">
            {section.bullets.map((item) => (
              <li
                key={item}
                className="sf-card border-l-2 border-l-[color:var(--sf-accent)] px-4 py-3.5 text-sm leading-snug text-[color:var(--sf-ink)]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2 md:mt-10">
          <Link href="/enquiry" className="sf-btn">
            Send an enquiry
          </Link>
          <Link href="/books" className="sf-btn-outline">
            {section.href === "/publications" || section.href === "/orders"
              ? "Browse catalogue"
              : "View catalogue"}
          </Link>
        </div>

        {related !== false ? (
          <section className="mt-12 border-t border-[color:var(--sf-line)] pt-8 md:mt-16">
            <p className="sf-eyebrow">More from DSB</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {INSTITUTIONAL_SECTIONS.filter((s) => s.href !== section.href)
                .slice(0, 4)
                .map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="sf-card sf-card-hover block p-4"
                    >
                      <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[color:var(--sf-accent)] uppercase">
                        {s.eyebrow}
                      </p>
                      <p className="mt-2 font-display text-base leading-snug">
                        {s.title}
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
      </div>
    </StorefrontShell>
  );
}
