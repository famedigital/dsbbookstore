import type { Metadata } from "next";
import { InstitutionalPage } from "@/components/storefront/institutional-page";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { getSection } from "@/lib/storefront/institutional";

export const metadata: Metadata = {
  title: "International Orders",
  description:
    "Enquire about international supply, shipping, and Australia Bridge fulfilment.",
};

export default async function OrdersPage() {
  const theme = await getStorefrontTheme();
  return <InstitutionalPage section={getSection("/orders")!} theme={theme} />;
}
