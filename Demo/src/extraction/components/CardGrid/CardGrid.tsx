/**
 * CardGrid — the auto-fit card field.
 *
 * Canonicalises four page grids that were the same declaration with a
 * different column floor:
 *   `.sink__grid` / `.assess__grid`  surfaces.css:29-35  — min 280px
 *   `.courses__grid`                 courses.css:133-138 — min 320px
 *   `.home__grid`                    home.css:26-38      — min 300px
 *
 * `trackSize` picks the floor (`sm` 280 · `md` 300 · `lg` 320) — off-scale
 * metrics held as component tokens, candidates for a `--card-grid-min-*`
 * family. Below the floor a track takes the full row via `min(…, 100%)`.
 *
 * Children may opt into the wide-band span with `data-span="2"` — the demo's
 * `home__continue` / `home__activity` behaviour, now a hook instead of a
 * page-local class.
 *
 * Per-identity arrangement overrides (Voyage's filmstrip, Meridian's ruled
 * column, Halo's stagger, Forge's four-up) live in `identity/layout.css` on the
 * legacy page classes and are intentionally NOT ported here — see README.
 */

import type { ReactNode } from "react";
import "./CardGrid.css";

export type CardGridTrackSize = "sm" | "md" | "lg";

export interface CardGridProps {
  children: ReactNode;
  /** Column floor: `sm` 280 (default), `md` 300, `lg` 320. */
  trackSize?: CardGridTrackSize;
  /** `div` default; `section`/`aside` become landmarks when `label` names them. */
  as?: "div" | "section" | "aside";
  label?: string;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function CardGrid({
  children,
  trackSize = "sm",
  as = "div",
  label,
  className = "",
  ...rest
}: CardGridProps) {
  const Tag = as;
  return (
    <Tag
      className={`x-card-grid${className ? ` ${className}` : ""}`}
      data-min={trackSize === "sm" ? undefined : trackSize}
      aria-label={as === "div" ? undefined : label}
      {...rest}
    >
      {children}
    </Tag>
  );
}
