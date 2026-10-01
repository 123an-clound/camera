import { CalendarCheck, PackageCheck, ScanSearch, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

const ICONS = [ScanSearch, CalendarCheck, PackageCheck];
const PASTELS = ["var(--c-pink)", "var(--c-lilac)", "var(--c-mint)", "var(--c-butter)", "var(--c-peach)"];

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
      <p className="font-script text-xl text-primary">
        {String(index).padStart(2, "0")} · {kicker}
      </p>
      <h2 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h2>
      <ol className="relative mt-10 grid gap-6 md:grid-cols-3">
        <span
          aria-hidden
          className="absolute left-0 right-0 top-[3.25rem] hidden border-t-2 border-dashed border-primary/30 md:block"
        />
        {steps.map(({ title, body }, i) => {
          const Icon = ICONS[i] ?? Sparkles;
          return (
            <li key={i} className="relative rounded-3xl border border-border bg-card p-6 shadow-[0_10px_24px_-16px_rgb(59_42_47/0.3)]">
              <div className="flex items-center justify-between">
                <span
                  className="flex size-14 items-center justify-center rounded-2xl border-2 border-foreground/80 text-foreground"
                  style={{ background: PASTELS[i % PASTELS.length] }}
                >
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="font-display text-4xl font-extrabold text-primary/20">{String(i + 1).padStart(2, "0")}</span>
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
