import { MessageCircle, Phone } from "lucide-react";

// Call / Zalo shortcuts pinned bottom-right (mobile-first conversion aid).
export function FloatingContact({ phone, zalo }: { phone: string; zalo: string }) {
  if (!phone && !zalo) return null;
  const base =
    "flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {zalo && (
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Nhắn Zalo"
          className={`${base} bg-[#0068ff] text-white`}
        >
          <MessageCircle className="size-5" aria-hidden />
        </a>
      )}
      {phone && (
        <a href={`tel:${phone}`} aria-label={`Gọi ${phone}`} className={`${base} bg-primary text-primary-foreground shadow-[0_0_24px_var(--glow)]`}>
          <Phone className="size-5" aria-hidden />
        </a>
      )}
    </div>
  );
}
