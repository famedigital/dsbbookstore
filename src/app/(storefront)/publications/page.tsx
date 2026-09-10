import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { getSection } from "@/lib/storefront/institutional";

export const metadata: Metadata = {
  title: "DSB Publications",
  description:
    "Books published under the DSB imprint — browse the live catalogue.",
};

export default async function PublicationsPage() {
  const theme = await getStorefrontTheme();
  return <InstitutionalPage section={getSection("/publications")!} theme={theme} />;
}
