/**
 * MaintenancePreview — the learner-facing read of a declared window.
 *
 * Extracted from admin-shell.css:176-177 and AdminPages.tsx:1065-1076: status
 * chip + affected-paths title + learner-safe message + the two facts + the
 * no-manual-end note. Renders only when a window is actually declared — the
 * page's "complete all four fields" empty state stays a StateBlock upstream.
 */

import type { ReactNode } from "react";
import "./MaintenancePreview.css";

export interface MaintenancePreviewProps {
  /** Status word on the chip — the demo's is "Declared". */
  status: string;
  /** The affected paths line, e.g. "Batch execution, assessment grading". */
  title: string;
  message: ReactNode;
  /** Window facts — starts / expected end. null renders an em dash. */
  facts: { term: string; value: ReactNode }[];
  /** The closing note, e.g. "ends only when health signals recover". */
  note?: ReactNode;
}

export function MaintenancePreview({ status, title, message, facts, note }: MaintenancePreviewProps) {
  return (
    <div className="x-maintenance-preview">
      <span className="x-chip x-chip--quiet x-maintenance-preview__status">
        <span className="x-chip__text">{status}</span>
      </span>
      <h3 className="x-maintenance-preview__title">{title}</h3>
      <p className="x-maintenance-preview__message">{message}</p>
      <dl className="x-key-value">
        {facts.map((fact) => (
          <div className="x-key-value__row" key={fact.term}>
            <dt className="x-key-value__term">{fact.term}</dt>
            <dd className="x-key-value__value">{fact.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {note ? <p className="x-maintenance-preview__note">{note}</p> : null}
    </div>
  );
}
