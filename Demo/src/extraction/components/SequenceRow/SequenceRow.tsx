/**
 * SequenceRow — the carded, mono-prefixed progression row.
 *
 * Extracted from Practice.tsx:270-277 (TrackDetail "Curriculum Sequence"). It
 * composes the containers family's `x-list-row` for the frame and adds the
 * 01/02/… prefix + done indicator. The demo's `rgba(45,212,191,.15)`/"✓ Solved"
 * literal becomes `data-done` + check icon + word.
 */

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./SequenceRow.css";

export interface SequenceRowProps {
  /** 1-based position — rendered padded ("01"). */
  n: number;
  to?: string;
  done?: boolean;
  /** Word on the done chip, e.g. "Solved" / "Completed". */
  doneLabel?: string;
  title: ReactNode;
  meta?: ReactNode;
}

export function SequenceRow({ n, to, done, doneLabel = "Done", title, meta }: SequenceRowProps) {
  const body = (
    <>
      <span className="x-sequence-row__n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <span className="x-sequence-row__main">
        <strong className="x-sequence-row__title">{title}</strong>
        {meta ? <span className="x-sequence-row__meta">{meta}</span> : null}
      </span>
      <span className="x-sequence-row__trailing">
        {done ? (
          <span className="x-chip x-sequence-row__done">
            <Icon name="check" size={12} />
            <span className="x-chip__text">{doneLabel}</span>
          </span>
        ) : (
          <Icon name="chevron-right" size={14} />
        )}
      </span>
    </>
  );

  const props = { className: "x-list-row x-list-row--center x-sequence-row", "data-done": done || undefined };
  return to ? <Link to={to} {...props}>{body}</Link> : <div {...props}>{body}</div>;
}
