"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// Cross-fades in on load instead of popping in abruptly once bytes arrive —
// makes image-heavy grids/pages feel faster even when the network isn't.
export function FadeImage({ className, alt, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={`${className ?? ""} transition-[opacity,transform] duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
