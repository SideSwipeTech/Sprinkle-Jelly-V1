/**
 * CodeEditor — the platform's one code editor: Monaco, painted from the live
 * palette tokens so every identity and scheme reaches the editing surface.
 *
 * Inside a CodeWorkbench it is bare — the workbench owns the toolbar, status
 * bar and shortcuts, and this component reports its cursor and actions up
 * through context. Standalone it carries its own header and status bar.
 *
 * Shortcuts are editor actions (scoped to this instance and listed in the F1
 * palette): Ctrl/Cmd+Enter runs, Ctrl/Cmd+Shift+Enter submits, Ctrl/Cmd+S
 * confirms the device draft instead of opening the browser's save dialog, and
 * Alt+Z toggles word wrap.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { useLiveEditorTheme } from "./editor-theme";
import { EditorStatusBar, EditorTools, Kbd, SHORTCUTS } from "./EditorChrome";
import { fileIcon, indentationFor, languageName, type SupportedLanguage } from "./language";
import { setEditorPreferences, getEditorPreferences, useEditorPreferences } from "./preferences";
import {
  createStatusStore,
  useWorkbench,
  type EditorApi
} from "./workbench-context";
import "./code-editor.css";

export type { SupportedLanguage } from "./language";

/* The slice of Monaco's API this component touches, stated once so the
   mount handler reads as plain typed calls. */
interface Disposable {
  dispose(): void;
}
interface MonacoRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}
interface MonacoSelection extends MonacoRange {
  positionLineNumber: number;
  positionColumn: number;
}
interface MonacoModel {
  getLineCount(): number;
  getValueInRange(range: MonacoRange): string;
}
interface MonacoEditor {
  getModel(): MonacoModel | null;
  getValue(): string;
  focus(): void;
  getAction(id: string): { run(): Promise<void> } | null;
  addAction(action: {
    id: string;
    label: string;
    keybindings?: number[];
    contextMenuGroupId?: string;
    contextMenuOrder?: number;
    run: () => void;
  }): Disposable;
  onDidChangeCursorSelection(listener: (e: { selection: MonacoSelection }) => void): Disposable;
  onDidChangeModelContent(listener: () => void): Disposable;
  onDidChangeModel(listener: () => void): Disposable;
}
interface MonacoNamespace {
  KeyMod: { CtrlCmd: number; Shift: number; Alt: number };
  KeyCode: { Enter: number; KeyS: number; KeyZ: number };
  editor: { remeasureFonts(): void };
}

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: SupportedLanguage;
  readOnly?: boolean;
  filename?: string;
  /** Model identity. Give each file or draft its own so undo history never crosses them. */
  path?: string;
  height?: string | number;
  minHeight?: string | number;
  /** Pass false to keep the minimap off here whatever the learner's setting. */
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  onRun?: () => void;
  onSubmit?: () => void;
  isExecuting?: boolean;
  onCursorChange?: (pos: { line: number; col: number }) => void;
  toolbarActions?: ReactNode;
  headerTitle?: string;
  headerIcon?: IconName;
  hideHeader?: boolean;
  hideFooter?: boolean;
  ariaLabel?: string;
}

const SLOW_LOAD_MS = 10000;

