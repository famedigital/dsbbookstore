import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/erp/auth";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { STAFF_ROLES } from "@/types/erp";

/** Import a remote image URL into Cloudinary (staff only). */
export async function POST(request: Request) {
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

  let body: { url?: string; folder?: string };
  try {
    body = (await request.json()) as { url?: string; folder?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = String(body.url || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "A public http(s) image URL is required" },
      { status: 400 }
    );
  }

  const folder =
    body.folder === "dsb/cms" || body.folder === "dsb/covers"
      ? body.folder
      : "dsb/covers";

  try {
    const cld = getCloudinary();
    const result = await cld.uploader.upload(url, {
      folder,
      resource_type: "image",
    });
    return NextResponse.json({
      publicId: result.public_id as string,
      url: result.secure_url as string,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Could not import URL to Cloudinary",
      },
      { status: 500 }
    );
  }
}
