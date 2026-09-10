import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { resolveInstitutional } from "@/lib/storefront/resolve-institutional";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const section = await resolveInstitutional("/orders");
  return {
    title: section?.title ?? "International Orders",
    description: section?.summary,
  };
}

export default async function OrdersPage() {
  const theme = await getStorefrontTheme();
  const section = await resolveInstitutional("/orders");
  if (!section) notFound();
  return <InstitutionalPage section={section} theme={theme} />;
}
