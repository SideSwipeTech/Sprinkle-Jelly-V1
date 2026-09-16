/**
 * Skeleton — the shape-of-the-thing placeholder. NEW: the demo had none; every
 * async surface showed either a bare spinner (`.spinner`, code-editor.css:691)
 * or popped content in unannounced.
 *
 * Four primitives cover what a loading region actually looks like:
 *   text   a run of line-bones; the last line shortens like real copy
 *   row    disc + two lines — the list-row silhouette
 *   card   a framed panel of bones — the card silhouette
 *   block  one freeform bone for media/charts/whatever has no cleaner shape
 *
 * The shimmer is a single sheen sweep on the outer container, so composite
 * variants read as ONE loading object rather than a scatter of blinking bars.
 * Speed is `calc(var(--duration-slow) * 4)` — the identity's own motion register
 * scales it (Meridian's register is near-instant, so its shimmer barely moves,
 * which is honest for a low-stimulus identity).
 *
 * Reduced motion: the sheen is removed entirely — the bones stay as a static
 * matte. A stopped shimmer would still read "loading" from shape alone; adding
 * a fade pulse would only reintroduce motion under a different name.
 *
 * a11y: every skeleton is `aria-hidden`. It is decoration — pair it with
 * `LoadingState` (same family) or `aria-busy` on the region so the fact of
 * loading is announced, not implied.
 */

import type { CSSProperties } from "react";
import "./Skeleton.css";

export type SkeletonVariant = "text" | "row" | "card" | "block";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** `text` only: number of line-bones. */
  lines?: number;
  /** `block`/`card`: height in `--space-4` units (default 4 → 16px rhythm). */
  height?: number;
  /** `block`/`text`: width in `--space-4` units. Omit for full width. */
  width?: number;
  className?: string;
}

/** A single bone — the shimmer-sheened placeholder atom. */
function Bone({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`x-skeleton__bone ${className}`} style={style} aria-hidden="true" />;
}

function spaceUnits(v: number | undefined): string | undefined {
  return v === undefined ? undefined : `calc(var(--space-4) * ${v})`;
}

export function Skeleton({ variant = "block", lines = 3, height, width, className = "" }: SkeletonProps) {
  const w = spaceUnits(width);
  const h = spaceUnits(height);

  if (variant === "text") {
    const count = Math.max(1, lines);
    return (
      <div className={`x-skeleton x-skeleton--text ${className}`} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <Bone
            key={i}
            className={`x-skeleton__bone--line ${i === count - 1 && count > 1 ? "x-skeleton__bone--short" : ""}`.trim()}
            style={{ width: w }}
          />
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className={`x-skeleton x-skeleton--row ${className}`} aria-hidden="true">
        <Bone className="x-skeleton__bone--disc" />
        <span className="x-skeleton__stack">
          <Bone className="x-skeleton__bone--line x-skeleton__bone--wide" />
          <Bone className="x-skeleton__bone--line x-skeleton__bone--faint x-skeleton__bone--narrow" />
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`x-skeleton x-skeleton--card ${className}`} aria-hidden="true">
        <Bone className="x-skeleton__bone--title" />
        <Bone className="x-skeleton__bone--line" />
        <Bone className="x-skeleton__bone--line x-skeleton__bone--faint x-skeleton__bone--mid" />
        <Bone className="x-skeleton__bone--cta" />
      </div>
    );
  }

  return (
    <div
      className={`x-skeleton x-skeleton--block ${className}`}
      style={{ width: w, height: h }}
      aria-hidden="true"
    >
      <Bone className="x-skeleton__bone--fill" />
    </div>
  );
}

/* Named conveniences — the four primitives as readable call-sites. */
export function SkeletonText({ lines = 3, width, className = "" }: Pick<SkeletonProps, "lines" | "width" | "className">) {
  return <Skeleton variant="text" lines={lines} width={width} className={className} />;
}

export function SkeletonRow({ className = "" }: Pick<SkeletonProps, "className">) {
  return <Skeleton variant="row" className={className} />;
}

export function SkeletonCard({ height, className = "" }: Pick<SkeletonProps, "height" | "className">) {
  return <Skeleton variant="card" height={height} className={className} />;
}

export function SkeletonBlock({ width, height, className = "" }: Pick<SkeletonProps, "width" | "height" | "className">) {
  return <Skeleton variant="block" width={width} height={height} className={className} />;
}
