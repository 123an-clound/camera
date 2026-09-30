import type { Metadata } from "next";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Giới thiệu", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const { settings, about } = await getSiteConfig();
  const storeName = settingText(settings, "store_name", "Camera Rent");
  const body = settingText(settings, "about", "Đang cập nhật nội dung giới thiệu.");

  const faqJsonLd =
    about.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: about.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-14 px-4 py-12">
      <section>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Giới thiệu {storeName}</h1>
        <p className="mt-4 whitespace-pre-line text-muted-foreground">{body}</p>
      </section>

      {about.highlights.length > 0 && (
        <section aria-labelledby="highlights" className="space-y-5">
          <h2 id="highlights" className="text-2xl font-bold tracking-tight">
            Vì sao chọn chúng tôi
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {about.highlights.map((h, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/60 p-5">
                <p className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-lg font-semibold">{h.title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{h.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {about.faq.length > 0 && (
        <section aria-labelledby="faq" className="space-y-5">
          <h2 id="faq" className="text-2xl font-bold tracking-tight">
            Câu hỏi thường gặp
          </h2>
          <div className="divide-y divide-border rounded-2xl border border-border">
            {about.faq.map((f, i) => (
              <details key={i} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span aria-hidden className="text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {faqJsonLd && (
        <script
          type="application/ld+json"
          // JSON.stringify output with "<" escaped so admin text can't close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}
