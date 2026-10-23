import Link from "next/link";
import { Icon } from "@/components/icon";
import { AddListingForm, CopyField } from "@/components/presence-kit";
import { Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { listingStatus } from "@/lib/geo";
import { presenceKit } from "@/lib/presence";
import { toPublicProfile } from "@/lib/profile";
import { siteUrl } from "@/app/s/load";
import { getProfile, requireBusiness } from "@/server/business";
import { getSite } from "@/server/sites";

export const metadata = { title: "Get listed" };

/**
 * The presence agent. It prepares every listing (same facts, each platform's
 * limits, deep links, progress) and leaves the owner only the steps platforms
 * require a human for: signing in, verification codes and the final click.
 */
export default async function PresencePage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const b = await requireBusiness(db, ctx);
  const [site, profile] = await Promise.all([getSite(db, ctx), getProfile(db, ctx)]);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const live = Boolean(site?.publishedVersionId);
  const websiteUrl = live && site ? siteUrl(site.slug) : (b.websiteUrl ?? `${appUrl}/b/${profile?.slug ?? ""}`);
  const p = toPublicProfile(b);
  const kit = presenceKit({ ...p, description: p.description, websiteUrl, profileUrl: `${appUrl}/b/${profile?.slug ?? ""}` });
  const status = listingStatus(b.listings);
  const done = status.filter((s) => s.url).length;
  const next = status.find((s) => !s.url);

  return (
    <>
      <PageHeader
        icon="presence"
        title="Get listed where AI looks"
        description="AI assistants recommend businesses they find in several places with the same details. Everything below is written from your confirmed facts and cut to each platform's limits. Create the listing, paste the text, then paste the link back here."
      />
      <div className="kit-progress">
        <div className="kit-progress-bar" aria-hidden="true"><span style={{ width: `${(done / status.length) * 100}%` }} /></div>
        <p>
          <strong>{done} of {status.length}</strong> listings linked.{" "}
          {next ? <>Next: <a href={`#${next.key}`} className="underline">{next.label}</a>.</> : "All done. Keep them updated when your details change."}
        </p>
      </div>
      {!live && (
        <div className="mb-5">
          <Notice tone="warn" title="Publish your website first">
            Listings should link to your website so AI assistants can read your full details there. <Link href="/app/website" className="font-semibold underline">Go to My Website</Link>.
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
                  <div className="kit-actions">
                    {linked ? (
                      <a href={linked} target="_blank" rel="noopener noreferrer" className="share-btn">Open your listing</a>
                    ) : (
                      <a href={platform.create} target="_blank" rel="noopener noreferrer" className="share-btn kit-create">
                        Create on {platform.label} <Icon name="arrow" size={14} />
                      </a>
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
      <p className="admin-footnote">
        Foundly never signs in to these sites or creates accounts for you: their rules forbid it and listings made that way get removed. Verification codes and the final click are yours; everything else is prepared.
      </p>
    </>
  );
}
