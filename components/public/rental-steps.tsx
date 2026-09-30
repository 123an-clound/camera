import { CalendarCheck, PackageCheck, ScanSearch, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

const ICONS = [ScanSearch, CalendarCheck, PackageCheck];

export function RentalSteps({
  index,
  kicker,
  title,
  steps,
}: {
  index: number;
  kicker: string;
  title: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <FadeIn className="mx-auto max-w-6xl px-4 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
        {String(index).padStart(2, "0")} / {kicker}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <ol className="relative mt-10 grid gap-6 md:grid-cols-3">
        <span
          aria-hidden
          className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-primary/30 md:block"
        />
        {steps.map(({ title, body }, i) => {
          const Icon = ICONS[i] ?? Sparkles;
          return (
            <li key={i} className="relative rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_0_24px_var(--glow)]">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="font-mono text-4xl font-bold text-foreground/10">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          );
        })}
      </ol>
    </FadeIn>
  );
}
