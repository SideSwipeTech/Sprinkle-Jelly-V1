/**
 * navigation.ts — the courses pages' route entry behaviour.
 *
 * The audit found a scrolled catalogue handing its scroll depth to the next
 * page. The rule these pages follow:
 *
 *   - a forward navigation lands at the top with the page heading focused —
 *     the heading carries tabindex=-1 so focus lands without scrolling;
 *   - Back / Forward (a POP) restores the scroll position that page was left
 *     at — the catalogue keeps its place when you come back from a course.
 *
 * Positions are keyed by the router's location.key, which survives POP.
 */

import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const positions = new Map<string, number>();

function focusHeading() {
  const h1 = document.querySelector<HTMLElement>(".shell__main h1");
  if (!h1) return;
  if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1");
  h1.focus({ preventScroll: true });
}

export function usePageEntry() {
  const location = useLocation();
  const navType = useNavigationType();

  // Save the leaving position continuously — cheap map writes on scroll,
  // keyed to the location that owns them.
  useEffect(() => {
    const key = location.key;
    const save = () => positions.set(key, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      save();
      window.removeEventListener("scroll", save);
    };
  }, [location.key]);

  useEffect(() => {
    const saved = positions.get(location.key);
    if (navType === "POP" && saved !== undefined) {
      // Content height settles across the commit; restore on the next frame.
      const raf = requestAnimationFrame(() => window.scrollTo(0, saved));
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo(0, 0);
    // Let the page paint its header before moving focus to it.
    const raf = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(raf);
  }, [location.key, navType]);
}
