/**
 * CodeWorkbench — the one coding surface every practice domain mounts: Code
 * Lab, challenges, the Daily, Debug Detective and project workspaces.
 *
 *   ┌ toolbar: file · language · page actions ········ editor tools · focus ┐
 *   │ [sidebar] │ tabs                                                     │
 *   │           │ editor                                                   │
 *   │           ├──────── drag to resize ─────────────────────────────────┤
 *   │           │ console: Output · Test results · Input                   │
 *   └ Run · Submit │ Ln/Col · lines ·························· language ┘
 *
 * Pages supply the domain's material through slots and keep their own rules;
 * the workbench owns the chrome, the Ctrl/Cmd+Enter shortcuts outside the
 * editor, the console's height (a device preference) and focus mode.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { EditorStatusBar, EditorTools, Kbd, SHORTCUTS } from "./EditorChrome";
import { fileIcon } from "./language";
import { getEditorPreferences, setEditorPreferences } from "./preferences";
import {
  createStatusStore,
  WorkbenchContext,
  type EditorApi,
  type WorkbenchContextValue
} from "./workbench-context";
import "./code-workbench.css";

export interface CodeWorkbenchProps {
  /** Landmark name — "Challenge workbench". */
  label: string;
  /** Single-file surfaces name their file in the toolbar. */
  fileName?: string;
  fileIconName?: IconName;
  toolbar?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  sidebar?: ReactNode;
  editor: ReactNode;
  console: ReactNode;
  /** Primary actions, leading the footer — Run, Submit. */
  footer?: ReactNode;
  statusItems?: ReactNode[];
  onRun?: () => void;
  onSubmit?: () => void;
  /** While true the console is kept open so the run is visible. */
  busy?: boolean;
  className?: string;
}

function rowHeight(el: Element | null): number {
  const raw = el ? parseFloat(getComputedStyle(el).getPropertyValue("--row-height")) : NaN;
  return Number.isFinite(raw) && raw > 0 ? raw : 44;
}

export function CodeWorkbench({
  label,
  fileName,
  fileIconName,
  toolbar,
  actions,
  tabs,
  sidebar,
  editor,
  console: consolePanel,
  footer,
  statusItems,
  onRun,
  onSubmit,
  busy = false,
  className = ""
}: CodeWorkbenchProps) {
  const rootRef = useRef<HTMLElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [status] = useState(createStatusStore);
  const [api, setApi] = useState<EditorApi | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(() => getEditorPreferences().consoleHeight);
  const [dragging, setDragging] = useState(false);
  const heightRef = useRef(consoleHeight);
  heightRef.current = consoleHeight;

  const runRef = useRef(onRun);
  runRef.current = onRun;
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const registerEditor = useCallback((next: EditorApi) => setApi(next), []);
  const unregisterEditor = useCallback((gone: EditorApi) => setApi((cur) => (cur === gone ? null : cur)), []);

  const context = useMemo<WorkbenchContextValue>(
    () => ({
      status,
      registerEditor,
      unregisterEditor,
      runRef,
      submitRef,
      consoleCollapsed: collapsed,
      setConsoleCollapsed: setCollapsed
    }),
    [status, registerEditor, unregisterEditor, collapsed]
  );

  /* A run opens the console so its progress and result are seen. */
  useEffect(() => {
    if (busy) setCollapsed(false);
  }, [busy]);

  /* Ctrl/Cmd+Enter from anywhere on the page. Inside the editor its own action
     handles the chord first and stops it, so a run never fires twice. */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || !(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('[role="dialog"], [aria-modal="true"]')) return;
      const handler = e.shiftKey ? submitRef.current : runRef.current;
      if (!handler) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!focusMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [focusMode]);

  const bounds = () => {
    const row = rowHeight(rootRef.current);
    const paneHeight = paneRef.current?.getBoundingClientRect().height ?? row * 14;
    return { min: row * 2.5, max: Math.max(row * 2.5, paneHeight - row * 3.5), step: row / 2 };
  };

  const commitHeight = (next: number) => {
    const { min, max } = bounds();
    const clamped = Math.round(Math.min(max, Math.max(min, next)));
    setConsoleHeight(clamped);
    return clamped;
  };

  const onSplitterDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    const startY = e.clientY;
    const startHeight = collapsed ? bounds().min : heightRef.current;
    handle.setPointerCapture(e.pointerId);
    setDragging(true);
    setCollapsed(false);

    const move = (ev: PointerEvent) => commitHeight(startHeight - (ev.clientY - startY));
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      setDragging(false);
      setEditorPreferences({ consoleHeight: heightRef.current });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  const onSplitterKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const { step, min, max } = bounds();
    let next: number | null = null;
    if (e.key === "ArrowUp") next = heightRef.current + step;
    else if (e.key === "ArrowDown") next = heightRef.current - step;
    else if (e.key === "Home") next = max;
    else if (e.key === "End") next = min;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setCollapsed((c) => !c);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    setCollapsed(false);
    setEditorPreferences({ consoleHeight: commitHeight(next) });
  };

  const style = { "--code-wb-console-height": `${consoleHeight}px` } as CSSProperties;

  return (
    <WorkbenchContext.Provider value={context}>
      <section
        ref={rootRef}
        className={`code-wb ${className}`.trim()}
        aria-label={label}
        data-focus={focusMode || undefined}
        data-dragging={dragging || undefined}
        data-collapsed={collapsed || undefined}
        style={style}
      >
        <header className="code-wb__bar">
          <div className="code-wb__lead">
            {fileName ? (
              <span className="code-wb__file" title={fileName}>
                <Icon name={fileIconName ?? fileIcon(fileName)} size={14} />
                <span>{fileName}</span>
              </span>
            ) : null}
            {toolbar}
          </div>
          <div className="code-wb__trail">
            {actions ? <div className="code-wb__actions">{actions}</div> : null}
            <EditorTools api={api} status={status} hasRun={Boolean(onRun)} hasSubmit={Boolean(onSubmit)} />
            <button
              type="button"
              className="editor-tool"
              aria-pressed={focusMode}
              onClick={() => setFocusMode((f) => !f)}
              title={focusMode ? "Exit focus mode (Esc)" : "Focus mode"}
              aria-label={focusMode ? "Exit focus mode" : "Focus mode"}
            >
              <Icon name={focusMode ? "x" : "maximize"} size={14} />
            </button>
          </div>
        </header>

        <div className="code-wb__main" data-side={sidebar ? true : undefined}>
          {sidebar ? <div className="code-wb__side">{sidebar}</div> : null}
          <div className="code-wb__pane" ref={paneRef}>
            {tabs ? <div className="code-wb__tabs">{tabs}</div> : null}
            <div className="code-wb__editor">{editor}</div>
            <div
              className="code-wb__splitter"
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize console"
              aria-valuenow={collapsed ? 0 : consoleHeight}
              tabIndex={0}
              onPointerDown={onSplitterDown}
              onKeyDown={onSplitterKey}
              onDoubleClick={() => setCollapsed((c) => !c)}
            />
            <div className="code-wb__console">{consolePanel}</div>
          </div>
        </div>

        <footer className="code-wb__foot">
          {footer ? <div className="code-wb__primary">{footer}</div> : null}
          <EditorStatusBar status={status} extra={statusItems} className="code-wb__status" />
        </footer>
      </section>
    </WorkbenchContext.Provider>
  );
}

