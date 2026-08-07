import type { Metadata } from "next";
import { getCmsPage } from "@/lib/cms/get-page";
import { MarkdownBody } from "@/components/storefront/markdown-body";
import { getSiteUrl } from "@/lib/storefront/site";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("terms");
  return {
    title: page?.seo_title ?? "Terms of Use",
    description: page?.seo_description ?? undefined,
    alternates: { canonical: `${getSiteUrl()}/terms` },
  };
}

export default async function TermsPage() {
  const page = await getCmsPage("terms");
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 pb-20">
      <h1 className="font-heading text-4xl font-semibold">
        {page?.title ?? "Terms of Use"}
      </h1>
      {page?.subtitle ? (
        <p className="mt-3 text-lg text-muted-foreground">{page.subtitle}</p>
      ) : null}
      <div className="mt-8">
        <MarkdownBody content={page?.body_md ?? ""} />
      </div>
    </article>
  );
}
