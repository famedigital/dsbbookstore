import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { resolveInstitutional } from "@/lib/storefront/resolve-institutional";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const section = await resolveInstitutional("/partner");
  return {
    title: section?.title ?? "Partner",
    description: section?.summary,
  };
}

export default async function PartnerPage() {
  const theme = await getStorefrontTheme();
  const section = await resolveInstitutional("/partner");
  if (!section) notFound();
  return <InstitutionalPage section={section} theme={theme} />;
}
