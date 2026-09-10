import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { getSection } from "@/lib/storefront/institutional";

export const metadata: Metadata = {
  title: "Partner With DSB",
  description:
    "Collaborate on publishing, distribution, education, digital projects, and cultural programmes.",
};

export default async function PartnerPage() {
  const theme = await getStorefrontTheme();
  return <InstitutionalPage section={getSection("/partner")!} theme={theme} />;
}
