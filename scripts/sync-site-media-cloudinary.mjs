/**
 * Upload only owned site media to Cloudinary (free-tier safe).
 * Folders:
 *   dsb/brand  — seals / logos
 *   dsb/heroes — storefront hero photos
 *   dsb/cms    — reserved for CMS uploads
 *
 * Does NOT upload catalogue covers (use Open Library links instead).
 * Also deletes obvious sample/demo assets outside dsb/.
 *
 * Usage: node scripts/sync-site-media-cloudinary.mjs [--delete-samples]
 */
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join, extname, basename } from "node:path";

const require = createRequire(import.meta.url);
const cloudinary = require("cloudinary").v2;

function loadEnv() {
  const raw = readFileSync(resolve(".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

loadEnv();

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const deleteSamples = process.argv.includes("--delete-samples");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

async function uploadFolder(localDir, cloudFolder) {
  const abs = resolve(localDir);
  let files = [];
  try {
    files = readdirSync(abs).filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()));
  } catch {
    console.warn("skip missing", localDir);
    return [];
  }

  const uploaded = [];
  for (const file of files) {
    // Prefer seal / real photos; skip intermediate redraws if any
    const id = basename(file, extname(file));
    const publicId = `${cloudFolder}/${id}`;
    const result = await cloudinary.uploader.upload(join(abs, file), {
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      // public_id already includes folder path — do not also pass `folder`
      use_filename: true,
      unique_filename: false,
    });
    uploaded.push(result.public_id);
    console.log("UP", result.public_id, result.bytes);
  }
  return uploaded;
}

const brand = await uploadFolder("public/brand", "dsb/brand");
const heroes = await uploadFolder("public/images", "dsb/heroes");

let deleted = [];
if (deleteSamples) {
  // List root-level / sample folders and remove non-dsb demo assets
  const { resources } = await cloudinary.api.resources({
    type: "upload",
    max_results: 100,
    prefix: "",
  });
  const victims = (resources || []).filter((r) => {
    const id = r.public_id.toLowerCase();
    if (id.startsWith("dsb/")) return false;
    return (
      id.includes("sample") ||
      id.includes("demo") ||
      id.startsWith("samples/") ||
      id === "sample" ||
      id.startsWith("cld-sample")
    );
  });
  for (const r of victims) {
    await cloudinary.uploader.destroy(r.public_id);
    deleted.push(r.public_id);
    console.log("DEL", r.public_id);
  }
}

console.log(
  JSON.stringify(
    { brand: brand.length, heroes: heroes.length, deleted },
    null,
    2
  )
);
