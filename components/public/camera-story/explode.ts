// Pure timeline math for the exploding-camera scroll story. No imports so it
// can be self-checked with plain Node (see explode.check.mjs).

export type Vec3 = [number, number, number];

export type ChapterId = "lens" | "shutter" | "sensor" | "internals";

// Progress windows (0..1 of the pinned section) in which each chapter's parts fly out.
// `hold` is how far the parts stay out once the next chapter takes over (1 = fully exploded),
// so earlier parts tuck back in and don't crowd the next chapter.
export const CHAPTERS: readonly { id: ChapterId; start: number; end: number; hold: number }[] = [
  { id: "lens", start: 0.08, end: 0.28, hold: 0.2 },
  { id: "shutter", start: 0.28, end: 0.46, hold: 0.3 },
  { id: "sensor", start: 0.46, end: 0.64, hold: 0.45 },
  { id: "internals", start: 0.64, end: 0.82, hold: 1 },
];

// From here to the end every part flies back and the camera reassembles.
export const OUTRO_START = 0.86;
const OUTRO_END = 0.97;

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

// 0 before the window, eases to 1 across it, settles to `hold` over the following window,
// then returns to 0 in the outro.
export function explodeAmount(progress: number, start: number, end: number, hold = 1): number {
  const out = smoothstep(start, end, progress) - (1 - hold) * smoothstep(end, end + (end - start), progress);
  return out * (1 - smoothstep(OUTRO_START, OUTRO_END, progress));
}

// Visibility of a chapter's callouts: fades in with the chapter, out as the next one starts.
export function chapterFocus(progress: number, start: number, end: number): number {
  return smoothstep(start + (end - start) * 0.4, end, progress) * (1 - smoothstep(end, end + 0.05, progress));
}

// -1 = intro, 0..3 = chapter index, 4 = outro.
export function activeChapter(progress: number): number {
  if (progress < CHAPTERS[0].start) return -1;
  if (progress >= OUTRO_START) return CHAPTERS.length;
  let index = 0;
  for (let i = 0; i < CHAPTERS.length; i++) if (progress >= CHAPTERS[i].start) index = i;
  return index;
}

export function mix3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Eased piecewise interpolation between keyframes sorted by `at`; clamps outside the range.
export function sampleKeyframes(progress: number, frames: readonly { at: number; value: Vec3 }[]): Vec3 {
  if (progress <= frames[0].at) return frames[0].value;
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1];
    const b = frames[i];
    if (progress <= b.at) return mix3(a.value, b.value, smoothstep(a.at, b.at, progress));
  }
  return frames[frames.length - 1].value;
}
