import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/erp/auth";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { STAFF_ROLES } from "@/types/erp";

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

  let folder = "dsb/covers";
  try {
    const body = (await request.json()) as { folder?: string };
    if (body.folder === "dsb/cms" || body.folder === "dsb/covers") {
      folder = body.folder;
    }
  } catch {
    // empty body is fine
  }

  const cld = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cld.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: cloudName(),
    timestamp,
    folder,
    signature,
  });
}

function cloudName() {
  return (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  );
}
