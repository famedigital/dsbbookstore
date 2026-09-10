import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
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
  return <InstitutionalPage section={section} theme={theme} />;
}
