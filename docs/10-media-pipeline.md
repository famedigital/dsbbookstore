# Media Pipeline — AI → Supabase → Cloudinary

## Principle
**Supabase Storage is the system of record for new images.**  
Cloudinary is an optional CDN/optimizer for production delivery bandwidth.

```text
AI generate / staff upload
        ↓
Supabase Storage bucket: media/
        ↓
media_assets row (status = supabase)
        ↓
Book cover / hero references media_assets.id
        ↓
[ERP action] Migrate to Cloudinary
        ↓
Upload to Cloudinary → save public_id
Delete Supabase object → status = cloudinary
```

## Data model

```text
media_assets
  id uuid PK
  kind text              -- cover | hero | author | other
  title text
  prompt text            -- AI prompt if generated
  storage_provider text  -- supabase | cloudinary
  supabase_path text     -- e.g. media/covers/uuid.webp
  supabase_url text      -- public URL
  cloudinary_public_id text
  width int
  height int
  bytes int
  mime_type text
  created_by uuid
  migrated_at timestamptz
  deleted_from_supabase_at timestamptz
  created_at / updated_at

books.cover_media_id uuid → media_assets.id
books.cover_public_id text  -- legacy Cloudinary id (kept for compat)
```

## Delivery rules (runtime)
1. If `cloudinary_public_id` set → deliver via Cloudinary (`f_auto,q_auto`)  
2. Else if `supabase_url` set → deliver via Supabase public URL (+ Next image optimizer if possible)  
3. Else placeholder gradient  

## ERP Media Library (`/erp/media`)
- Grid of all assets  
- Filter: supabase-only / cloudinary / all  
- Actions per asset:
  - **Generate AI cover** (prompt form)  
  - **Upload file** → Supabase  
  - **Attach to book**  
  - **Migrate to Cloudinary** (copy + verify + delete Supabase)  
  - **Delete**  

## AI generation (server)
- Route: `POST /api/media/generate`  
- Auth: staff+  
- Uses `AI_IMAGE_API_KEY`  
- Saves WebP/PNG into `media/covers/{uuid}.webp`  
- Inserts `media_assets`  

If AI key missing: UI shows “Upload only” mode (no mock images).

## Migrate action
1. Download from Supabase (service role)  
2. Upload to Cloudinary folder `dsb/covers`  
3. Update `media_assets` + linked books  
4. Remove Supabase object  
5. Audit log `media.migrate`  

## Security
- Bucket policies: public read for `media/public/**` or signed URLs  
- Writes: staff only via server actions / service role  
- Never expose service role or AI key to browser  

## Rollout
1. Migration SQL for `media_assets` + bucket  
2. Library UI  
3. Wire book forms to pick from library  
4. Generate + migrate flows  
5. Backfill existing `cover_public_id` rows as `storage_provider=cloudinary`  
