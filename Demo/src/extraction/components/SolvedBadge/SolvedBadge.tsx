/**
 * SolvedBadge — the "✓ Solved" marker. Kills the literal teal chips at
 * Practice.tsx:213, :276, the solved state in list rows, and the demo's
 * `borderLeft: 3px solid #2dd4bf` solved-row tint (Practice.tsx:184 — that
 * becomes the badge's job inside the row).
 *
 * The check is the tell — `check-mark` is a bare tick, not a circle-check, so
 * it reads at 12px inside a dense row. Colour reinforces through the success
 * token; the word "Solved" plus the tick carry it without hue.
 *
 * Static only — solved is a fact, never a toggle.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./SolvedBadge.css";

export interface SolvedBadgeProps {
  /** Default "Solved" — callers may render "Accepted on this device". */
  children?: ReactNode;
  className?: string;
}

export function SolvedBadge({ children = "Solved", className = "" }: SolvedBadgeProps) {
  return (
    <span className={`x-solved-badge ${className}`.trim()} data-done="">
      <Icon name="check-mark" size={12} />
      <span className="x-solved-badge__label">{children}</span>
    </span>
  );
}
