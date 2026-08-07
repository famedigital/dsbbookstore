import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCmsPage,
  listAboutChildren,
  listCmsPages,
} from "@/lib/cms/get-page";
import { MarkdownBody } from "@/components/storefront/markdown-body";
import { AboutNav } from "@/components/storefront/about-nav";
import { Breadcrumbs } from "@/components/storefront/chrome";
import { JsonLd } from "@/components/storefront/json-ld";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/storefront/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await listCmsPages({
    publishedOnly: true,
    prefix: "about/",
  });
  return pages
    .filter((p) => p.slug.startsWith("about/") && p.slug !== "about")
    .map((p) => ({ slug: p.slug.replace(/^about\//, "") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPage(`about/${slug}`);
  if (!page) return { title: "Not found" };
  const url = `${getSiteUrl()}/about/${slug}`;
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? page.subtitle ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? page.subtitle ?? undefined,
      url,
      type: "article",
    },
  };
}

export default async function AboutArticlePage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = `about/${slug}`;
  const [page, siblings] = await Promise.all([
    getCmsPage(fullSlug),
    listAboutChildren(),
  ]);
  if (!page) notFound();

  const related = siblings.filter((s) => s.slug !== fullSlug).slice(0, 3);
  const url = `${getSiteUrl()}/about/${slug}`;

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
            { "@type": "ListItem", position: 3, name: page.title, item: url },
          ],
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AboutNav currentSlug={fullSlug} />
        <article>
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/about", label: "About" },
              { label: page.nav_label ?? page.title },
            ]}
          />
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {page.title}
          </h1>
          {page.subtitle ? (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {page.subtitle}
            </p>
          ) : null}
          <div className="mt-8">
            <MarkdownBody content={page.body_md} />
          </div>

          {page.show_enquire_cta ? (
            <div className="mt-10 rounded-lg border border-primary/20 bg-white/70 p-6">
              <p className="font-heading text-xl font-semibold">Continue the conversation</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us what you need — we reply by email.
              </p>
              <Button asChild className="mt-4">
                <Link
                  href={`/enquiry?topic=${encodeURIComponent(page.enquire_topic ?? "general")}`}
                >
                  Enquire
                </Link>
              </Button>
            </div>
          ) : null}

          {related.length ? (
            <div className="mt-12">
              <h2 className="font-heading text-2xl font-semibold">Related</h2>
              <ul className="mt-4 space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/${r.slug}`} className="text-primary hover:underline">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </div>
    </div>
  );
}
