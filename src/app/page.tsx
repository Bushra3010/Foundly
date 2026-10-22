import Link from "next/link";
import { LinkButton } from "@/components/ui";

const steps = [
  ["Add your business", "Name, services, city and how customers reach you. Takes a few minutes."],
  ["Get a website", "Generate an editable site from the facts you confirm — or keep the one you have."],
  ["Publish when ready", "Nothing goes public until you approve it. Roll back any time."],
  ["Track AI answers", "See whether supported AI answers mention or cite you, with the saved evidence."],
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold">Growth Platform</span>
        <nav className="flex items-center gap-2">
          <Link href="/directory" className="inline-flex min-h-11 items-center px-3 font-medium">
            Directory
          </Link>
          <LinkButton href="/login" variant="secondary">
            Sign in
          </LinkButton>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 pt-10 pb-20">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            An accurate online presence for your business, without the jargon.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Create a business profile and website from facts you confirm, improve what customers read, and see how
            supported AI answers describe you — with every number backed by the answers we saved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/login">Get started free</LinkButton>
            <LinkButton href="/directory" variant="secondary">
              Browse businesses
            </LinkButton>
          </div>
        </section>
        <ol className="mt-16 grid gap-4 sm:grid-cols-2">
          {steps.map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-sm font-semibold text-brand">Step {i + 1}</p>
              <h2 className="mt-1 text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-muted">{body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-3xl text-sm text-muted">
          We don&apos;t sell rankings and can&apos;t guarantee that any AI service will mention, recommend or link to
          your business. We show what we observed, how we collected it, and what you can improve.
        </p>
      </main>
    </>
  );
}
