import Link from "next/link";
import { Icon } from "@/components/icon";
import { ScrollLink } from "@/components/scroll-link";
import { buttonClass, Card, LinkButton } from "@/components/ui";
import { SoftwareDemo } from "@/components/software-demo";
import { SoftwareShowcase } from "@/components/software-showcase";
import { getProduct, SECTORS, type Sector } from "@/lib/software-catalog";
import { getDemo } from "@/lib/software-demo";
import { whatsappLink } from "@/lib/site-schema";

const SECTOR_ICONS: Record<Sector, string> = { manufacturing: "business", hospitals: "shield", universities: "reports" };

type Props = {
  product: NonNullable<ReturnType<typeof getProduct>>;
  sector: { id: Sector; label: string };
  basePath: string;
  backHref: string;
  backLabel: string;
  /** Search-led H1 and eyebrow; the product's own headline is used when omitted. */
  heading?: string;
  eyebrow?: string;
};

export function SoftwareProductGuide({ product, sector, basePath, backHref, backLabel, heading, eyebrow }: Props) {
  const guide = product.sectors[sector.id];
  const demo = getDemo(product.id, sector.id);

  return (
    <>
      <section className="au-hero">
        <div className="au-hero-copy">
          <p className="au-eyebrow"><Icon name={product.icon} size={14} /> {eyebrow ?? product.title}</p>
          <h1>{heading ?? product.headline}</h1>
          <p className="au-lede">{product.lede}</p>
          <div className="au-hero-actions">
            <a className={buttonClass()} href={whatsappLink(`Hi Foundly, I’d like to discuss ${product.title} for ${sector.label.toLowerCase()}.`)}>Discuss your project <Icon name="arrow" size={16} /></a>
            <ScrollLink className={buttonClass("secondary")} target="industry">See a live demo</ScrollLink>
          </div>
          <ul className="au-hero-points">
            <li><Icon name="check" size={14} /> {product.price}</li>
            <li><Icon name="check" size={14} /> 100% custom built</li>
            <li><Icon name="check" size={14} /> <Link href={backHref}>{backLabel}</Link></li>
          </ul>
        </div>
        {demo && <SoftwareShowcase key={`sx-${product.id}-${sector.id}`} variant={product.id === "app" ? "phone" : "desktop"} demo={demo} features={guide.features.map(([name]) => name)} />}
      </section>

      <Card className="space-y-5" id="industry">
        <div>
          <h2 className="font-semibold">Choose your industry</h2>
          <p className="mt-1 text-sm text-muted">Each one has its own features, workflow and demo.</p>
        </div>
        <nav aria-label="Industries" className="au-depts">
          {SECTORS.map(({ id, label }) => (
            <LinkButton key={id} href={`${basePath}/${product.id}?sector=${id}#industry`} variant={id === sector.id ? "primary" : "secondary"} aria-current={id === sector.id ? "page" : undefined} scroll={false}>
              <Icon name={SECTOR_ICONS[id]} size={15} /> {label}
            </LinkButton>
          ))}
        </nav>
        <div className="border-t border-border pt-5">
          <h2 className="text-xl font-semibold">{guide.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{guide.outcome}</p>
        </div>
      </Card>
      {demo && (
        <SoftwareDemo
          key={`${product.id}-${sector.id}`}
          title={product.title}
          demo={demo}
          features={guide.features.map(([name, description]) => ({ name, description }))}
          workflow={guide.workflow}
          variant={product.id === "app" ? "phone" : "desktop"}
        />
      )}
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <Card key={sector.id}>
          <h2 className="text-lg font-semibold">Explore the features</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Open any feature to see how it works.</p>
          {guide.features.map(([name, description]) => (
            <details key={name} name="software-feature" className="group border-t border-border py-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded px-2 text-sm font-semibold hover:bg-surface-2">
                {name}<Icon name="down" size={16} className="shrink-0 group-open:rotate-180" />
              </summary>
              <p className="px-2 pt-1 pb-3 text-sm leading-relaxed text-muted">{description}</p>
            </details>
          ))}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Example workflow</h2>
          <ol className="mt-4 space-y-3">
            {guide.workflow.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm leading-relaxed">
                <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-semibold">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-5 border-t border-border pt-5">
            <p className="font-semibold">{product.price}</p>
            <p className="mt-1 mb-3 text-sm text-muted">We’ll scope your project around the features and integrations your team needs.</p>
            <a className={buttonClass()} href={whatsappLink(`Hi Foundly, I’d like to discuss ${product.title} for ${sector.label.toLowerCase()}.`)}>Discuss this project <Icon name="arrow" size={16} /></a>
          </div>
        </Card>
      </div>
    </>
  );
}
