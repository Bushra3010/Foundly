import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { SoftwareProductGuide } from "@/components/software-product-guide";
import { getProduct, getSector } from "@/lib/software-catalog";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/software-demo.css";
import "@/app/automation.css";

type PageProps = {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ sector?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProduct((await params).product);
  if (!product) notFound();
  return {
    title: `${product.title} development`,
    description: `${product.summary} Explore features and workflows for manufacturing, hospitals and universities.`,
    alternates: { canonical: `/software/${product.id}` },
  };
}

export default async function PublicSoftwareProductPage({ params, searchParams }: PageProps) {
  const product = getProduct((await params).product);
  if (!product) notFound();

  const { sector: sectorParam } = await searchParams;
  const sector = getSector(typeof sectorParam === "string" ? sectorParam : undefined);

  return (
    <div className="foundly-landing">
      <LandingHeader />
      <main id="main" className="landing-main public-software-guide automation-page">
        <SoftwareProductGuide
          product={product}
          sector={sector}
          basePath="/software"
          backHref="/services#custom-development"
          backLabel="View all software services"
        />
      </main>
      <LandingFooter />
    </div>
  );
}
