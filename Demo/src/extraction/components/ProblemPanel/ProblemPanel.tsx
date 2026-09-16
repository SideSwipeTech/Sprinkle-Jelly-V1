/**
 * ProblemPanel — the statement pane beside a workbench (Practice.tsx:382-449):
 * the prompt, the tag/topic chips, the constraints inset, an optional solved
 * verdict banner, and a slot for HintLadder.
 *
 * Chips ride the controls family's `x-chip` hooks (`x-chip`, `x-chip--accent`,
 * `x-chip--quiet`) — sibling class reference per contract §6, flagged here and
 * in the report. The accepted banner's `#2dd4bf` literals (Practice:439-447)
 * become `--c-success` mixes.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./ProblemPanel.css";

export interface ProblemPanelProps {
  /** The statement text — plain copy or marked-up ReactNode. */
  statement: ReactNode;
  /** Topic chips. */
  tags?: string[];
  /** Extra chips after the tags (difficulty, policy) — rendered accent-then-quiet. */
  badges?: { accent?: string; quiet?: string[] };
  /** Constraints/guarantees list items — `<code>` children welcome. */
  constraints?: ReactNode[];
  constraintsTitle?: string;
  /** Accepted-state banner. Absent → nothing renders (honest absence). */
  verdict?: { text: string; action?: ReactNode };
  /** Slot — HintLadder lives here on the challenge page. */
  children?: ReactNode;
}

export function ProblemPanel({
  statement,
  tags,
  badges,
  constraints,
  constraintsTitle = "Constraints & Guarantees",
  verdict,
  children
}: ProblemPanelProps) {
  return (
    <div className="x-problem">
      <div className="x-problem__statement">{statement}</div>

      {tags?.length || badges?.accent || badges?.quiet?.length ? (
        <div className="x-problem__section">
          <h4 className="x-problem__heading">Tags & Topic Classifications</h4>
          <div className="x-problem__tags">
            {tags?.map((t) => (
              <span key={t} className="x-chip">
                {t}
              </span>
            ))}
            {badges?.accent ? <span className="x-chip x-chip--accent">{badges.accent}</span> : null}
            {badges?.quiet?.map((b) => (
              <span key={b} className="x-chip x-chip--quiet">
                {b}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {constraints?.length ? (
        <div className="x-problem__constraints">
          <h4 className="x-problem__constraints-title">{constraintsTitle}</h4>
          <ul className="x-problem__constraints-list">
            {constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {children}

      {verdict ? (
        <div className="x-problem__verdict" role="status">
          <p className="x-problem__verdict-text">
            <Icon name="check" size={14} />
            <span>{verdict.text}</span>
          </p>
          {verdict.action ? <div className="x-problem__verdict-action">{verdict.action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
