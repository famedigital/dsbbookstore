"use client";

import Link from "next/link";
import { GOOGLE_MAPS_URL, STORE_GEO } from "@/lib/storefront/seo";
import { useWhatsApp } from "@/components/storefront/storefront-providers";

/** Sticky mobile Call · Maps · WhatsApp — not overlaid on hero. */
export function MobileServiceBar() {
  const { url } = useWhatsApp();
  const wa = url(
    "Hi DSB Books — I'd like to ask about a title / visit Chang Lam."
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--sf-line)] bg-[color:var(--sf-night)]/95 text-[color:var(--sf-ivory)] backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-white/10">
        <a
          href={`tel:${STORE_GEO.phone.replace(/\s+/g, "")}`}
          className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-center text-[0.65rem] font-semibold tracking-[0.12em] uppercase transition hover:bg-white/5"
        >
          Call
          <span className="text-[0.6rem] font-normal tracking-normal text-white/50 normal-case">
            02 326275
          </span>
        </a>
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-center text-[0.65rem] font-semibold tracking-[0.12em] uppercase transition hover:bg-white/5"
        >
          Maps
          <span className="text-[0.6rem] font-normal tracking-normal text-white/50 normal-case">
            Chang Lam
          </span>
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-center text-[0.65rem] font-semibold tracking-[0.12em] text-[color:var(--sf-gilt)] uppercase transition hover:bg-white/5"
        >
          WhatsApp
          <span className="text-[0.6rem] font-normal tracking-normal text-white/50 normal-case">
            Ask us
          </span>
        </a>
      </div>
      <Link href="/list" className="sr-only">
        Reading list
      </Link>
    </div>
  );
}
