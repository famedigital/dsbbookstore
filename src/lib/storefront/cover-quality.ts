/** True when a book has a stored cover we can show (not SVG placeholder). */
export function hasStoredCover(
  coverPublicId?: string | null
): coverPublicId is string {
  const v = coverPublicId?.trim();
  if (!v) return false;
  if (v.toLowerCase().endsWith(".svg")) return false;
  return true;
}

/** Prefer titles with real covers for homepage merchandising. */
export function withCoversFirst<T extends { cover_public_id?: string | null }>(
  books: T[],
  limit: number
): T[] {
  const withCover = books.filter((b) => hasStoredCover(b.cover_public_id));
  if (withCover.length >= limit) return withCover.slice(0, limit);
  const rest = books.filter((b) => !hasStoredCover(b.cover_public_id));
  return [...withCover, ...rest].slice(0, limit);
}
