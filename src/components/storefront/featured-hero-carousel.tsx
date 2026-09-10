"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn } from "@/lib/erp/format";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price_btn: number;
  cover_public_id: string | null;
  isbn_13: string | null;
  barcode: string | null;
  publisher_name: string | null;
  published_at: string | null;
  brand: string | null;
  categoryName: string;
  categorySlug: string;
};

const INTERVAL_MS = 5500;

export function FeaturedHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const slide = slides[index] ?? slides[0];
  const year = slide.published_at?.slice(0, 4);
  const yearOk = year && /^\d{4}$/.test(year) ? year : null;
  const metaLine = [
    slide.brand,
    slide.publisher_name &&
    slide.publisher_name !== "DSB Publication" &&
    slide.publisher_name !== "DSB Enterprises"
      ? slide.publisher_name
      : null,
    yearOk,
  ]
    .filter(Boolean)
    .join(" · ");
  const blurb =
    (slide.subtitle ||
      slide.description?.slice(0, 160) ||
      "Live stock from Bhutan's bookstore on Chang Lam.") +
    (slide.description &&
    !slide.subtitle &&
    slide.description.length > 160
      ? "…"
      : "");

  return (
    <section
      className="sf-featured-hero sf-textile sf-dzong-top"
      aria-roledescription="carousel"
      aria-label="Featured books by category"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div className="sf-featured-hero__frame mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="sf-featured-hero__grid">
          <div className="sf-rise min-w-0 self-center">
            <p className="sf-eyebrow">
              {slide.categoryName}
              <span className="font-normal text-[color:var(--sf-muted)]">
                {" "}
                · Featured
              </span>
            </p>
            <div className="sf-featured-hero__gilt" aria-hidden />

            <div
              key={slide.id}
              className="sf-featured-hero__copy"
            >
              <h1 className="sf-featured-hero__title mt-3 hidden md:block">
                {slide.title}
              </h1>
              {metaLine ? (
                <p className="mt-2 hidden text-sm text-[color:var(--sf-muted)] md:block">
                  {metaLine}
                </p>
              ) : null}
              <p className="mt-3 hidden max-w-lg text-[0.9rem] leading-relaxed text-[color:var(--sf-muted)] md:line-clamp-3 md:block md:text-base">
                {blurb}
              </p>

              <p className="sf-featured-hero__price mt-2 md:mt-5">
                {formatBtn(slide.price_btn)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 md:mt-5 md:gap-3">
                <Link
                  href={`/books/${slide.slug}`}
                  className="sf-btn sf-featured-hero__btn"
                >
                  View book
                </Link>
                <Link
                  href={`/books?category=${encodeURIComponent(slide.categorySlug)}`}
                  className="sf-btn-pine sf-featured-hero__btn"
                >
                  {slide.categoryName}
                </Link>
              </div>
            </div>

            {slides.length > 1 ? (
              <div
                className="mt-4 flex flex-wrap items-center gap-1.5 md:mt-6"
                role="tablist"
                aria-label="Slide categories"
              >
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${s.categoryName}: ${s.title}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index
                        ? "w-7 bg-[color:var(--sf-accent)]"
                        : "w-1.5 bg-[color:var(--sf-line)] hover:bg-[color:var(--sf-muted)]"
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="sf-featured-hero__cover justify-self-end md:justify-self-center">
            <div className="sf-featured-hero__cover-stage" key={slide.id}>
              <BookCover
                publicId={slide.cover_public_id}
                isbn={slide.isbn_13}
                barcode={slide.barcode}
                alt={slide.title}
                width={640}
                height={960}
                priority={index === 0}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            key={`m-${slide.id}`}
            className="col-span-2 min-w-0 md:hidden"
          >
            <h1 className="sf-featured-hero__title">{slide.title}</h1>
            {metaLine ? (
              <p className="mt-1 text-xs text-[color:var(--sf-muted)]">
                {metaLine}
              </p>
            ) : null}
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[color:var(--sf-muted)]">
              {blurb}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
