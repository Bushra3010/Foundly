import type { Metadata } from "next";
import Link from "next/link";
import { Card, Notice } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-lg font-bold">
        Growth Platform
      </Link>
      <Card>
        <h1 className="text-2xl font-bold">Sign in or create an account</h1>
        <p className="mt-1 mb-6 text-muted">No password needed. We&apos;ll email you a secure link.</p>
        {error === "no_workspace" && (
          <div className="mb-4">
            <Notice tone="err">Your account has no workspace. Contact support so we can restore access.</Notice>
          </div>
        )}
        <LoginForm />
      </Card>
    </main>
  );
}
