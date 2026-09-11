"use client";

import { HoldBagProvider } from "@/components/storefront/hold-bag";
import { MobileServiceBar } from "@/components/storefront/mobile-service-bar";

export function StorefrontProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HoldBagProvider>
      {children}
      <MobileServiceBar />
      {/* Spacer so sticky bar doesn't cover content on mobile */}
      <div className="h-14 md:hidden" aria-hidden />
    </HoldBagProvider>
  );
}
