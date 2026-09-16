/**
 * IconButton — the icon-only square button, extracted from `.icon-btn`
 * (shell.css:603-612). Live sites: Shell.tsx:138 (notifications, with the
 * badge-dot pinned), :181 (Quick Notes), :477 (drawer close);
 * AdminShell.tsx:42 (nav close); Companion.tsx:165/:175 (dismiss, close).
 *
 * Three things the demo got right that this keeps, and two it fixes:
 *   kept   — 36px grid-centred square, muted ink → primary on hover
 *   kept   — the badge pin (position: relative host)
 *   fixed  — `aria-label` is a REQUIRED prop: an icon-only button with no
 *            name is a mystery key. `label` is not optional.
 *   fixed  — `disabled` is real (`disabled` + `aria-disabled` + data-disabled),
 *            matching the Button contract; the companion's dismiss used it
 *            bare.
 *
 * `badge` renders the count pip — the sibling `x-badge-dot` referenced by
 * class (contract §6 — a later pass may promote the class to an import), and
 * `badgeLabel` folds the count into the accessible name: the visual dot is
 * aria-hidden, so "Notifications, 3 unread" is the honest announcement.
 */

import type { MouseEvent } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./IconButton.css";

export interface IconButtonProps {
  icon: IconName;
  /** Accessible name — REQUIRED. An icon-only control has no visible text. */
  label: string;
  /** Unread/count pin — renders BadgeDot in the corner. 0 renders nothing. */
  badge?: number | null;
  /** Count folded into the accessible name, e.g. "3 unread" → "Notifications, 3 unread". */
  badgeLabel?: string;
  iconSize?: number;
  /** Toggle semantics — aria-expanded for popover/panel triggers. */
  expanded?: boolean;
  /** data-on for on/off icon toggles. */
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function IconButton({
  icon,
  label,
  badge,
  badgeLabel,
  iconSize = 18,
  expanded,
  active,
  disabled,
  onClick,
  className = ""
}: IconButtonProps) {
  const showBadge = badge !== null && badge !== undefined && badge > 0;
  const accessibleLabel = showBadge && badgeLabel ? `${label}, ${badgeLabel}` : label;

  return (
    <button
      type="button"
      className={`x-icon-btn ${className}`.trim()}
      aria-label={accessibleLabel}
      aria-expanded={expanded}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-on={active || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} size={iconSize} />
      {showBadge ? (
        <span className="x-badge-dot" aria-hidden="true">
          {(badge ?? 0) > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  );
}
