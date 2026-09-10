"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";

type Props = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function isLocalOrHttp(src: string) {
  return (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}

/** CMS hero/inline image: local path, remote URL, or Cloudinary public_id. */
export function CmsImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: Props) {
  if (!src) return null;

  if (isLocalOrHttp(src)) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          unoptimized={src.startsWith("/")}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 800}
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("/")}
      />
    );
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return null;

  return (
    <CldImage
      src={src}
      alt={alt}
      width={width ?? 1600}
      height={height ?? 900}
      crop="fill"
      gravity="auto"
      format="auto"
      quality="auto"
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
