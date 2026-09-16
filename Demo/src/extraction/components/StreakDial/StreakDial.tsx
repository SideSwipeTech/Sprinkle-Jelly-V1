/**
 * StreakDial — the streak figure, rebuilt as a `ChargeRing` usage.
 *
 * The demo (Practice.tsx:778-784) drew a 56px amber literal disc with "{n}d"
 * inside — a static circle that looked like a gauge but measured nothing.
 * Here the figure rides the platform's actual progress language:
 *
 *   - `ChargeRing` owns the arc, the hatch-on-unavailable, and the accessible
 *     `role="progressbar"` announcement.
 *   - `centre={`${days}d`}` replaces the default "n%" readout — the pattern
 *     for any ring whose unit is not a percentage (levels, streaks, counts).
 *   - `value` is days toward `goal` (default 7, the weekly ritual window), so
 *     the arc means something: a 23-day streak shows a full ring, an
 *     honest "goal met", not a painted disc.
 *   - `days: null` → the ring hatches and the centre reads "—", never "0d".
 *
 * The ring is the dial; the row beside it (title + window meta) is included
 * because that pairing is what the demo actually rendered.
 */

import { ChargeRing } from "@components/Charge";
import "./StreakDial.css";

export interface StreakDialProps {
  /** Consecutive days on the ledger. null → unavailable, never zero. */
  days: number | null;
  /** The window the arc fills toward — default 7, the weekly ritual. */
  goal?: number;
  /** Ring diameter in px — default 56, the demo's disc size. */
  size?: number;
  /** The heading beside the ring — default "{days}-Day Active Streak". */
  title?: string;
  /** The meta line — e.g. "Window closes at 23:59:59 IST · 14h 22m remaining". */
  meta?: string;
  /** Progressbar accessible name. */
  label?: string;
  className?: string;
}

export function StreakDial({
  days,
  goal = 7,
  size = 56,
  title,
  meta,
  label = "Current streak",
  className = ""
}: StreakDialProps) {
  const value = days === null ? null : Math.round((days / Math.max(1, goal)) * 100);
  const heading = title ?? (days === null ? "Streak unavailable" : `${days}-Day Active Streak`);

  return (
    <div className={`x-streak-dial ${className}`.trim()}>
      <ChargeRing
        value={value}
        label={label}
        size={size}
        stroke={6}
        centre={days === null ? undefined : `${days}d`}
      />
      <div className="x-streak-dial__text">
        <strong className="x-streak-dial__title">{heading}</strong>
        {meta ? <span className="x-streak-dial__meta">{meta}</span> : null}
      </div>
    </div>
  );
}
