import Link from "next/link";
import { Brand } from "./icon";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-bold">
          <Brand />
        </Link>
        <nav className="flex gap-1 text-xs sm:text-sm">
          <Link
            href="/directory"
            className="inline-flex min-h-11 items-center px-3 font-medium"
          >
            Directory
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center px-3 font-medium"
          >
            List your business
          </Link>
        </nav>
      </div>
    </header>
  );
}
