import type { Metadata } from "next";
import Link from "next/link";
import { Brand, Icon } from "@/components/icon";
import { Card, Notice } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <main id="main" className="login-page">
      <Link href="/" className="login-brand">
        <Brand />
      </Link>
      <Card className="login-card">
        <h2 className="text-xl font-medium tracking-tight">
          Sign in to Growth Platform
        </h2>
        <p className="mt-1 mb-6 text-muted">
          No password needed. We&apos;ll email you a secure link.
        </p>
        {error === "no_workspace" && (
          <div className="mb-4">
            <Notice tone="err">
              Your account has no workspace. Contact support so we can restore
              access.
            </Notice>
          </div>
        )}
        <LoginForm next={next} />
        <p className="login-security">
          <Icon name="shield" size={15} />
          Secure sign-in. No password to remember.
        </p>
      </Card>
    </main>
  );
}
