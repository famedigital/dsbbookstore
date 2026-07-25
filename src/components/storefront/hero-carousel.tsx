"use client";

import * as React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useReducedMotion } from "motion/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCover } from "@/components/media/book-cover";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  slug: string;
  title: string;
  subtitle: string | null;
  priceLabel: string;
  availabilityLabel: string;
  inStock: boolean;
  cover: {
    publicId: string | null;
    cloudinaryId: string | null;
    supabaseUrl: string | null;
  };
};

export function HeroCarousel({
  slides,
  eyebrow,
}: {
  slides: HeroSlide[];
  eyebrow: string;
}) {
  const reduce = useReducedMotion();
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  const plugins = React.useMemo(
    () =>
      reduce
        ? []
        : [
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ],
    [reduce]
  );

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true, align: "start" }}
      plugins={plugins}
      className="group relative"
    >
      <CarouselContent className="ml-0">
        {slides.map((slide, i) => (
          <CarouselItem key={slide.slug} className="pl-0">
            <div className="relative isolate overflow-hidden rounded-3xl">
              {/* Brand gradient advertisement backdrop */}
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_25%_15%,var(--dsb-blue)_0%,transparent_55%),radial-gradient(ellipse_at_95%_90%,var(--dsb-green)_0%,transparent_48%),linear-gradient(135deg,#071a3a,#0b2f6b_52%,#0a3f30)]" />
              <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:url('data:image/svg+xml,%3Csvg%20width%3D%2748%27%20height%3D%2748%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M0%2048L48%200M24%2048L48%2024M0%2024L24%200%27%20stroke%3D%27%23ffffff%27%20fill%3D%27none%27/%3E%3C/svg%3E')]" />

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-6 sm:gap-8 sm:p-12">
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-medium tracking-[0.28em] text-[color:var(--dsb-gold)] uppercase sm:text-xs">
                    {eyebrow}
                  </p>
                  <h2 className="mt-3 line-clamp-2 font-heading text-2xl leading-[1.1] font-semibold text-white sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>
                  {slide.subtitle ? (
                    <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/75 sm:mt-3 sm:text-base">
                      {slide.subtitle}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
                    <span className="text-base font-semibold text-white sm:text-lg">
                      {slide.priceLabel}
                    </span>
                    <Badge
                      className={cn(
                        "border-transparent text-[0.7rem]",
                        slide.inStock
                          ? "bg-[color:var(--dsb-green)] text-white"
                          : "bg-white/15 text-white/90"
                      )}
                    >
                      {slide.availabilityLabel}
                    </Badge>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                    <Button
                      asChild
                      className="bg-[color:var(--dsb-gold)] text-[#2a2108] shadow-lg hover:brightness-105"
                    >
                      <Link href={`/books/${slide.slug}`}>View book</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      <Link href="/books">Browse all</Link>
                    </Button>
                  </div>
                </div>

                <Link
                  href={`/books/${slide.slug}`}
                  className="relative block shrink-0"
                  tabIndex={-1}
                  aria-hidden
                >
                  <BookCover
                    publicId={slide.cover.publicId}
                    cloudinaryId={slide.cover.cloudinaryId}
                    supabaseUrl={slide.cover.supabaseUrl}
                    alt={slide.title}
                    width={400}
                    height={600}
                    sizes="(max-width: 640px) 35vw, 220px"
                    className="aspect-[2/3] w-24 rotate-3 rounded-lg object-cover shadow-2xl ring-1 ring-white/15 transition duration-500 group-hover:rotate-0 sm:w-40 lg:w-48"
                  />
                  <span className="absolute -top-2 -left-2 rounded-full bg-[color:var(--dsb-gold)] px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-[#2a2108] shadow-md">
                    #{i + 1}
                  </span>
                </Link>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={selected === i}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selected === i
                ? "w-6 bg-[color:var(--dsb-gold)]"
                : "w-1.5 bg-primary/25 hover:bg-primary/40"
            )}
          />
        ))}
      </div>

      <CarouselPrevious className="left-3 hidden border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:inline-flex" />
      <CarouselNext className="right-3 hidden border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:inline-flex" />
    </Carousel>
  );
}
