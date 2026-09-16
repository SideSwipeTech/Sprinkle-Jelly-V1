/**
 * Icon — the Keyline set, rendered.
 *
 * Two layers, always: STRUCTURE inherits `currentColor`, CHARGE resolves through the
 * theme's accent ramp. An icon never names a colour, which is why switching identity
 * recolours all 77 on the style recalc with zero re-render.
 *
 * ONE gradient, not 77. A single document-level <linearGradient> lives in <ChargeDefs/>
 * at the app root, and every icon references it. Per-instance defs would add ~5 nodes per
 * icon for nothing — they are only needed to show several identities at once.
 *
 * Micro optical size: six glyphs were measured as failing at true 16px (elements under
 * 1px apart, charge marks under 2px, collapsing into a smudge). Below 17px those six
 * swap to simplified geometry; the other 71 keep their paths and only take the heavier
 * stroke. Redrawing a glyph that already works would be two drawings to maintain.
 */

import { KEYLINE, type IconName } from "./keyline";
import "./icon.css";

/** The six animations. All CSS on the charge group — zero bytes of JavaScript. */
export type IconMotion =
  | "none"
  /** mount / route change — the charge draws itself in */
  | "draw"
  /** empty states, first paint — structure traces, then charge */
  | "trace"
  /** running jobs, live sessions — loops */
  | "flow"
  /** notification arrival, XP gained */
  | "pulse"
  /** loaders, indeterminate work — loops */
  | "orbit"
  /** confirmations */
  | "settle";

/** Static treatments over the same two layers. Only plate and knockout touch geometry. */
export type IconTreatment = "keyline" | "duotone" | "etched" | "plate" | "mono";

export interface IconProps {
  name: IconName;
  size?: number;
  motion?: IconMotion;
  treatment?: IconTreatment;
  /** Accessible label. Omit for decorative icons — they are then aria-hidden. */
  label?: string;
  className?: string;
}

const MICRO_THRESHOLD = 17;

export function Icon({
  name,
  size = 20,
  motion = "none",
  treatment = "keyline",
  label,
  className = ""
}: IconProps) {
  const glyph = KEYLINE[name];
  if (!glyph) return null;

  const micro = size < MICRO_THRESHOLD && Boolean(glyph.ms);
  const structure = micro ? glyph.ms! : glyph.s;
  const charge = micro ? (glyph.mc ?? glyph.c) : glyph.c;

  // The micro size takes heavier strokes so the drawing survives at 16px and below.
  const structureWidth = micro ? 1.85 : 1.5;
  const chargeWidth = micro ? 2.2 : 1.9;

  return (
    <svg
      className={`icon icon--${treatment} ${motion !== "none" ? `icon--${motion}` : ""} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {treatment === "plate" ? (
        <rect
          className="icon__plate"
          x="1" y="1" width="22" height="22"
          rx="5"
        />
      ) : null}

      <g
        className={`icon__structure${micro ? " icon__structure--micro" : ""}`}
        stroke="currentColor"
        strokeWidth={structureWidth}
        dangerouslySetInnerHTML={{ __html: structure }}
      />

      {charge ? (
        <g
          className="icon__charge"
          stroke="url(#wz-charge)"
          strokeWidth={chargeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          dangerouslySetInnerHTML={{ __html: charge }}
        />
      ) : null}
    </svg>
  );
}

/**
 * ChargeDefs — mounted once at the app root. The stops are theme tokens, so the whole set
 * follows an identity change through the style recalc.
 *
 * Note the stops are NOT the identity's charge distribution here: an SVG <stop offset> is a
 * presentation attribute and a custom property does not resolve in one. Icon glyphs are
 * 24px, where a stop shifted by 10% is invisible, so the even distribution is honest. The
 * ring in Charge.tsx, where the distribution IS visible, reads its stops from values.ts.
 */
export function ChargeDefs() {
  return (
    <svg className="icon-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wz-charge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-accent-primary)" />
          <stop offset="55%" stopColor="var(--c-accent-secondary)" />
          <stop offset="100%" stopColor="var(--c-accent-light)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
