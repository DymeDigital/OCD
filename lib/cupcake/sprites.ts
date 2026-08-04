/**
 * Wraps the auto-generated sprite list (see scripts/generate-cupcake-manifest.mjs) with the small
 * amount of hand-authored metadata that can't be inferred from the file itself. A brand-new sprite
 * dropped into public/images/cupcakes_animate/ is eligible everywhere with a "clear" logo by
 * default — the override map below exists only for the one sprite we know is a real exception:
 * `cupcake_alt_cutout.png`'s logo topper renders as illegible/warped text (the "logo melts under
 * generation" failure the hero brief warns about), so it's kept out of the foreground layer, where
 * a sharp, large cupcake with garbled branding would be the first thing a visitor notices.
 */
import { GENERATED_SPRITES } from "./generated-sprite-manifest";
import type { CupcakeLayer } from "@/types/cupcake";

export type SpriteId = string;

export type LogoQuality = "clear" | "none" | "garbled";

export type Sprite = {
  id: SpriteId;
  src: string;
  width: number;
  height: number;
  logoQuality: LogoQuality;
  layers: CupcakeLayer[];
};

const ALL_LAYERS: CupcakeLayer[] = [0, 1, 2];

// `id` gives poses.ts's `preferredSprite` a stable, semantic name to reference instead of coupling
// it to an exact filename — a sprite not listed here just falls back to its filename-derived id
// (no pose will specifically prefer it, which is a fine default for anything dropped in later).
const OVERRIDES: Record<string, Partial<Pick<Sprite, "id" | "logoQuality" | "layers">>> = {
  "cupcake_no_bg.png": { id: "classic" },
  "cupcake_tilted_cutout.png": { id: "tilted", logoQuality: "none" },
  "cupcake_alt_cutout.png": { id: "alt", logoQuality: "garbled", layers: [0, 1] },
};

function idFromSrc(src: string): SpriteId {
  return src.split("/").pop()!.replace(/\.png$/, "");
}

export const SPRITES: Sprite[] = GENERATED_SPRITES.map((g) => {
  const filename = g.src.split("/").pop()!;
  const override = OVERRIDES[filename];
  return {
    id: override?.id ?? idFromSrc(g.src),
    src: g.src,
    width: g.width,
    height: g.height,
    logoQuality: override?.logoQuality ?? "clear",
    layers: override?.layers ?? ALL_LAYERS,
  };
});

export function spritesForLayer(layer: CupcakeLayer): Sprite[] {
  const eligible = SPRITES.filter((s) => s.layers.includes(layer));
  // Should never happen with the current asset set, but a manifest edited down to zero eligible
  // sprites for a layer would otherwise silently render nothing for it.
  return eligible.length > 0 ? eligible : SPRITES;
}

export function spriteById(id: SpriteId): Sprite | undefined {
  return SPRITES.find((s) => s.id === id);
}
