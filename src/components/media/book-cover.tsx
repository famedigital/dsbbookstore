"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { buildCoverUrl } from "@/lib/cloudinary-url";

type Props = {
  publicId?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
};

function Placeholder({
  alt,
  width,
  height,
  className,
}: Pick<Props, "alt" | "width" | "height" | "className">) {
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

function isLocalOrRemoteSrc(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

/** Cloudinary-optimized cover. Falls back to local/remote src, then placeholder. */
export function BookCover({
  publicId,
  alt,
  width,
  height,
  className,
  sizes,
}: Props) {
  if (!publicId) {
    return (
      <Placeholder alt={alt} width={width} height={height} className={className} />
    );
  }

  if (isLocalOrRemoteSrc(publicId)) {
    // Local sample SVGs and remote URLs — skip Cloudinary pipeline.
    if (publicId.endsWith(".svg") || publicId.startsWith("http")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={publicId}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading="lazy"
        />
      );
    }

    return (
      <Image
        src={publicId}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        className={className}
      />
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (cloudName) {
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

  const fallbackUrl = buildCoverUrl(publicId, width);
  if (fallbackUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallbackUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <Placeholder alt={alt} width={width} height={height} className={className} />
  );
}
