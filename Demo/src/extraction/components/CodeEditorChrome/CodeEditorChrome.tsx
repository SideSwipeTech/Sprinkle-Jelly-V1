/**
 * CodeEditorChrome — the kit editor's chrome, canonicalised.
 *
 * Same anatomy as components/CodeEditor (header: file meta + lang badge + toolbar
 * with engine toggle / font zoom / minimap / copy / run; body: Monaco or the
 * tokenized custom surface; footer: status bar) — with the violations removed:
 *
 *  - The Monaco theme is GENERATED from palette tokens (see monacoTheme.ts):
 *    `wizly-dark`'s ~20 hardcoded hexes are gone, the theme repaints on every
 *    appearance-axis change, and `theme=` follows the active scheme instead of
 *    pinning dark.
 *  - `.x-editor__body` reads `var(--editor-bg, var(--c-surface-inset))` — the
 *    `#0B0E1A`/`#F8FAFC` literals and the dead `[data-theme="light"]` override
 *    (code-editor.css:144-151 — `data-theme` holds an identity, never a scheme)
 *    are gone.
 *  - Syntax tokens (`x-tok-*`) all resolve through `--c-*`; the `#767DA0`/
 *    `#7C84A3` comment hexes at code-editor.css:241-250 are gone.
 *  - Engine toggle and minimap use `data-on` + `aria-pressed`; gated controls
 *    take real `disabled` + `aria-disabled`, never opacity hacks.
 *
 * The Monaco core (`@monaco-editor/react`'s <Editor>) is untouched — this file
 * owns the chrome and the theme derivation only.
 */

import { useRef, useState, type ReactNode, type SyntheticEvent, type UIEvent } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { useTokenMonacoTheme } from "./monacoTheme";
import { tokenizeCode } from "./tokenize";
import "./CodeEditorChrome.css";

export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "go"
  | "json"
  | "markdown"
  | "html"
  | "css";

export type EditorEngine = "monaco" | "custom";

const MONACO_LANG: Record<SupportedLanguage, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  cpp: "cpp",
  go: "go",
  json: "json",
  markdown: "markdown",
  html: "html",
  css: "css"
};

const ENGINE_LABEL: Record<EditorEngine, string> = {
  monaco: "Monaco IDE",
  custom: "Theme Native"
};

const FONT_MIN = 11;
const FONT_MAX = 22;

