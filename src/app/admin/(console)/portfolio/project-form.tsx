import { ActionForm } from "@/components/action-form";
import { DEMO_STATUS_TEXT, PORTFOLIO_CATEGORIES } from "@/server/portfolio";
import type { portfolioProjects } from "@/db/schema";
import { saveProjectAction } from "../../portfolio-actions";

type Project = typeof portfolioProjects.$inferSelect;

const field = "min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2";
const label = "block text-sm font-semibold";
const hint = "mt-1 block text-xs font-normal text-muted";

export function ProjectForm({ project }: { project?: Project }) {
  const p = project;
  return (
    <ActionForm action={saveProjectAction} submitLabel={p ? "Save changes" : "Create project"} className="grid gap-4 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className={label}>Project name
        <input name="name" required defaultValue={p?.name} className={`${field} mt-1`} placeholder="AC service platform" />
      </label>
      <label className={label}>URL name (slug)
        <input name="slug" required defaultValue={p?.slug} className={`${field} mt-1`} placeholder="pushpak-ac-service" />
        <span className={hint}>Page address: /work/<b>slug</b></span>
      </label>
      <label className={label}>Client name (private)
        <input name="clientName" defaultValue={p?.clientName ?? ""} className={`${field} mt-1`} />
        <span className={hint}>Only shown publicly when the box below is ticked.</span>
      </label>
      <label className={label}>Public client description
        <input name="clientLabel" required defaultValue={p?.clientLabel} className={`${field} mt-1`} placeholder="AC service company · New Delhi" />
        <span className={hint}>Shown instead of the name until the client agrees.</span>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input type="checkbox" name="showClient" defaultChecked={p?.showClient} className="size-4" /> Client agreed to be named publicly
      </label>
      <label className={label}>Category
        <select name="category" defaultValue={p?.category ?? PORTFOLIO_CATEGORIES[0]} className={`${field} mt-1`}>
          {PORTFOLIO_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className={label}>Industry
        <input name="industry" defaultValue={p?.industry ?? ""} className={`${field} mt-1`} placeholder="Home services" />
      </label>
      <label className={`${label} sm:col-span-2`}>Short description
        <textarea name="summary" required rows={3} defaultValue={p?.summary} className={`${field} mt-1`} />
      </label>
      <label className={`${label} sm:col-span-2`}>Details / main workflow
        <textarea name="description" rows={3} defaultValue={p?.description ?? ""} className={`${field} mt-1`} />
      </label>
      <label className={label}>Key features
        <textarea name="features" rows={6} defaultValue={p?.features.join("\n")} className={`${field} mt-1`} />
        <span className={hint}>One per line.</span>
      </label>
      <div className="space-y-4">
        <label className={label}>Technology stack
          <input name="techStack" defaultValue={p?.techStack.join(", ")} className={`${field} mt-1`} placeholder="Next.js, Supabase, Tailwind" />
          <span className={hint}>Comma separated.</span>
        </label>
        <label className={label}>Order on /work
          <input name="sortOrder" type="number" min={0} max={10000} defaultValue={p?.sortOrder ?? 100} className={`${field} mt-1`} />
          <span className={hint}>Lower numbers come first.</span>
        </label>
      </div>
      <fieldset className="space-y-4 rounded-lg border border-border p-4 sm:col-span-2">
        <legend className="px-1 text-sm font-semibold">Live demo</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>Demo address
            <input name="demoUrl" defaultValue={p?.demoUrl ?? ""} className={`${field} mt-1`} placeholder="/demos/pushpak" />
            <span className={hint}>/demos/&lt;project&gt; for demos built into this site, or the address of a separate demo copy — never the client&apos;s live app.</span>
          </label>
          <label className={label}>Demo status
            <select name="demoStatus" defaultValue={p?.demoStatus ?? "none"} className={`${field} mt-1`}>
              {Object.entries(DEMO_STATUS_TEXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <span className={hint}>Mark &ldquo;Live demo&rdquo; only after the demo passes its checks.</span>
          </label>
        </div>
        <label className={label}>Demo logins
          <textarea name="demoLogins" rows={3} defaultValue={p?.demoLogins.map((l) => [l.role, l.login, l.secret].filter(Boolean).join(" | ")).join("\n")} className={`${field} mt-1`} placeholder={"Admin | admin@demo.in | demo1234\nCustomer | 9876543210 | OTP 1234"} />
          <span className={hint}>One per line: role | login | password. Demo accounts only — shown publicly while the demo is live.</span>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="embeddable" defaultChecked={p?.embeddable} className="size-4" /> Show the demo inside the project page (the demo must allow being embedded)
        </label>
      </fieldset>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input type="checkbox" name="published" defaultChecked={p?.published} className="size-4" /> Published on /work
      </label>
    </ActionForm>
  );
}
