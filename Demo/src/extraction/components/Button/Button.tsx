/**
 * Button — the action element, in every variant the demo reached for.
 *
 * Covers the legacy `.btn` family plus the states it faked:
 *   variant    primary | secondary | quiet | destructive
 *   size       md | sm            (`sm` is the workbench/toolbar size)
 *   loading    spinner + aria-busy, interaction held
 *   disabled   REAL semantics — `disabled` on a button, `aria-disabled` + removed from
 *              the tab order on a link. The demo's `pointerEvents:none` + opacity hack
 *              (Assess.tsx:388,859) is the violation this kills: it left the gated link
 *              focusable, activatable by keyboard, and announced as enabled.
 *
 * Renders `<button>` by default, or `Link` when `to` is set. A disabled `to` renders a
 * link that announces itself disabled and refuses navigation — not a dead-looking link
 * that still works.
 */

import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "destructive";
export type ButtonSize = "md" | "sm";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Route target — renders a router Link instead of a button. */
  to?: string;
  type?: "button" | "submit";
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  /** Text announced while loading, when the label alone would mislead. */
  loadingLabel?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  label?: string;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  type = "button",
  icon,
  iconEnd,
  loading = false,
  loadingLabel,
  disabled = false,
  onClick,
  label,
  className = ""
}: ButtonProps) {
  const inert = disabled || loading;
  const iconSize = size === "sm" ? 13 : 16;

  const classes = [
    "x-btn",
    `x-btn--${variant}`,
    size !== "md" ? `x-btn--${size}` : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      {loading ? (
        <Icon name="loader" size={iconSize} motion="orbit" />
      ) : (
        icon ? <Icon name={icon} size={iconSize} /> : null
      )}
      <span className="x-btn__label">{loading && loadingLabel ? loadingLabel : children}</span>
      {!loading && iconEnd ? <Icon name={iconEnd} size={iconSize} /> : null}
    </>
  );

  const shared = {
    className: classes,
    "data-disabled": inert || undefined,
    "data-loading": loading || undefined,
    "aria-label": label
  };

  if (to) {
    return (
      <Link
        {...shared}
        to={to}
        aria-disabled={inert || undefined}
        aria-busy={loading || undefined}
        tabIndex={inert ? -1 : undefined}
        onClick={(event) => {
          // The fix the pointerEvents hack never delivered: a disabled link does not
          // navigate, for pointer OR keyboard OR assistive technology.
          if (inert) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      {...shared}
      type={type}
      disabled={disabled}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (inert) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {body}
    </button>
  );
}
