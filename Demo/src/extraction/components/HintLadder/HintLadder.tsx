/**
 * HintLadder — progressive rung-by-rung hint reveal (Practice.tsx:409-437,
 * More.tsx:170-174's simpler one-at-a-time variant is the same anatomy with
 * single-rung bodies).
 *
 * Reveals are deliberate: one click, one rung, counter states the total. The
 * `rgba(99,102,241,*)` rung literals are gone — rungs paint off
 * `color-mix(--c-accent-primary)` so every identity tints its own accent.
 * Newly revealed rungs land in an `aria-live` region so the reveal is announced.
 */

import { Icon } from "@icons/Icon";
import "./HintLadder.css";

export interface HintRung {
  /** e.g. "Rung 2: Algorithmic Invariant & Data Structure" */
  title: string;
  /** May contain newlines — rendered pre-wrap. */
  content: string;
}

export interface HintLadderProps {
  rungs: HintRung[];
  /** Controlled count of revealed rungs (0 = none). */
  revealed: number;
  /** Called with the next rung count when the learner reveals one. */
  onReveal: (next: number) => void;
  /** Section label (default "Hint ladder"). */
  label?: string;
  /** Note shown before the first reveal — honest absence, not an empty box. */
  emptyNote?: string;
}

export function HintLadder({
  rungs,
  revealed,
  onReveal,
  label = "Hint ladder",
  emptyNote = "Hints are delivered in progressive rungs. Unlock only as needed."
}: HintLadderProps) {
  const total = rungs.length;
  const clamped = Math.max(0, Math.min(revealed, total));
  const exhausted = clamped >= total;

  return (
    <section className="x-hint-ladder" aria-label={label}>
      <div className="x-hint-ladder__head">
        <span className="x-hint-ladder__label">
          {label} · {clamped}/{total} revealed
        </span>
        {!exhausted ? (
          <button
            type="button"
            className="x-hint-ladder__reveal"
            onClick={() => onReveal(clamped + 1)}
          >
            <Icon name="info" size={12} />
            <span>Reveal rung {clamped + 1}</span>
          </button>
        ) : null}
      </div>

      <ol className="x-hint-ladder__rungs" aria-live="polite">
        {clamped === 0 ? (
          <li className="x-hint-ladder__note">{emptyNote}</li>
        ) : (
          rungs.slice(0, clamped).map((rung, idx) => (
            <li key={idx} className="x-hint-ladder__rung" data-index={idx + 1}>
              <strong className="x-hint-ladder__rung-title">{rung.title}</strong>
              <p className="x-hint-ladder__rung-body">{rung.content}</p>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
