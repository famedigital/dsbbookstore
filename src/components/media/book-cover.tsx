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
  priority?: boolean;
};

function Placeholder({
  alt,
  width,
  height,
  className,
}: Pick<Props, "alt" | "width" | "height" | "className">) {
  return (
    <div
      className={`flex items-center justify-center bg-[linear-gradient(145deg,#1a1510_0%,#5c241c_55%,#9c7a3e_100%)] text-[#f7f2e8]/90 ${className ?? ""}`}
      style={{ aspectRatio: `${width}/${height}` }}
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

/** Cloudinary-optimized cover. Falls back to local/remote src, then placeholder. */
export function BookCover({
  publicId,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
}: Props) {
  const frame = `sf-cover object-cover ${className ?? ""}`;

  if (!publicId) {
    return (
      <Placeholder alt={alt} width={width} height={height} className={frame} />
    );
  }

  if (isLocalOrRemoteSrc(publicId)) {
    if (publicId.endsWith(".svg")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={publicId}
          alt={alt}
          width={width}
          height={height}
          className={frame}
          loading={priority ? "eager" : "lazy"}
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
        className={frame}
        priority={priority}
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
        className={frame}
        priority={priority}
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
        className={frame}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Placeholder alt={alt} width={width} height={height} className={frame} />
  );
}
