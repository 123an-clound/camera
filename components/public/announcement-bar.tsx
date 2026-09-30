import Link from "next/link";

export function AnnouncementBar({ text, href }: { text: string; href?: string }) {
  const content = (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="size-1.5 rounded-full bg-primary-foreground/80" />
      {text}
      {href && <span aria-hidden>→</span>}
    </span>
  );
  return (
    <div className="relative z-50 bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground sm:text-sm">
      {href ? (
        <Link href={href} className="underline-offset-4 hover:underline">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
