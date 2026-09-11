import type { Metadata } from "next";
import { SchoolListBuilder } from "@/components/storefront/school-list-builder";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { resolveInstitutional } from "@/lib/storefront/resolve-institutional";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const section = await resolveInstitutional("/schools");
  return {
    title: section?.title ?? "Schools",
    description: section?.summary,
  };
}

export default async function SchoolsPage() {
  const theme = await getStorefrontTheme();
  const section = await resolveInstitutional("/schools");
  if (!section) notFound();

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

        <SchoolListBuilder />
      </div>
    </StorefrontShell>
  );
}
