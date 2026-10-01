import { SHOP_TIMEZONE } from "@/lib/rental";

// Decorative Y2K stickers (inline SVG, aria-hidden). Fill is a pastel, outline is the text colour.
const PATHS = {
  sparkle: "M12 1.5c.6 5.2 4.3 9 9.5 10.5-5.2 1.5-8.9 5.3-9.5 10.5C11.4 17.3 7.7 13.5 2.5 12 7.7 10.5 11.4 6.7 12 1.5Z",
  heart: "M12 21s-8.5-5.2-8.5-11.3A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 8.5 3.1C20.5 15.8 12 21 12 21Z",
  star: "m12 2.2 2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.2l-6 3.3 1.3-6.7-5-4.6 6.8-.8L12 2.2Z",
  flower:
    "M12 8.2a3.4 3.4 0 1 1 3.3-4.4 3.4 3.4 0 1 1 3.1 5.6 3.4 3.4 0 1 1-1.2 6.4 3.4 3.4 0 1 1-5.2 3.5 3.4 3.4 0 1 1-5.2-3.5 3.4 3.4 0 1 1-1.2-6.4 3.4 3.4 0 1 1 3.1-5.6A3.4 3.4 0 0 1 12 8.2Z",
  smiley: "M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Z",
} as const;

export type StickerName = keyof typeof PATHS;

export function Sticker({
  name,
  color = "var(--c-pink)",
  className = "size-8",
  style,
}: {
  name: StickerName;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`pointer-events-none select-none ${className}`} style={style}>
      <path d={PATHS[name]} fill={color} stroke="var(--foreground)" strokeWidth="1.2" strokeLinejoin="round" />
      {name === "smiley" && (
        <g fill="none" stroke="var(--foreground)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M9 10v1M15 10v1" />
          <path d="M8.5 14.2c1.9 2 5.1 2 7 0" />
        </g>
      )}
      {name === "flower" && <circle cx="12" cy="12" r="2.4" fill="var(--c-butter)" stroke="var(--foreground)" strokeWidth="1.2" />}
    </svg>
  );
}

// Digicam-style date stamp: 'YY MM DD in the shop's timezone.
export function filmDate(input: string | Date = new Date()): string {
  const [y, m, d] = new Date(input).toLocaleDateString("sv-SE", { timeZone: SHOP_TIMEZONE }).split("-");
  return `'${y.slice(2)} ${m} ${d}`;
}
