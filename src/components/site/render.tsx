import type { Block, PageKey, SiteContent } from "@/lib/site/content";
import { phoneDigits } from "@/lib/profile";
import { LeadForm } from "./lead-form";
import "./site.css";

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
  const href = (key: PageKey) => (key === "home" ? basePath || "/" : `${basePath}/${key}`);
  const hasContact = content.pages.some((p) => p.key === "contact");
  const wa = f.whatsapp ? `https://wa.me/${phoneDigits(f.whatsapp, f.country)}` : null;

  return (
    <div
      className={`fs${wa ? " fs-has-wa" : ""}`}
      style={{ ["--site-primary" as string]: primary, ["--site-accent" as string]: accent }}
    >
      <header className="fs-header">
        <div className="fs-wrap">
          <a href={basePath || "/"} className="fs-brand">
            <span className="fs-mark" aria-hidden="true">{f.name.trim().slice(0, 1).toUpperCase()}</span>
            {f.name}
          </a>
          <nav aria-label="Site" className="fs-nav">
            {content.pages
              .filter((p) => p.key !== "privacy" && p.key !== "contact")
              .map((p) => (
                <a key={p.key} href={href(p.key)} aria-current={p.key === page.key ? "page" : undefined}>
                  {p.title}
                </a>
              ))}
            {hasContact && (
              <a href={href("contact")} aria-current={page.key === "contact" ? "page" : undefined} className="fs-nav-cta">
                Get in touch
              </a>
            )}
          </nav>
        </div>
      </header>
      <main id="main">
        {page.blocks.map((block) => (
          <BlockView key={block.id} block={block} content={content} siteSlug={siteSlug} mode={mode} contactHref={href("contact")} />
        ))}
      </main>
      <footer className="fs-footer">
        <div className="fs-wrap">
          <div>
            <strong>{f.name}</strong>
            <p>
              {f.category} · {f.address ? `${f.address}, ` : ""}
              {f.city}
            </p>
          </div>
          <nav aria-label="Footer">
            {content.pages.map((p) => (
              <a key={p.key} href={href(p.key)}>
                {p.title}
              </a>
            ))}
          </nav>
          <p className="fs-footer-copy">© {new Date().getFullYear()} {f.name}</p>
        </div>
      </footer>
      {wa && (
        <a href={wa} className="fs-wa-float" rel="noopener" aria-label={`Message ${f.name} on WhatsApp`}>
          <Svg d={ICON.chat} /> WhatsApp
        </a>
      )}
    </div>
  );
}

const ICON = {
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  chat: "M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z",
  mail: "M3 5h18v14H3V5Zm0 1 9 7 9-7",
  calendar: "M4 5h16v15H4V5Zm0 5h16M8 3v4m8-4v4",
  pin: "M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l3 2",
  arrow: "M4 12h16m-6-6 6 6-6 6",
};

