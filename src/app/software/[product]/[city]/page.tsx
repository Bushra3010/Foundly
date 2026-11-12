import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactBar } from "@/components/contact-bar";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { buttonClass } from "@/components/ui";
import { WorkCard } from "@/components/work-card";
import { getDb } from "@/db";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, COMPANY, faqLd, graph, siteUrl, whatsappLink } from "@/lib/site-schema";
import { getProduct } from "@/lib/software-catalog";
import { CITY_PRODUCTS, type CityProduct, softwareCity } from "@/lib/software-cities";
import { SOFTWARE_SEO } from "@/lib/software-seo";
import { listShowcaseProjects } from "@/server/portfolio";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/automation.css";
import "@/app/work.css";

type PageProps = { params: Promise<{ product: string; city: string }> };

async function resolve(params: PageProps["params"]) {
  const { product: productId, city: citySlug } = await params;
  if (!CITY_PRODUCTS.includes(productId as CityProduct)) return null;
  const product = getProduct(productId);
  const city = softwareCity(citySlug);
  const seo = SOFTWARE_SEO[productId];
  if (!product || !city || !seo) return null;
  return { product, city, seo, id: productId as CityProduct };
}

const label = (id: CityProduct) => (id === "erp" ? "ERP" : "CRM");

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return { title: "Page not found", robots: { index: false } };
  const title = `${label(r.id)} Software Company in ${r.city.name}`;
  const description = `Custom ${label(r.id)} software for ${r.city.name} businesses, from ${r.id === "erp" ? "₹3,00,000" : "₹99,999"}. See live demos of ${label(r.id)}s we've built and get a free consultation from Foundly.`;
  const path = `/software/${r.id}/${r.city.slug}`;
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path, images: "/opengraph-image" } };
}

export default async function SoftwareCityPage({ params }: PageProps) {
  const r = await resolve(params);
  if (!r) notFound();
  const { product, city, seo, id } = r;
  const name = label(id);
  const copy = city[id];
  const projects = await listShowcaseProjects(await getDb(), id);
  const local = projects.filter((p) => city.match.test(p.client));
  const others = projects.filter((p) => !local.includes(p));
  const path = `/software/${id}/${city.slug}`;
  const price = id === "erp" ? "₹3,00,000" : "₹99,999";

  const faq = [
    {
      q: `Do you build ${name} software for businesses in ${city.name}?`,
      a: city.office
        ? `Yes. Foundly's office is in Akurdi, Pune (${COMPANY.address}), so we can meet you in person, see how your team works and then build your ${name}.`
        : `Yes. Foundly is based in Pune and works with ${city.name} businesses remotely: we understand your process on video calls and WhatsApp, show you a working demo as we build, and train your team online.`,
    },
    {
      q: `How much does custom ${name} software cost in ${city.name}?`,
      a: `Custom ${name} from Foundly starts at ${price} (one-time build cost, before GST), the same for every city. The final price depends on the features, users and integrations you need, and we agree a fixed quote before work starts. There are no per-user licence fees.`,
    },
    {
      q: `Which ${city.name} businesses is a custom ${name} good for?`,
      a: `We see the most demand from ${copy.industries.slice(0, -1).join(", ")} and ${copy.industries.at(-1)}. Any business that has outgrown Excel and WhatsApp for ${id === "erp" ? "stock, orders and accounts" : "leads and follow-ups"} is a good fit.`,
    },
    {
      q: `Can I see ${name} software you have built?`,
      a: `Yes. This page lists ${projects.length} ${name} projects we've built for real businesses${local.length > 0 ? `, including ${local.length} in and around ${city.name}` : ""}. Each has a live demo with sample data you can try.`,
    },
  ];

  const ld = graph(
    {
      "@type": "Service",
      "@id": `${siteUrl(path)}#service`,
      name: `${seo.serviceName} in ${city.name}`,
      serviceType: seo.serviceType,
      url: siteUrl(path),
      provider: { "@id": siteUrl("/#organization") },
      areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "State", name: city.state } },
      offers: { "@type": "Offer", url: siteUrl(path), priceCurrency: "INR", price: seo.priceFrom },
    },
    faqLd(faq),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: product.title, path: `/software/${id}` }, { name: city.name, path }]),
  );

  return (
    <div className="foundly-landing has-contact-bar">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader announcement={false} />
      <main id="main" className="landing-main public-software-guide automation-page work-page">
        <Link href={`/software/${id}`} className="wk-back"><Icon name="chevron" size={14} className="wk-flip" /> {product.title}</Link>
        <section className="wk-hero">
          <p className="au-eyebrow"><Icon name={product.icon} size={14} /> {name} software · {city.name}{city.office ? " · Office in Pune" : ""}</p>
          <h1>{`${name} software company in ${city.name}`}</h1>
          <p className="au-lede">{copy.intro}</p>
          <dl className="wk-stats">
            <div><dt>Starting price</dt><dd>{price}</dd></div>
            <div><dt>{name} projects built</dt><dd>{projects.length}</dd></div>
            <div><dt>Live demos you can try</dt><dd>{projects.filter((p) => p.demoStatus === "live").length}</dd></div>
          </dl>
          <div className="au-hero-actions" style={{ marginTop: 20 }}>
            <a className={buttonClass()} href={whatsappLink(`Hi Foundly, I'm in ${city.name} and I'd like a quote for a custom ${name}.`)}>Get a free quote on WhatsApp <Icon name="arrow" size={16} /></a>
            <a className={buttonClass("secondary")} href={`tel:${COMPANY.telephone}`}>Call {COMPANY.telephoneDisplay}</a>
          </div>
        </section>

        <section className="wk-section" aria-labelledby="fit-title">
          <h2 id="fit-title">Who we build {name} for in {city.name}</h2>
          <ul className="wk-features">
            {copy.industries.map((i) => <li key={i}><Icon name="check" size={14} /><span>{i[0].toUpperCase() + i.slice(1)}</span></li>)}
          </ul>
          <p className="text-sm text-muted" style={{ marginTop: 12 }}>Areas we work with include {city.areas.join(", ")}.</p>
        </section>

        {local.length > 0 && (
          <section className="sw-showcase" aria-labelledby="local-title">
            <div className="sw-showcase-head"><div><h2 id="local-title">{name} projects for businesses in and around {city.name}</h2></div></div>
            <ul className="wk-grid">{local.map((p) => <li key={p.slug}><WorkCard project={p} /></li>)}</ul>
          </section>
        )}

        <section className="sw-showcase" aria-labelledby="all-title">
          <div className="sw-showcase-head">
            <div>
              <h2 id="all-title">{local.length > 0 ? `More ${name}s we've built` : `${name}s we've built`}</h2>
              <p>Open any project to see what it does, or try the live demo with sample data.</p>
            </div>
            <Link href={`/software/${id}`} className="wk-link">How our {name} works <Icon name="arrow" size={14} /></Link>
          </div>
          <ul className="wk-grid">{others.map((p) => <li key={p.slug}><WorkCard project={p} /></li>)}</ul>
        </section>

        <section className="sw-faq" aria-labelledby="city-faq-title">
          <h2 id="city-faq-title">{name} software in {city.name}: common questions</h2>
          {faq.map((f, i) => (
            <details key={f.q} name="city-faq" open={i === 0}>
              <summary>{f.q}<Icon name="down" size={16} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </main>
      <LandingFooter />
      <ContactBar what={`${name} software in ${city.name}`} message={`Hi Foundly, I'm in ${city.name} and I'd like a quote for a custom ${name}.`} />
    </div>
  );
}
