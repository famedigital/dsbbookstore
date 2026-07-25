"use client";

import { CldImage } from "next-cloudinary";
import { resolveMediaUrl } from "@/lib/media/url";
import type { MediaAsset } from "@/types/media";

type Props = {
  /** Legacy Cloudinary public id */
  publicId?: string | null;
  cloudinaryId?: string | null;
  supabaseUrl?: string | null;
  asset?: Pick<
    MediaAsset,
    "storage_provider" | "supabase_url" | "cloudinary_public_id"
  > | null;
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

/** Cover from media asset, Cloudinary id, or Supabase URL. */
export function BookCover({
  publicId,
  cloudinaryId,
  supabaseUrl,
  asset,
  alt,
  width,
  height,
  className,
  sizes,
}: Props) {
  const resolvedCloudinary =
    asset?.cloudinary_public_id || cloudinaryId || publicId || null;
  const resolvedSupabase = asset?.supabase_url || supabaseUrl || null;

  if (resolvedCloudinary && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    return (
      <CldImage
        src={resolvedCloudinary}
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

  const url =
    resolveMediaUrl(
      asset ??
        (resolvedCloudinary || resolvedSupabase
          ? {
              storage_provider: resolvedCloudinary ? "cloudinary" : "supabase",
              cloudinary_public_id: resolvedCloudinary,
              supabase_url: resolvedSupabase,
            }
          : null),
      width
    ) || resolvedSupabase;

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
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
