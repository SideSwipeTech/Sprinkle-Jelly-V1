/**
 * EditorChrome — the parts around the editing surface that every editor on
 * the platform shares: the tool cluster (format, copy, settings), the settings
 * popover with its shortcut sheet, and the status bar.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "@icons/Icon";
import { canFormat, languageName } from "./language";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  setEditorPreferences,
  useEditorPreferences
} from "./preferences";
import {
  ALT_KEY,
  MOD_KEY,
  useEditorStatus,
  type EditorApi,
  type StatusStore
} from "./workbench-context";

/* ── Keys ──────────────────────────────────────────────────────────────────── */

export function Kbd({ keys }: { keys: string[] }) {
  return (
    <span className="editor-kbd" aria-hidden="true">
      {keys.map((key) => (
        <kbd key={key}>{key}</kbd>
      ))}
    </span>
  );
}

export const SHORTCUTS = {
  run: [MOD_KEY, "↵"],
  submit: [MOD_KEY, "⇧", "↵"]
};

/* ── Tool cluster ──────────────────────────────────────────────────────────── */

export interface EditorToolsProps {
  api: EditorApi | null;
  status: StatusStore;
  /** Whether a Submit shortcut exists here — listed in the shortcut sheet. */
  hasSubmit?: boolean;
  hasRun?: boolean;
}

export function EditorTools({ api, status, hasSubmit = false, hasRun = false }: EditorToolsProps) {
  const { language, readOnly } = useEditorStatus(status);
  const [copied, setCopied] = useState(false);
  const formattable = language !== null && canFormat(language) && !readOnly;

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const formatTitle = !language
    ? "Format document"
    : formattable
      ? `Format document (${ALT_KEY === "Alt" ? "Shift+Alt+F" : "⇧⌥F"})`
      : readOnly
        ? "Read-only — nothing to format"
        : `Formatting isn't available for ${languageName(language)}`;

  return (
    <div className="editor-tools" role="toolbar" aria-label="Editor tools">
      <button
        type="button"
        className="editor-tool"
        onClick={() => api?.format()}
        disabled={!api || !formattable}
        title={formatTitle}
        aria-label={formatTitle}
      >
        <Icon name="sparkles" size={14} />
      </button>
      <button
        type="button"
        className="editor-tool"
        data-done={copied || undefined}
        onClick={async () => {
          if (api && (await api.copy())) setCopied(true);
        }}
        disabled={!api}
        title={copied ? "Copied" : "Copy code"}
        aria-label={copied ? "Copied" : "Copy code"}
      >
        <Icon name={copied ? "check" : "copy"} size={14} />
      </button>
      <EditorSettings hasRun={hasRun} hasSubmit={hasSubmit} />
      <span className="editor-tools__live" role="status" aria-live="polite">
        {copied ? "Code copied to the clipboard" : ""}
      </span>
    </div>
  );
}

/* ── Settings popover ──────────────────────────────────────────────────────── */

function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="editor-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="editor-switch__text">
        <span>{label}</span>
        {hint ? <span className="editor-switch__hint">{hint}</span> : null}
      </span>
      <span className="editor-switch__track" aria-hidden="true">
        <span className="editor-switch__thumb" />
      </span>
    </button>
  );
}

