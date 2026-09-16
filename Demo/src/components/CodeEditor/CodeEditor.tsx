import { useState, useEffect, useRef, useMemo, type ReactNode, type UIEvent, type SyntheticEvent } from "react";
import Editor, { useMonaco, type OnMount } from "@monaco-editor/react";
import { Icon } from "@icons/Icon";
import "./code-editor.css";

export type SupportedLanguage = "python" | "javascript" | "typescript" | "java" | "cpp" | "go" | "json" | "markdown" | "html" | "css";
export type EditorEngine = "monaco" | "custom";

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: SupportedLanguage;
  readOnly?: boolean;
  filename?: string;
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
  toolbarActions?: ReactNode;
  headerTitle?: string;
  headerIcon?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

// ── Lightweight Syntax Highlighter for Custom Engine ─────────────────────────
function tokenizeCode(code: string, language: SupportedLanguage): ReactNode[] {
  const lines = code.split("\n");
  
  const keywordsByLang: Record<string, Set<string>> = {
    python: new Set(["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "as", "class", "try", "except", "finally", "with", "yield", "lambda", "pass", "break", "continue", "True", "False", "None", "async", "await", "self"]),
    javascript: new Set(["function", "return", "if", "else", "for", "while", "import", "export", "from", "as", "class", "const", "let", "var", "new", "this", "try", "catch", "finally", "async", "await", "yield", "typeof", "instanceof", "true", "false", "null", "undefined", "switch", "case", "break", "default"]),
    typescript: new Set(["function", "return", "if", "else", "for", "while", "import", "export", "from", "as", "class", "interface", "type", "enum", "const", "let", "var", "new", "this", "try", "catch", "finally", "async", "await", "yield", "typeof", "instanceof", "true", "false", "null", "undefined", "switch", "case", "break", "default", "public", "private", "protected", "readonly", "implements", "extends", "declare", "namespace"]),
    java: new Set(["public", "private", "protected", "class", "interface", "enum", "extends", "implements", "static", "final", "void", "return", "if", "else", "for", "while", "do", "new", "this", "super", "try", "catch", "finally", "throw", "throws", "import", "package", "true", "false", "null"]),
    cpp: new Set(["auto", "const", "constexpr", "class", "struct", "enum", "namespace", "using", "template", "typename", "public", "private", "protected", "virtual", "override", "void", "return", "if", "else", "for", "while", "do", "new", "delete", "this", "try", "catch", "throw", "include", "true", "false", "nullptr"]),
    go: new Set(["package", "import", "func", "return", "var", "const", "type", "struct", "interface", "if", "else", "for", "range", "switch", "case", "default", "break", "continue", "fallthrough", "go", "defer", "chan", "select", "make", "new", "len", "cap", "append", "nil", "true", "false"])
  };

  const typesByLang: Record<string, Set<string>> = {
    python: new Set(["str", "int", "float", "bool", "list", "dict", "set", "tuple", "Any", "Optional", "Union", "List", "Dict", "Set", "Tuple"]),
    javascript: new Set(["Array", "Object", "String", "Number", "Boolean", "Promise", "Map", "Set", "Symbol", "Error"]),
    typescript: new Set(["string", "number", "boolean", "any", "void", "never", "unknown", "Array", "Record", "Partial", "Promise", "Map", "Set"]),
    java: new Set(["int", "long", "double", "float", "boolean", "char", "byte", "short", "String", "List", "Map", "Set", "ArrayList", "HashMap", "Integer", "Double", "Boolean"]),
    cpp: new Set(["int", "long", "double", "float", "bool", "char", "size_t", "string", "vector", "map", "unordered_map", "set", "pair", "unique_ptr", "shared_ptr"]),
    go: new Set(["int", "int64", "float64", "string", "bool", "byte", "rune", "error", "map", "slice"])
  };

  const keywords = keywordsByLang[language] || keywordsByLang.python!;
  const types = typesByLang[language] || typesByLang.python!;

  return lines.map((line, lineIdx) => {
    // Basic regex token parsing
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let col = 0;

    while (remaining.length > 0) {
      // Comments
      if (
        (language === "python" && remaining.startsWith("#")) ||
        (["javascript", "typescript", "java", "cpp", "go"].includes(language) && remaining.startsWith("//"))
      ) {
        tokens.push(
          <span key={`comment-${lineIdx}-${col}`} className="token-comment">
            {remaining}
          </span>
        );
        break;
      }

      // Strings (single, double, backtick)
      const stringMatch = remaining.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
      if (stringMatch) {
        const str = stringMatch[0];
        tokens.push(
          <span key={`str-${lineIdx}-${col}`} className="token-string">
            {str}
          </span>
        );
        remaining = remaining.slice(str.length);
        col += str.length;
        continue;
      }

      // Numbers
      const numMatch = remaining.match(/^[0-9]+(\.[0-9]+)?\b/);
      if (numMatch) {
        const num = numMatch[0];
        tokens.push(
          <span key={`num-${lineIdx}-${col}`} className="token-number">
            {num}
          </span>
        );
        remaining = remaining.slice(num.length);
        col += num.length;
        continue;
      }

      // Words (identifiers, keywords, types)
      const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        if (keywords.has(word)) {
          tokens.push(
            <span key={`kw-${lineIdx}-${col}`} className="token-keyword">
              {word}
            </span>
          );
        } else if (types.has(word)) {
          tokens.push(
            <span key={`type-${lineIdx}-${col}`} className="token-type">
              {word}
            </span>
          );
        } else if (remaining.slice(word.length).trim().startsWith("(")) {
          tokens.push(
            <span key={`fn-${lineIdx}-${col}`} className="token-function">
              {word}
            </span>
          );
        } else {
          tokens.push(
            <span key={`ident-${lineIdx}-${col}`} className="token-ident">
              {word}
            </span>
          );
        }
        remaining = remaining.slice(word.length);
        col += word.length;
        continue;
      }

      // Operators and punctuation
      const opMatch = remaining.match(/^([=+\-*/%&|^!~<>?:;,.()[\]{}]+)/);
      if (opMatch) {
        const op = opMatch[0];
        tokens.push(
          <span key={`op-${lineIdx}-${col}`} className="token-operator">
            {op}
          </span>
        );
        remaining = remaining.slice(op.length);
        col += op.length;
        continue;
      }

      // Any other characters (spaces, etc.)
      const char = remaining[0];
      tokens.push(<span key={`ch-${lineIdx}-${col}`}>{char}</span>);
      remaining = remaining.slice(1);
      col++;
    }

    return (
      <div key={`line-${lineIdx}`} className="editor-line">
        {tokens.length === 0 ? "\u00A0" : tokens}
      </div>
    );
  });
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  filename = "solution.py",
  height = "100%",
  minHeight = "360px",
  showMinimap = true,
  showLineNumbers = true,
  fontSize: initialFontSize = 14,
  engine: controlledEngine,
  onEngineChange,
  onRun,
  isExecuting = false,
  onCursorChange,
  toolbarActions,
  headerTitle,
  headerIcon,
  hideHeader = false,
  hideFooter = false,
}: CodeEditorProps) {
  const [internalEngine, setInternalEngine] = useState<EditorEngine>("monaco");
  const [fontSize, setFontSize] = useState<number>(initialFontSize);
  const [minimapVisible, setMinimapVisible] = useState(showMinimap);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [activeLine, setActiveLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const monaco = useMonaco();
  const engine = controlledEngine ?? internalEngine;
  const setEngine = onEngineChange ?? setInternalEngine;

  // Language mapping for Monaco
  const monacoLang = useMemo(() => {
    switch (language) {
      case "python": return "python";
      case "javascript": return "javascript";
      case "typescript": return "typescript";
      case "java": return "java";
      case "cpp": return "cpp";
      case "go": return "go";
      case "json": return "json";
      case "markdown": return "markdown";
      case "html": return "html";
      case "css": return "css";
      default: return "plaintext";
    }
  }, [language]);

  // Configure Monaco Theme dynamically from current CSS root tokens
  useEffect(() => {
    if (!monaco) return;

    // Define sleek dark theme matching Wizly Design System
    monaco.editor.defineTheme("wizly-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "767DA0", fontStyle: "italic" },
        { token: "keyword", foreground: "7C7CF0", fontStyle: "bold" },
        { token: "type", foreground: "3FB6D8" },
        { token: "string", foreground: "3DD68C" },
        { token: "number", foreground: "F0B23D" },
        { token: "function", foreground: "A8D8F0" },
        { token: "operator", foreground: "EEF0FA" },
        { token: "variable", foreground: "EEF0FA" },
      ],
      colors: {
        "editor.background": "#0e1222",
        "editor.foreground": "#EEF0FA",
        "editor.lineHighlightBackground": "#161b3380",
        "editor.selectionBackground": "#7C7CF033",
        "editor.inactiveSelectionBackground": "#7C7CF01a",
        "editorLineNumber.foreground": "#565e80",
        "editorLineNumber.activeForeground": "#A8D8F0",
        "editorGutter.background": "#0B0E1A",
        "editorCursor.foreground": "#7C7CF0",
        "editorBracketMatch.background": "#3FB6D833",
        "editorBracketMatch.border": "#3FB6D888",
        "editorOverviewRuler.border": "#00000000",
        "minimap.background": "#0B0E1A80",
      },
    });

    // Define light theme
    monaco.editor.defineTheme("wizly-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7C84A3", fontStyle: "italic" },
        { token: "keyword", foreground: "5150C8", fontStyle: "bold" },
        { token: "type", foreground: "0E7490" },
        { token: "string", foreground: "0F7A4C" },
        { token: "number", foreground: "9A6100" },
        { token: "function", foreground: "3B82C4" },
      ],
      colors: {
        "editor.background": "#F8FAFC",
        "editor.foreground": "#1B1F35",
        "editor.lineHighlightBackground": "#EEF2F6",
        "editor.selectionBackground": "#5150C822",
        "editorLineNumber.foreground": "#A0A8C0",
        "editorLineNumber.activeForeground": "#5150C8",
        "editorGutter.background": "#F1F5F9",
        "editorCursor.foreground": "#5150C8",
      },
    });
  }, [monaco]);

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
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = value.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Custom editor textarea sync scroll
  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTextareaClickOrKeyUp = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBefore = target.value.substring(0, target.selectionStart);
    const lines = textBefore.split("\n");
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1]!.length + 1;
    const pos = { line: currentLine, col: currentCol };
    setCursorPos(pos);
    onCursorChange?.(pos);
    setActiveLine(currentLine);
  };

  return (
    <div
      className="pro-editor"
      style={{ height, minHeight }}
      data-engine={engine}
      data-readonly={readOnly || undefined}
    >
      {/* ── Editor Chrome Header ────────────────────────────────────────────── */}
      {!hideHeader && (
        <header className="pro-editor__header">
          <div className="pro-editor__file-meta">
            <span className="pro-editor__file-icon">
              <Icon name={(headerIcon as any) || "file"} size={15} />
            </span>
            <span className="pro-editor__filename">{headerTitle || filename}</span>
            <span className="pro-editor__lang-badge">{language}</span>
          </div>

          <div className="pro-editor__toolbar">
            {toolbarActions}

            {/* Engine switcher toggle */}
            <div className="pro-editor__engine-toggle" title="Switch editor engine">
              <button
                type="button"
                className={`engine-btn ${engine === "monaco" ? "is-active" : ""}`}
                onClick={() => setEngine("monaco")}
              >
                Monaco IDE
              </button>
              <button
                type="button"
                className={`engine-btn ${engine === "custom" ? "is-active" : ""}`}
                onClick={() => setEngine("custom")}
              >
                Theme Native
              </button>
            </div>

            {/* Font zoom */}
            <div className="pro-editor__font-controls">
              <button
                type="button"
                className="tool-btn"
                onClick={() => setFontSize((s) => Math.max(11, s - 1))}
                title="Decrease font size"
              >
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>A-</span>
              </button>
              <button
                type="button"
                className="tool-btn"
                onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                title="Increase font size"
              >
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>A+</span>
              </button>
            </div>

            {/* Minimap toggle */}
            <button
              type="button"
              className={`tool-btn ${minimapVisible ? "is-active" : ""}`}
              onClick={() => setMinimapVisible(!minimapVisible)}
              title={minimapVisible ? "Hide minimap" : "Show minimap"}
            >
              <Icon name="dashboard" size={14} />
            </button>

            {/* Copy button */}
            <button
              type="button"
              className="tool-btn"
              onClick={handleCopy}
              title="Copy code"
            >
              <Icon name={copied ? "check-mark" : "clipboard"} size={14} />
            </button>

            {/* Run Button if onRun provided */}
            {onRun && (
              <button
                type="button"
                className="pro-editor__run-btn btn btn--primary"
                onClick={onRun}
                disabled={isExecuting}
              >
                <Icon name="zap" size={14} />
                <span>{isExecuting ? "Executing…" : "Run Code"}</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Editor Body (Monaco vs Custom Native) ────────────────────────────── */}
      <div className="pro-editor__body" style={{ fontSize: `${fontSize}px` }}>
        {engine === "monaco" ? (
          <Editor
            height="100%"
            language={monacoLang}
            value={value}
            theme="wizly-dark"
            onChange={(val) => onChange?.(val ?? "")}
            onMount={handleEditorMount}
            options={{
              readOnly,
              fontSize,
              fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
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
              tabSize: 4,
            }}
            loading={
              <div className="pro-editor__loading">
                <span className="spinner" />
                <span>Initializing Editor Engine…</span>
              </div>
            }
          />
        ) : (
          <div className="custom-editor">
            {showLineNumbers && (
              <div className="custom-editor__gutter" ref={lineNumbersRef}>
                {lineNumbers.map((num) => (
                  <div
                    key={num}
                    className={`custom-editor__line-num ${num === activeLine ? "is-active" : ""}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            )}
            <div className="custom-editor__stage">
              {/* Highlighted syntax background */}
              <div className="custom-editor__tokens" aria-hidden="true">
                {tokenizeCode(value, language)}
              </div>
              {/* Interactive textarea overlay */}
              <textarea
                ref={textareaRef}
                className="custom-editor__textarea"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onScroll={handleScroll}
                onClick={handleTextareaClickOrKeyUp}
                onKeyUp={handleTextareaClickOrKeyUp}
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

      {/* ── Editor Chrome Footer / Status Bar ───────────────────────────────── */}
      {!hideFooter && (
        <footer className="pro-editor__status-bar">
          <div className="status-bar__left">
            <span className="status-item">
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span className="status-sep" />
            <span className="status-item">{lineCount} lines</span>
            <span className="status-sep" />
            <span className="status-item">UTF-8</span>
          </div>

          <div className="status-bar__right">
            <span className="status-item engine-indicator">
              Engine: <strong>{engine === "monaco" ? "Monaco (VS Code)" : "Wizly Theme Native"}</strong>
            </span>
            <span className="status-sep" />
            <span className="status-item">{language.toUpperCase()}</span>
          </div>
        </footer>
      )}
    </div>
  );
}
