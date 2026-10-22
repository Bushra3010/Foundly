import type { Block, PageKey, SiteContent } from "@/lib/site/content";
import { phoneDigits } from "@/lib/profile";
import { LeadForm } from "./lead-form";

/**
 * Renders validated site content with fixed, curated components. Content is
 * always rendered as text — no owner or generated HTML is ever injected.
 */
export function SiteRenderer({
  content,
  pageKey,
  basePath,
  siteSlug,
  mode,
}: {
  content: SiteContent;
  pageKey: PageKey;
  basePath: string;
  siteSlug: string;
  mode: "preview" | "live";
}) {
  const page = content.pages.find((p) => p.key === pageKey) ?? content.pages[0];
  const { primary, accent } = content.theme;
  const f = content.facts;
  const href = (key: PageKey) => (key === "home" ? basePath : `${basePath}/${key}`);

  return (
    <div className="min-h-dvh bg-white text-neutral-900" style={{ ["--site-primary" as string]: primary }}>
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <a href={basePath} className="text-xl font-bold" style={{ color: primary }}>
            {f.name}
          </a>
          <nav aria-label="Site">
            <ul className="flex flex-wrap gap-1">
              {content.pages.map((p) => (
                <li key={p.key}>
                  <a
                    href={href(p.key)}
                    aria-current={p.key === page.key ? "page" : undefined}
                    className="inline-flex min-h-11 items-center rounded-md px-3 font-medium hover:bg-neutral-100 aria-[current=page]:underline"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main">
        {page.blocks.map((block) => (
          <BlockView key={block.id} block={block} content={content} siteSlug={siteSlug} mode={mode} contactHref={href("contact")} accent={accent} />
        ))}
      </main>
      <footer className="mt-12 border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600">
          <p className="font-semibold text-neutral-900">{f.name}</p>
          <p>
            {f.category} · {f.address ? `${f.address}, ` : ""}
            {f.city}
          </p>
          <p className="mt-4">© {new Date().getFullYear()} {f.name}</p>
        </div>
      </footer>
    </div>
  );
}

function ContactButtons({ content }: { content: SiteContent }) {
  const f = content.facts;
  const btn = "inline-flex min-h-11 items-center rounded-lg px-4 font-semibold";
  return (
    <div className="flex flex-wrap gap-2">
      {f.phone && (
        <a href={`tel:+${phoneDigits(f.phone, f.country)}`} className={`${btn} text-white`} style={{ background: content.theme.primary }}>
          Call {f.phone}
        </a>
      )}
      {f.whatsapp && (
        <a
          href={`https://wa.me/${phoneDigits(f.whatsapp, f.country)}`}
          className={`${btn} border border-neutral-300 bg-white`}
          rel="noopener"
        >
          WhatsApp
        </a>
      )}
      {f.email && (
        <a href={`mailto:${f.email}`} className={`${btn} border border-neutral-300 bg-white`}>
          Email
        </a>
      )}
      {f.bookingUrl && (
        <a href={f.bookingUrl} className={`${btn} border border-neutral-300 bg-white`} rel="noopener nofollow">
          Book online
        </a>
      )}
    </div>
  );
}

function BlockView({
  block,
  content,
  siteSlug,
  mode,
  contactHref,
  accent,
}: {
  block: Block;
  content: SiteContent;
  siteSlug: string;
  mode: "preview" | "live";
  contactHref: string;
  accent: string;
}) {
  const f = content.facts;
  const primary = content.theme.primary;
  switch (block.type) {
    case "hero":
      return (
        <section className="px-4 py-16 text-white" style={{ background: primary }}>
          <div className="mx-auto max-w-5xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{block.heading}</h1>
            {block.subheading && <p className="mt-4 max-w-2xl text-lg opacity-95">{block.subheading}</p>}
            <a
              href={f.bookingUrl ?? contactHref}
              className="mt-8 inline-flex min-h-11 items-center rounded-lg px-5 font-semibold text-neutral-900"
              style={{ background: accent }}
            >
              {block.ctaLabel}
            </a>
          </div>
        </section>
      );
    case "services":
      return (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-bold">{block.heading}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {block.items.map((item) => (
              <li key={item.name} className="rounded-xl border border-neutral-200 p-5">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                {item.description && <p className="mt-1 text-neutral-700">{item.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      );
    case "about":
      return (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold">{block.heading}</h2>
          <div className="mt-4 space-y-4 text-lg text-neutral-800">
            {block.body.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold">{block.heading}</h2>
          <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
            {block.items.map((item) => (
              <details key={item.question} className="py-4">
                <summary className="cursor-pointer text-lg font-semibold">{item.question}</summary>
                <p className="mt-2 text-neutral-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );
    case "gallery":
      return (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-bold">{block.heading}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {block.images.map((img) => (
              <li key={img.url}>
                {/* eslint-disable-next-line @next/next/no-img-element -- owner-supplied external URL */}
                <img src={img.url} alt={img.alt} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              </li>
            ))}
          </ul>
        </section>
      );
    case "contact":
      return (
        <section className="bg-neutral-50 px-4 py-12">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{block.heading}</h2>
              {block.intro && <p className="mt-2 text-neutral-700">{block.intro}</p>}
              <div className="mt-6">
                <ContactButtons content={content} />
              </div>
              {f.hours.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold">Opening hours</h3>
                  <ul className="mt-1 text-neutral-700">
                    {f.hours.map((h) => (
                      <li key={h.days}>
                        {h.days}: {h.hours}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {f.serviceAreas.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold">Areas we serve</h3>
                  <p className="text-neutral-700">{f.serviceAreas.join(", ")}</p>
                </div>
              )}
            </div>
            {block.showForm && (
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="mb-4 text-lg font-semibold">Send an enquiry</h3>
                <LeadForm siteSlug={siteSlug} disabled={mode === "preview"} primary={primary} />
              </div>
            )}
          </div>
        </section>
      );
  }
}
