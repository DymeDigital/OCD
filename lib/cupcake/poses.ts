/**
 * Orientation presets — a photographed cupcake caught at one of a handful of recognizable angles,
 * not three independently randomized Euler angles (which reads as "mathematically rotated," not
 * art-directed). Every sprite in the manifest is a flat photo composited via a CSS 3D transform,
 * not a real 3D model: past roughly ±20-22° on rotateX/rotateY, a flat plane under perspective
 * visibly foreshortens into a warped sliver rather than a believable tilt (confirmed empirically —
 * see the git history on the old `dramatic` rotation range this file replaces). rotateZ never has
 * that problem (it's a pure in-plane spin), so poses that need to read as more extreme lean on Z
 * and on `preferredSprite` instead of pushing X/Y past what a flat plane can sell.
 *
 * `Bottom Visible` and `Upside Down` are the two names in the brief with no real photographed
 * reference in this sprite set (nobody shot the cupcake from underneath or inverted). Rather than
 * fake a 3D flip on a flat plane — which would warp into nonsense — `Bottom Visible` prefers the
 * `tilted` sprite (genuinely photographed from a lower, more side-on angle) and `Upside Down` is
 * an honest in-plane 180° spin (a photo rotated on a table, not a true flip). Flagging the
 * adaptation here rather than silently forcing a warp.
 */
import type { SpriteId } from "./sprites";

export type LogoBucket = "visible" | "partial";

export type Pose = {
  name: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  /** Only meaningful for sprites with a legible logo (see sprites.ts) — see poses.ts's file comment. */
  logoBucket: LogoBucket;
  /** A sprite this pose reads best on, if the layer's eligible sprite pool contains it — soft preference, not a hard requirement. */
  preferredSprite?: SpriteId;
};

export const POSES: Pose[] = [
  { name: "front", rotationX: 0, rotationY: 0, rotationZ: 0, logoBucket: "visible" },
  { name: "frontLeft", rotationX: 2, rotationY: -8, rotationZ: -3, logoBucket: "visible" },
  { name: "frontRight", rotationX: 2, rotationY: 8, rotationZ: 3, logoBucket: "visible" },
  { name: "threeQuarterLeft", rotationX: 6, rotationY: -18, rotationZ: -9, logoBucket: "partial" },
  { name: "threeQuarterRight", rotationX: 6, rotationY: 18, rotationZ: 9, logoBucket: "partial" },
  { name: "leftProfile", rotationX: 8, rotationY: -22, rotationZ: -14, logoBucket: "partial", preferredSprite: "tilted" },
  { name: "rightProfile", rotationX: 8, rotationY: 22, rotationZ: 14, logoBucket: "partial", preferredSprite: "tilted" },
  { name: "bottomVisible", rotationX: -16, rotationY: 0, rotationZ: 6, logoBucket: "partial", preferredSprite: "tilted" },
  { name: "frostingFacingCamera", rotationX: -6, rotationY: 0, rotationZ: 0, logoBucket: "visible" },
  { name: "upsideDown", rotationX: 0, rotationY: 0, rotationZ: 172, logoBucket: "partial", preferredSprite: "alt" },
];

export const VISIBLE_POSES = POSES.filter((p) => p.logoBucket === "visible");
export const PARTIAL_POSES = POSES.filter((p) => p.logoBucket === "partial");

const JITTER_DEG = 4;

/** Applies the brief's "±3-5° so each cupcake still feels unique" on top of a fixed preset. */
export function jitterPose(pose: Pose, rand: (min: number, max: number) => number) {
  return {
    rotationX: pose.rotationX + rand(-JITTER_DEG, JITTER_DEG),
    rotationY: pose.rotationY + rand(-JITTER_DEG, JITTER_DEG),
    rotationZ: pose.rotationZ + rand(-JITTER_DEG, JITTER_DEG),
  };
}
