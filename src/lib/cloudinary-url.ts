/** Client-safe Cloudinary URL builder (no Node SDK). */
export function buildCoverUrl(
  publicId: string | null | undefined,
  width: number
): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}
