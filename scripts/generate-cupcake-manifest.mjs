#!/usr/bin/env node
// Scans public/images/cupcakes_animate/ (top level only — a `_source/` subfolder holds raw,
// un-cutout reference photos that must never be auto-picked up) and writes a typed manifest of
// every eligible sprite. "Eligible" means a real alpha channel with a meaningful transparent
// fraction, not just a `.png` extension — several files that have landed in this folder over time
// turned out to be flat reference photos (solid or checkerboard background baked into opaque
// RGB pixels, no alpha at all) that would render as a grey box in the hero if picked up blindly.
//
// Run automatically via `predev`/`prebuild` (see package.json) so dropping a new, properly-cut
// sprite into the folder is enough to add it to the falling-cupcake field — no code change needed,
// per the brief's "automatically detect all available cupcake images" requirement.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SPRITE_DIR = path.resolve(import.meta.dirname, "../public/images/cupcakes_animate");
const PUBLIC_PREFIX = "/images/cupcakes_animate";
const OUT_FILE = path.resolve(import.meta.dirname, "../lib/cupcake/generated-sprite-manifest.ts");

// A sprite needs a real, substantial transparent area — this is what actually distinguishes a
// cutout from a flat reference photo (see the file-level comment above).
const MIN_TRANSPARENT_FRACTION = 0.15;

async function main() {
  const entries = await readdir(SPRITE_DIR, { withFileTypes: true });
  const pngFiles = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".png")).map((e) => e.name);

  const sprites = [];
  for (const file of pngFiles) {
    const fullPath = path.join(SPRITE_DIR, file);
    const img = sharp(fullPath);
    const meta = await img.metadata();
    if (!meta.hasAlpha) {
      console.warn(`[cupcake-manifest] skipping ${file} — no alpha channel (flat reference photo, not a cutout)`);
      continue;
    }
    const { channels } = await img.stats();
    const alphaChannel = channels[channels.length - 1];
    // stats() reports 0-255 min/max/mean per channel for an 8-bit image; a genuinely transparent
    // sprite has a low-ish mean alpha (most of the canvas is empty padding around the cupcake).
    const transparentFraction = 1 - alphaChannel.mean / 255;
    if (transparentFraction < MIN_TRANSPARENT_FRACTION) {
      console.warn(
        `[cupcake-manifest] skipping ${file} — only ${(transparentFraction * 100).toFixed(0)}% transparent, likely a near-opaque background rather than a real cutout`
      );
      continue;
    }
    sprites.push({
      src: `${PUBLIC_PREFIX}/${file}`,
      width: meta.width,
      height: meta.height,
    });
  }

  sprites.sort((a, b) => a.src.localeCompare(b.src));

  const banner = "// GENERATED FILE — do not edit by hand.\n// Produced by scripts/generate-cupcake-manifest.mjs from public/images/cupcakes_animate/.\n// Re-run `npm run dev` or `npm run build` (both trigger this via pre-scripts) after adding sprites.\n";
  const body = `export type GeneratedSprite = { src: string; width: number; height: number };\n\nexport const GENERATED_SPRITES: GeneratedSprite[] = ${JSON.stringify(sprites, null, 2)};\n`;
  await writeFile(OUT_FILE, banner + "\n" + body);
  console.log(`[cupcake-manifest] wrote ${sprites.length} sprite(s) to ${path.relative(process.cwd(), OUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