function EditorSettings({ hasRun, hasSubmit }: { hasRun: boolean; hasSubmit: boolean }) {
  const prefs = useEditorPreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const shortcuts: { label: string; keys: string[] }[] = [
    ...(hasRun ? [{ label: "Run", keys: SHORTCUTS.run }] : []),
    ...(hasSubmit ? [{ label: "Submit", keys: SHORTCUTS.submit }] : []),
    { label: "Format document", keys: ["⇧", ALT_KEY, "F"] },
    { label: "Toggle word wrap", keys: [ALT_KEY, "Z"] },
    { label: "Find · Replace", keys: [MOD_KEY, "F"] },
    { label: "Comment line", keys: [MOD_KEY, "/"] },
    { label: "All commands", keys: ["F1"] }
  ];

  return (
    <div className="editor-settings" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="editor-tool"
        data-on={open || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        title="Editor settings"
        aria-label="Editor settings"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="settings" size={14} />
      </button>
      {open ? (
        <div className="editor-settings__panel" id={panelId} role="dialog" aria-label="Editor settings" ref={panelRef}>
          <p className="editor-settings__heading">Editor</p>
          <div className="editor-stepper">
            <span id={`${panelId}-font`}>Font size</span>
            <div className="editor-stepper__controls" role="group" aria-labelledby={`${panelId}-font`}>
              <button
                type="button"
                aria-label="Decrease font size"
                disabled={prefs.fontSize <= FONT_SIZE_MIN}
                onClick={() => setEditorPreferences({ fontSize: prefs.fontSize - 1 })}
              >
                <Icon name="minus" size={12} />
              </button>
              <output aria-live="polite">{prefs.fontSize}</output>
              <button
                type="button"
                aria-label="Increase font size"
                disabled={prefs.fontSize >= FONT_SIZE_MAX}
                onClick={() => setEditorPreferences({ fontSize: prefs.fontSize + 1 })}
              >
                <Icon name="plus" size={12} />
              </button>
            </div>
          </div>
          <Switch
            label="Word wrap"
            hint={`${ALT_KEY}+Z`}
            checked={prefs.wordWrap}
            onChange={(wordWrap) => setEditorPreferences({ wordWrap })}
          />
          <Switch label="Minimap" checked={prefs.minimap} onChange={(minimap) => setEditorPreferences({ minimap })} />
          <p className="editor-settings__note">Saved on this device for every editor.</p>

          <p className="editor-settings__heading">Keyboard shortcuts</p>
          <dl className="editor-shortcuts">
            {shortcuts.map((s) => (
              <div key={s.label} className="editor-shortcuts__row">
                <dt>{s.label}</dt>
                <dd>
                  <Kbd keys={s.keys} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

/* ── Status bar ────────────────────────────────────────────────────────────── */

export interface EditorStatusBarProps {
  status: StatusStore;
  /** Surface-specific items, shown after the cursor readout. */
  extra?: ReactNode[];
  className?: string;
}

export function EditorStatusBar({ status, extra = [], className = "" }: EditorStatusBarProps) {
  const s = useEditorStatus(status);
  const [savedVisible, setSavedVisible] = useState(false);

  useEffect(() => {
    if (!s.savedAt) return;
    setSavedVisible(true);
    const t = window.setTimeout(() => setSavedVisible(false), 1800);
    return () => window.clearTimeout(t);
  }, [s.savedAt]);

  const left: ReactNode[] =
    s.changes !== null
      ? [`${s.changes} ${s.changes === 1 ? "change" : "changes"}`]
      : [
          `Ln ${s.line}, Col ${s.column}${s.selected > 0 ? ` (${s.selected} selected)` : ""}`,
          `${s.lines} ${s.lines === 1 ? "line" : "lines"}`
        ];

  const right: ReactNode[] = [
    ...(s.readOnly ? ["Read-only"] : []),
    s.insertSpaces ? `Spaces: ${s.tabSize}` : `Tab size: ${s.tabSize}`,
    "UTF-8",
    ...(s.language ? [languageName(s.language)] : [])
  ];

  return (
    <div className={`editor-status ${className}`.trim()}>
      <div className="editor-status__group">
        {[...left, ...extra].map((item, i) => (
          <span key={i} className="editor-status__item">
            {item}
          </span>
        ))}
      </div>
      <div className="editor-status__group">
        <span className="editor-status__saved" data-on={savedVisible || undefined} role="status" aria-live="polite">
          {savedVisible ? (
            <>
              <Icon name="check" size={12} />
              <span>Saved on this device</span>
            </>
          ) : null}
        </span>
        {right.map((item, i) => (
          <span key={i} className="editor-status__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
