"use client";

import { FadeIn } from "@/components/storefront/motion";
import type { ReactNode } from "react";

export function BookDetailHero({
  cover,
  body,
}: {
  cover: ReactNode;
  body: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-28 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-14 md:px-8 md:pb-24 lg:gap-20">
      <FadeIn className="md:sticky md:top-8 md:self-start" y={16}>
        <div className="mx-auto w-full max-w-md overflow-hidden shadow-[0_30px_80px_-40px_rgba(11,61,145,0.65)] md:max-w-none">
          {cover}
        </div>
      </FadeIn>
      <FadeIn delay={0.08} y={18}>
        {body}
      </FadeIn>
    </div>
  );
}
