import { v2 as cloudinary } from "cloudinary";

export { buildCoverUrl } from "@/lib/cloudinary-url";

function cloudName() {
  return (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  );
}

export function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    cloudName()
  );
}

export function getCloudinary() {
  cloudinary.config({
    cloud_name: cloudName(),
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}
