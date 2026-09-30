"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ViewfinderCorners } from "@/components/public/viewfinder";
import { BlueprintBackdrop, CameraBlueprint } from "./camera-blueprint";
import { CHAPTERS, activeChapter } from "./explode";
import type { SiteConfigGroups } from "@/lib/site-config-schema";

const CameraScene = dynamic(() => import("./camera-scene"), {
  ssr: false,
  loading: () => <BlueprintBackdrop />,
});

// Copy is admin-editable (Settings -> Trang chủ / Story 3D); the four chapters map to the
// four fixed 3D scenes.
export type StoryContent = SiteConfigGroups["story"];
export type HeroContent = {
  title: string;
  subtitle: string;
  kicker: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const TOTAL_FRAMES = 36;

// SSR-safe media query: server snapshot is `false`, client updates after hydration.
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Probed once per page load: getSnapshot runs on every render, and each probe would
// otherwise hold a WebGL context until the browser starts dropping them.
let webglSupported: boolean | undefined;
function probeWebGL() {
  if (webglSupported === undefined) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      webglSupported = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupported = false;
    }
  }
  return webglSupported;
}
const noopSubscribe = () => () => {};
function useWebGLSupported() {
  return useSyncExternalStore(noopSubscribe, probeWebGL, () => true);
}

// Mount the heavy 3D scene only once the browser is idle after first paint, so the hero
// text (the LCP element) and early interactions aren't blocked by three.js start-up.
// Save-Data / very low-end devices keep the lightweight blueprint.
function useIdleMount() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    // Save-Data and very low-end devices (≤2 cores or ≤2 GB) keep the static blueprint.
    if (nav.connection?.saveData || (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return;
    const run = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 1200);
    return () => window.clearTimeout(t);
  }, []);
  return ready;
}

function PrimaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_var(--glow)] transition-shadow hover:shadow-[0_0_48px_var(--glow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function SecondaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </Link>
  );
}

function Intro({ hero }: { hero: HeroContent }) {
  return (
    <>
      {hero.kicker && <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-primary">{hero.kicker}</p>}
      <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl">{hero.title}</h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">{hero.subtitle}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {hero.primary.label && hero.primary.href && <PrimaryCta href={hero.primary.href}>{hero.primary.label}</PrimaryCta>}
        {hero.secondary.label && hero.secondary.href && (
          <SecondaryCta href={hero.secondary.href}>{hero.secondary.label}</SecondaryCta>
        )}
      </div>
    </>
  );
}

function ChapterCopy({ index, c }: { index: number; c: StoryContent["chapters"][number] }) {
  return (
    <>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
        {String(index + 1).padStart(2, "0")} / {c.kicker}
      </p>
      <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{c.title}</h2>
      <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">{c.body}</p>
      <p className="mt-6 inline-block border-l-2 border-primary pl-3 font-mono text-xs uppercase tracking-widest text-foreground/80">
        {c.spec}
      </p>
    </>
  );
}

function Outro({ o }: { o: StoryContent["outro"] }) {
  return (
    <>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-primary">05 / {o.kicker}</p>
      <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{o.title}</h2>
      <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">{o.body}</p>
      {o.cta_label && o.cta_href && (
        <div className="mt-8">
          <PrimaryCta href={o.cta_href}>{o.cta_label}</PrimaryCta>
        </div>
      )}
    </>
  );
}

// One slide of HUD copy. All slides stay in the DOM (SEO); inactive ones are hidden and inert.
function Slide({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 24, filter: "blur(6px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!active}
      inert={!active}
      className="col-start-1 row-start-1"
    >
      {children}
    </motion.div>
  );
}

function PinnedStory({ hero, story }: { hero: HeroContent; story: StoryContent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const inView = useInView(ref, { margin: "200px 0px" });
  const webgl = useWebGLSupported();
  const idle = useIdleMount();
  const [chapter, setChapter] = useState(-1);
  const frame = useTransform(progress, (v) => String(Math.round(v * TOTAL_FRAMES)).padStart(2, "0"));
  const hintOpacity = useTransform(progress, [0, 0.05], [1, 0]);

  useMotionValueEvent(progress, "change", (v) => setChapter(activeChapter(v)));

  return (
    <section ref={ref} aria-label="Bên trong một chiếc máy ảnh" className="relative -mt-16 h-[320vh] md:h-[450vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_at_60%_45%,black_30%,transparent_75%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_50%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%)]" />

        <div className="absolute inset-0">
          {webgl && idle ? <CameraScene progress={progress} active={inView} /> : <BlueprintBackdrop />}
        </div>

        {/* Viewfinder HUD */}
        <ViewfinderCorners className="inset-x-4 bottom-4 top-20 hidden md:block" size="size-8" />
        <div
          aria-hidden
          className="absolute left-8 right-8 top-24 hidden items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:flex"
        >
          <span className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-red-500" /> REC
          </span>
          <span>{story.hud}</span>
          <span>
            FRAME <motion.span className="text-primary">{frame}</motion.span>/{TOTAL_FRAMES}
          </span>
        </div>

        {/* Copy */}
        <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-10 md:items-center md:pb-0">
          <div className="grid w-full max-w-lg rounded-2xl bg-background/60 p-5 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
            <Slide active={chapter === -1}>
              <Intro hero={hero} />
            </Slide>
            {story.chapters.map((c, i) => (
              <Slide key={i} active={chapter === i}>
                <ChapterCopy index={i} c={c} />
              </Slide>
            ))}
            <Slide active={chapter === CHAPTERS.length}>
              <Outro o={story.outro} />
            </Slide>
          </div>
        </div>

        {/* Focus-ring style progress rail */}
        <div aria-hidden className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-5 md:flex">
          {story.chapters.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  chapter === i ? "text-primary" : "text-muted-foreground/60"
                }`}
              >
                {c.kicker}
              </span>
              <span
                className={`h-px transition-all duration-300 ${chapter === i ? "w-10 bg-primary" : "w-4 bg-muted-foreground/40"}`}
              />
            </div>
          ))}
          <div className="mt-2 h-24 w-px self-end bg-border">
            <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-primary" />
          </div>
        </div>

        <motion.p
          aria-hidden
          style={{ opacity: hintOpacity }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block"
        >
          Cuộn để khám phá ↓
        </motion.p>
      </div>
    </section>
  );
}

// Reduced motion (or 3D disabled in admin): no pinning, no canvas — the same story as a list.
function StaticStory({ hero, story }: { hero: HeroContent; story: StoryContent }) {
  return (
    <section aria-label="Bên trong một chiếc máy ảnh" className="bg-blueprint">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <Intro hero={hero} />
        </div>
        <CameraBlueprint className="w-full max-w-lg" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 md:grid-cols-2">
        {story.chapters.map((c, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/60 p-6">
            <ChapterCopy index={i} c={c} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CameraStory({ hero, story, enable3d }: { hero: HeroContent; story: StoryContent; enable3d: boolean }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return reducedMotion || !enable3d ? <StaticStory hero={hero} story={story} /> : <PinnedStory hero={hero} story={story} />;
}
