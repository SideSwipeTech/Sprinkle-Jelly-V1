/**
 * ReviewItemCard — one question's outcome on the result review.
 *
 * Extracted from Assess.tsx:626-645. The demo painted correct/incorrect as
 * rgba(45,212,191,*) / rgba(251,113,133,*) fills; now `data-verdict` carries the
 * tone and the header spells it out ("✓ Correct" / "✕ Incorrect" + icon), so
 * the verdict survives greyscale and colour-blindness.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./ReviewItemCard.css";

export interface ReviewItemCardProps {
  /** 0-based item index — rendered as "Item n". */
  index: number;
  correct: boolean;
  prompt: ReactNode;
  /** The remediation text — the demo's inset "Remediation: …" block. */
  remediation?: ReactNode;
  /** Trailing meta, e.g. "+10 XP" / "0 XP". */
  credit?: string;
}

export function ReviewItemCard({ index, correct, prompt, remediation, credit }: ReviewItemCardProps) {
  return (
    <article className="x-review-item" data-verdict={correct ? "correct" : "incorrect"}>
      <div className="x-review-item__head">
        <span className="x-review-item__verdict">
          <Icon name={correct ? "check" : "x"} size={13} />
          Item {index + 1} · {correct ? "Correct" : "Incorrect"}
        </span>
        {credit ? <span className="x-review-item__credit">{credit}</span> : null}
      </div>
      <p className="x-review-item__prompt">{prompt}</p>
      {remediation ? (
        <p className="x-review-item__remediation">
          <strong>Remediation: </strong>
          {remediation}
        </p>
      ) : null}
    </article>
  );
}
