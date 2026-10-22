import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const variants = {
  primary: "bg-brand text-brand-contrast hover:opacity-90",
  secondary: "border border-border bg-surface text-text hover:bg-surface-2",
  danger: "border border-err-fg/40 bg-err-bg text-err-fg hover:opacity-90",
  ghost: "text-text hover:bg-surface-2",
};
export type ButtonVariant = keyof typeof variants;

export function buttonClass(variant: ButtonVariant = "primary", extra?: string) {
  return cx(buttonBase, variants[variant], extra);
}

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-xl border border-border bg-surface p-4 sm:p-6", className)} {...props} />;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

type Tone = "ok" | "warn" | "err" | "info" | "neutral" | "demo";
const toneClass: Record<Tone, string> = {
  ok: "bg-ok-bg text-ok-fg",
  warn: "bg-warn-bg text-warn-fg",
  err: "bg-err-bg text-err-fg",
  info: "bg-info-bg text-info-fg",
  neutral: "bg-surface-2 text-muted",
  demo: "bg-demo-bg text-demo-fg",
};
const toneIcon: Record<Tone, string> = { ok: "✓", warn: "!", err: "×", info: "i", neutral: "•", demo: "◆" };

/** Status is always conveyed by text and an icon, never colour alone. */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", toneClass[tone])}>
      <span aria-hidden="true">{toneIcon[tone]}</span>
      {children}
    </span>
  );
}

export function Notice({ tone = "info", title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <div role={tone === "err" ? "alert" : "status"} className={cx("rounded-lg p-4 text-sm", toneClass[tone])}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? "mt-1" : undefined}>{children}</div>}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

const inputClass =
  "block w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base text-text placeholder:text-muted/70 aria-[invalid=true]:border-err-fg";

type FieldProps = {
  label: string;
  name: string;
  hint?: ReactNode;
  errors?: string[];
  optional?: boolean;
};

function FieldShell({ label, name, hint, errors, optional, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={`${name}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm font-medium text-err-fg">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, hint?: ReactNode, errors?: string[]) {
  return [hint && `${name}-hint`, errors?.length && `${name}-error`].filter(Boolean).join(" ") || undefined;
}

export function TextField({ label, name, hint, errors, optional, ...props }: FieldProps & Omit<ComponentProps<"input">, "name">) {
  return (
    <FieldShell {...{ label, name, hint, errors, optional }}>
      <input
        id={name}
        name={name}
        className={inputClass}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({ label, name, hint, errors, optional, ...props }: FieldProps & Omit<ComponentProps<"textarea">, "name">) {
  return (
    <FieldShell {...{ label, name, hint, errors, optional }}>
      <textarea
        id={name}
        name={name}
        rows={4}
        className={inputClass}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        {...props}
      />
    </FieldShell>
  );
}

export function Checkbox({ label, name, hint, ...props }: { label: string; name: string; hint?: string } & Omit<ComponentProps<"input">, "name" | "type">) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" name={name} className="mt-1 size-5 accent-[var(--brand)]" {...props} />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function DefinitionList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border">
      {items.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm font-semibold text-muted">{k}</dt>
          <dd className="sm:col-span-2">{v || <span className="text-muted">Not added</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
