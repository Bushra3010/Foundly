import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { requireCurrentBusiness } from "@/server/current";
import { getBrandProfile } from "@/server/profile-ai";
import { refreshProfileAction } from "./actions";
import "../overview.css";

export const metadata = { title: "Brand profile" };

export default async function BrandProfilePage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const [business, profile] = await Promise.all([requireCurrentBusiness(db, ctx), getBrandProfile(db, ctx)]);
  const max = Math.max(1, ...(profile?.data.attributes.map((a) => a.strength) ?? [1]));

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Brand profile</span>
          <h1>How AI describes {business.name}</h1>
          <p>The words AI assistants attach to you, and the objections they raise, read from the answers that name you.</p>
        </div>
        <div className="dash-hero-actions">
          <ActionForm action={refreshProfileAction} submitLabel={profile ? "Refresh" : "Build my profile"} pendingLabel="Reading answers…" variant="secondary" className="" />
        </div>
      </header>

      {!profile ? (
        <section className="dash-panel ov-empty">
          <Icon name="spark" size={34} />
          <h2>Not built yet</h2>
          <p>Once AI answers name your business, press <strong>Build my profile</strong> to see how they describe you. It takes about a minute.</p>
        </section>
      ) : (
        <>
          <p className="ov-note">
            Built {profile.generatedAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} from {profile.fromAnswers} answer{profile.fromAnswers === 1 ? "" : "s"} that name you. Getting mentioned is half the story; this is the other half.
          </p>
          <section className="dash-panel ov-panel" aria-labelledby="bp-sum">
            <h2 id="bp-sum">In short</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, marginTop: 10 }}>{profile.data.summary}</p>
          </section>
          <div className="ov-two">
            <section className="dash-panel ov-panel" aria-labelledby="bp-attr">
              <h2 id="bp-attr">What AI says you are</h2>
              <p className="ov-sub">Attributes by how many answers support them</p>
              <ul className="ov-bars">
                {profile.data.attributes.map((a) => (
                  <li key={a.term}>
                    <div className="ov-bar-top">
                      <span>{a.term}</span>
                      <span>{a.strength} answer{a.strength === 1 ? "" : "s"}</span>
                    </div>
                    <div className="ov-bar" role="presentation"><span style={{ width: `${Math.round((a.strength / max) * 100)}%` }} /></div>
                    {a.evidence && <p className="ov-q">“{a.evidence}”</p>}
                  </li>
                ))}
              </ul>
            </section>
            <section className="dash-panel ov-panel" aria-labelledby="bp-obj">
              <h2 id="bp-obj">Objections AI raises</h2>
              <p className="ov-sub">Caveats customers hear before they call you</p>
              {profile.data.objections.length === 0 ? (
                <p className="ov-sub" style={{ marginTop: 12 }}>None found in the answers so far.</p>
              ) : (
                <ul className="ov-list">
                  {profile.data.objections.map((o) => (
                    <li key={o.text}>
                      <span>
                        <strong>{o.text}</strong>
                        {o.evidence && <span className="ov-q">“{o.evidence}”</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <p className="ov-sub">
            To change the story, change the sources: <Link href="/app/sources" className="underline">see which sites AI reads</Link> and <Link href="/app/improve" className="underline">the fixes we suggest</Link>.
          </p>
        </>
      )}
    </div>
  );
}
