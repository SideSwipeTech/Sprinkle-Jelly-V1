/**
 * ListRow — the polymorphic row and its stack.
 *
 * Canonicalises `.list` / `.list-row` (app.css:83-102), used at ~25 sites across
 * every page. One row, three honest element kinds, resolved in this order:
 *
 *   `to`        → router Link        (navigable rows: catalogues, results, records)
 *   `onClick`   → `<button>`         (selectable rows: pickers, chapter lists)
 *   `as`        → `article` / `div`  (static record rows: requests, certificates)
 *
 * An `onClick` always produces a real `<button>` — an interactive row must be a
 * real interactive element, and the demo never had a clickable div to preserve.
 *
 * State rides data attributes per the contract: `data-on` (selected / current),
 * `data-done` (completed — success edge), `data-unread` (unread — accent edge),
 * `data-disabled`. Buttons announce `aria-pressed` when `selected` is passed and
 * `aria-current` when `current` is; links announce `aria-current`. `data-hover`
 * and `data-focus` are sink pins so the state matrix can show hover/focus
 * statically — pages never set them.
 *
 * Sibling note: SequenceRow and UnreadListRow emit `x-list-row` directly per
 * contract §6 — this stylesheet is the frame they compose onto.
 */

import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./ListRow.css";

/* ── The stack ───────────────────────────────────────────────────────────── */

export interface ListProps {
  children: ReactNode;
  className?: string;
}

export function List({ children, className = "" }: ListProps) {
  return <div className={`x-list${className ? ` ${className}` : ""}`}>{children}</div>;
}

/* ── The row ─────────────────────────────────────────────────────────────── */

export interface ListRowProps {
  children: ReactNode;
  /** Route target — renders a router Link. */
  to?: string;
  /** Static element: `article` for self-contained records, `div` otherwise. */
  as?: "div" | "article";
  /** Selected — paints `data-on`; on a button row also sets `aria-pressed`. */
  selected?: boolean;
  /** Points at the thing currently open — `data-on` + `aria-current`. */
  current?: boolean;
  /** Completed record — `data-done` paints the success edge. */
  done?: boolean;
  /** Unread record — `data-unread` paints the accent edge. */
  unread?: boolean;
  /** Inert: `disabled`/`aria-disabled`, leaves the tab order, refuses activation. */
  disabled?: boolean;
  /** `center` for single-line rows (the demo's inline alignItems overrides). */
  align?: "start" | "center";
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Accessible name when the row's own text does not name it. */
  label?: string;
  className?: string;
  /** Sink pins and forwarded data-/aria- attributes. */
  [key: `data-${string}`]: unknown;
}

export function ListRow({
  children,
  to,
  as,
  selected,
  current,
  done,
  unread,
  disabled,
  align,
  onClick,
  label,
  className = "",
  ...rest
}: ListRowProps) {
  const classes = [
    "x-list-row",
    align === "center" ? "x-list-row--center" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const shared = {
    className: classes,
    "data-on": selected || current || undefined,
    "data-done": done || undefined,
    "data-unread": unread || undefined,
    "data-disabled": disabled || undefined,
    "aria-label": label,
    ...rest
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    // A disabled row does not navigate or fire — for pointer, keyboard, and AT.
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
        aria-current={current ? "true" : undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={handleClick}
      >
        {children}
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
        aria-current={current ? "true" : undefined}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }

  const Tag = as === "article" ? "article" : "div";
  return (
    <Tag {...shared} aria-disabled={disabled || undefined}>
      {children}
    </Tag>
  );
}
