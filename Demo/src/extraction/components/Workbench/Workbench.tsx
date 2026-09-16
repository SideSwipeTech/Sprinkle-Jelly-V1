/**
 * Workbench — the canonical code-workbench shell (was `.workbench` in lab.css:230-471).
 *
 * One bordered panel; every part inside joins by 1px dividers and loses its own chrome
 * (`.x-workbench .x-file-explorer | .x-editor | .x-terminal` fusion rules in the CSS).
 * The frame carries the card family's accent edge (`--card-edge`) and the two chrome
 * bookends — toolbar, status bar — close on the tinted `--x-workbench-seam` hairline,
 * so the bench reads as one deliberate instrument rather than stacked boxes.
 * The three hand-rolled Practice layouts (Practice.tsx:379 / :879 / :1077) and the CodeLab
 * bench (Learn.tsx:998-1123) are the same anatomy — this suite is the one system:
 *
 *   <Workbench label="CodeLab workbench">
 *     <WorkbenchToolbar>
 *       <WorkbenchTools>… LanguageSelect, WorkbenchHint …</WorkbenchTools>
 *       <WorkbenchTools>… ToolButton(s), RunButton …</WorkbenchTools>
 *     </WorkbenchToolbar>
 *     <StdinRow … />                       optional strip
 *     <WorkbenchMain side={<FileExplorer/>}>
 *       <WorkbenchPane>
 *         <EditorTabs … />                 sibling by class contract
 *         <WorkbenchEditorArea><CodeEditorChrome/></WorkbenchEditorArea>
 *         <WorkbenchOutput><Terminal/></WorkbenchOutput>
 *       </WorkbenchPane>
 *     </WorkbenchMain>
 *     <StatusBar><StatusGroup items={…}/><StatusGroup items={…}/></StatusBar>
 *   </Workbench>
 */

import { Fragment, useId } from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { StateBlock } from "@components/Card";
import "./Workbench.css";

export interface WorkbenchProps {
  /** Accessible landmark name — every workbench on a page needs one. */
  label: string;
  children: ReactNode;
  className?: string;
}

export function Workbench({ label, children, className = "" }: WorkbenchProps) {
  return (
    <section className={`x-workbench${className ? ` ${className}` : ""}`} aria-label={label}>
      {children}
    </section>
  );
}

/* ── Toolbar ─────────────────────────────────────────────────────────────── */

/** The chrome strip. Convention: two WorkbenchTools groups — context left, actions right. */
export function WorkbenchToolbar({ children }: { children: ReactNode }) {
  return <header className="x-workbench__toolbar">{children}</header>;
}

export function WorkbenchTools({ children }: { children: ReactNode }) {
  return <div className="x-workbench__tools">{children}</div>;
}

/** Passive context readout in the toolbar (active file, detected runtime, …). */
export function WorkbenchHint({
  icon = "code",
  title,
  children
}: {
  icon?: IconName;
  title?: string;
  children: ReactNode;
}) {
  return (
    <span className="x-workbench__hint" title={title}>
      <Icon name={icon} size={12} />
      <span>{children}</span>
    </span>
  );
}

export interface ToolButtonProps {
  icon?: IconName;
  /**
   * Toggle semantics. When `on` is provided the button is a real toggle:
   * `data-on` paints it and `aria-pressed` announces it. Leave undefined for
   * momentary actions (Reset, Format, …).
   */
  on?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  children: ReactNode;
}

export function ToolButton({ icon, on, disabled, onClick, title, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      className="x-workbench__tool"
      data-on={on || undefined}
      aria-pressed={on === undefined ? undefined : on}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      title={title}
    >
      {icon ? <Icon name={icon} size={13} /> : null}
      <span>{children}</span>
    </button>
  );
}

export interface RunButtonProps {
  /** True while a run is in flight — disables the button and swaps icon/label. */
  running?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function RunButton({ running = false, disabled, onClick, children }: RunButtonProps) {
  const gated = disabled || running;
  return (
    <button
      type="button"
      className="x-workbench__run"
      onClick={onClick}
      disabled={gated}
      aria-disabled={gated || undefined}
      data-running={running || undefined}
    >
      <Icon name={running ? "loader" : "zap"} size={13} motion={running ? "flow" : "none"} />
      <span>{children ?? (running ? "Running…" : "Run")}</span>
    </button>
  );
}

/* ── stdin strip ─────────────────────────────────────────────────────────── */

export interface StdinRowProps {
  value: string;
  onChange: (value: string) => void;
  /** Visible strip label; also the input's accessible name via htmlFor. */
  label?: string;
  placeholder?: string;
}

export function StdinRow({ value, onChange, label = "stdin", placeholder }: StdinRowProps) {
  const id = useId();
  return (
    <div className="x-workbench__stdin">
      <label className="x-workbench__stdin-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="x-workbench__stdin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Input passed to the program on run"}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
      />
    </div>
  );
}

/* ── Main split ──────────────────────────────────────────────────────────── */

export interface WorkbenchMainProps {
  /**
   * The side rail — a FileExplorer in practice. Rendered as the grid's first
   * track; any `.x-file-explorer` inside a workbench fuses into the frame by CSS.
   */
  side?: ReactNode;
  children: ReactNode;
}

export function WorkbenchMain({ side, children }: WorkbenchMainProps) {
  return (
    <div className="x-workbench__main" data-layout={side !== undefined ? "sidebar" : "plain"}>
      {side}
      {children}
    </div>
  );
}

/** The right-hand column: tabs strip, editor surface, output dock. */
export function WorkbenchPane({ children }: { children: ReactNode }) {
  return <div className="x-workbench__pane">{children}</div>;
}

/**
 * Flex region the editor surface fills. No children → an honest `empty`
 * StateBlock ("no file open") — the pane never renders as a bare void.
 */
export function WorkbenchEditorArea({ children }: { children?: ReactNode }) {
  return (
    <div className="x-workbench__editor-area">
      {children ?? (
        <StateBlock
          state="empty"
          compact
          message="No file open. Pick a file from the explorer to start editing."
        />
      )}
    </div>
  );
}

/** Fixed output dock at the foot of a pane. */
export function WorkbenchOutput({ children }: { children: ReactNode }) {
  return <div className="x-workbench__output">{children}</div>;
}

/* ── Status bar ──────────────────────────────────────────────────────────── */

/**
 * The foot strip. Convention: two StatusGroups — cursor/file facts left,
 * runtime/encoding/keymap facts right.
 */
export function StatusBar({ children }: { children: ReactNode }) {
  return <footer className="x-workbench__status">{children}</footer>;
}

export interface StatusGroupProps {
  /** Facts in display order; falsy items drop out, separators join the rest. */
  items: ReactNode[];
}

export function StatusGroup({ items }: StatusGroupProps) {
  const shown = items.filter((item) => item !== null && item !== undefined && item !== false);
  return (
    <div className="x-workbench__status-group">
      {shown.map((item, i) => (
        <Fragment key={i}>
          {i > 0 ? <i className="x-workbench__status-sep" aria-hidden="true" /> : null}
          {item}
        </Fragment>
      ))}
    </div>
  );
}
