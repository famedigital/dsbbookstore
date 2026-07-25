export type MediaStorageProvider = "supabase" | "cloudinary";

export type MediaKind = "cover" | "hero" | "author" | "other" | string;

/** Row shape for public.media_assets */
export type MediaAsset = {
  id: string;
  kind: MediaKind;
  title: string | null;
  prompt: string | null;
  storage_provider: MediaStorageProvider;
  supabase_path: string | null;
  supabase_url: string | null;
  cloudinary_public_id: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  mime_type: string | null;
  created_by: string | null;
  migrated_at: string | null;
  deleted_from_supabase_at: string | null;
  created_at: string;
  updated_at: string;
};
