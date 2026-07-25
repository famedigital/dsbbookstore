import { buildCoverUrl } from "@/lib/cloudinary-url";

type MediaLike = {
  storage_provider: string;
  supabase_url?: string | null;
  cloudinary_public_id?: string | null;
} | null | undefined;

export function resolveMediaUrl(
  asset: MediaLike,
  width = 800
): string | null {
  if (!asset) return null;
  if (asset.cloudinary_public_id) {
    return buildCoverUrl(asset.cloudinary_public_id, width);
  }
  if (asset.supabase_url) return asset.supabase_url;
  return null;
}
