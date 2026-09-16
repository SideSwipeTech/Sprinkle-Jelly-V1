/**
 * Charge — the platform's progress language, and the thing that most stops this looking
 * like a generic component kit.
 *
 * Progress is energy filling a cell, on a cool -> hot gradient, so the fill BOUNDARY is
 * always the luminous end. Carried forward from the previous platform (shared/ui/charge.tsx),
 * which is an input for layout and language, not a file to reproduce.
 *
 * What is new here: the fill BEHAVIOUR belongs to the identity, not to the component.
 *   halo      sweep-bloom      — fills, then blooms at the boundary
 *   voyage    travelling-head  — a bright head runs ahead of the fill, trailing
 *   forge     draw             — the fill draws like a trace being routed
 *   meridian  instant          — no fill animation at all
 *
 * Every variant carries a NON-COLOUR tell, because SHR-R38 forbids meaning resting on
 * colour alone: the value is always available as text, and the track carries a hatch
 * pattern when the reading is unavailable rather than simply rendering empty.
 */

import { useEffect, useId, useState, type ReactNode } from "react";
import { useChargeStops } from "@foundation/useSubtheme";
import "./charge.css";

export interface ChargeProps {
  /** 0–100. Clamped. Null means genuinely unknown — rendered as unavailable, never as 0. */
  value: number | null;
  /** Accessible name. Required: a bare progressbar announces nothing useful. */
  label: string;
  /** Bar height in px. */
  height?: number;
  /** Show the numeric value beside the bar — the non-colour carrier. */
  showValue?: boolean;
  /** When the figure is derived and ageing, its age. PRODUCT.md §10: a stale figure states it. */
  asOf?: string;
  className?: string;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function Charge({
  value,
  label,
  height = 8,
  showValue = true,
  asOf,
  className = ""
}: ChargeProps) {
  const unavailable = value === null;
  const pct = unavailable ? 0 : clamp(value);

  // The fill animates from its previous position, not from zero, so a value that moves
  // twice does not restart. Mount is the one exception — it sweeps in.
  const [rendered, setRendered] = useState(0);

  useEffect(() => {
    if (unavailable) return;
    const id = requestAnimationFrame(() => setRendered(pct));
    return () => cancelAnimationFrame(id);
  }, [pct, unavailable]);

  return (
    <div className={`charge ${className}`} data-unavailable={unavailable || undefined}>
      <div className="charge__head">
        <span className="charge__label micro">{label}</span>
        {showValue ? (
          <span className="charge__value numeral">
            {unavailable ? "—" : `${Math.round(pct)}%`}
          </span>
        ) : null}
      </div>

      <div
        className="charge__track"
        style={{ height }}
        role="progressbar"
        aria-label={label}
        {...(unavailable
          ? { "aria-valuetext": "Unavailable" }
          : { "aria-valuenow": Math.round(pct), "aria-valuemin": 0, "aria-valuemax": 100 })}
      >
        {unavailable ? (
          // Not an empty bar. An empty bar says "you have done nothing"; this says
          // "we cannot tell you right now" — PRODUCT.md §10, the first row of the table.
          <span className="charge__hatch" aria-hidden="true" />
        ) : (
          <span className="charge__fill" style={{ width: `${rendered}%` }}>
            <span className="charge__edge" aria-hidden="true" />
          </span>
        )}
      </div>

      {unavailable ? (
        <span className="charge__note">Unavailable — this figure could not be read.</span>
      ) : asOf ? (
        <span className="charge__note">as of {asOf}</span>
      ) : null}
    </div>
  );
}

/**
 * ChargeRing — the radial cell. Same language, same identity-owned behaviour, used where
 * a figure is the subject rather than an attribute (level, completion, readiness).
 */
export interface ChargeRingProps {
  value: number | null;
  label: string;
  size?: number;
  stroke?: number;
  caption?: string;
  centre?: ReactNode;
}

export function ChargeRing({
  value,
  label,
  size = 132,
  stroke = 9,
  caption,
  centre
}: ChargeRingProps) {
  const unavailable = value === null;
  const pct = unavailable ? 0 : clamp(value);
  const [rendered, setRendered] = useState(0);
  const stops = useChargeStops();
  // useId is url()-safe once the colons React emits are stripped. Deriving the id from
  // the label instead would collide the moment two rings share one.
  const gradientId = `cg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hatchId = `${gradientId}-hatch`;

  useEffect(() => {
    if (unavailable) return;
    const id = requestAnimationFrame(() => setRendered(pct));
    return () => cancelAnimationFrame(id);
  }, [pct, unavailable]);

  const r = (100 - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (rendered / 100) * circumference;

  // Arc head in the same coordinate space as the arc, so the edge dot sits exactly on it.
  const angle = (rendered / 100) * 2 * Math.PI - Math.PI / 2;
  const headX = 50 + r * Math.cos(angle);
  const headY = 50 + r * Math.sin(angle);

  return (
    <div
      className="charge-ring"
      style={{ width: size, height: size }}
      data-unavailable={unavailable || undefined}
      role="progressbar"
      aria-label={label}
      {...(unavailable
        ? { "aria-valuetext": "Unavailable" }
        : { "aria-valuenow": Math.round(pct), "aria-valuemin": 0, "aria-valuemax": 100 })}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset={stops[0]} stopColor="var(--c-accent-primary)" />
            <stop offset={stops[1]} stopColor="var(--c-accent-secondary)" />
            <stop offset={stops[2]} stopColor="var(--c-accent-light)" />
          </linearGradient>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-text-faint)" strokeWidth="2" />
          </pattern>
        </defs>

        <circle
          cx="50" cy="50" r={r} fill="none" strokeWidth={stroke}
          stroke="var(--c-border)"
          opacity={`calc(var(--charge-track-opacity) * 6)`}
        />

        {unavailable ? (
          <circle
            cx="50" cy="50" r={r} fill="none" strokeWidth={stroke}
            stroke={`url(#${hatchId})`} opacity="0.5"
          />
        ) : (
          <>
            <circle
              className="charge-ring__arc"
              cx="50" cy="50" r={r} fill="none" strokeWidth={stroke}
              strokeLinecap="round"
              stroke={`url(#${gradientId})`}
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 50 50)"
            />
            {rendered > 0 ? (
              <circle
                className="charge-ring__head"
                cx={headX} cy={headY} r={stroke * 0.44}
                fill="var(--c-accent-light)"
              />
            ) : null}
          </>
        )}
      </svg>

      <div className="charge-ring__centre">
        {caption ? <span className="micro">{caption}</span> : null}
        <strong className="numeral charge-ring__value">
          {unavailable ? "—" : (centre ?? `${Math.round(pct)}%`)}
        </strong>
      </div>
    </div>
  );
}
