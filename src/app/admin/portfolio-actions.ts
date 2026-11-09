"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/server/admin";
import { createProject, deleteMedia, deleteProject, makeCover, PORTFOLIO_CATEGORIES, updateProject, type ProjectInput } from "@/server/portfolio";

async function admin() {
  return requireAdmin(await getCurrentUser());
}

function refresh(id?: string) {
  revalidatePath("/admin/portfolio");
  if (id) revalidatePath(`/admin/portfolio/${id}`);
  revalidatePath("/work", "layout");
}

const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

const projectSchema = z.object({
  name: z.string().trim().min(2, "Enter the project name").max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens").max(80),
  clientName: z.string().trim().max(120),
  showClient: z.boolean(),
  clientLabel: z.string().trim().min(2, "Describe the client, e.g. “AC service company · New Delhi”").max(120),
  category: z.enum(PORTFOLIO_CATEGORIES, "Choose a category"),
  industry: z.string().trim().max(80),
  summary: z.string().trim().min(20, "Write at least a sentence").max(600),
  description: z.string().trim().max(3000),
  features: z.array(z.string().max(200)).max(12),
  techStack: z.array(z.string().max(40)).max(12),
  demoUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Enter the full demo address, starting with https://"),
  demoLogins: z.array(z.object({ role: z.string().max(60), login: z.string().max(120), secret: z.string().max(120).optional() })).max(8),
  demoStatus: z.enum(["none", "coming_soon", "live", "maintenance"]),
  embeddable: z.boolean(),
  published: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

function parse(form: FormData) {
  const s = (k: string) => String(form.get(k) ?? "");
  return projectSchema.safeParse({
    name: s("name"),
    slug: s("slug"),
    clientName: s("clientName"),
    showClient: form.get("showClient") === "on",
    clientLabel: s("clientLabel"),
    category: s("category"),
    industry: s("industry"),
    summary: s("summary"),
    description: s("description"),
    features: lines(s("features")),
    techStack: s("techStack").split(",").map((t) => t.trim()).filter(Boolean),
    demoUrl: s("demoUrl"),
    demoLogins: lines(s("demoLogins")).map((l) => {
      const [role = "", login = "", secret] = l.split("|").map((p) => p.trim());
      return { role, login, ...(secret ? { secret } : {}) };
    }),
    demoStatus: s("demoStatus") || "none",
    embeddable: form.get("embeddable") === "on",
    published: form.get("published") === "on",
    sortOrder: s("sortOrder") || "100",
  });
}

export async function saveProjectAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = parse(form);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first ? `${String(first.path[0] ?? "Form")}: ${first.message}` : "Check the form.", values };
  }
  const d = parsed.data;
  if (d.demoStatus === "live" && !d.demoUrl) return { ok: false, message: "Add the demo address before marking the demo as live.", values };
  const input: ProjectInput = {
    ...d,
    clientName: d.clientName || null,
    industry: d.industry || null,
    description: d.description || null,
    demoUrl: d.demoUrl || null,
  };
  const id = String(form.get("id") ?? "");
  let created: string | null = null;
  try {
    const db = await getDb();
    const who = await admin();
    if (id) await updateProject(db, who, id, input);
    else created = await createProject(db, who, input);
  } catch (err) {
    if (err instanceof Error && /portfolio_projects_slug_unique|duplicate key/i.test(err.message + String((err as { cause?: unknown }).cause ?? ""))) {
      return { ok: false, message: "Another project already uses that URL name (slug).", values };
    }
    return toActionError(err, values);
  }
  refresh(id || created || undefined);
  if (created) redirect(`/admin/portfolio/${created}?saved=1`);
  return { ok: true, message: d.published ? "Saved. Changes are live on /work." : "Saved. This project is hidden from the public site until you publish it." };
}

export async function quickUpdateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get("id") ?? "");
  const field = String(form.get("field") ?? "");
  try {
    const db = await getDb();
    const who = await admin();
    if (field === "published") await updateProject(db, who, id, { published: form.get("value") === "true" });
    else if (field === "demoStatus") {
      const v = String(form.get("value"));
      if (v !== "none" && v !== "coming_soon" && v !== "live" && v !== "maintenance") return { ok: false, message: "Bad status" };
      await updateProject(db, who, id, { demoStatus: v });
    } else return { ok: false, message: "Nothing to change." };
    refresh(id);
    return { ok: true, message: "Updated." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteProjectAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (form.get("confirm") !== "delete") return { ok: false, message: "Type delete to confirm." };
  try {
    await deleteProject(await getDb(), await admin(), String(form.get("id") ?? ""));
  } catch (err) {
    return toActionError(err);
  }
  refresh();
  redirect("/admin/portfolio?deleted=1");
}

export async function deleteMediaAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await deleteMedia(await getDb(), await admin(), String(form.get("mediaId") ?? ""));
    refresh(String(form.get("projectId") ?? ""));
    return { ok: true, message: "Screenshot removed." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function makeCoverAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await makeCover(await getDb(), await admin(), String(form.get("mediaId") ?? ""));
    refresh(String(form.get("projectId") ?? ""));
    return { ok: true, message: "Set as the thumbnail." };
  } catch (err) {
    return toActionError(err);
  }
}
