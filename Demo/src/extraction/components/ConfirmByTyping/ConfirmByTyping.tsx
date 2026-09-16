/**
 * ConfirmByTyping — the "type the exact phrase to arm the destructive action" gate
 * from the admin course lifecycle card (AdminPages.tsx:164-169): a field whose label
 * carries the phrase, an echo input, and an action that stays disabled until the
 * input matches exactly.
 *
 * Upgrades over the source: the phrase is rendered as styled code (findable, not just
 * interpolated text), the input gets `aria-invalid` while a non-empty value fails to
 * match, and a live `role="status"` line says why the action is still unreachable —
 * "a bad echo leaves the action unreachable" is now announced, not just implied.
 *
 * Gated children are a render prop: `(matched) => ReactNode`, the same contract as
 * AcknowledgeGate.
 */

import { useId, type ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./ConfirmByTyping.css";

export interface ConfirmByTypingProps {
  /** The exact string the learner must echo — e.g. the course title. */
  phrase: string;
  value: string;
  onChange: (value: string) => void;
  /** Label lead-in — default "Type {phrase} to confirm". */
  label?: ReactNode;
  /** Gated actions — called with `matched`. */
  children: (matched: boolean) => ReactNode;
  /** Compare loosely (trim + case-fold) instead of exact match. Default exact. */
  lax?: boolean;
  id?: string;
  className?: string;
}

export function ConfirmByTyping({
  phrase,
  value,
  onChange,
  label,
  children,
  lax = false,
  id,
  className = ""
}: ConfirmByTypingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const inputId = id ?? `x-confirm-${uid}`;
  const statusId = `x-confirm-status-${uid}`;

  const normalized = lax ? value.trim().toLowerCase() : value;
  const target = lax ? phrase.trim().toLowerCase() : phrase;
  const matched = normalized === target && normalized.length > 0;
  const dirty = value.length > 0;

  return (
    <div
      className={`x-confirm ${className}`}
      data-matched={matched || undefined}
    >
      <label className="x-confirm__label" htmlFor={inputId}>
        {label ?? (
          <>
            Type <code className="x-confirm__phrase">{phrase}</code> to confirm
          </>
        )}
      </label>
      <input
        id={inputId}
        className="x-confirm__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={dirty && !matched ? true : undefined}
        aria-describedby={statusId}
        autoComplete="off"
        spellCheck={false}
      />
      <p className="x-confirm__status" id={statusId} role="status">
        {matched ? (
          <>
            <Icon name="check" size={13} />
            <span>Matches — the action is armed.</span>
          </>
        ) : dirty ? (
          <span>Doesn’t match yet — the action stays unreachable.</span>
        ) : (
          <span>Type the phrase exactly as shown.</span>
        )}
      </p>
      <div className="x-confirm__actions">{children(matched)}</div>
    </div>
  );
}
