import type { Metadata } from "next";
import Link from "next/link";
import { getCmsPage, listAboutChildren } from "@/lib/cms/get-page";
import { MarkdownBody } from "@/components/storefront/markdown-body";
import { AboutNav } from "@/components/storefront/about-nav";
import { Breadcrumbs } from "@/components/storefront/chrome";
import { JsonLd } from "@/components/storefront/json-ld";
import { getSiteUrl } from "@/lib/storefront/site";
import { ChevronRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("about");
  return {
    title: page?.seo_title ?? page?.title ?? "About",
    description: page?.seo_description ?? page?.subtitle ?? undefined,
    alternates: { canonical: `${getSiteUrl()}/about` },
    openGraph: {
      title: page?.seo_title ?? page?.title ?? "About DSB",
      description: page?.seo_description ?? page?.subtitle ?? undefined,
      url: `${getSiteUrl()}/about`,
      type: "website",
    },
  };
}

export default async function AboutHubPage() {
  const [page, children] = await Promise.all([
    getCmsPage("about"),
    listAboutChildren(),
  ]);

  const title = page?.title ?? "About DSB";
  const subtitle = page?.subtitle;
  const body = page?.body_md ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
            {
              "@type": "ListItem",
              position: 2,
              name: "About",
              item: `${getSiteUrl()}/about`,
            },
          ],
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AboutNav currentSlug="about" />
        <div>
          <Breadcrumbs
            items={[{ href: "/", label: "Home" }, { label: "About" }]}
          />
          <p className="font-heading text-sm tracking-[0.2em] text-primary uppercase">
            DSB Books
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
          {body ? (
            <div className="mt-8">
              <MarkdownBody content={body} />
            </div>
          ) : null}

          <ul className="mt-12 divide-y divide-border/70 border-y border-border/70">
            {children.map((child, i) => (
              <li
                key={child.id}
                className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  href={`/${child.slug}`}
                  className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-primary"
                >
                  <div>
                    <p className="font-heading text-xl font-semibold">
                      {child.title}
                    </p>
                    {child.subtitle ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {child.subtitle}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
