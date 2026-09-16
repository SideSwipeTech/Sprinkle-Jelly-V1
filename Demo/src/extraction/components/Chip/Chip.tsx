/**
 * Chip — the small pill that is either a filter toggle or a status tag.
 *
 * One component, two honest roles:
 *   - interactive  <button aria-pressed data-on>   filter selections, toggles
 *   - static       <span>                          metadata and verdict tags
 *
 * The demo carried two divergent `.chip` definitions (app.css vs home.css) and two
 * modifier classes with no backing styles at all (`chip--accent`, `chip--quiet` on the
 * canonical paint). This is the single canonical version: `x-chip`, modifiers
 * `x-chip--quiet` / `x-chip--accent` / `x-chip--sm`, selected state on `data-on`.
 *
 * Verdict colouring (Accepted / Easy / TLE …) is NOT here — that is the states family's
 * badge job. A chip only ever means "selectable / selected" or "small fact".
 */

import type { ReactNode, MouseEvent } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./Chip.css";

export interface ChipProps {
  children: ReactNode;
  /** Selected / on state. Paints `data-on`; on a button it also sets `aria-pressed`. */
  selected?: boolean;
  /** quiet = recessive metadata pill. accent = accent-tinted tag. default = outlined. */
  variant?: "default" | "quiet" | "accent";
  /** sm matches the legacy fontSize:11px overrides — dense tag rows and card meta. */
  size?: "md" | "sm";
  icon?: IconName;
  /** Static tag when omitted; toggle button when provided. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Accessible name when the chip is icon-only or its text is not self-naming. */
  label?: string;
  className?: string;
}

export function Chip({
  children,
  selected,
  variant = "default",
  size = "md",
  icon,
  onClick,
  disabled,
  label,
  className = ""
}: ChipProps) {
  const classes = [
    "x-chip",
    variant !== "default" ? `x-chip--${variant}` : "",
    size !== "md" ? `x-chip--${size}` : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      {icon ? <Icon name={icon} size={size === "sm" ? 12 : 14} /> : null}
      <span className="x-chip__text">{children}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        data-on={selected || undefined}
        aria-pressed={selected ?? false}
        aria-label={label}
        disabled={disabled}
        data-disabled={disabled || undefined}
        onClick={onClick}
      >
        {body}
      </button>
    );
  }

  return (
    <span
      className={classes}
      data-on={selected || undefined}
      data-disabled={disabled || undefined}
    >
      {body}
    </span>
  );
}
