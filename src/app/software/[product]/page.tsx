import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { SoftwareProductGuide } from "@/components/software-product-guide";
import { WorkCard } from "@/components/work-card";
import { getDb } from "@/db";
import { getProduct, getSector } from "@/lib/software-catalog";
import { listShowcaseProjects } from "@/server/portfolio";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, faqLd, graph, siteUrl } from "@/lib/site-schema";
import { SOFTWARE_SEO } from "@/lib/software-seo";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/software-demo.css";
import "@/app/automation.css";
import "@/app/work.css";

type PageProps = {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ sector?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProduct((await params).product);
  if (!product) notFound();
  const seo = SOFTWARE_SEO[product.id];
  const title = seo?.title ?? `${product.title} development`;
  const description = seo?.description ?? product.summary;
  return {
    title,
    description,
    alternates: { canonical: `/software/${product.id}` },
    openGraph: { title, description, url: `/software/${product.id}`, images: "/opengraph-image" },
  };
}

const SHOWCASE_TITLE: Record<string, string> = {
  erp: "ERP and management systems we've built",
  crm: "CRMs we've built",
  app: "Mobile apps we've built",
};

export default async function PublicSoftwareProductPage({ params, searchParams }: PageProps) {
  const product = getProduct((await params).product);
  if (!product) notFound();

  const { sector: sectorParam } = await searchParams;
  const sector = getSector(typeof sectorParam === "string" ? sectorParam : undefined);
  const projects = await listShowcaseProjects(await getDb(), product.id);
  const seo = SOFTWARE_SEO[product.id];
  const pageUrl = siteUrl(`/software/${product.id}`);
  const ld = graph(
    ...(seo ? [{
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: seo.serviceName,
      serviceType: seo.serviceType,
      description: seo.description,
      url: pageUrl,
      provider: { "@id": siteUrl("/#organization") },
      areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
      offers: { "@type": "Offer", url: pageUrl, priceCurrency: "INR", price: seo.priceFrom, priceSpecification: { "@type": "PriceSpecification", minPrice: seo.priceFrom, priceCurrency: "INR", valueAddedTaxIncluded: false } },
    }, faqLd(seo.faq)] : []),
    ...(projects.length > 0 ? [{
      "@type": "ItemList",
      name: SHOWCASE_TITLE[product.id] ?? "Projects we've built",
      itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: siteUrl(`/work/${p.slug}`) })),
    }] : []),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: product.title, path: `/software/${product.id}` }]),
  );

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader announcement={false} />
      <main id="main" className="landing-main public-software-guide automation-page">
        <SoftwareProductGuide
          product={product}
          sector={sector}
          basePath="/software"
          backHref="/services#custom-development"
          backLabel="View all software services"
        />
        {projects.length > 0 && (
          <section className="sw-showcase" aria-labelledby="showcase-title">
            <div className="sw-showcase-head">
              <div>
                <p className="au-eyebrow"><Icon name="workspaces" size={14} /> Our work</p>
                <h2 id="showcase-title">{SHOWCASE_TITLE[product.id] ?? "Projects we've built"}</h2>
                <p>Real projects for real businesses. Open any one to see what it does, or try the live demo with sample data.</p>
              </div>
              <Link href="/work" className="wk-link">See all projects <Icon name="arrow" size={14} /></Link>
            </div>
            <ul className="wk-grid">
              {projects.map((p, i) => <li key={p.slug} style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}><WorkCard project={p} /></li>)}
            </ul>
          </section>
        )}
        {seo && (
          <section className="sw-faq" aria-labelledby="sw-faq-title">
            <p className="au-eyebrow"><Icon name="spark" size={14} /> Questions clients ask</p>
            <h2 id="sw-faq-title">{product.title}: common questions</h2>
            {seo.faq.map((f, i) => (
              <details key={f.q} name="sw-faq" open={i === 0}>
                <summary>{f.q}<Icon name="down" size={16} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
