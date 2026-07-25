import { SiteShell } from "@/components/storefront/site-shell";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
