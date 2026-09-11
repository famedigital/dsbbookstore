/** Cover URL helpers — free-tier friendly (Open Library first, Cloudinary for owned media). */

export function buildCoverUrl(
  publicId: string | null | undefined,
  width: number
): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;
  if (
    publicId.startsWith("/") ||
    publicId.startsWith("http://") ||
    publicId.startsWith("https://")
  ) {
    return publicId;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

/** Normalize barcode / ISBN to digits used by Open Library. */
export function normalizeIsbn(value?: string | null): string | null {
  if (!value) return null;
  const clean = String(value).replace(/[^0-9Xx]/g, "");
  if (/^97[89]\d{10}$/.test(clean)) return clean;
  if (/^\d{9}[\dXx]$/.test(clean)) return clean.toUpperCase();
  return null;
}

/**
 * Free CDN cover by ISBN — no Cloudinary/Supabase storage.
 * Size: S (~small), M (lists ~180px), L (detail ~ up to ~500px+).
 * Prefer L for retina catalogue / PDP — M looks muddy when scaled.
 * `default=false` makes missing covers 404 (instead of a blank 1×1 placeholder).
 */
export function openLibraryCoverUrl(
  isbnOrBarcode?: string | null,
  size: "S" | "M" | "L" = "L"
): string | null {
  const isbn = normalizeIsbn(isbnOrBarcode);
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;
}

/** Bump Open Library cover URLs to a sharper size when we already stored -S/-M. */
export function sharpenOpenLibraryUrl(
  url: string,
  size: "M" | "L" = "L"
): string {
  if (!url.includes("covers.openlibrary.org")) return url;
  return url
    .replace(/-S\.jpg/i, `-${size}.jpg`)
    .replace(/-M\.jpg/i, `-${size}.jpg`);
}

function olSizeForWidth(width?: number): "M" | "L" {
  // Retina catalogue thumbs still need L; only tiny chrome uses M
  return (width ?? 400) >= 120 ? "L" : "M";
}

/** Prefer stored cover, else Open Library from ISBN/barcode. */
export function resolveCoverSrc(opts: {
  publicId?: string | null;
  isbn?: string | null;
  barcode?: string | null;
  width?: number;
}): string | null {
  const size = olSizeForWidth(opts.width);
  const stored = opts.publicId?.trim();
  if (stored) {
    if (
      stored.startsWith("/") ||
      stored.startsWith("http://") ||
      stored.startsWith("https://")
    ) {
      return sharpenOpenLibraryUrl(stored, size);
    }
    return buildCoverUrl(stored, opts.width ?? 400);
  }
  return (
    openLibraryCoverUrl(opts.isbn, size) ||
    openLibraryCoverUrl(opts.barcode, size)
  );
}
