"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";

type Slide = Pick<Banner, "title" | "subtitle" | "image_url" | "link_url">;

export function BannerSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];
  if (!slide) return null;

  const content = (
    <div className="relative h-[60vh] min-h-96 w-full overflow-hidden rounded-2xl bg-muted">
      {/* All slides stacked; CSS cross-fades the active one (no exit animation to get stuck). */}
      {slides.map((sl, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={sl.image_url}
            alt={sl.title ?? ""}
            fill
            sizes="(min-width: 1152px) 1120px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {(sl.title || sl.subtitle) && (
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-8 text-white">
              {sl.title && <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{sl.title}</h2>}
              {sl.subtitle && <p className="max-w-lg text-white/85 md:text-lg">{sl.subtitle}</p>}
            </div>
          )}
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Xem banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className="flex size-6 items-center justify-center"
            >
              <span className={`size-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return slide.link_url ? <Link href={slide.link_url}>{content}</Link> : content;
}
