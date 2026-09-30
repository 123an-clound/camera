// Line-art camera used while the 3D scene loads, without WebGL, and for reduced motion.
export function CameraBlueprint({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="text-primary/70">
        <rect x="60" y="70" width="280" height="160" rx="14" />
        <rect x="60" y="80" width="62" height="150" rx="24" />
        <path d="M170 70 v-26 a8 8 0 0 1 8 -8 h64 a8 8 0 0 1 8 8 v26" />
        <rect x="90" y="56" width="44" height="14" rx="4" />
        <rect x="280" y="56" width="44" height="14" rx="4" />
        <circle cx="222" cy="150" r="66" />
        <circle cx="222" cy="150" r="54" />
        <circle cx="222" cy="150" r="40" strokeDasharray="3 4" />
        <circle cx="222" cy="150" r="24" />
        <circle cx="210" cy="138" r="6" />
        <circle cx="318" cy="92" r="3" className="fill-current" />
      </g>
      <g className="text-muted-foreground/60" strokeWidth="0.8">
        <path d="M60 244 h280 M60 240 v8 M340 240 v8" />
        <path d="M352 70 v160 M348 70 h8 M348 230 h8" />
        <path d="M288 150 h52" strokeDasharray="2 3" />
      </g>
      <g className="fill-muted-foreground/80 font-mono" stroke="none" fontSize="9" letterSpacing="1">
        <text x="200" y="258" textAnchor="middle">
          128 MM
        </text>
        <text x="362" y="153">
          86
        </text>
        <text x="296" y="143">
          ƒ/1.8
        </text>
      </g>
    </svg>
  );
}
