"use client";

import { useEffect } from "react";

// The header menus are plain <details>. Close them on an outside click, on Escape and after a link inside is used.
const MENUS = ".landing-software-menu, .landing-mobile-menu";

export function MenuCloser() {
  useEffect(() => {
    const closeAll = (except?: Element | null) => {
      document.querySelectorAll<HTMLDetailsElement>(MENUS).forEach(d => { if (d !== except) d.open = false; });
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const menu = target?.closest(MENUS) ?? null;
      if (menu && target?.closest("a")) closeAll();
      else closeAll(menu);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const open = document.querySelector<HTMLDetailsElement>(`${MENUS.split(", ").map(s => `${s}[open]`).join(", ")}`);
      if (!open) return;
      open.open = false;
      open.querySelector("summary")?.focus();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