function Svg({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function ContactMethods({ content }: { content: SiteContent }) {
  const f = content.facts;
  return (
    <div className="fs-methods">
      {f.phone && (
        <a href={`tel:+${phoneDigits(f.phone, f.country)}`} className="fs-method">
          <span className="fs-method-icon"><Svg d={ICON.phone} /></span>
          <span><strong>Call us</strong><span>{f.phone}</span></span>
        </a>
      )}
      {f.whatsapp && (
        <a href={`https://wa.me/${phoneDigits(f.whatsapp, f.country)}`} className="fs-method wa" rel="noopener">
          <span className="fs-method-icon"><Svg d={ICON.chat} /></span>
          <span><strong>Message on WhatsApp</strong><span>{f.whatsapp}</span></span>
        </a>
      )}
      {f.email && (
        <a href={`mailto:${f.email}`} className="fs-method">
          <span className="fs-method-icon"><Svg d={ICON.mail} /></span>
          <span><strong>Email us</strong><span>{f.email}</span></span>
        </a>
      )}
      {f.bookingUrl && (
        <a href={f.bookingUrl} className="fs-method" rel="noopener nofollow">
          <span className="fs-method-icon"><Svg d={ICON.calendar} /></span>
          <span><strong>Book online</strong><span>Choose a time that suits you</span></span>
        </a>
      )}
    </div>
  );
}

function Paragraphs({ body, className }: { body: string; className: string }) {
  return (
    <div className={className}>
      {body.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function BlockView({
  block,
  content,
  siteSlug,
  mode,
  contactHref,
}: {
  block: Block;
  content: SiteContent;
  siteSlug: string;
  mode: "preview" | "live";
  contactHref: string;
}) {
  const f = content.facts;
  switch (block.type) {
    case "hero":
      return (
        <section className="fs-hero">
          <div className="fs-wrap">
            <span className="fs-chip">
              {f.category}
              {f.city ? ` · ${f.city}` : ""}
            </span>
            <h1 className="fs-serif">{block.heading}</h1>
            {block.subheading && <p className="fs-lead">{block.subheading}</p>}
            <div className="fs-hero-actions">
              <a href={f.bookingUrl ?? contactHref} className="fs-btn fs-btn-primary">
                {block.ctaLabel} <Svg d={ICON.arrow} size={18} />
              </a>
              {f.whatsapp ? (
                <a href={`https://wa.me/${phoneDigits(f.whatsapp, f.country)}`} className="fs-btn fs-btn-ghost" rel="noopener">
                  <Svg d={ICON.chat} size={18} /> WhatsApp
                </a>
              ) : f.phone ? (
                <a href={`tel:+${phoneDigits(f.phone, f.country)}`} className="fs-btn fs-btn-ghost">
                  <Svg d={ICON.phone} size={18} /> Call {f.phone}
                </a>
              ) : null}
            </div>
            {(f.serviceAreas.length > 0 || f.hours.length > 0) && (
              <div className="fs-trust">
                {f.serviceAreas.length > 0 && (
                  <span><Svg d={ICON.pin} size={17} /> Serving {f.serviceAreas.slice(0, 4).join(", ")}</span>
                )}
                {f.hours[0] && (
                  <span><Svg d={ICON.clock} size={17} /> {f.hours[0].days}: {f.hours[0].hours}</span>
                )}
              </div>
            )}
          </div>
        </section>
      );
    case "services":
      return (
        <section className="fs-section">
          <div className="fs-wrap">
            <p className="fs-eyebrow">What we do</p>
            <h2 className="fs-h2 fs-serif">{block.heading}</h2>
            <ul className="fs-services">
              {block.items.map((item, i) => (
                <li key={item.name} className="fs-card">
                  <span className="fs-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    case "about":
      return (
        <section className="fs-section">
          <div className="fs-wrap fs-about">
            <div>
              <p className="fs-eyebrow">About us</p>
              <h2 className="fs-h2 fs-serif">{block.heading}</h2>
            </div>
            <Paragraphs body={block.body} className="fs-about-body" />
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="fs-section">
          <div className="fs-wrap fs-narrow">
            <p className="fs-eyebrow">Good to know</p>
            <h2 className="fs-h2 fs-serif">{block.heading}</h2>
            <div className="fs-faq">
              {block.items.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    case "text":
      return (
        <section className="fs-section">
          <div className="fs-wrap fs-narrow">
            <h2 className="fs-h2 fs-serif">{block.heading}</h2>
            <Paragraphs body={block.body} className="fs-text-body" />
          </div>
        </section>
      );
    case "gallery":
      return (
        <section className="fs-section">
          <div className="fs-wrap">
            <p className="fs-eyebrow">Our work</p>
            <h2 className="fs-h2 fs-serif">{block.heading}</h2>
            <ul className="fs-gallery">
              {block.images.map((img) => (
                <li key={img.url}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- owner-supplied external URL */}
                  <img src={img.url} alt={img.alt} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    case "contact":
      return (
        <section className="fs-section fs-contact">
          <div className="fs-wrap fs-contact-grid">
            <div>
              <p className="fs-eyebrow">Contact</p>
              <h2 className="fs-h2 fs-serif">{block.heading}</h2>
              {block.intro && <p className="fs-contact-intro">{block.intro}</p>}
              <ContactMethods content={content} />
              {(f.hours.length > 0 || f.serviceAreas.length > 0) && (
                <div className="fs-info">
                  {f.hours.length > 0 && (
                    <div>
                      <h3>Opening hours</h3>
                      <ul>
                        {f.hours.map((h) => (
                          <li key={h.days}>
                            {h.days}: {h.hours}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {f.serviceAreas.length > 0 && (
                    <div>
                      <h3>Areas we serve</h3>
                      <ul><li>{f.serviceAreas.join(", ")}</li></ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {block.showForm && (
              <div className="fs-form-card">
                <h3>Send an enquiry</h3>
                <LeadForm siteSlug={siteSlug} disabled={mode === "preview"} primary={content.theme.primary} />
              </div>
            )}
          </div>
        </section>
      );
  }
}
