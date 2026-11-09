import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { buttonClass, Card, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireAdminPage } from "@/lib/admin-guard";
import { adminGetProject } from "@/server/portfolio";
import { deleteMediaAction, deleteProjectAction, makeCoverAction } from "../../../portfolio-actions";
import { ProjectForm } from "../project-form";

export const metadata = { title: "Edit portfolio project" };

const field = "min-h-11 rounded-lg border border-border bg-surface px-3 py-2";

export default async function EditPortfolioProject({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; added?: string; upload?: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await adminGetProject(await getDb(), id);
  if (!data) notFound();
  const { project: p, media } = data;
  return (
    <>
      <PageHeader
        icon="reports"
        title={p.name}
        description={`${p.published ? "Published" : "Hidden"} · /work/${p.slug}`}
        actions={
          <>
            <Link href="/admin/portfolio" className="text-sm font-semibold underline">Back to portfolio</Link>
            {p.published && <LinkButton href={`/work/${p.slug}`} variant="secondary" target="_blank">View public page</LinkButton>}
          </>
        }
      />
      <div className="space-y-4">
        {sp.saved && <Notice tone="ok">Project created. Add screenshots below, then publish it when it&apos;s ready.</Notice>}
        <Card>
          <ProjectForm project={p} />
        </Card>

        <Card>
          <h2 className="font-semibold">Screenshots</h2>
          <p className="mt-1 text-sm text-muted">The first screenshot is the thumbnail on /work. PNG, JPEG or WebP, up to 2.5 MB each.</p>
          {sp.added && <div className="mt-3"><Notice tone="ok">{sp.added} screenshot{sp.added === "1" ? "" : "s"} added.</Notice></div>}
          {sp.upload && <div className="mt-3"><Notice tone="err">{sp.upload}</Notice></div>}
          {media.length > 0 && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((m, i) => (
                <li key={m.id} className="overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- served from our own database route */}
                  <img src={`/work/media/${m.id}`} alt={m.caption ?? `Screenshot ${i + 1}`} className="aspect-video w-full bg-surface-2 object-cover" />
                  <div className="space-y-2 p-3 text-sm">
                    <p className="font-medium">{i === 0 ? "Thumbnail · " : ""}{m.caption ?? "No caption"}</p>
                    <div className="flex flex-wrap gap-2">
                      {i > 0 && (
                        <ActionForm action={makeCoverAction} submitLabel="Make thumbnail" variant="secondary" inline>
                          <input type="hidden" name="mediaId" value={m.id} />
                          <input type="hidden" name="projectId" value={p.id} />
                        </ActionForm>
                      )}
                      <ActionForm action={deleteMediaAction} submitLabel="Remove" variant="secondary" inline>
                        <input type="hidden" name="mediaId" value={m.id} />
                        <input type="hidden" name="projectId" value={p.id} />
                      </ActionForm>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form action="/admin/portfolio-upload" method="post" encType="multipart/form-data" className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <input type="hidden" name="projectId" value={p.id} />
            <label className="text-sm font-semibold">Images
              <input type="file" name="files" accept="image/png,image/jpeg,image/webp" multiple required className="mt-1 block text-sm" />
            </label>
            <input name="caption" placeholder="Caption (optional)" aria-label="Caption" className={`${field} min-w-56 flex-1`} />
            <button type="submit" className={buttonClass()}>Upload</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-semibold">Delete project</h2>
          <p className="mt-1 text-sm text-muted">Removes it and its screenshots. To take it off /work temporarily, untick Published instead.</p>
          <div className="mt-3">
            <ActionForm action={deleteProjectAction} submitLabel="Delete project" variant="secondary" inline>
              <input type="hidden" name="id" value={p.id} />
              <input name="confirm" aria-label="Type delete to confirm" placeholder="Type delete to confirm" className={field} />
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
