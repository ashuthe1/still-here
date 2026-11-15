"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * On touch screens, a horizontal swipe moves to the next (left) or previous (right) item.
 * Ignored when it starts in a text field, near a screen edge (the system back gesture), or
 * when the movement is mostly vertical, so scrolling and typing are never hijacked.
 */
export default function SwipeNav({ prevHref, nextHref }: { prevHref?: string; nextHref?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (prevHref) router.prefetch(prevHref);
    if (nextHref) router.prefetch(nextHref);
    let x0 = 0, y0 = 0, t0 = 0, active = false;
    const EDGE = 28, MIN = 70;

    function onStart(e: TouchEvent) {
      if (e.touches.length !== 1) { active = false; return; }
      const t = e.touches[0];
      const el = e.target as HTMLElement | null;
      const typing = el?.closest("textarea, input, select, [contenteditable], .cal, .chooser, .welcome, .install-sheet");
      const nearEdge = t.clientX < EDGE || t.clientX > window.innerWidth - EDGE;
      active = !typing && !nearEdge;
      x0 = t.clientX; y0 = t.clientY; t0 = Date.now();
    }
    function onEnd(e: TouchEvent) {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (Date.now() - t0 > 700) return;
      if (Math.abs(dx) < MIN || Math.abs(dx) < Math.abs(dy) * 2) return;
      if (window.getSelection()?.toString()) return;
      const href = dx < 0 ? nextHref : prevHref;
      if (!href) return;
      document.documentElement.dataset.swipe = dx < 0 ? "next" : "prev";
      setTimeout(() => { delete document.documentElement.dataset.swipe; }, 400);
      router.push(href);
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [prevHref, nextHref, router]);
  return null;
}
