"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, requireManager } from "@/lib/erp/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

const MEDIA_BUCKET = "media";
const BUCKET_MISSING_MSG =
  'Create a public Storage bucket named "media" in Supabase Storage, then retry.';

function isBucketMissing(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("bucket not found") ||
    (m.includes("not found") && m.includes("bucket")) ||
    (m.includes("bucket") && m.includes("does not exist"))
  );
}

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string,
  meta?: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    meta: meta ?? null,
  });
}

function publicObjectUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export async function uploadMediaToSupabase(formData: FormData) {
  const { userId } = await requireStaff();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }

  const title = String(formData.get("title") || "").trim() || file.name;
  const kind = String(formData.get("kind") || "cover").trim() || "cover";
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `covers/${crypto.randomUUID()}.${ext}`;

  const admin = await createAdminClient({ required: true });
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(MEDIA_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    if (isBucketMissing(uploadError.message)) {
      throw new Error(BUCKET_MISSING_MSG);
    }
    throw new Error(uploadError.message);
  }

  const { data: publicData } = admin.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);
  const supabaseUrl = publicData.publicUrl || publicObjectUrl(path);

  const { data, error } = await admin
    .from("media_assets")
    .insert({
      kind,
      title,
      storage_provider: "supabase",
      supabase_path: path,
      supabase_url: supabaseUrl,
      mime_type: file.type || null,
      bytes: file.size,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await audit(userId, "media.upload", "media_asset", data.id, {
    path,
    title,
  });

  revalidatePath("/erp/media");
}

export async function generateAiCover(formData: FormData) {
  const { userId } = await requireStaff();
  const apiKey = process.env.AI_IMAGE_API_KEY;
  if (!apiKey) {
    throw new Error("AI_IMAGE_API_KEY not configured");
  }

  const prompt = String(formData.get("prompt") || "").trim();
  const title = String(formData.get("title") || "").trim() || null;
  if (!prompt) throw new Error("Prompt is required");

  const fullPrompt = title
    ? `Book cover for "${title}": ${prompt}`
    : prompt;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `AI image generation failed (${res.status})${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }

  const json = (await res.json()) as {
    data?: { b64_json?: string; url?: string }[];
  };
  const b64 = json.data?.[0]?.b64_json;
  let bytes: Buffer;

  if (b64) {
    bytes = Buffer.from(b64, "base64");
  } else if (json.data?.[0]?.url) {
    const imgRes = await fetch(json.data[0].url);
    if (!imgRes.ok) throw new Error("Failed to download generated image");
    bytes = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error("AI image API returned no image data");
  }

  const path = `covers/${crypto.randomUUID()}.png`;
  const admin = await createAdminClient({ required: true });

  const { error: uploadError } = await admin.storage
    .from(MEDIA_BUCKET)
    .upload(path, bytes, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    if (isBucketMissing(uploadError.message)) {
      throw new Error(BUCKET_MISSING_MSG);
    }
    throw new Error(uploadError.message);
  }

  const { data: publicData } = admin.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);
  const supabaseUrl = publicData.publicUrl || publicObjectUrl(path);

  const { data, error } = await admin
    .from("media_assets")
    .insert({
      kind: "cover",
      title,
      prompt,
      storage_provider: "supabase",
      supabase_path: path,
      supabase_url: supabaseUrl,
      mime_type: "image/png",
      bytes: bytes.length,
      width: 1024,
      height: 1024,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await audit(userId, "media.ai_generate", "media_asset", data.id, {
    prompt,
    title,
  });

  revalidatePath("/erp/media");
}

export async function migrateMediaToCloudinary(formData: FormData) {
  const { userId } = await requireManager();
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const mediaId = String(formData.get("media_id") || "").trim();
  if (!mediaId) throw new Error("media_id is required");

  const admin = await createAdminClient({ required: true });
  const { data: asset, error } = await admin
    .from("media_assets")
    .select("*")
    .eq("id", mediaId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!asset) throw new Error("Media asset not found");
  if (asset.storage_provider === "cloudinary" && asset.cloudinary_public_id) {
    throw new Error("Already on Cloudinary");
  }
  if (!asset.supabase_url && !asset.supabase_path) {
    throw new Error("No Supabase source to migrate");
  }

  let sourceUrl = asset.supabase_url as string | null;
  if (!sourceUrl && asset.supabase_path) {
    const { data: signed } = await admin.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(asset.supabase_path, 60);
    sourceUrl = signed?.signedUrl ?? publicObjectUrl(asset.supabase_path);
  }
  if (!sourceUrl) throw new Error("Could not resolve Supabase media URL");

  const imgRes = await fetch(sourceUrl);
  if (!imgRes.ok) {
    throw new Error("Failed to download image from Supabase");
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const cloudinary = getCloudinary();
  const uploaded = await new Promise<{ public_id: string; bytes?: number; width?: number; height?: number }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "dsb/covers",
            resource_type: "image",
          },
          (err, result) => {
            if (err || !result) {
              reject(err ?? new Error("Cloudinary upload failed"));
              return;
            }
            resolve(result as { public_id: string; bytes?: number; width?: number; height?: number });
          }
        )
        .end(buffer);
    }
  );

  const now = new Date().toISOString();
  const { error: updateError } = await admin
    .from("media_assets")
    .update({
      storage_provider: "cloudinary",
      cloudinary_public_id: uploaded.public_id,
      migrated_at: now,
      deleted_from_supabase_at: asset.supabase_path ? now : null,
      width: uploaded.width ?? asset.width,
      height: uploaded.height ?? asset.height,
      bytes: uploaded.bytes ?? asset.bytes,
      updated_at: now,
    })
    .eq("id", mediaId);

  if (updateError) throw new Error(updateError.message);

  if (asset.supabase_path) {
    const { error: removeError } = await admin.storage
      .from(MEDIA_BUCKET)
      .remove([asset.supabase_path]);
    if (removeError && !isBucketMissing(removeError.message)) {
      // Row already migrated; log but don't fail hard
      console.warn("Failed to delete Supabase object:", removeError.message);
    }
  }

  await admin
    .from("books")
    .update({ cover_public_id: uploaded.public_id })
    .eq("cover_media_id", mediaId);

  await audit(userId, "media.migrate", "media_asset", mediaId, {
    cloudinary_public_id: uploaded.public_id,
  });

  revalidatePath("/erp/media");
  revalidatePath("/erp/catalogue");
  revalidatePath("/books");
}

export async function attachMediaToBook(formData: FormData) {
  const { userId } = await requireStaff();
  const bookId = String(formData.get("book_id") || "").trim();
  const mediaId = String(formData.get("media_id") || "").trim();
  if (!bookId || !mediaId) {
    throw new Error("book_id and media_id are required");
  }

  const supabase = await createClient();
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .select("id, cloudinary_public_id")
    .eq("id", mediaId)
    .maybeSingle();

  if (assetError) throw new Error(assetError.message);
  if (!asset) throw new Error("Media asset not found");

  const payload: {
    cover_media_id: string;
    updated_at: string;
    cover_public_id?: string;
  } = {
    cover_media_id: mediaId,
    updated_at: new Date().toISOString(),
  };
  if (asset.cloudinary_public_id) {
    payload.cover_public_id = asset.cloudinary_public_id;
  }

  const { error } = await supabase
    .from("books")
    .update(payload)
    .eq("id", bookId);

  if (error) throw new Error(error.message);

  await audit(userId, "media.attach", "book", bookId, { media_id: mediaId });

  revalidatePath("/erp/media");
  revalidatePath("/erp/catalogue");
  revalidatePath(`/erp/catalogue/${bookId}`);
  revalidatePath("/books");
}

export async function deleteMediaAsset(formData: FormData) {
  const { userId } = await requireStaff();
  const mediaId = String(formData.get("media_id") || "").trim();
  if (!mediaId) throw new Error("media_id is required");

  const admin = await createAdminClient({ required: true });
  const { data: asset, error } = await admin
    .from("media_assets")
    .select("*")
    .eq("id", mediaId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!asset) throw new Error("Media asset not found");

  if (asset.supabase_path && !asset.deleted_from_supabase_at) {
    const { error: removeError } = await admin.storage
      .from(MEDIA_BUCKET)
      .remove([asset.supabase_path]);
    if (removeError && isBucketMissing(removeError.message)) {
      throw new Error(BUCKET_MISSING_MSG);
    }
  }

  if (asset.cloudinary_public_id && isCloudinaryConfigured()) {
    try {
      const cloudinary = getCloudinary();
      await cloudinary.uploader.destroy(asset.cloudinary_public_id);
    } catch {
      // Best-effort Cloudinary cleanup
    }
  }

  const { error: deleteError } = await admin
    .from("media_assets")
    .delete()
    .eq("id", mediaId);

  if (deleteError) throw new Error(deleteError.message);

  await audit(userId, "media.delete", "media_asset", mediaId);

  revalidatePath("/erp/media");
  revalidatePath("/erp/catalogue");
  revalidatePath("/books");
}
