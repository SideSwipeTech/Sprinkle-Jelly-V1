/**
 * DifficultyBadge — the level tag. Kills the literal difficulty chips at
 * Practice.tsx:194-212 (rgba teal/amber/rose by level), Practice.tsx:394/886
 * (`chip--accent` — a class with NO backing styles, so Hard rendered as a
 * plain chip), Assess.tsx:297/689 (plain chip), KitchenSink.tsx:297-299
 * ("Easy (20 XP)" tints).
 *
 * The non-colour tell is a three-pip meter: easy fills one, medium two, hard
 * three. The count — not the hue — carries the level, so it survives
 * greyscale and reads in every accent theme. Colour reinforces through
 * `data-level` (easy→success, medium→warning, hard→error), matching the
 * demo's intent with tokens instead of rgba literals.
 *
 * Static tag only — difficulty is a fact, not a toggle (filters are Chip).
 */

import "./DifficultyBadge.css";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

const LEVEL_FILL: Record<DifficultyLevel, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3
};

export interface DifficultyBadgeProps {
  level: DifficultyLevel;
  /** Trailing fact — e.g. the XP value: "20 XP". */
  meta?: string;
  /** Override the visible word when the surface needs different casing/copy. */
  label?: string;
  className?: string;
}

export function DifficultyBadge({ level, meta, label, className = "" }: DifficultyBadgeProps) {
  const filled = LEVEL_FILL[level];
  return (
    <span
      className={`x-difficulty-badge ${className}`.trim()}
      data-level={level.toLowerCase()}
      aria-label={`Difficulty: ${level}`}
    >
      <span className="x-difficulty-badge__meter" aria-hidden="true">
        {[1, 2, 3].map((pip) => (
          <span key={pip} className="x-difficulty-badge__pip" data-filled={pip <= filled || undefined} />
        ))}
      </span>
      <span className="x-difficulty-badge__label">{label ?? level}</span>
      {meta ? <span className="x-difficulty-badge__meta">({meta})</span> : null}
    </span>
  );
}
