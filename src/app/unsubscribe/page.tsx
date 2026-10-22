import { Card } from "@/components/ui";
import { getDb } from "@/db";
import { setPrefs, verifyUnsubscribe, type PrefKind } from "@/server/notifications";

export const metadata = { title: "Unsubscribe", robots: { index: false } };

const LABEL: Record<PrefKind, string> = { weeklySummary: "weekly summary emails", leadAlerts: "new enquiry alerts" };

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ u?: string; w?: string; k?: string; t?: string }> }) {
  const { u = "", w = "", k = "", t = "" } = await searchParams;
  const kind = k === "weeklySummary" || k === "leadAlerts" ? k : null;
  const ok = !!kind && /^[0-9a-f-]{36}$/.test(u) && /^[0-9a-f-]{36}$/.test(w) && /^[0-9a-f]{64}$/.test(t) && verifyUnsubscribe(u, w, kind, t);
  if (ok) await setPrefs(await getDb(), { userId: u, workspaceId: w }, { [kind!]: false });
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold">{ok ? "You're unsubscribed" : "This link isn't valid"}</h1>
        <p className="mt-2 text-muted">
          {ok ? `You won't receive ${LABEL[kind!]} any more. Security and billing messages are still sent.` : "Change your email preferences in Settings instead."}
        </p>
      </Card>
    </main>
  );
}
