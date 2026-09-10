import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/erp/auth";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { STAFF_ROLES } from "@/types/erp";

const ALLOWED_PREFIXES = ["dsb/covers", "dsb/brand", "dsb/heroes", "dsb/cms"] as const;

type CldResource = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  created_at?: string;
};

/** List Cloudinary images for staff cover picker (free-tier Admin API). */
export async function GET(request: Request) {
  const session = await getSessionProfile();
  if (!session || !STAFF_ROLES.includes(session.profile.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const folderRaw = searchParams.get("folder") || "dsb/covers";
  const folder = ALLOWED_PREFIXES.includes(
    folderRaw as (typeof ALLOWED_PREFIXES)[number]
  )
    ? folderRaw
    : "dsb/covers";
  const cursor = searchParams.get("cursor") || undefined;
  const q = searchParams.get("q")?.trim().toLowerCase() || "";

  const cld = getCloudinary();

  try {
    const result = await cld.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: folder,
      max_results: 50,
      next_cursor: cursor,
    });

    let resources = ((result.resources || []) as CldResource[]).map((r) => ({
      publicId: r.public_id,
      url: r.secure_url,
      width: r.width,
      height: r.height,
      createdAt: r.created_at,
    }));

    if (q) {
      resources = resources.filter((r) =>
        r.publicId.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      resources,
      nextCursor: result.next_cursor || null,
      folder,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Failed to list Cloudinary media",
      },
      { status: 500 }
    );
  }
}
