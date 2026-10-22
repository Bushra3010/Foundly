"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { Badge, Button, Card, Notice } from "@/components/ui";
import type { Block, SiteContent } from "@/lib/site/content";
import { contrastRatio } from "@/lib/contrast";
import { regenerateBlockAction, saveDraftAction } from "./actions";

type SaveState =
  | { kind: "saved" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "error"; message: string; issues?: { path: string; message: string }[] }
  | { kind: "conflict"; message: string };

const BLOCK_LABEL: Record<Block["type"], string> = {
  hero: "Top banner",
  services: "Services",
  about: "About",
  faq: "Questions and answers",
  gallery: "Photos",
  contact: "Contact",
  text: "Text",
};

const REGENERABLE: Block["type"][] = ["hero", "services", "about", "faq", "contact", "text"];
const AUTOSAVE_MS = 1200;

const input = "block w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base";

export function SiteEditor({ initialDraft, initialRevision, readOnly }: { initialDraft: SiteContent; initialRevision: number; readOnly: boolean }) {
  const [draft, setDraft] = useState(initialDraft);
  const [revision, setRevision] = useState(initialRevision);
  const [save, setSave] = useState<SaveState>({ kind: "saved" });
  const [pageIdx, setPageIdx] = useState(0);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ draft, revision });
  useEffect(() => {
    latest.current = { draft, revision };
  }, [draft, revision]);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const { draft: d, revision: r } = latest.current;
    setSave({ kind: "saving" });
    startTransition(async () => {
      const res = await saveDraftAction(d, r);
      if (res.ok) {
        setRevision(res.revision);
        // Only mark saved if nothing changed while the request was in flight.
        if (latest.current.draft === d) setSave({ kind: "saved" });
        else setSave({ kind: "dirty" });
      } else if (res.conflict) {
        setSave({ kind: "conflict", message: res.message });
      } else {
        setSave({ kind: "error", message: res.message, issues: res.issues });
      }
    });
  }, []);

  useEffect(() => {
    if (save.kind !== "dirty") return;
    timer.current = setTimeout(flush, AUTOSAVE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, save.kind, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save.kind === "dirty" || save.kind === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save.kind]);

  function update(fn: (d: SiteContent) => void) {
    if (readOnly) return;
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setSave((s) => (s.kind === "conflict" ? s : { kind: "dirty" }));
  }

  function updateBlock(blockId: string, fn: (b: Block) => void) {
    update((d) => {
      for (const p of d.pages) for (const b of p.blocks) if (b.id === blockId) fn(b);
    });
  }

  function moveBlock(i: number, dir: -1 | 1) {
    update((d) => {
      const blocks = d.pages[pageIdx].blocks;
      const j = i + dir;
      if (j < 0 || j >= blocks.length) return;
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    });
  }

  function removeBlock(i: number) {
    update((d) => {
      d.pages[pageIdx].blocks.splice(i, 1);
    });
  }

  function addGallery() {
    update((d) => {
      d.pages[pageIdx].blocks.push({ id: `gallery-${Date.now().toString(36)}`, type: "gallery", heading: "Photos", images: [] });
    });
  }

  function regenerate(blockId: string) {
    if (save.kind === "dirty" || save.kind === "saving") {
      setSave({ kind: "error", message: "Wait for your changes to save, then regenerate this section." });
      return;
    }
    setSave({ kind: "saving" });
    startTransition(async () => {
      const res = await regenerateBlockAction(blockId, latest.current.revision);
      if (res.ok) {
        setDraft(res.draft);
        setRevision(res.revision);
        setSave({ kind: "saved" });
      } else {
        setSave(res.conflict ? { kind: "conflict", message: res.message } : { kind: "error", message: res.message });
      }
    });
  }

  const page = draft.pages[pageIdx];
  const heroContrast = contrastRatio("#ffffff", draft.theme.primary);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <p aria-live="polite" className="text-sm">
          {save.kind === "saved" && <Badge tone="ok">Draft saved</Badge>}
          {save.kind === "dirty" && <Badge tone="neutral">Unsaved changes</Badge>}
          {save.kind === "saving" && <Badge tone="info">Saving…</Badge>}
          {save.kind === "error" && <Badge tone="err">Not saved</Badge>}
          {save.kind === "conflict" && <Badge tone="warn">Changed elsewhere</Badge>}
          <span className="ml-2 text-muted">Edits never change your live site until you publish.</span>
        </p>
        {!readOnly && (
          <Button variant="secondary" onClick={flush} disabled={save.kind === "saving" || save.kind === "conflict"}>
            Save now
          </Button>
        )}
      </div>

      {save.kind === "error" && (
        <Notice tone="err" title={save.message}>
          {save.issues && (
            <ul className="list-disc pl-5">
              {save.issues.map((i) => (
                <li key={i.path}>{i.message}</li>
              ))}
            </ul>
          )}
        </Notice>
      )}
      {save.kind === "conflict" && (
        <Notice tone="warn" title={save.message}>
          <Button variant="secondary" className="mt-2" onClick={() => window.location.reload()}>
            Reload latest draft
          </Button>
        </Notice>
      )}
      {readOnly && <Notice tone="info">You have view access. Ask an owner or editor to make changes.</Notice>}

      <Card>
        <h2 className="text-lg font-semibold">Look and search listing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ColorField label="Main colour" value={draft.theme.primary} onChange={(v) => update((d) => void (d.theme.primary = v))} disabled={readOnly} />
          <ColorField label="Button colour" value={draft.theme.accent} onChange={(v) => update((d) => void (d.theme.accent = v))} disabled={readOnly} />
        </div>
        {heroContrast < 4.5 && (
          <div className="mt-3">
            <Notice tone="warn">
              White text on your main colour is hard to read (contrast {heroContrast.toFixed(1)}:1, aim for 4.5:1). Try a
              darker colour.
            </Notice>
          </div>
        )}
        <div className="mt-4 grid gap-4">
          <LabeledInput label="Search result title" max={70} value={draft.seo.title} onChange={(v) => update((d) => void (d.seo.title = v))} disabled={readOnly} />
          <LabeledInput
            label="Search result description"
            max={170}
            multiline
            value={draft.seo.description}
            onChange={(v) => update((d) => void (d.seo.description = v))}
            disabled={readOnly}
          />
        </div>
      </Card>

      <div role="tablist" aria-label="Pages" className="flex flex-wrap gap-2">
        {draft.pages.map((p, i) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={i === pageIdx}
            onClick={() => setPageIdx(i)}
            className={`min-h-11 rounded-lg px-4 font-semibold ${i === pageIdx ? "bg-brand text-brand-contrast" : "border border-border bg-surface"}`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="space-y-4">
        <Card>
          <LabeledInput label="Page name in menu" max={60} value={page.title} onChange={(v) => update((d) => void (d.pages[pageIdx].title = v))} disabled={readOnly} />
        </Card>
        {page.blocks.map((block, i) => (
          <Card key={block.id}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{BLOCK_LABEL[block.type]}</h3>
              {!readOnly && (
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" onClick={() => moveBlock(i, -1)} disabled={i === 0} aria-label={`Move ${BLOCK_LABEL[block.type]} up`}>
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => moveBlock(i, 1)}
                    disabled={i === page.blocks.length - 1}
                    aria-label={`Move ${BLOCK_LABEL[block.type]} down`}
                  >
                    ↓
                  </Button>
                  {REGENERABLE.includes(block.type) && (
                    <Button variant="ghost" onClick={() => regenerate(block.id)}>
                      Rewrite from my details
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => removeBlock(i)}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <BlockFields block={block} onChange={(fn) => updateBlock(block.id, fn)} disabled={readOnly} />
          </Card>
        ))}
        {!readOnly && (
          <Button variant="secondary" onClick={addGallery}>
            + Add photos section
          </Button>
        )}
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  max,
  multiline,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex justify-between text-sm font-semibold">
        <span>{label}</span>
        {max && (
          <span className={`font-normal ${value.length > max ? "text-err-fg" : "text-muted"}`}>
            {value.length}/{max}
          </span>
        )}
      </label>
      {multiline ? (
        <textarea id={id} className={input} rows={4} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
      ) : (
        <input id={id} className={input} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="h-11 w-14 cursor-pointer rounded border border-border" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="text-sm text-muted">{value}</span>
      </span>
    </label>
  );
}

function BlockFields({ block, onChange, disabled }: { block: Block; onChange: (fn: (b: Block) => void) => void; disabled: boolean }) {
  const set = <T extends Block>(fn: (b: T) => void) => onChange((b) => fn(b as T));
  switch (block.type) {
    case "hero":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          <LabeledInput label="Text under heading" max={300} multiline value={block.subheading} onChange={(v) => set<typeof block>((b) => void (b.subheading = v))} disabled={disabled} />
          <LabeledInput label="Button text" max={40} value={block.ctaLabel} onChange={(v) => set<typeof block>((b) => void (b.ctaLabel = v))} disabled={disabled} />
        </div>
      );
    case "text":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          <LabeledInput label="Text" max={8000} multiline value={block.body} onChange={(v) => set<typeof block>((b) => void (b.body = v))} disabled={disabled} />
          <p className="text-sm text-muted">This is a starting draft. Check that it matches how you actually handle customer details.</p>
        </div>
      );
    case "about":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          <LabeledInput label="Your story" max={3000} multiline value={block.body} onChange={(v) => set<typeof block>((b) => void (b.body = v))} disabled={disabled} />
        </div>
      );
    case "contact":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          <LabeledInput label="Intro" max={400} multiline value={block.intro} onChange={(v) => set<typeof block>((b) => void (b.intro = v))} disabled={disabled} />
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" className="size-5" checked={block.showForm} onChange={(e) => set<typeof block>((b) => void (b.showForm = e.target.checked))} disabled={disabled} />
            Show enquiry form
          </label>
          <p className="text-sm text-muted">Phone, WhatsApp, email and hours come from My Business, so they stay consistent everywhere.</p>
        </div>
      );
    case "services":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          {block.items.map((item, i) => (
            <fieldset key={i} className="grid gap-3 rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-semibold">Service {i + 1}</legend>
              <LabeledInput label="Name" max={100} value={item.name} onChange={(v) => set<typeof block>((b) => void (b.items[i].name = v))} disabled={disabled} />
              <LabeledInput label="Description" max={600} multiline value={item.description} onChange={(v) => set<typeof block>((b) => void (b.items[i].description = v))} disabled={disabled} />
              {!disabled && (
                <Button variant="ghost" className="justify-self-start" onClick={() => set<typeof block>((b) => void b.items.splice(i, 1))}>
                  Remove service
                </Button>
              )}
            </fieldset>
          ))}
          {!disabled && (
            <Button variant="secondary" className="justify-self-start" onClick={() => set<typeof block>((b) => void b.items.push({ name: "New service", description: "" }))}>
              + Add service
            </Button>
          )}
        </div>
      );
    case "faq":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          {block.items.map((item, i) => (
            <fieldset key={i} className="grid gap-3 rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-semibold">Question {i + 1}</legend>
              <LabeledInput label="Question" max={200} value={item.question} onChange={(v) => set<typeof block>((b) => void (b.items[i].question = v))} disabled={disabled} />
              <LabeledInput label="Answer" max={1000} multiline value={item.answer} onChange={(v) => set<typeof block>((b) => void (b.items[i].answer = v))} disabled={disabled} />
              {!disabled && (
                <Button variant="ghost" className="justify-self-start" onClick={() => set<typeof block>((b) => void b.items.splice(i, 1))}>
                  Remove question
                </Button>
              )}
            </fieldset>
          ))}
          {!disabled && (
            <Button variant="secondary" className="justify-self-start" onClick={() => set<typeof block>((b) => void b.items.push({ question: "", answer: "" }))}>
              + Add question
            </Button>
          )}
        </div>
      );
    case "gallery":
      return (
        <div className="grid gap-4">
          <LabeledInput label="Heading" max={120} value={block.heading} onChange={(v) => set<typeof block>((b) => void (b.heading = v))} disabled={disabled} />
          <p className="text-sm text-muted">Use your own photos only, and describe each one for people who can&apos;t see it.</p>
          {!disabled && <PhotoUpload onUploaded={(url) => set<typeof block>((b) => void b.images.push({ url, alt: "" }))} />}
          {block.images.map((img, i) => (
            <fieldset key={i} className="grid gap-3 rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-semibold">Photo {i + 1}</legend>
              {/* eslint-disable-next-line @next/next/no-img-element -- preview of the owner's own upload */}
              <img src={img.url} alt="" className="h-24 w-24 rounded object-cover" />
              <LabeledInput label="Image link" value={img.url} onChange={(v) => set<typeof block>((b) => void (b.images[i].url = v))} disabled={disabled} />
              <LabeledInput label="Description" max={200} value={img.alt} onChange={(v) => set<typeof block>((b) => void (b.images[i].alt = v))} disabled={disabled} />
              {!disabled && (
                <Button variant="ghost" className="justify-self-start" onClick={() => set<typeof block>((b) => void b.images.splice(i, 1))}>
                  Remove photo
                </Button>
              )}
            </fieldset>
          ))}
          {!disabled && (
            <Button variant="secondary" className="justify-self-start" onClick={() => set<typeof block>((b) => void b.images.push({ url: "https://", alt: "" }))}>
              + Add photo by link
            </Button>
          )}
        </div>
      );
  }
}

function PhotoUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [rights, setRights] = useState(false);
  const [status, setStatus] = useState<{ busy: boolean; error?: string }>({ busy: false });
  async function upload(file: File) {
    setStatus({ busy: true });
    const form = new FormData();
    form.set("file", file);
    if (rights) form.set("rights", "on");
    try {
      const res = await fetch("/app/media/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      onUploaded(data.url);
      setStatus({ busy: false });
    } catch (e) {
      setStatus({ busy: false, error: e instanceof Error ? e.message : "Upload failed" });
    }
  }
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" className="size-5" checked={rights} onChange={(e) => setRights(e.target.checked)} />
        <span className="text-sm">I took this photo or have permission to use it, and it shows my real work or premises.</span>
      </label>
      <label className="block text-sm font-semibold">
        Upload a photo (JPEG, PNG or WebP, up to 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={!rights || status.busy}
          className="mt-1 block w-full text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </label>
      <p aria-live="polite" className="text-sm">
        {status.busy ? "Uploading…" : status.error ? <span className="text-err-fg">{status.error}</span> : null}
      </p>
    </div>
  );
}
