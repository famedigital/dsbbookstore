import { getCmsSection } from "@/lib/storefront/cms";
import { sectionToInstitutional } from "@/lib/storefront/cms-types";
import {
  getSection,
  type InstitutionalSection,
} from "@/lib/storefront/institutional";

export async function resolveInstitutional(
  href: string
): Promise<InstitutionalSection | null> {
  const fallback = getSection(href);
  if (!fallback) return null;
  const slug = href.replace(/^\//, "") || "home";
  const section = await getCmsSection(slug, "intro");
  return sectionToInstitutional(href, fallback.label, section, fallback);
}
