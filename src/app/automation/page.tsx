import type { Metadata } from "next";
import { AutomationFlow } from "@/components/automation-flow";
import { AutomationHub } from "@/components/automation-hub";
import { Icon } from "@/components/icon";
import { ScrollLink } from "@/components/scroll-link";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { SoftwareDemo } from "@/components/software-demo";
import { buttonClass, Card, LinkButton } from "@/components/ui";
import { AUTOMATION_TOOLS, DEPARTMENTS, getDepartment } from "@/lib/automation-catalog";
import { breadcrumbLd, graph, siteUrl, whatsappLink } from "@/lib/site-schema";
import { jsonLdScript } from "@/lib/profile";
import { AUTOMATION_SEO } from "@/lib/software-seo";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/software-demo.css";
import "@/app/automation.css";

const AUTOMATION_LD = graph(
  {
    "@type": "Service",
    "@id": `${siteUrl("/automation")}#service`,
    name: "AI automation for business",
    serviceType: ["AI automation", "Business process automation", "WhatsApp AI assistant", "AI agents", "Document AI"],
    description: AUTOMATION_SEO.description,
    url: siteUrl("/automation"),
    provider: { "@id": siteUrl("/#organization") },
    areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
    hasOfferCatalog: { "@type": "OfferCatalog", name: "AI automation by department", itemListElement: DEPARTMENTS.map((d) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: d.title } })) },
  },
  breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI automation", path: "/automation" }]),
);

export const metadata: Metadata = {
  title: AUTOMATION_SEO.title,
  description: AUTOMATION_SEO.description,
  openGraph: { title: AUTOMATION_SEO.title, description: AUTOMATION_SEO.description, url: "/automation", images: "/opengraph-image" },
  alternates: { canonical: "/automation" },
};

type PageProps = { searchParams: Promise<{ team?: string | string[] }> };

export default async function AutomationPage({ searchParams }: PageProps) {
  const { team } = await searchParams;
  const dept = getDepartment(typeof team === "string" ? team : undefined);

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(AUTOMATION_LD) }} />
      <LandingHeader />
      <main id="main" className="landing-main public-software-guide automation-page">
        <section className="au-hero">
          <div className="au-hero-copy">
            <p className="au-eyebrow"><Icon name="spark" size={14} /> AI automation</p>
            <h1>Automate your company with AI</h1>
            <p className="au-lede">We build AI automations that take over the repetitive work in every department: replying, reading documents, updating systems and chasing follow-ups. Your team approves what matters and spends its time on customers.</p>
            <div className="au-hero-actions">
              <a className={buttonClass()} href={whatsappLink("Hi Foundly, I’d like a free AI automation audit for my company.")}>Get a free automation audit <Icon name="arrow" size={16} /></a>
              <ScrollLink className={buttonClass("secondary")} target="department">See a live demo</ScrollLink>
            </div>
            <ul className="au-hero-points">
              <li><Icon name="check" size={14} /> 8 departments</li>
              <li><Icon name="check" size={14} /> Works with your current tools</li>
              <li><Icon name="check" size={14} /> People stay in control</li>
            </ul>
          </div>
          <AutomationHub current={dept.id} />
        </section>

        <Card className="space-y-5" id="department">
          <div>
            <h2 className="font-semibold">Choose a department</h2>
            <p className="mt-1 text-sm text-muted">Each one has its own automation flow, dashboard and demo.</p>
          </div>
          <nav aria-label="Departments" className="au-depts">
            {DEPARTMENTS.map(({ id, label, icon }) => (
              <LinkButton key={id} href={`/automation?team=${id}#department`} variant={id === dept.id ? "primary" : "secondary"} aria-current={id === dept.id ? "page" : undefined} scroll={false}>
                <Icon name={icon} size={15} /> {label}
              </LinkButton>
            ))}
          </nav>
          <div className="border-t border-border pt-5">
            <h2 className="text-xl font-semibold">{dept.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{dept.outcome}</p>
          </div>
        </Card>

        <AutomationFlow key={`flow-${dept.id}`} flow={dept.flow} name={dept.title} />

        <SoftwareDemo
          key={`demo-${dept.id}`}
          title={dept.title}
          demo={dept.demo}
          features={dept.automations.map(([name, description]) => ({ name, description }))}
          workflow={dept.workflow}
          variant="desktop"
        />

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
          <Card key={dept.id}>
            <h2 className="text-lg font-semibold">What we automate in {dept.label.toLowerCase()}</h2>
            <p className="mt-1 mb-4 text-sm text-muted">Open any automation to see what it does.</p>
            {dept.automations.map(([name, description]) => (
              <details key={name} name="automation" className="group border-t border-border py-1">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded px-2 text-sm font-semibold hover:bg-surface-2">
                  {name}<Icon name="down" size={16} className="shrink-0 group-open:rotate-180" />
                </summary>
                <p className="px-2 pt-1 pb-3 text-sm leading-relaxed text-muted">{description}</p>
              </details>
            ))}
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">How we set it up</h2>
            <ol className="mt-4 space-y-3">
              {["We map the work your team repeats every day.", "We connect your tools and build the automation with you.", "You test it with real examples, then we switch it on and keep improving it."].map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-semibold">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t border-border pt-5">
              <p className="font-semibold">Priced to your workflow</p>
              <p className="mt-1 mb-3 text-sm text-muted">Tell us what takes your team the most time and we’ll suggest what to automate first.</p>
              <a className={buttonClass()} href={whatsappLink(`Hi Foundly, I’d like to automate ${dept.label.toLowerCase()} work with AI.`)}>Discuss {dept.label.toLowerCase()} automation <Icon name="arrow" size={16} /></a>
            </div>
          </Card>
        </div>

        <section className="au-tools" aria-labelledby="au-tools-title">
          <h2 id="au-tools-title">Connects the tools you already use</h2>
          <ul>
            {AUTOMATION_TOOLS.map((tool, i) => <li key={tool} style={{ animationDelay: `${i * 60}ms` }}>{tool}</li>)}
          </ul>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
