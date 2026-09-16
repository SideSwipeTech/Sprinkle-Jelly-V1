/**
 * WorkbenchLayout — the bare pane split the Practice pages hand-rolled.
 *
 * Canonicalises the three inline grids in Practice.tsx, each a
 * `display:grid; gap:16px; minHeight:600ish` literal:
 *   :379  ChallengeSolve — statement | work      → layout "statement" (1fr / 1.35fr)
 *   :879  DebugSolve     — bug | fix             → layout "split"     (1fr / 1fr)
 *   :1077 ProjectWorkspace — files | editor | output → layout "tri" (rail / 1.4fr / 1fr)
 * plus `sidebar` (rail / pane) — the canonical rail split standing alone.
 *
 * `WorkbenchLayoutPaneHead` is the pane's caption row — accent-tick eyebrow +
 * title + right-aligned meta — so the grid reads as a workbench, not bare
 * boxes. As a `WorkbenchLayoutDock`'s first child it collapses into the dock's
 * title bar (one line, hairline, chrome tint).
 *
 * Boundary: this is the arrangement only — no toolbar, stdin strip or status
 * bar. The full chrome is the work/ family's `x-workbench` suite (Workbench /
 * WorkbenchToolbar / StdinRow / StatusBar), which wraps its own main split.
 * A bench surface composes the two: x-workbench chrome outside, this grid's
 * panes for the multi-pane arrangements WorkbenchMain cannot express.
 *
 * All four layouts collapse to a single column below the standard band — the
 * demo's inline grids never did, which is why narrow viewports clipped.
 */

import type { ReactNode } from "react";
import "./WorkbenchLayout.css";

export type WorkbenchLayoutKind = "statement" | "split" | "tri" | "sidebar";

export interface WorkbenchLayoutProps {
  children: ReactNode;
  /**
   * `statement` — 1fr / 1.35fr (read | solve). `split` — 1fr / 1fr
   * (bug | fix). `tri` — rail / 1.4fr / 1fr (files | editor | output).
   * `sidebar` — rail / pane standing alone.
   */
  layout?: WorkbenchLayoutKind;
  /** Accessible name — the region landmark; every workbench surface needs one. */
  label: string;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function WorkbenchLayout({
  children,
  layout = "statement",
  label,
  className = "",
  ...rest
}: WorkbenchLayoutProps) {
  return (
    <div
      className={`x-workbench-layout${className ? ` ${className}` : ""}`}
      data-layout={layout}
      role="region"
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface WorkbenchLayoutPaneProps {
  children: ReactNode;
  /** `flush` removes the inner gap — the editor stack (tabs + editor + dock)
   *  that must read as one continuous column. */
  flush?: boolean;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function WorkbenchLayoutPane({
  children,
  flush,
  className = "",
  ...rest
}: WorkbenchLayoutPaneProps) {
  return (
    <div
      className={`x-workbench-layout__pane${className ? ` ${className}` : ""}`}
      data-flush={flush || undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface WorkbenchLayoutPaneHeadProps {
  /** Micro caption over the title — the pane's role ("statement", "editor"). */
  eyebrow?: string;
  title: ReactNode;
  /** Right-side slot — counts, runtimes, key hints. */
  meta?: ReactNode;
  className?: string;
}

/**
 * The caption row a pane carries above its content: accent tick + eyebrow +
 * title, `meta` pushed right. Dropped as the first child of a Dock it becomes
 * the dock's title bar (compacts to one line, gains the header hairline) — the
 * CSS reads position, not a second component.
 */
export function WorkbenchLayoutPaneHead({
  eyebrow,
  title,
  meta,
  className = ""
}: WorkbenchLayoutPaneHeadProps) {
  return (
    <header className={`x-workbench-layout__pane-head${className ? ` ${className}` : ""}`}>
      <span className="x-workbench-layout__head-text">
        {eyebrow ? <span className="x-workbench-layout__eyebrow">{eyebrow}</span> : null}
        <span className="x-workbench-layout__title">{title}</span>
      </span>
      {meta ? <span className="x-workbench-layout__meta">{meta}</span> : null}
    </header>
  );
}

/** The flex region a suite panel (editor, terminal, explorer) fills. */
export function WorkbenchLayoutFill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`x-workbench-layout__fill${className ? ` ${className}` : ""}`}>{children}</div>;
}

/** The fixed output dock at a pane's foot — four row-heights, density-aware. */
export function WorkbenchLayoutDock({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`x-workbench-layout__dock${className ? ` ${className}` : ""}`}>{children}</div>;
}
