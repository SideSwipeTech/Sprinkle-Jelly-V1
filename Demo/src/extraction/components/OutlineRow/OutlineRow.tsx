/**
 * OutlineRow — the numbered divided row of a curriculum outline, plus its
 * `OutlineList` container.
 *
 * Extracted from lab.css:90-110 (`.outline`/`.outline__row`/`.outline__n`) and
 * Learn.tsx:237-254. The demo marked a finished lesson with a `3px solid #2dd4bf`
 * left-edge literal; now `data-done` carries it — edge, check glyph and the word
 * all say "done", colour only reinforces.
 */

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./OutlineRow.css";

export function OutlineList({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="x-outline" role="list" aria-label={label}>
      {children}
    </div>
  );
}

export interface OutlineRowProps {
  /** 1-based position — rendered as a padded mono numeral. */
  n: number;
  /** Link target; omit for a non-interactive row. */
  to?: string;
  /** Marked complete — left charge edge + check, non-colour tell included. */
  done?: boolean;
  title: ReactNode;
  meta?: ReactNode;
  /** Trailing slot — status chips, chevron. Defaults to check/chevron by done. */
  trailing?: ReactNode;
}

export function OutlineRow({ n, to, done, title, meta, trailing }: OutlineRowProps) {
  const content = (
    <>
      <span className="x-outline-row__n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <span className="x-outline-row__main">
        <strong className="x-outline-row__title">{title}</strong>
        {meta ? <span className="x-outline-row__meta">{meta}</span> : null}
      </span>
      <span className="x-outline-row__trailing">
        {trailing ?? <Icon name={done ? "check" : "chevron-right"} size={16} />}
      </span>
    </>
  );

  const className = "x-outline-row";
  const stateProps = { "data-done": done || undefined };

  return to ? (
    <Link role="listitem" className={className} to={to} {...stateProps}>
      {content}
    </Link>
  ) : (
    <div role="listitem" className={className} {...stateProps}>
      {content}
    </div>
  );
}
