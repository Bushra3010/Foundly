"use client";

import type { ComponentProps } from "react";

// In-page jump link that scrolls every time it is clicked, even when the URL already ends in the same #hash.
export function ScrollLink({ target, onClick, ...props }: Omit<ComponentProps<"a">, "href"> & { target: string }) {
  return (
    <a
      {...props}
      href={`#${target}`}
      onClick={e => {
        onClick?.(e);
        const el = document.getElementById(target);
        if (!el || e.defaultPrevented) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
        history.replaceState(history.state, "", `#${target}`);
      }}
    />
  );
}
