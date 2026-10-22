import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = { title: "Confirm sign in", robots: { index: false } };

// The token is consumed by an explicit POST so email link scanners can't use it up.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold">Confirm sign in</h1>
        <p className="mt-1 mb-6 text-muted">Select Continue to finish signing in on this device.</p>
        <VerifyForm token={token} />
      </Card>
    </main>
  );
}
