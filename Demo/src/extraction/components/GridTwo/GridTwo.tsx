/**
 * GridTwo — the two-track page split, and its three-up sibling.
 *
 * Canonicalises the fixed-ratio grids:
 *   `.grid-2`        app.css:35-42   → ratio "lead"     (1.2fr / 0.8fr)
 *   `.split`         surfaces.css:37 → ratio "balanced" (1.15fr / 0.85fr)
 *   `.split--editor` surfaces.css:46 → ratio "editor"   (0.42fr / 0.58fr, 52dvh floor)
 *   `.grid-3`        app.css:44-51   → `GridThree`
 *
 * One column below the standard band (900px — the band token's edge, restated
 * as a literal because custom properties cannot evaluate inside @media). The
 * demo's editor split used a 1100px threshold — folded to the standard band;
 * a component may never invent a global breakpoint.
 *
 * For auto-fit card grids see CardGrid; for workbench pane splits see
 * WorkbenchLayout.
 */

import type { ReactNode } from "react";
import "./GridTwo.css";

export type GridTwoRatio = "lead" | "balanced" | "editor";

export interface GridTwoProps {
  children: ReactNode;
  /**
   * `lead` (default — lead column + aside), `balanced` (near-even page split),
   * `editor` (narrow statement pane + wide work pane, with a viewport floor).
   */
  ratio?: GridTwoRatio;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function GridTwo({ children, ratio = "lead", className = "", ...rest }: GridTwoProps) {
  return (
    <div
      className={`x-grid-two${className ? ` ${className}` : ""}`}
      data-ratio={ratio}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface GridThreeProps {
  children: ReactNode;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function GridThree({ children, className = "", ...rest }: GridThreeProps) {
  return (
    <div className={`x-grid-three${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </div>
  );
}
