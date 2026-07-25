import { MobileNav } from "@/components/storefront/mobile-nav";

/**
 * Storefront chrome: mobile bottom nav + content clearance.
 * Page-level headers stay on individual routes (desktop nav).
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-20 md:pb-0">{children}</div>
      <MobileNav />
    </>
  );
}
