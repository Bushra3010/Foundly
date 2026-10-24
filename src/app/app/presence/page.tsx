import Link from "next/link";
import { cookies } from "next/headers";
import { Icon } from "@/components/icon";
import { AddListingForm, CandidatePicker, CopyField, SyncCard } from "@/components/presence-kit";
import { getGoogleConnection } from "@/server/google-business";
import { getFacebookConnection } from "@/server/facebook-page";
import { SocialConnect } from "@/components/social-connect";
import { socialStatus } from "@/server/performance";
import { isPlatformAdmin } from "@/lib/admin";
import { decodeCandidates, providerConfigured, providerEnvNames, type Provider } from "@/server/connect";
import { Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { listingStatus } from "@/lib/geo";
import { presenceKit } from "@/lib/presence";
import { toPublicProfile } from "@/lib/profile";
import { currentProfile, requireCurrentBusiness } from "@/server/current";

export const metadata = { title: "Social media" };

/**
 * The presence agent. It prepares every listing (same facts, each platform's
 * limits, deep links, progress) and leaves the owner only the steps platforms
 * require a human for: signing in, verification codes and the final click.
 */
const CONNECT_MESSAGES: Record<string, { tone: "ok" | "warn" | "err" | "info"; text: string }> = {
  linked: { tone: "ok", text: "Linked. It now appears on your website and profile, and search engines have been told." },
  none: { tone: "warn", text: "That account doesn't manage any listings yet. Create one with the steps below, or log in with the account that owns it." },
  denied: { tone: "info", text: "No problem, nothing was connected. You can paste the link instead." },
  failed: { tone: "err", text: "We couldn't read your listings from that account right now. Paste the link instead, or try again later." },
  invalid: { tone: "err", text: "That connection attempt expired. Start again from the Connect button." },
  unavailable: { tone: "info", text: "Connecting isn't switched on yet. Paste the link instead." },
};

/** Which platforms get a Connect button, and through which login. */
const CONNECT_VIA: Partial<Record<string, Provider>> = { google: "google", facebook: "facebook", instagram: "facebook" };

export default async function PresencePage({ searchParams }: { searchParams: Promise<{ connect?: string }> }) {
  const { connect } = await searchParams;
  const ctx = await requireCtx();
  const db = await getDb();
  const b = await requireCurrentBusiness(db, ctx);
  const [profile, google, facebook] = await Promise.all([currentProfile(db, ctx), getGoogleConnection(db, ctx), getFacebookConnection(db, ctx)]);
  const social = await socialStatus(db, ctx, b);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const websiteUrl = b.websiteUrl ?? `${appUrl}/b/${profile?.slug ?? ""}`;
  const p = toPublicProfile(b);
  const kit = presenceKit({ ...p, description: p.description, websiteUrl, profileUrl: `${appUrl}/b/${profile?.slug ?? ""}` });
  const status = listingStatus(b.listings);
  const done = status.filter((s) => s.url).length;
  const next = status.find((s) => !s.url);
  const candidates = connect === "google" || connect === "facebook" ? decodeCandidates((await cookies()).get("foundly_connect")?.value) : null;
  const message = connect && CONNECT_MESSAGES[connect];
  const admin = isPlatformAdmin(ctx.user.email);

  return (
    <>
      <PageHeader
        icon="presence"
        title="Social media"
        description="Connect your pages so AI assistants see your business in more places with the same details."
      />
      <section className="dash-panel mb-6">
        <SocialConnect social={social} oneClick={{ google: providerConfigured("google"), facebook: providerConfigured("facebook") }} />
        {(google || facebook) && (
          <div className="mt-4 grid gap-3">
            {google && <SyncCard provider="google" connection={{ status: google.status, lastError: google.lastError, lastSyncedAt: google.lastSyncedAt?.toISOString() ?? null }} />}
            {facebook && <SyncCard provider="facebook" connection={{ status: facebook.status, lastError: facebook.lastError, lastSyncedAt: facebook.lastSyncedAt?.toISOString() ?? null }} />}
          </div>
        )}
      </section>
      <details className="kit-more">
        <summary>
          <strong>Get listed in more places (optional)</strong>
          <span>{done} of {status.length} listings linked · Justdial, Bing Places, YouTube and more, with the text written for you</span>
        </summary>
      <div className="kit-progress">
        <div className="kit-progress-bar" aria-hidden="true"><span style={{ width: `${(done / status.length) * 100}%` }} /></div>
        <p>
          <strong>{done} of {status.length}</strong> listings linked.{" "}
          {next ? <>Next: <a href={`#${next.key}`} className="underline">{next.label}</a>.</> : "All done. Keep them updated when your details change."}
        </p>
      </div>
      {message && (
        <div className="mb-5">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}
      {candidates && candidates.length > 0 && <CandidatePicker candidates={candidates} label={connect === "google" ? "Google" : "Facebook"} />}
      {!b.websiteUrl && (
        <div className="mb-5">
          <Notice tone="warn" title="Listings link to your Foundly profile for now">
            Once your website is connected, listings link to it so AI assistants can read your full details there. <Link href="/app/website" className="font-semibold underline">Go to My Website</Link>.
          </Notice>
        </div>
      )}
      <ol className="kit-list">
        {kit.map((platform, i) => {
          const linked = status.find((s) => s.key === platform.key)?.url ?? null;
          return (
            <li key={platform.key} id={platform.key} className={`kit-card${linked ? " done" : ""}`}>
              <details open={!linked && next?.key === platform.key}>
                <summary>
                  <span className="kit-num" aria-hidden="true">{linked ? <Icon name="check" size={14} /> : i + 1}</span>
                  <span className="kit-title">
                    <strong>{platform.label}</strong>
                    <span>{linked ? "Linked" : platform.why}</span>
                  </span>
                  <span className="kit-toggle" aria-hidden="true"><Icon name="down" size={16} /></span>
                </summary>
                <div className="kit-body">
                  {platform.key === "google" && google && (
                    <SyncCard provider="google" connection={{ status: google.status, lastError: google.lastError, lastSyncedAt: google.lastSyncedAt?.toISOString() ?? null }} />
                  )}
                  {platform.key === "facebook" && facebook && (
                    <SyncCard provider="facebook" connection={{ status: facebook.status, lastError: facebook.lastError, lastSyncedAt: facebook.lastSyncedAt?.toISOString() ?? null }} />
                  )}
                  <div className="kit-actions">
                    {linked ? (
                      <a href={linked} target="_blank" rel="noopener noreferrer" className="share-btn">Open your listing</a>
                    ) : (
                      <>
                        {CONNECT_VIA[platform.key] && providerConfigured(CONNECT_VIA[platform.key]!) && (
                          <a href={`/api/connect/${CONNECT_VIA[platform.key]}/start`} className="share-btn kit-create">
                            Already have it? Connect with {CONNECT_VIA[platform.key] === "google" ? "Google" : "Facebook"} <Icon name="arrow" size={14} />
                          </a>
                        )}
                        <a href={platform.create} target="_blank" rel="noopener noreferrer" className={`share-btn${CONNECT_VIA[platform.key] && providerConfigured(CONNECT_VIA[platform.key]!) ? "" : " kit-create"}`}>
                          Create on {platform.label} <Icon name="arrow" size={14} />
                        </a>
                        {CONNECT_VIA[platform.key] && !providerConfigured(CONNECT_VIA[platform.key]!) && admin && (
                          <span className="kit-hint">Admin: set {providerEnvNames(CONNECT_VIA[platform.key]!).join(" and ")} to enable one-click connect.</span>
                        )}
                      </>
                    )}
                  </div>
                  <ol className="kit-steps">
                    {platform.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                  <div className="kit-fields">
                    {platform.fields.map((f) => <CopyField key={f.label} field={f} />)}
                  </div>
                  {!linked && <AddListingForm platform={platform.label} />}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      </details>
      <p className="admin-footnote">
        Foundly never signs in to these sites or creates accounts for you: their rules forbid it and listings made that way get removed. Verification codes and the final click are yours; everything else is prepared.
      </p>
    </>
  );
}
