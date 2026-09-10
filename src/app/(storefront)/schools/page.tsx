import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { getSection } from "@/lib/storefront/institutional";

export const metadata: Metadata = {
  title: "Schools, Universities and Libraries",
  description:
    "Supply and learning partnerships for classrooms and collections.",
};

export default async function SchoolsPage() {
  const theme = await getStorefrontTheme();
  return <InstitutionalPage section={getSection("/schools")!} theme={theme} />;
}
