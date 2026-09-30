# Optical Lab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dark "Optical Lab" public theme plus a code-built 3D camera that explodes into its parts on scroll.

**Architecture:** Theme tokens are scoped under `.theme-lab` on the public layout so admin is unchanged.
The homepage hero becomes a pinned scroll section: framer-motion `useScroll` → spring-smoothed progress →
read in R3F `useFrame` → pure functions in `explode.ts` compute every part's transform.

**Tech Stack:** Next 16.3.5 App Router, React 19, Tailwind 4, framer-motion 13, three 0.186, @react-three/fiber 9, drei 10.

**Spec:** `docs/superpowers/specs/2026-09-30-optical-lab-redesign-design.md`

## Global Constraints
- No new npm dependencies.
- No admin file changes; admin must look identical.
- No external network fetches from the 3D scene (CSP): no HDRI / `<Environment>` / remote fonts in canvas.
- All user-facing copy in Vietnamese; code/comments English.
- Exactly one `h1` per page. Canvas is `aria-hidden`; story copy is real HTML.
- `prefers-reduced-motion` → no pinning, no canvas.

---

### Task 1: Scoped theme foundation
**Files:** Modify `app/globals.css`, `app/layout.tsx`, `app/(public)/layout.tsx`, `components/motion/page-transition.tsx`.

**Produces:** classes `theme-lab`, `font-display`, `bg-blueprint`, `text-glow`, `vf-corners`; CSS vars `--mx`, `--my`
(pointer position, px) on the theme wrapper; font var `--font-display`.

- [ ] Add `vietnamese` subset to Geist + Geist Mono; add `Chakra_Petch` (400/500/600/700, latin+vietnamese) as `--font-display`.
- [ ] In globals.css add `.theme-lab { --background… --primary: amber … }` and utilities; map `--font-display` in `@theme inline`.
- [ ] Public layout: wrap in `<div className="dark theme-lab relative flex min-h-full flex-1 flex-col bg-background text-foreground">`.
- [ ] Page-transition curtain: `bg-neutral-900` → `bg-[oklch(0.12_0.005_60)]` with amber top edge.
- [ ] `npm run build` passes; screenshot `/` and `/admin/login` (admin unchanged).
- [ ] Commit `feat(theme): scoped Optical Lab dark theme`.

### Task 2: Explode math (pure, checked)
**Files:** Create `components/public/camera-story/explode.ts`, `components/public/camera-story/explode.check.mjs`.

**Produces:**
```ts
export type Vec3 = [number, number, number];
export const CHAPTERS: readonly { id: "lens"|"shutter"|"sensor"|"internals"; start: number; end: number }[];
export const OUTRO_START: number;
export function smoothstep(e0: number, e1: number, x: number): number;
export function explodeAmount(progress: number, start: number, end: number): number; // 0 before, 1 in, 0 after outro
export function activeChapter(progress: number): number; // -1 intro, 0..3 chapter, 4 outro
export function sampleKeyframes(progress: number, frames: readonly { at: number; value: Vec3 }[]): Vec3;
export function mix3(a: Vec3, b: Vec3, t: number): Vec3;
```
- [ ] Write `explode.check.mjs` with `node:assert` cases: smoothstep clamps 0/1 and is 0.5 at midpoint;
      explodeAmount = 0 at progress 0, 1 at chapter end, 0 at progress 1; activeChapter(0)=-1, mid-lens=0, 1→4;
      sampleKeyframes returns endpoints exactly and clamps outside range.
- [ ] Run `node components/public/camera-story/explode.check.mjs` → fails (module missing).
- [ ] Implement `explode.ts`. Re-run → prints `explode ok`.
- [ ] Commit `feat(story): explode timeline math with self-check`.

### Task 3: Code-built 3D camera
**Files:** Create `components/public/camera-story/camera-model.tsx`, `components/public/camera-story/camera-scene.tsx`.

**Consumes:** Task 2 API. **Produces:** `default export CameraScene({ progress }: { progress: MotionValue<number> })`.

- [ ] `camera-model.tsx`: `PARTS` table — each `{ key, chapter, geometry, material, from: Vec3, to: Vec3, rotTo?: Vec3 }`;
      body shell (front plate, chassis, back plate + LCD, top plate + dials, grip), lens (mount, barrel, focus ring,
      4 glass elements, hood), shutter (frame + 6 blades that rotate open), sensor (emissive amber when exploded),
      internals (board, battery, SD card). `useFrame` reads `progress.get()` and sets each ref's position/rotation
      via `mix3(from, to, explodeAmount(...))`. Group rotation/scale from `sampleKeyframes`.
- [ ] `camera-scene.tsx`: `<Canvas dpr={[1,1.5]} frameloop={inView ? "always" : "never"}>` + ambient, key, amber rim
      point lights, mouse parallax on intro. No Environment.
- [ ] Build passes.
- [ ] Commit `feat(story): code-built exploding camera`.

### Task 4: Scroll story section + homepage wiring
**Files:** Create `components/public/camera-story/camera-story.tsx` (client), `components/public/camera-story/camera-blueprint.tsx` (SVG);
Modify `components/public/hero.tsx`, `app/(public)/page.tsx`, `components/public/banner-slider.tsx` (h1→h2).

- [ ] `CameraStory({ title, subtitle })`: section height `h-[450vh] md:` / `h-[300vh]` mobile, inner `sticky top-0 h-svh`;
      canvas via `next/dynamic(() => import("./camera-scene"), { ssr: false, loading: Blueprint })`;
      HUD: intro block (`h1` title, subtitle, "CUỘN ĐỂ KHÁM PHÁ"), 4 chapter cards whose opacity/translate derive from
      `useTransform(progress, …)`, right-side focus-ring progress rail, outro CTA to `/products`.
- [ ] Reduced motion: render intro + 4 chapter blocks statically with `<CameraBlueprint/>`, no canvas.
- [ ] `Hero` renders `<CameraStory>` then banners (inside viewfinder frame) below.
- [ ] Browser check: scroll top/mid/end screenshots, no console errors.
- [ ] Commit `feat(home): pinned 3D camera scroll story`.

### Task 5: Global decoration & component restyle
**Files:** Create `components/public/cursor-spotlight.tsx`, `components/public/viewfinder.tsx`, `components/public/rental-steps.tsx`;
Modify `navbar.tsx`, `nav-links.tsx`, `mobile-nav.tsx`, `footer.tsx`, `product-card.tsx`, `app/(public)/page.tsx`.

- [ ] CursorSpotlight: pointermove (fine pointers only, not reduced motion) → rAF → sets `--mx/--my` on wrapper; fixed radial overlay.
- [ ] Viewfinder: 4 corner brackets + optional mono label, used by banner & card hover.
- [ ] Navbar glass + REC dot; amber active underline; footer HUD with EXIF line.
- [ ] Product card: amber glow border following pointer, corners on hover, mono prices.
- [ ] Section headings `01 / Sản phẩm nổi bật` in display font; RentalSteps 3-step strip.
- [ ] Build + lint; commit `feat(ui): Optical Lab decoration and component restyle`.

### Task 6: Quality gates
- [ ] `npm run lint`, `npm run build`, `node …/explode.check.mjs`.
- [ ] Playwright: `/`, `/products`, a product detail, `/cart`, `/about`, `/contact` at 1440 and 390 wide; reduced motion;
      console errors; admin login page unchanged.
- [ ] A11y: contrast of amber on dark ≥ 4.5 for text, focus rings visible, one h1, keyboard nav through story.
- [ ] Perf: canvas paused off-screen; no CLS from the sticky section.
- [ ] Commit fixes.