export function CodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  filename = "solution.py",
  path,
  height = "100%",
  minHeight,
  showMinimap,
  showLineNumbers = true,
  onRun,
  onSubmit,
  isExecuting = false,
  onCursorChange,
  toolbarActions,
  headerTitle,
  headerIcon,
  hideHeader = false,
  hideFooter = false,
  ariaLabel
}: CodeEditorProps) {
  const workbench = useWorkbench();
  const prefs = useEditorPreferences();
  const { theme, hostRef, beforeMount } = useLiveEditorTheme();
  const [localStatus] = useState(createStatusStore);
  const status = workbench?.status ?? localStatus;

  const editorRef = useRef<MonacoEditor | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const onCursorRef = useRef(onCursorChange);
  onCursorRef.current = onCursorChange;

  const [mounted, setMounted] = useState(false);
  const [slow, setSlow] = useState(false);
  const [fontFamily, setFontFamily] = useState<string | undefined>(undefined);

  const [api] = useState<EditorApi>(() => ({
    format: () => {
      void editorRef.current?.getAction("editor.action.formatDocument")?.run();
    },
    copy: async () => {
      try {
        await navigator.clipboard.writeText(editorRef.current?.getValue() ?? valueRef.current);
        return true;
      } catch {
        return false;
      }
    },
    focus: () => editorRef.current?.focus()
  }));

  const showHeader = !workbench && !hideHeader;
  const showFooter = !workbench && !hideFooter;
  const bare = !showHeader && !showFooter;
  const indentation = indentationFor(language);

  /* The mono family is a token; Monaco measures glyphs, so it needs the resolved stack. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const family = getComputedStyle(host).getPropertyValue("--font-mono").trim();
    if (family) setFontFamily(family);
  }, [hostRef]);

  useEffect(() => {
    if (mounted) return;
    const t = window.setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => window.clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    status.set({
      language,
      readOnly,
      tabSize: indentation.tabSize,
      insertSpaces: indentation.insertSpaces,
      changes: null
    });
  }, [status, language, readOnly, indentation.tabSize, indentation.insertSpaces]);

  useEffect(() => {
    if (!workbench) return;
    workbench.registerEditor(api);
    return () => workbench.unregisterEditor(api);
  }, [workbench, api]);

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (model) status.set({ lines: model.getLineCount() });
  }, [status, value]);

  const handleMount: OnMount = (instance, monacoInstance) => {
    const editor = instance as unknown as MonacoEditor;
    const monaco = monacoInstance as unknown as MonacoNamespace;
    editorRef.current = editor;
    setMounted(true);

    const { KeyMod, KeyCode } = monaco;
    const run = () => (onRunRef.current ?? workbench?.runRef.current)?.();
    const submit = () => (onSubmitRef.current ?? workbench?.submitRef.current)?.();

    if (onRunRef.current || workbench?.runRef.current) {
      editor.addAction({
        id: "wizly.run",
        label: "Run code",
        keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 0,
        run
      });
    }
    if (onSubmitRef.current || workbench?.submitRef.current) {
      editor.addAction({
        id: "wizly.submit",
        label: "Submit",
        keybindings: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1,
        run: submit
      });
    }
    editor.addAction({
      id: "wizly.save",
      label: "Save draft",
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
      run: () => status.set({ savedAt: Date.now() })
    });
    editor.addAction({
      id: "wizly.toggleWordWrap",
      label: "Toggle word wrap",
      keybindings: [KeyMod.Alt | KeyCode.KeyZ],
      run: () => setEditorPreferences({ wordWrap: !getEditorPreferences().wordWrap })
    });

    const reportLines = () => {
      const model = editor.getModel();
      if (model) status.set({ lines: model.getLineCount() });
    };
    editor.onDidChangeCursorSelection(({ selection }) => {
      const model = editor.getModel();
      status.set({
        line: selection.positionLineNumber,
        column: selection.positionColumn,
        selected: model ? model.getValueInRange(selection).length : 0
      });
      onCursorRef.current?.({ line: selection.positionLineNumber, col: selection.positionColumn });
    });
    editor.onDidChangeModelContent(reportLines);
    editor.onDidChangeModel(() => {
      reportLines();
      status.set({ line: 1, column: 1, selected: 0 });
    });
    reportLines();

    /* Web fonts land after Monaco measures; remeasure or the cursor drifts. */
    void document.fonts?.ready.then(() => monaco.editor.remeasureFonts());
  };

  const options = useMemo(
    () => ({
      readOnly,
      domReadOnly: readOnly,
      fontSize: prefs.fontSize,
      lineHeight: Math.round(prefs.fontSize * 1.6),
      fontFamily,
      fontLigatures: true,
      minimap: { enabled: showMinimap !== false && prefs.minimap, renderCharacters: false },
      wordWrap: prefs.wordWrap ? ("on" as const) : ("off" as const),
      lineNumbers: showLineNumbers ? ("on" as const) : ("off" as const),
      lineNumbersMinChars: 3,
      tabSize: indentation.tabSize,
      insertSpaces: indentation.insertSpaces,
      detectIndentation: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      smoothScrolling: true,
      cursorBlinking: "smooth" as const,
      cursorSmoothCaretAnimation: "on" as const,
      padding: { top: prefs.fontSize, bottom: prefs.fontSize },
      renderLineHighlight: "line" as const,
      renderWhitespace: "selection" as const,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: "active" as const, indentation: true },
      stickyScroll: { enabled: true },
      fixedOverflowWidgets: true,
      overviewRulerBorder: false,
      scrollbar: { useShadows: false, verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      ariaLabel: ariaLabel ?? `Code editor, ${languageName(language)}, ${filename}`
    }),
    [
      readOnly,
      prefs.fontSize,
      prefs.minimap,
      prefs.wordWrap,
      fontFamily,
      showMinimap,
      showLineNumbers,
      indentation.tabSize,
      indentation.insertSpaces,
      ariaLabel,
      language,
      filename
    ]
  );

  return (
    <div
      ref={hostRef}
      className="pro-editor"
      data-bare={bare || undefined}
      data-readonly={readOnly || undefined}
      style={workbench ? undefined : { height, minHeight }}
    >
      {showHeader ? (
        <header className="pro-editor__header">
          <div className="pro-editor__file">
            <Icon name={headerIcon ?? fileIcon(filename)} size={14} />
            <span className="pro-editor__filename">{headerTitle ?? filename}</span>
            <span className="pro-editor__lang">{languageName(language)}</span>
          </div>
          <div className="pro-editor__toolbar">
            {toolbarActions}
            <EditorTools api={mounted ? api : null} status={status} hasRun={Boolean(onRun)} hasSubmit={Boolean(onSubmit)} />
            {onRun ? (
              <button type="button" className="pro-editor__run" onClick={onRun} disabled={isExecuting} data-running={isExecuting || undefined}>
                <Icon name={isExecuting ? "loader" : "play"} size={13} motion={isExecuting ? "orbit" : "none"} />
                <span>{isExecuting ? "Running…" : "Run"}</span>
                <Kbd keys={SHORTCUTS.run} />
              </button>
            ) : null}
          </div>
        </header>
      ) : null}

      <div className="pro-editor__body">
        <Editor
          height="100%"
          language={language}
          path={path}
          value={value}
          theme={theme}
          beforeMount={beforeMount}
          onChange={(next) => onChange?.(next ?? "")}
          onMount={handleMount}
          options={options}
          loading={
            <div className="pro-editor__loading" role="status">
              <div className="pro-editor__skeleton" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <span className="pro-editor__loading-text">
                {slow ? "The editor is taking longer than usual to load — check your connection." : "Loading editor…"}
              </span>
            </div>
          }
        />
      </div>

      {showFooter ? <EditorStatusBar status={status} className="pro-editor__status" /> : null}
    </div>
  );
}
