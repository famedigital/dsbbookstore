"use client";

import { useState } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import {
  buildCoverUrl,
  openLibraryCoverUrl,
  resolveCoverSrc,
} from "@/lib/cloudinary-url";

type Props = {
  publicId?: string | null;
  /** ISBN-13 when known — free Open Library fallback */
  isbn?: string | null;
  /** UPCEAN / barcode — used when ISBN missing */
  barcode?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function Placeholder({
  alt,
  width,
  height,
  className,
}: Pick<Props, "alt" | "width" | "height" | "className">) {
  const fills = className?.includes("absolute") || className?.includes("h-full");
  return (
    <div
      className={`flex items-center justify-center bg-[linear-gradient(160deg,#0f172a_0%,#1e3a5f_50%,#0284c7_100%)] text-white/90 ${className ?? ""}`}
      style={fills ? undefined : { aspectRatio: `${width}/${height}` }}
      aria-label={alt}
    >
      <span className="px-3 text-center text-[0.65rem] font-medium tracking-[0.2em] uppercase">
        DSB
      </span>
    </div>
  );
}

function isLocalOrRemoteSrc(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

function localFallbackSrc(src: string) {
  if (!src.startsWith("/covers/")) return null;
  if (src.endsWith(".jpg")) return src.replace(/\.jpg$/i, ".svg");
  if (src.endsWith(".svg")) return src.replace(/\.svg$/i, ".jpg");
  return null;
}

/**
 * Cover resolver (free-tier order):
 * 1. Stored publicId (Cloudinary id, /local, or https URL)
 * 2. Open Library by ISBN/barcode (no storage cost)
 * 3. Soft DSB placeholder
 */
export function BookCover({
  publicId,
  isbn,
  barcode,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
}: Props) {
  const frame = `sf-cover object-cover ${className ?? ""}`;
  const initial =
    resolveCoverSrc({ publicId, isbn, barcode, width }) || publicId || "";
  const [src, setSrc] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [triedOl, setTriedOl] = useState(false);

  if (!src || failed) {
    return (
      <Placeholder alt={alt} width={width} height={height} className={frame} />
    );
  }

  if (isLocalOrRemoteSrc(src)) {
    if (src.endsWith(".svg")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={frame}
          loading={priority ? "eager" : "lazy"}
          onError={() => {
            const next = localFallbackSrc(src);
            if (next && next !== src) setSrc(next);
            else if (!triedOl) {
              const ol =
                openLibraryCoverUrl(isbn, "M") ||
                openLibraryCoverUrl(barcode, "M");
              setTriedOl(true);
              if (ol) setSrc(ol);
              else setFailed(true);
            } else setFailed(true);
          }}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        className={frame}
        priority={priority}
        unoptimized={src.startsWith("/") || src.includes("openlibrary.org")}
        onError={() => {
          const next = localFallbackSrc(src);
          if (next && next !== src) {
            setSrc(next);
            return;
          }
          if (!triedOl) {
            const ol =
              openLibraryCoverUrl(isbn, "M") ||
              openLibraryCoverUrl(barcode, "M");
            setTriedOl(true);
            if (ol && ol !== src) {
              setSrc(ol);
              return;
            }
          }
          setFailed(true);
        }}
      />
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (cloudName) {
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        crop="fill"
        gravity="auto"
        format="auto"
        quality="auto"
        sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        className={frame}
        priority={priority}
        onError={() => {
          if (!triedOl) {
            const ol =
              openLibraryCoverUrl(isbn, "M") ||
              openLibraryCoverUrl(barcode, "M");
            setTriedOl(true);
            if (ol) {
              setSrc(ol);
              return;
            }
          }
          setFailed(true);
        }}
      />
    );
  }

  const fallbackUrl = buildCoverUrl(src, width);
  if (fallbackUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallbackUrl}
        alt={alt}
        width={width}
        height={height}
        className={frame}
        loading={priority ? "eager" : "lazy"}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Placeholder alt={alt} width={width} height={height} className={frame} />
  );
}
