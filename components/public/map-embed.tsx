"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

// Click-to-load Google Maps: the embed pulls ~500KB of third-party JS/CSS, so it only loads
// when the visitor asks for it. A plain link to Google Maps works without JavaScript.
export function MapEmbed({ query }: { query: string }) {
  const [open, setOpen] = useState(false);
  const q = encodeURIComponent(query);

  if (open) {
    return (
      <iframe
        title="Bản đồ cửa hàng"
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        className="h-80 w-full rounded-xl border border-border/60"
      />
    );
  }

  return (
    <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-card/60 text-center">
      <MapPin className="size-8 text-primary" aria-hidden />
      <p className="max-w-sm px-4 text-sm text-muted-foreground">{query}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Hiện bản đồ
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium hover:border-primary/60"
        >
          Mở Google Maps
        </a>
      </div>
    </div>
  );
}
