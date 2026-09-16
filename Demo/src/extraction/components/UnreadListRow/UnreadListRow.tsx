/**
 * UnreadListRow — the notification record row.
 *
 * Extracted from Account.tsx:72-88 (`/notifications`): a `list-row` article that
 * painted `border-left: 3px solid var(--c-accent-primary)` + a "NEW" chip in
 * `color: "white"` when unread. The edge is now `data-unread` on `x-list-row`
 * (a shape tell, painted by the sibling's stylesheet); the chip is the
 * `x-unread-list-row__new` marker — text first, `--c-on-accent-primary` ink
 * (which is NOT white in every theme).
 *
 * This is a pure composition: it emits `x-list-row` directly rather than
 * importing the sibling ListRow component, per contract §6.
 */

import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./UnreadListRow.css";

export interface UnreadListRowProps {
  /** The record's headline. */
  title: ReactNode;
  /** Trailing meta — the timestamp / source line. */
  meta?: ReactNode;
  /** Body line under the head. */
  children?: ReactNode;
  /** Unread — paints the accent edge (`data-unread`) and shows the marker. */
  unread?: boolean;
  /** The unread marker text — "NEW" by default; `null` hides it (the edge stays). */
  badge?: ReactNode;
  /** Route target — renders a router Link. */
  to?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Static element when not interactive: `article` (default) or `div`. */
  as?: "article" | "div";
  /** Selected — `data-on` (+ `aria-pressed` on a button row). */
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function UnreadListRow({
  title,
  meta,
  children,
  unread,
  badge = "NEW",
  to,
  onClick,
  as = "article",
  selected,
  disabled,
  className = "",
  ...rest
}: UnreadListRowProps) {
  const classes = `x-list-row x-unread-list-row${className ? ` ${className}` : ""}`;

  const shared = {
    className: classes,
    "data-unread": unread || undefined,
    "data-on": selected || undefined,
    "data-disabled": disabled || undefined,
    ...rest
  };

  const body = (
    <div className="x-unread-list-row__main">
      <div className="x-unread-list-row__head">
        <strong className="x-unread-list-row__title">{title}</strong>
        <span className="x-unread-list-row__meta">
          {meta}
          {unread && badge != null ? (
            <span className="x-unread-list-row__new">{badge}</span>
          ) : null}
        </span>
      </div>
      {children ? <p className="x-unread-list-row__body">{children}</p> : null}
    </div>
  );

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  if (to) {
    return (
      <Link
        {...shared}
        to={to}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={handleClick}
      >
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        {...shared}
        type="button"
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-pressed={selected === undefined ? undefined : selected}
        onClick={handleClick}
      >
        {body}
      </button>
    );
  }

  const Tag = as === "article" ? "article" : "div";
  return (
    <Tag {...shared} aria-disabled={disabled || undefined}>
      {body}
    </Tag>
  );
}
