import { StorefrontShell } from "@/components/storefront/shell";
import { ReadingListPanel } from "@/components/storefront/reading-list-panel";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";

export const metadata = {
  title: "Reading list",
  description: "Guest reading list for pickup at DSB Books, Chang Lam.",
};

export default async function ReadingListPage() {
  const theme = await getStorefrontTheme();
  return (
    <StorefrontShell active="/list" theme={theme}>
      <ReadingListPanel />
    </StorefrontShell>
  );
}
