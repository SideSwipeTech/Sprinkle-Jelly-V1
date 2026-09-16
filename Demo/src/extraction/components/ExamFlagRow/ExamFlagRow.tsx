/**
 * ExamFlagRow — one exam-experience flag on the briefing preflight.
 *
 * Extracted from Assess.tsx:420-427 ("Exam Experience Flags", MCK-R42). The demo
 * hardcoded every flag as a teal "Active" chip — `rgba(45,212,191,.15)` on
 * `#2dd4bf`. Now `data-on` carries the state and the word + icon carry the
 * meaning: an off flag reads "Off", not a different shade of Active.
 */

import { Icon } from "@icons/Icon";
import "./ExamFlagRow.css";

export interface ExamFlagRowProps {
  name: string;
  /** What the flag does — the demo held this text but never rendered it. */
  hint?: string;
  on: boolean;
}

export function ExamFlagRow({ name, hint, on }: ExamFlagRowProps) {
  return (
    <div className="x-exam-flag-row" data-on={on || undefined}>
      <span className="x-exam-flag-row__name">
        {name}
        {hint ? <span className="x-exam-flag-row__hint">{hint}</span> : null}
      </span>
      <span className="x-chip x-exam-flag-row__status">
        <Icon name={on ? "check" : "minus"} size={12} />
        <span className="x-chip__text">{on ? "Active" : "Off"}</span>
      </span>
    </div>
  );
}
