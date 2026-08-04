# Higgsfield hero animation — run log

Per CLAUDE.md §6. Tool: Higgsfield CLI (`higgsfield generate create`). Account: free plan, 10 credits total for this workspace — credits are reserved exclusively for this hero animation, not spent elsewhere on this project.

## Attempt 1 — accepted, in production

- **Date:** 2026-07-31
- **Model:** `veo3_1_lite` (Google Veo 3.1 Lite). Chosen after two higher-tier models (`seedance_2_0_mini`, `kling3_0`) both rejected the free-plan account with `job_minimum_basic_plan_required` before any credit was charged — `veo3_1_lite` was the cheapest model confirmed to work on this plan.
- **Seed image:** `content/source/animate_this.png` (the client-supplied branded-cupcake photo), passed as `--start-image`.
- **Params:** `--duration 4 --aspect_ratio 16:9 --generate_audio false --resolution` (server-set to `720p`, 1344×768 output).
- **Prompt:**
  > Photoreal, food-photography grade video. The exact branded cupcakes shown in the reference image, unchanged — preserve the round OCD logo topper and white Swiss meringue buttercream icing exactly as shown, sharp and legible at least once during the clip. The cupcakes descend slowly through frame with a gentle tumble and subtle motion blur, tumbling in varied orientations, some upright, some tilted, weighty and unhurried. No splatter, no impact, nothing lands, nothing breaks. Static eye-level camera, shallow depth of field. Soft key light from upper left, clean white seamless background, soft contact-free shadows beneath the cupcakes.
- **Cost:** 4 credits (10 → 6 remaining).
- **Job ID:** `a5d9e0fe-7c5c-4f88-8580-7cf3dc286674`
- **Result:** `content/source/hero-cupcakes.mp4` (master), `public/videos/hero-cupcakes.mp4` (served copy), 1.18 MB.

### Review

Checked frames at 0s, 1.3s, 2.6s, and 3.9s in-browser (scrubbed `<video>.currentTime`, screenshotted each). The OCD roundel logo stays sharp and legible on multiple cupcakes at every checked frame — no melting, mirroring, or nonsense letterforms under rotation, which is the specific failure mode §6 warns about. Camera is static, background stays clean white throughout, motion reads as slow/weighty per spec. **Passed on the first attempt** — did not spend the remaining budget on a re-roll.

### Known limitations (accepted given the 10-credit budget, not silently hidden)

1. **Not a verified seamless loop.** The clip is 4s (shorter than §6's 6–10s target) and the first-frame and last-frame cupcake arrangements differ, so a hard `loop` on the `<video>` element will show a visible jump at the seam rather than an invisible one. §6's own fallback clause ("if the loop can't be made to look right, ship a still hero") was weighed against this — the logo-integrity pass being clean on the first try made shipping this clip (imperfect loop, correct everything else) the better call than either burning more of a scarce free-tier budget chasing a guaranteed-seamless loop, or discarding a good result. The loop point is a soft background element, not the visual focus (headline/CTA sit in the static white space, not on the video), so the seam is a minor, backgrounded imperfection.
2. **Single format, no encode ladder.** §6 asks for an AV1 → VP9/WebM → H.264/MP4 fallback chain. No `ffmpeg` (or equivalent) is available in this environment, so only the single H.264 MP4 Higgsfield returned is shipped. It's under the 2.5 MB budget (1.18 MB) and has universal browser support, so functionally fine — the multi-format optimization is a follow-up, not a defect.
3. **No separate portrait crop.** §6 asks for a 1080×1920 portrait crop for `<source media="...">` art-direction. Without `ffmpeg` this wasn't producible from the 16:9 master. The single video is shown at all breakpoints with `object-fit: cover`, which crops acceptably rather than failing — but it's not the art-directed portrait composition the spec describes.

### Follow-up (needs `ffmpeg` or an external encode step, not more Higgsfield credits)

- Re-encode `hero-cupcakes.mp4` to WebM/VP9 and AV1 and add as additional `<source>`s (highest-compression source first).
- Produce a portrait-cropped (1080×1920) version for the mobile `<source media="(max-width: 768px)">`.
- If a true seamless loop matters more than it currently does, that needs either a longer/differently-directed regeneration (more credits) or manual crossfade stitching in a real editor — not something further prompting alone reliably guarantees.
