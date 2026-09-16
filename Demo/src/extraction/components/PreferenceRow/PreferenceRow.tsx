/**
 * PreferenceRow — a settings row: title + hint on the left, control on the right.
 *
 * Extracted from app.css:203-206 (`.preference-row`) and its two source shapes:
 * the checkbox row (`<label className="choice preference-row">`) and the
 * segmented-control row (`<div className="preference-row">`). `asLabel` picks
 * the element — a row containing a checkbox must be a label so the whole row
 * toggles; a row containing buttons must not.
 */

import type { ReactNode } from "react";
import "./PreferenceRow.css";

export interface PreferenceRowProps {
  title: string;
  /** The small-print explainer. */
  hint?: ReactNode;
  /** The control — checkbox input, segmented control, field+buttons. */
  control: ReactNode;
  /** Render as <label> (checkbox rows). Default false → <div>. */
  asLabel?: boolean;
  /** Extra status line under the hint (validation notes etc.). */
  note?: ReactNode;
}

export function PreferenceRow({ title, hint, control, asLabel, note }: PreferenceRowProps) {
  const body = (
    <>
      <span className="x-preference-row__text">
        <strong className="x-preference-row__title">{title}</strong>
        {hint ? <small className="x-preference-row__hint">{hint}</small> : null}
        {note ? <span className="x-preference-row__note" role="status">{note}</span> : null}
      </span>
      <span className="x-preference-row__control">{control}</span>
    </>
  );
  return asLabel ? (
    <label className="x-preference-row">{body}</label>
  ) : (
    <div className="x-preference-row">{body}</div>
  );
}