export interface CodeEditorChromeProps {
  value: string;
  onChange?: (value: string) => void;
  language?: SupportedLanguage;
  readOnly?: boolean;
  filename?: string;
  /** Header overrides — `headerTitle` replaces the filename, `headerIcon` the glyph. */
  headerTitle?: string;
  headerIcon?: IconName;
  height?: string | number;
  minHeight?: string | number;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  engine?: EditorEngine;
  onEngineChange?: (engine: EditorEngine) => void;
  onRun?: () => void;
  isExecuting?: boolean;
  onCursorChange?: (pos: { line: number; col: number }) => void;
  /** Slot on the toolbar's left — page actions live here. */
  toolbarActions?: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function CodeEditorChrome({
  value,
  onChange,
  language = "python",
  readOnly = false,
  filename = "solution.py",
  headerTitle,
  headerIcon,
  height = "100%",
  minHeight,
  showMinimap = true,
  showLineNumbers = true,
  fontSize: initialFontSize = 14,
  engine: controlledEngine,
  onEngineChange,
  onRun,
  isExecuting = false,
  onCursorChange,
  toolbarActions,
  hideHeader = false,
  hideFooter = false
}: CodeEditorChromeProps) {
  const [internalEngine, setInternalEngine] = useState<EditorEngine>("monaco");
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [minimapVisible, setMinimapVisible] = useState(showMinimap);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [activeLine, setActiveLine] = useState(1);
  const gutterRef = useRef<HTMLDivElement>(null);

  const { theme, hostRef } = useTokenMonacoTheme();
  const engine = controlledEngine ?? internalEngine;
  const setEngine = onEngineChange ?? setInternalEngine;

  const handleEditorMount: OnMount = (editor) => {
    editor.onDidChangeCursorPosition((e) => {
      const pos = { line: e.position.lineNumber, col: e.position.column };
      setCursorPos(pos);
      onCursorChange?.(pos);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = value.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  const handleCaret = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const lines = target.value.substring(0, target.selectionStart).split("\n");
    const pos = { line: lines.length, col: lines[lines.length - 1]!.length + 1 };
    setCursorPos(pos);
    onCursorChange?.(pos);
    setActiveLine(pos.line);
  };

  return (
    <div
      ref={hostRef}
      className="x-editor"
      style={{ height, minHeight }}
      data-engine={engine}
      data-readonly={readOnly || undefined}
    >
      {!hideHeader && (
        <header className="x-editor__header">
          <div className="x-editor__file-meta">
            <span className="x-editor__file-icon">
              <Icon name={headerIcon ?? "file"} size={15} />
            </span>
            <span className="x-editor__filename">{headerTitle ?? filename}</span>
            <span className="x-editor__lang">{language}</span>
          </div>

          <div className="x-editor__toolbar">
            {toolbarActions}

            <div className="x-editor__engine" role="group" aria-label="Editor engine">
              {(["monaco", "custom"] as const).map((eng) => (
                <button
                  key={eng}
                  type="button"
                  className="x-editor__engine-btn"
                  data-on={engine === eng || undefined}
                  aria-pressed={engine === eng}
                  onClick={() => setEngine(eng)}
                >
                  {ENGINE_LABEL[eng]}
                </button>
              ))}
            </div>

            <div className="x-editor__font" role="group" aria-label="Editor font size">
              <button
                type="button"
                className="x-editor__tool"
                onClick={() => setFontSize((s) => Math.max(FONT_MIN, s - 1))}
                disabled={fontSize <= FONT_MIN}
                aria-disabled={fontSize <= FONT_MIN || undefined}
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                <span className="x-editor__font-dec" aria-hidden="true">
                  A−
                </span>
              </button>
              <button
                type="button"
                className="x-editor__tool"
                onClick={() => setFontSize((s) => Math.min(FONT_MAX, s + 1))}
                disabled={fontSize >= FONT_MAX}
                aria-disabled={fontSize >= FONT_MAX || undefined}
                aria-label="Increase font size"
                title="Increase font size"
              >
                <span className="x-editor__font-inc" aria-hidden="true">
                  A+
                </span>
              </button>
            </div>

            <button
              type="button"
              className="x-editor__tool"
              data-on={minimapVisible || undefined}
              aria-pressed={minimapVisible}
              onClick={() => setMinimapVisible((v) => !v)}
              aria-label={minimapVisible ? "Hide minimap" : "Show minimap"}
              title={minimapVisible ? "Hide minimap" : "Show minimap"}
            >
              <Icon name="dashboard" size={14} />
            </button>

            <button
              type="button"
              className="x-editor__tool"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy code"}
              title="Copy code"
              data-copied={copied || undefined}
            >
              <Icon name={copied ? "check-mark" : "clipboard"} size={14} />
            </button>

            {onRun && (
              <button
                type="button"
                className="x-editor__run"
                onClick={onRun}
                disabled={isExecuting}
                aria-disabled={isExecuting || undefined}
                data-running={isExecuting || undefined}
              >
                <Icon name={isExecuting ? "loader" : "zap"} size={13} motion={isExecuting ? "flow" : "none"} />
                <span>{isExecuting ? "Executing…" : "Run Code"}</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* fontSize is runtime data from the prop — carried on a CSS var so the
          stylesheet stays literal-free and the zoom survives theming. */}
      <div
        className="x-editor__body"
        style={{ ["--x-editor-zoom" as string]: `${fontSize / 14}` }}
      >
        {engine === "monaco" ? (
          <Editor
            height="100%"
            language={MONACO_LANG[language]}
            value={value}
            theme={theme}
            onChange={(val) => onChange?.(val ?? "")}
            onMount={handleEditorMount}
            options={{
              readOnly,
              fontSize,
              fontFamily: "var(--font-mono)",
              fontLigatures: true,
              minimap: { enabled: minimapVisible },
              lineNumbers: showLineNumbers ? "on" : "off",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: "all",
              bracketPairColorization: { enabled: true },
              tabSize: 4
            }}
            loading={
              <div className="x-editor__loading" role="status">
                <span className="x-editor__spinner" aria-hidden="true" />
                <span>Initializing Editor Engine…</span>
              </div>
            }
          />
        ) : (
          <div className="x-editor__custom">
            {showLineNumbers && (
              <div className="x-editor__gutter" ref={gutterRef} aria-hidden="true">
                {lineNumbers.map((num) => (
                  <div key={num} className="x-editor__line-num" data-on={num === activeLine || undefined}>
                    {num}
                  </div>
                ))}
              </div>
            )}
            <div className="x-editor__stage">
              <div className="x-editor__tokens" aria-hidden="true">
                {tokenizeCode(value, language)}
              </div>
              <textarea
                className="x-editor__textarea"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onScroll={handleScroll}
                onClick={handleCaret}
                onKeyUp={handleCaret}
                readOnly={readOnly}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                aria-label={`Code editor for ${filename}`}
              />
            </div>
          </div>
        )}
      </div>

      {!hideFooter && (
        <footer className="x-editor__status">
          <div className="x-editor__status-group">
            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
            <i className="x-editor__status-sep" aria-hidden="true" />
            <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
            <i className="x-editor__status-sep" aria-hidden="true" />
            <span>UTF-8</span>
          </div>
          <div className="x-editor__status-group">
            <span>
              Engine: <strong className="x-editor__engine-name">{engine === "monaco" ? "Monaco (VS Code)" : "Theme Native"}</strong>
            </span>
            <i className="x-editor__status-sep" aria-hidden="true" />
            <span>{language.toUpperCase()}</span>
          </div>
        </footer>
      )}
    </div>
  );
}
