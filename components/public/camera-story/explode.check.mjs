// Self-check for the scroll-story timeline math. Run: node components/public/camera-story/explode.check.mjs
import assert from "node:assert/strict";
import {
  CHAPTERS,
  activeChapter,
  chapterFocus,
  explodeAmount,
  mix3,
  sampleKeyframes,
  smoothstep,
} from "./explode.ts";

assert.equal(smoothstep(0, 1, -1), 0);
assert.equal(smoothstep(0, 1, 2), 1);
assert.equal(smoothstep(0, 1, 0.5), 0.5);

const lens = CHAPTERS[0];
assert.equal(explodeAmount(0, lens.start, lens.end), 0);
assert.equal(explodeAmount(lens.end, lens.start, lens.end), 1);
assert.equal(explodeAmount(1, lens.start, lens.end), 0, "camera reassembles by the end");
const settled = lens.end + (lens.end - lens.start);
assert.ok(Math.abs(explodeAmount(settled, lens.start, lens.end, 0.2) - 0.2) < 1e-9, "tucks back to hold");
assert.equal(explodeAmount(settled, lens.start, lens.end), 1, "default hold keeps parts out");
assert.equal(chapterFocus(lens.start, lens.start, lens.end), 0);
assert.equal(chapterFocus(lens.end, lens.start, lens.end), 1);
assert.equal(chapterFocus(lens.end + 0.05, lens.start, lens.end), 0);

assert.equal(activeChapter(0), -1);
assert.equal(activeChapter((lens.start + lens.end) / 2), 0);
assert.equal(activeChapter((CHAPTERS[3].start + CHAPTERS[3].end) / 2), 3);
assert.equal(activeChapter(1), 4);

const frames = [
  { at: 0.2, value: [0, 0, 0] },
  { at: 0.6, value: [1, 2, 3] },
];
assert.deepEqual(sampleKeyframes(0, frames), [0, 0, 0]);
assert.deepEqual(sampleKeyframes(0.2, frames), [0, 0, 0]);
assert.deepEqual(sampleKeyframes(0.6, frames), [1, 2, 3]);
assert.deepEqual(sampleKeyframes(1, frames), [1, 2, 3]);
sampleKeyframes(0.4, frames).forEach((v, i) => assert.ok(Math.abs(v - [0.5, 1, 1.5][i]) < 1e-9));

assert.deepEqual(mix3([0, 0, 0], [2, 4, 6], 0.5), [1, 2, 3]);

console.log("explode ok");
