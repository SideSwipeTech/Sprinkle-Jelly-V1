/**
 * monacoTheme.ts — generates the editor's Monaco theme from LIVE palette tokens.
 *
 * The kit editor shipped ~20 hardcoded hexes (`wizly-dark`/`wizly-light`,
 * CodeEditor.tsx:225-277) and pinned `theme="wizly-dark"` regardless of scheme.
 * Here the theme is derived: palette custom properties are read off the mounted
 * editor element (so a `[data-scheme]`/`[data-theme]` scoped wrapper resolves too,
 * and Atlas/Atelier's `--editor-*` family feeds straight through), normalised to
 * Monaco's `rrggbb`/`#rrggbbaa` formats, and re-defined whenever an appearance
 * attribute changes. No colour is stated in this file — when a token cannot be
 * read the rule is omitted and the base theme's own colour stands.
 */

import { useEffect, useRef, useState } from "react";
import { useMonaco } from "@monaco-editor/react";

type MonacoApi = NonNullable<ReturnType<typeof useMonaco>>;

/** Appearance attributes that can repaint the palette underneath us. */
const APPEARANCE_ATTRS = ["data-theme", "data-scheme", "data-subtheme", "data-accent"] as const;

const THEME_NAME = "x-editor-tokens";

/* ── Colour plumbing ─────────────────────────────────────────────────────── */

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Reads the first custom property that resolves, off the given element. */
function readVar(el: Element, names: readonly string[]): string {
  const style = getComputedStyle(el);
  for (const name of names) {
    const value = style.getPropertyValue(name).trim();
    if (value) return value;
  }
  return "";
}

/** #rgb / #rrggbb / #rrggbbaa / rgb() / rgba() → channels. Unparseable → null. */
function parseColor(raw: string): Rgba | null {
  const s = raw.trim();
  const hexMatch = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    const h = hexMatch[1]!;
    const full = h.length <= 4 ? h.split("").map((c) => c + c).join("") : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: full.length >= 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1
    };
  }
  const rgbMatch = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i);
  if (rgbMatch) {
    const alphaRaw = rgbMatch[4];
    const a =
      alphaRaw === undefined
        ? 1
        : alphaRaw.endsWith("%")
          ? parseFloat(alphaRaw) / 100
          : parseFloat(alphaRaw);
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]), a };
  }
  return null;
}

const byte = (v: number) =>
  Math.round(Math.min(255, Math.max(0, v)))
    .toString(16)
    .padStart(2, "0");

const hex6 = (c: Rgba) => `${byte(c.r)}${byte(c.g)}${byte(c.b)}`;
const hex8 = (c: Rgba, alpha: number) => `${hex6(c)}${byte(Math.min(1, Math.max(0, c.a * alpha)) * 255)}`;

/* ── Theme definition ────────────────────────────────────────────────────── */

/**
 * Defines (or re-defines) `x-editor-tokens` from the element's resolved tokens
 * and returns the theme name. `colors` take `#rrggbb[aa]`; `rules.foreground`
 * takes `rrggbb` with no `#`.
 */
export function defineTokenMonacoTheme(monaco: MonacoApi, host: Element | null): string {
  const el = host ?? document.documentElement;
  const scheme =
    (host?.closest("[data-scheme]")?.getAttribute("data-scheme") ??
      document.documentElement.getAttribute("data-scheme")) === "light"
      ? "light"
      : "dark";

  const fg = (...names: string[]): string | undefined => {
    const c = parseColor(readVar(el, names));
    return c ? hex6(c) : undefined;
  };
  const paint = (alpha: number | undefined, ...names: string[]): string | undefined => {
    const c = parseColor(readVar(el, names));
    if (!c) return undefined;
    return `#${alpha === undefined ? hex6(c) : hex8(c, alpha)}`;
  };

  const rules: { token: string; foreground?: string; fontStyle?: string }[] = [];
  const rule = (token: string, names: string[], fontStyle?: string) => {
    const foreground = fg(...names);
    if (foreground) rules.push({ token, foreground, ...(fontStyle ? { fontStyle } : {}) });
  };

  rule("comment", ["--c-text-faint"], "italic");
  rule("keyword", ["--c-accent-primary"], "bold");
  rule("type", ["--c-accent-secondary"]);
  rule("string", ["--c-success"]);
  rule("number", ["--c-warning"]);
  rule("function", ["--c-accent-light"]);
  rule("operator", ["--c-text-primary"]);
  rule("delimiter", ["--c-text-muted"]);
  rule("variable", ["--c-text-primary"]);
  rule("identifier", ["--c-text-primary"]);

  const colors: Record<string, string> = {};
  const color = (key: string, names: string[], alpha?: number) => {
    const value = paint(alpha, ...names);
    if (value) colors[key] = value;
  };

  color("editor.background", ["--editor-bg", "--c-surface-inset"]);
  color("editor.foreground", ["--editor-fg", "--c-text-primary"]);
  color("editor.lineHighlightBackground", ["--editor-current-line", "--c-surface-elevated"], 0.55);
  color("editor.lineHighlightBorder", ["--editor-divider", "--c-border"], 0);
  color("editor.selectionBackground", ["--editor-selection", "--c-accent-primary"], 0.28);
  color("editor.inactiveSelectionBackground", ["--editor-selection", "--c-accent-primary"], 0.14);
  color("editorLineNumber.foreground", ["--editor-gutter-fg", "--c-text-faint"]);
  color("editorLineNumber.activeForeground", ["--editor-gutter-active", "--c-accent-light"]);
  color("editorGutter.background", ["--editor-shell", "--editor-bg", "--c-surface-inset"]);
  color("editorCursor.foreground", ["--editor-cursor", "--c-accent-primary"]);
  color("editorIndentGuide.background1", ["--editor-indent-guide", "--c-border"]);
  color("editorBracketMatch.background", ["--c-accent-secondary"], 0.2);
  color("editorBracketMatch.border", ["--c-accent-secondary"], 0.55);
  color("editorWidget.background", ["--editor-widget", "--c-surface-elevated"]);
  color("editorWidget.border", ["--editor-divider", "--c-border"]);
  color("minimap.background", ["--editor-shell", "--editor-bg", "--c-surface-inset"], 0.85);
  color("editorOverviewRuler.border", ["--editor-divider", "--c-border"], 0);

  monaco.editor.defineTheme(THEME_NAME, {
    base: scheme === "light" ? "vs" : "vs-dark",
    inherit: true,
    rules,
    colors
  });
  return THEME_NAME;
}

/**
 * Keeps the token-derived theme defined and applied. Runs in an effect (not a memo)
 * so the host ref is already mounted when the palette is read, and re-runs whenever
 * an appearance attribute flips; `setTheme` after `defineTheme` repaints the live
 * editor even though the theme *name* never changes.
 */
export function useTokenMonacoTheme(): { theme: string; hostRef: React.RefObject<HTMLDivElement | null> } {
  const monaco = useMonaco();
  const hostRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState("vs-dark");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setTick((t) => t + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [...APPEARANCE_ATTRS]
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!monaco) return;
    const name = defineTokenMonacoTheme(monaco, hostRef.current);
    monaco.editor.setTheme(name);
    setTheme(name);
  }, [monaco, tick]);

  return { theme, hostRef };
}
