# Optical Lab redesign — design

Date: 2026-09-30 · Status: approved in chat (user: "cứ tiếp tục cho đến khi xong dự án")

## Goal
Replace the generic shadcn-neutral public UI with a dark, tech "Optical Lab" identity whose
centrepiece is a code-built 3D camera that explodes into its components as the user scrolls.

## Decisions (from brainstorming)
- 3D model: built from primitives in code (no GLB). Stylised, fully controllable, tiny, no licensing.
- Scope: homepage 3D scroll story + new theme across all public pages. Admin untouched.
- Look: dark near-black, single amber "tally light" accent, blueprint grid, mono spec/HUD text,
  viewfinder corners, cursor spotlight. Dark only on public pages.
- Scroll approach A: sticky scroll story (pinned section), not a site-wide fixed canvas.

## Theme system
- Admin shares `app/globals.css` and the root layout, so the new theme is **scoped**: the public
  layout wraps content in `<div className="dark theme-lab ...">`. `.theme-lab` overrides the shadcn
  tokens (background, card, primary = amber, border, ring…). Admin keeps `:root` tokens unchanged.
- Fonts: add `vietnamese` subset to Geist / Geist Mono (currently latin only — diacritics fall back).
  Add Chakra Petch (has vietnamese) as `--font-display` for headings.
- Utilities in globals.css: `.bg-blueprint` (grid), `.font-display`, `.text-glow`, viewfinder corners.

## Homepage structure
1. **Scroll story hero** (`components/public/camera-story/`), pinned ~450vh desktop / ~300vh mobile.
   - Intro: assembled camera, subtle mouse parallax; `h1` = `hero_title`, subtitle = `hero_subtitle`
     (still from admin settings), "SCROLL TO EXPLORE".
   - 4 chapters driven by scroll progress, each with an HTML HUD label + progress rail:
     1. Lens — lens elements slide out along the optical axis.
     2. Shutter — shutter blades fan out.
     3. Sensor — sensor plate lifts and glows amber.
     4. Battery / board / card — separate out the back.
   - Outro: camera reassembles and turns to face the viewer, CTA to /products.
   - All copy is real HTML (SEO / a11y); the canvas is `aria-hidden` decoration.
2. Banner slider (admin data) inside a viewfinder frame; its title becomes `h2` (single `h1` per page).
3. Featured / For sale / For rent product sections (same data), numbered mono headings.
4. New static "Quy trình thuê" 3-step strip.

## 3D camera
- `camera-model.tsx`: ~15 meshes from drei primitives (`RoundedBox`, cylinders, torus). Each part
  has `from` (assembled) and `to` (exploded) position/rotation and a chapter window `[start,end]`
  in progress space; per-frame lerp with smoothstep easing. Pure math lives in `explode.ts` with an
  assert-based self-check.
- Scroll progress: framer-motion `useScroll` on the pinned section, smoothed with `useSpring`,
  read inside `useFrame` (no React re-render per frame).
- Lighting: ambient + key + amber rim point lights; no HDRI (CSP blocks third-party fetches).
- Loaded via `next/dynamic(..., { ssr: false })` from a client component; static SVG blueprint
  placeholder while loading / when WebGL is unavailable.
- `frameloop="demand"`-free but `dpr={[1, 1.5]}`; canvas paused (`frameloop="never"`) when the
  section is off-screen.

## Fallbacks
- `prefers-reduced-motion`: no pinning, no canvas; chapters render as a static list with the SVG.
- Mobile (<768px): shorter pin, DPR ≤ 1.5.

## Global interaction / decoration
- Cursor spotlight: one client component sets `--mx/--my` on the theme wrapper; a radial amber
  gradient overlay follows the pointer (disabled on touch / reduced motion).
- Product card: keeps tilt, adds amber glow border + viewfinder corners on hover, mono price line.
- Navbar: glass dark bar, amber active underline, blinking "REC" dot by the logo.
- Footer: HUD style with mono EXIF line.
- Page transition curtain uses theme background colour instead of `neutral-900`.

## Non-goals
- No layout restructure of products / detail / cart / about / contact (they inherit the theme).
- No new dependencies (no Lenis/GSAP — framer-motion + R3F already installed cover it).
- No admin changes.

## Verification
`npm run build` + `npm run lint`, Playwright screenshots of home (top / mid-story / end), products,
product detail, mobile width, reduced motion; console free of errors; admin visually unchanged.
