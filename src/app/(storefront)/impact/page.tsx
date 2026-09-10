import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { getSection } from "@/lib/storefront/institutional";

export const metadata: Metadata = {
  title: "Earth and Community Impact",
  description:
    "Publishing and programmes that respect land, culture, and community.",
};

export default async function ImpactPage() {
  const theme = await getStorefrontTheme();
  return <InstitutionalPage section={getSection("/impact")!} theme={theme} />;
}
