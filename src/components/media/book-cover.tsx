"use client";

import { CldImage } from "next-cloudinary";

type Props = {
  publicId?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
};

/** Cloudinary-optimized cover. Falls back to a calm placeholder when unset. */
export function BookCover({
  publicId,
  alt,
  width,
  height,
  className,
  sizes,
}: Props) {
  if (!publicId || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    return (
      <div
        className={`flex items-center justify-center bg-[linear-gradient(145deg,#0b3d91_0%,#0f6b4c_55%,#c9a227_100%)] text-white/90 ${className ?? ""}`}
        style={{ aspectRatio: `${width}/${height}` }}
        aria-label={alt}
      >
        <span className="px-3 text-center text-xs font-medium tracking-wide">
          DSB
        </span>
      </div>
    );
  }

  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      crop="fill"
      gravity="auto"
      format="auto"
      quality="auto"
      sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
      className={className}
    />
  );
}
