import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { Card, Notice } from "@/components/ui";
import { formatInr, planPrice, planSpec, PLANS } from "@/lib/plans";
import { completeTestCheckout } from "./actions";

export const metadata = { title: "Test checkout", robots: { index: false } };

export default async function TestCheckout({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { plan = "" } = await searchParams;
  if (!PLANS.some((p) => p.key === plan && p.key !== "free")) notFound();
  const spec = planSpec(plan as (typeof PLANS)[number]["key"]);
  const price = planPrice(spec);
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <Notice tone="demo" title="Test mode — no money is charged">
          This page stands in for the payment provider&apos;s hosted checkout so the billing flow can be tried locally.
        </Notice>
        <h1 className="mt-4 text-2xl font-bold">{spec.name} plan</h1>
        <p className="mt-1 text-muted">{price ? `${formatInr(price)} per month` : "Price not set yet"}</p>
        <form action={completeTestCheckout} className="mt-6 space-y-3">
          <input type="hidden" name="plan" value={spec.key} />
          <SubmitButton name="outcome" value="success">Simulate successful payment</SubmitButton>
          <SubmitButton name="outcome" value="fail" variant="secondary">Simulate failed payment</SubmitButton>
        </form>
      </Card>
    </main>
  );
}
