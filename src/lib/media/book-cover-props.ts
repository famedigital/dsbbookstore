import type { MediaAsset } from "@/types/media";

type BookLike = {
  cover_public_id?: string | null;
  cover?: MediaAsset | MediaAsset[] | null;
};

/** Normalize joined cover media + legacy cover_public_id for BookCover. */
export function bookCoverProps(book: BookLike) {
  const cover = Array.isArray(book.cover) ? book.cover[0] : book.cover;

  return {
    publicId: book.cover_public_id ?? null,
    cloudinaryId:
      cover?.cloudinary_public_id ?? book.cover_public_id ?? null,
    supabaseUrl: cover?.supabase_url ?? null,
  };
}