/* ── Actions ───────────────────────────────────────────────────────────────── */

export interface RunButtonProps {
  onClick: () => void;
  running?: boolean;
  disabled?: boolean;
  label?: string;
  runningLabel?: string;
  /** Show the Ctrl/Cmd+Enter hint (only the primary run carries it). */
  shortcut?: boolean;
  title?: string;
}

export function RunButton({
  onClick,
  running = false,
  disabled = false,
  label = "Run",
  runningLabel = "Running…",
  shortcut = true,
  title
}: RunButtonProps) {
  return (
    <button
      type="button"
      className="wb-button"
      data-kind="run"
      data-running={running || undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon name={running ? "loader" : "play"} size={13} motion={running ? "orbit" : "none"} />
      <span>{running ? runningLabel : label}</span>
      {shortcut ? <Kbd keys={SHORTCUTS.run} /> : null}
    </button>
  );
}

export interface SubmitButtonProps {
  onClick: () => void;
  pending?: boolean;
  disabled?: boolean;
  label?: string;
  pendingLabel?: string;
  title?: string;
}

export function SubmitButton({
  onClick,
  pending = false,
  disabled = false,
  label = "Submit",
  pendingLabel = "Grading…",
  title
}: SubmitButtonProps) {
  return (
    <button
      type="button"
      className="wb-button"
      data-kind="submit"
      data-running={pending || undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon name={pending ? "loader" : "check"} size={13} motion={pending ? "orbit" : "none"} />
      <span>{pending ? pendingLabel : label}</span>
      <Kbd keys={SHORTCUTS.submit} />
    </button>
  );
}

export interface ToolButtonProps {
  icon: IconName;
  children?: ReactNode;
  onClick: () => void;
  on?: boolean;
  /** An armed two-step action (a reset awaiting confirmation). */
  armed?: boolean;
  disabled?: boolean;
  title?: string;
}

/** A labelled toolbar action for the page's own controls. */
export function ToolButton({ icon, children, onClick, on, armed, disabled = false, title }: ToolButtonProps) {
  return (
    <button
      type="button"
      className="wb-tool"
      data-armed={armed || undefined}
      aria-pressed={on === undefined ? undefined : on}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon name={icon} size={13} />
      {children ? <span>{children}</span> : null}
    </button>
  );
}
