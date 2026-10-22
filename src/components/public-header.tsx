import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold">
          Growth Platform
        </Link>
        <nav className="flex gap-1">
          <Link href="/directory" className="inline-flex min-h-11 items-center px-3 font-medium">
            Directory
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center px-3 font-medium">
            List your business
          </Link>
        </nav>
      </div>
    </header>
  );
}
