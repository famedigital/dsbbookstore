"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  bookWhatsAppHref,
  whatsappNumberDigits,
  whatsappUrl,
} from "@/lib/storefront/whatsapp";
import { HoldBagProvider } from "@/components/storefront/hold-bag";
import { MobileServiceBar } from "@/components/storefront/mobile-service-bar";

const WhatsAppCtx = createContext<string>(whatsappNumberDigits());

export function useWhatsAppDigits() {
  return useContext(WhatsAppCtx);
}

export function useWhatsApp() {
  const digits = useWhatsAppDigits();
  return {
    digits,
    url: (message: string) => whatsappUrl(message, digits),
    bookHref: (opts: {
      title: string;
      slug?: string;
      isbn?: string | null;
      price?: number | null;
    }) => bookWhatsAppHref(opts, digits),
  };
}

export function StorefrontProviders({
  children,
  whatsappDigits,
}: {
  children: ReactNode;
  whatsappDigits?: string | null;
}) {
  const digits = whatsappNumberDigits(whatsappDigits);
  return (
    <WhatsAppCtx.Provider value={digits}>
      <HoldBagProvider>
        {children}
        <MobileServiceBar />
        <div className="h-14 md:hidden" aria-hidden />
      </HoldBagProvider>
    </WhatsAppCtx.Provider>
  );
}
