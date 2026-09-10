/**
 * Build clean brand seal PNGs from the authentic DSB Enterprises crest.
 * Keeps original artwork — transparent bg, navy (not red).
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const SRC = resolve("public/brand/dsb-enterprises-original.jpg");
const OUT_NAVY = resolve("public/brand/dsb-seal-navy.png");
const OUT_WHITE = resolve("public/brand/dsb-seal-white.png");
const SIZE = 512;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .resize(SIZE, SIZE, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = Buffer.from(data);
const w = info.width;
const h = info.height;

function lum(i) {
  return 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
}

for (let i = 0; i < pixels.length; i += 4) {
  const L = lum(i);
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  if (L > 230 || (r > 220 && g > 220 && b > 220)) {
    pixels[i + 3] = 0;
    continue;
  }
  if (L > 200) {
    pixels[i + 3] = Math.round(((230 - L) / 30) * 255);
  }
  if (pixels[i + 3] > 12) {
    const ink = Math.max(0, Math.min(1, 1 - L / 200));
    pixels[i] = Math.round(11 * ink);
    pixels[i + 1] = Math.round(31 * ink);
    pixels[i + 2] = Math.round(58 * ink);
  }
}

await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(OUT_NAVY);

const white = Buffer.from(pixels);
for (let i = 0; i < white.length; i += 4) {
  if (white[i + 3] === 0) continue;
  white[i] = 247;
  white[i + 1] = 242;
  white[i + 2] = 232;
}
await sharp(white, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(OUT_WHITE);

console.log("ok", OUT_NAVY, OUT_WHITE);
