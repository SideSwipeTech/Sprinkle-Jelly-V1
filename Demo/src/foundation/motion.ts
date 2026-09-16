/**
 * motion.ts — the behavioural half of each identity's motion language.
 *
 * CSS carries what CSS can (entrances, hovers, keyframes). This carries what it cannot:
 * scroll-driven reveal, magnetic attraction, the ambient field following the cursor, and
 * text resolving on entry. Each hook is a no-op unless the ACTIVE identity asks for it, so
 * a component never branches on identity itself.
 *
 * Card hover is deliberately NOT here. Halo's lift-and-glow lives in identity.css, in one
 * place, as a plain CSS hover — a pointer-parallax tilt was tried and reverted.
 *
 * Every hook checks reduced motion and bails. SHR-R38: depth, celebration and parallax each
 * need a non-motion equivalent — here the equivalent is simply the static composition, which
 * is designed to stand on its own.
 */

import { useEffect } from "react";

function motionSuppressed(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.getAttribute("data-reduced-motion") === "true") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function identity(): string {
  return document.documentElement.getAttribute("data-theme") ?? "halo";
}

/**
 * Scroll-driven reveal — VOYAGE mainly, but harmless elsewhere.
 *
 * Sets --in (0..1) on each [data-reveal] as it crosses the viewport, so CSS can drive scale,
 * blur, weight and opacity off a real scroll position rather than a fixed timer. Uses
 * IntersectionObserver with a threshold ladder — `animation-timeline: view()` is not yet
 * safe to rely on, and a hand-rolled scroll listener would fight the compositor.
 */
export function useScrollReveal(key = "") {
  useEffect(() => {
    if (motionSuppressed()) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.style.setProperty("--in", "1");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.style.setProperty("--in", entry.intersectionRatio.toFixed(3));
          el.toggleAttribute("data-seen", entry.intersectionRatio > 0.15);
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20), rootMargin: "-8% 0px -8% 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}

/**
 * Magnetic pointer — VOYAGE only.
 *
 * Interactive elements attract the cursor within a radius and deform toward it. Applied to
 * the whole document rather than per-component so any control picks it up.
 */
export function useMagnetic(selector = ".btn, .tile") {
  useEffect(() => {
    let raf = 0;

    function onMove(e: PointerEvent) {
      if (identity() !== "voyage" || motionSuppressed()) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          const radius = 90;
          if (dist < radius) {
            const pull = (1 - dist / radius) * 7;
            el.style.setProperty("--mag-x", `${((dx / dist) * pull).toFixed(2)}px`);
            el.style.setProperty("--mag-y", `${((dy / dist) * pull).toFixed(2)}px`);
          } else if (el.style.getPropertyValue("--mag-x") !== "0px") {
            el.style.setProperty("--mag-x", "0px");
            el.style.setProperty("--mag-y", "0px");
          }
        });
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [selector]);
}

/**
 * Ambient field follows the cursor — HALO.
 *
 * The aurora warms toward wherever the pointer is, on a long lag. Sub-perceptual per frame;
 * what you notice is that the room seems to be paying attention.
 */
export function useAmbientTracking() {
  useEffect(() => {
    let raf = 0;
    let cx = 50;
    let cy = 50;
    let tx = 50;
    let ty = 50;

    function loop() {
      cx += (tx - cx) * 0.03;
      cy += (ty - cy) * 0.03;
      document.documentElement.style.setProperty("--ambient-x", `${cx.toFixed(2)}%`);
      document.documentElement.style.setProperty("--ambient-y", `${cy.toFixed(2)}%`);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    }

    if (!motionSuppressed()) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
}

/**
 * Text scramble — VOYAGE.
 *
 * Headings resolve from a glyph set on first reveal. Runs once per element, respects
 * reduction by leaving the final text in place untouched.
 */
export function useTextScramble(selector = "[data-scramble]") {
  useEffect(() => {
    if (motionSuppressed()) return;
    if (identity() !== "voyage") return;

    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/\\<>[]{}";
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const timers: number[] = [];

    nodes.forEach((node, index) => {
      const final = node.dataset.scrambleText ?? node.textContent ?? "";
      node.dataset.scrambleText = final;
      let frame = 0;
      const duration = 28;

      const id = window.setTimeout(() => {
        const tick = window.setInterval(() => {
          frame++;
          const settled = Math.floor((frame / duration) * final.length);
          node.textContent = final
            .split("")
            .map((ch, i) => {
              if (i < settled || ch === " ") return ch;
              return CHARS[Math.floor(((frame * 7 + i * 13) % CHARS.length))] ?? ch;
            })
            .join("");
          if (frame >= duration) {
            node.textContent = final;
            window.clearInterval(tick);
          }
        }, 26);
        timers.push(tick);
      }, index * 90);

      timers.push(id);
    });

    return () => timers.forEach((t) => { window.clearTimeout(t); window.clearInterval(t); });
  }, [selector]);
}
