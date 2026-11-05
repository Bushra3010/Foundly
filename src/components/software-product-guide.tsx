import { Icon } from "@/components/icon";
import { buttonClass, Card, LinkButton, PageHeader } from "@/components/ui";
import { SoftwareDemo } from "@/components/software-demo";
import { getProduct, PRODUCTS, SECTORS, type Sector } from "@/lib/software-catalog";
import { getDemo } from "@/lib/software-demo";
import { whatsappLink } from "@/lib/site-schema";

type Props = {
  product: NonNullable<ReturnType<typeof getProduct>>;
  sector: { id: Sector; label: string };
  basePath: string;
  backHref: string;
  backLabel: string;
};

export function SoftwareProductGuide({ product, sector, basePath, backHref, backLabel }: Props) {
  const guide = product.sectors[sector.id];
  const demo = getDemo(product.id, sector.id);

  return (
    <>
      <PageHeader
        title={product.title}
        icon={product.icon}
        description={product.summary}
        actions={<LinkButton href={backHref} variant="secondary">{backLabel}</LinkButton>}
      />
      <nav aria-label="Software products" className="mb-6 flex flex-wrap gap-2">
        {PRODUCTS.map(({ id, title }) => (
          <LinkButton key={id} href={`${basePath}/${id}?sector=${sector.id}`} variant={id === product.id ? "primary" : "secondary"} aria-current={id === product.id ? "page" : undefined}>{title}</LinkButton>
        ))}
      </nav>
      <Card className="space-y-5">
        <div>
          <h2 className="font-semibold">Choose your industry</h2>
          <p className="mt-1 text-sm text-muted">See features and workflows relevant to your team.</p>
        </div>
        <nav aria-label="Industries" className="flex flex-wrap gap-2">
          {SECTORS.map(({ id, label }) => (
            <LinkButton key={id} href={`${basePath}/${product.id}?sector=${id}`} variant={id === sector.id ? "primary" : "secondary"} aria-current={id === sector.id ? "page" : undefined} scroll={false}>{label}</LinkButton>
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
