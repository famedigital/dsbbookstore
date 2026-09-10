import type { InstitutionalSection } from "@/lib/storefront/institutional";

export type CmsPageStatus = "draft" | "published";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  status: CmsPageStatus;
  sort_order: number;
  updated_at: string;
};

export type CmsSection = {
  id: string;
  page_id: string;
  key: string;
  eyebrow: string | null;
  heading: string | null;
  summary: string | null;
  body: unknown;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
  image_alt: string | null;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
};

export type CmsPageWithSections = CmsPage & {
  sections: CmsSection[];
};

export function bodyAsStrings(body: unknown): string[] {
  if (!Array.isArray(body)) return [];
  return body.filter((x): x is string => typeof x === "string");
}

export function bodyAsCards(
  body: unknown
): { title: string; body: string }[] {
  if (!Array.isArray(body)) return [];
  return body
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { title?: unknown; body?: unknown };
      if (typeof row.title !== "string" || typeof row.body !== "string") {
        return null;
      }
      return { title: row.title, body: row.body };
    })
    .filter((x): x is { title: string; body: string } => Boolean(x));
}

export function sectionToInstitutional(
  href: string,
  label: string,
  section: CmsSection | null | undefined,
  fallback: InstitutionalSection
): InstitutionalSection {
  if (!section) return fallback;
  const bullets = bodyAsCards(section.body).map((c) => c.title);
  const paras = bodyAsStrings(section.body);
  return {
    href,
    label,
    eyebrow: section.eyebrow ?? fallback.eyebrow,
    title: section.heading ?? fallback.title,
    summary: section.summary ?? fallback.summary,
    body: paras.length ? paras : fallback.body,
    bullets:
      bullets.length > 0
        ? bullets
        : Array.isArray(fallback.bullets)
          ? fallback.bullets
          : undefined,
  };
}
