/**
 * CompletionFactPanel — the factual record panel on a completed sitting.
 *
 * Extracted from Assess.tsx:1026-1033 (the CompanyResult "Sitting record" dl) and
 * 1044 (the privacy note). The definition list composes the containers family's
 * KeyValueRow classes (`x-key-value`) — this component owns the panel frame only:
 * term order is caller order, and an absent value is an em dash, never invented.
 */

import type { ReactNode } from "react";
import "./CompletionFactPanel.css";

export interface CompletionFact {
  term: string;
  /** null renders "—" — a fact that could not be read is stated, not zeroed. */
  value: ReactNode;
}

export interface CompletionFactPanelProps {
  facts: CompletionFact[];
  /** A closing note rendered as an inset (the demo's settings-note block). */
  note?: ReactNode;
  /** Action row / extra content under the facts. */
  children?: ReactNode;
  label?: string;
}

export function CompletionFactPanel({ facts, note, children, label = "Sitting record" }: CompletionFactPanelProps) {
  return (
    <section className="x-completion-facts" aria-label={label}>
      <dl className="x-key-value">
        {facts.map((fact) => (
          <div className="x-key-value__row" key={fact.term}>
            <dt className="x-key-value__term">{fact.term}</dt>
            <dd className="x-key-value__value">{fact.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {note ? <div className="x-completion-facts__note">{note}</div> : null}
      {children ? <div className="x-completion-facts__extra">{children}</div> : null}
    </section>
  );
}
