"use client";

import { useEffect } from "react";

const MIN_ZOOM = 0.72;
const DESKTOP = "(min-width: 1024px) and (min-height: 560px)";

/**
 * On desktop, each `.landing-fit` section fills one screen below the sticky
 * header. When its content is still taller than that, the content is zoomed
 * down a little (never below MIN_ZOOM) so the whole section fits in one view.
 * Phones keep normal scrolling.
 */
export function FitSections() {
  useEffect(() => {
    const media = window.matchMedia(DESKTOP);
    const bodies = Array.from(document.querySelectorAll<HTMLElement>(".landing-fit .fit-body"));
    if (bodies.length === 0) return;

    const root = document.querySelector<HTMLElement>(".foundly-landing");
    const fit = () => {
      const header = document.querySelector<HTMLElement>(".landing-header")?.getBoundingClientRect().height ?? 72;
      const footer = document.querySelector<HTMLElement>(".landing-footer")?.getBoundingClientRect().height ?? 0;
      // Anchors and section heights use the real header and footer sizes.
      root?.style.setProperty("--lp-header", `${Math.round(header)}px`);
      root?.style.setProperty("--lp-footer", `${Math.round(footer)}px`);
      for (const body of bodies) {
        if (!media.matches) {
          body.style.zoom = "";
          continue;
        }
        const current = parseFloat(body.style.zoom || "1") || 1;
        const natural = body.getBoundingClientRect().height / current;
        const section = body.parentElement!;
        const cs = getComputedStyle(section);
        const reserve = section.classList.contains("landing-last") ? footer : 0;
        const room = window.innerHeight - header - reserve - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const next = natural > room ? Math.max(MIN_ZOOM, room / natural) : 1;
        // Always shrink when content doesn't fit; only grow back for clear gains,
        // so content that animates doesn't make the zoom flicker.
        if (next < current - 0.001 || next > current + 0.015) body.style.zoom = next >= 0.999 ? "" : next.toFixed(3);
      }
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    bodies.forEach((b) => ro.observe(b));
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    document.fonts?.ready.then(schedule).catch(() => {});
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return null;
}
