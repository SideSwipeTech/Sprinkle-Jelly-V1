/**
 * Tooltip — the CSS-only tip, generalised from `.spine__tip` (shell.css:242-258).
 *
 * A wrapper component: it hosts one trigger child and a `role="tooltip"` label shown on
 * :hover and :focus-within — pointer and keyboard both get it, no JavaScript timer, no
 * listeners. The trigger gains `aria-describedby` pointing at the tip so assistive tech
 * announces the label too (the spine version was visual-only).
 *
 * Placement is a data attribute, not a prop-branch in markup: `data-side` on the tip.
 */

import { Children, cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import "./Tooltip.css";

export interface TooltipProps {
  /** The tip text. Keep it short — a label, not documentation. */
  label: string;
  /** Which side of the trigger the tip opens on. Default `right` (the spine pattern). */
  side?: "right" | "left" | "top" | "bottom";
  children: ReactNode;
}

export function Tooltip({ label, side = "right", children }: TooltipProps) {
  const tipId = useId();

  // Attach aria-describedby to the trigger child when it is a real element; otherwise
  // wrap — a non-element child can't hold the attribute.
  const trigger: ReactNode =
    isValidElement(children) && Children.count(children) === 1 ? (
      cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": tipId
      })
    ) : (
      <span aria-describedby={tipId}>{children}</span>
    );

  return (
    <span className="x-tip">
      {trigger}
      <span className="x-tip__label" role="tooltip" id={tipId} data-side={side}>
        {label}
      </span>
    </span>
  );
}
