/**
 * AcknowledgeGate — the "tick the box, then the action unlocks" pattern from the
 * sitting briefings (Assess.tsx:380-384, 851-854) and the admin broadcast composer
 * (AdminPages.tsx:393-394).
 *
 * What it fixes: the gated action in the demo was a Link given `pointerEvents:none` +
 * `opacity:0.5` — it looked disabled but stayed focusable and keyboard-activatable.
 * Here the gate is real: children receive `acknowledged` and must put `disabled` on
 * the control (Button does this honestly — `disabled` on a button, `aria-disabled` +
 * no navigation on a link). The checkbox is a real styled input, not a native blob.
 *
 * Usage:
 *   <AcknowledgeGate checked={ok} onChange={setOk} label="I acknowledge the rules.">
 *     {(ok) => <Button to="/mock/x/sitting" disabled={!ok}>Start</Button>}
 *   </AcknowledgeGate>
 */

import { useId, type ReactNode } from "react";
import "./AcknowledgeGate.css";

export interface AcknowledgeGateProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The acknowledgement sentence, e.g. "I acknowledge the test rules…". */
  label: ReactNode;
  /** Optional supporting line under the checkbox. */
  hint?: ReactNode;
  /** Gated actions — called with the current acknowledged state. */
  children: (acknowledged: boolean) => ReactNode;
  id?: string;
  className?: string;
}

export function AcknowledgeGate({
  checked,
  onChange,
  label,
  hint,
  children,
  id,
  className = ""
}: AcknowledgeGateProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const boxId = id ?? `x-ackgate-${uid}`;
  const hintId = `x-ackgate-hint-${uid}`;

  return (
    <div
      className={`x-ackgate ${className}`}
      data-acknowledged={checked || undefined}
    >
      <label className="x-ackgate__label" htmlFor={boxId}>
        <input
          id={boxId}
          className="x-ackgate__box"
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={hint ? hintId : undefined}
        />
        <span className="x-ackgate__text">{label}</span>
      </label>
      {hint ? (
        <p className="x-ackgate__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div className="x-ackgate__actions">{children(checked)}</div>
    </div>
  );
}
