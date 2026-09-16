/**
 * CodeBlock — the canonical `pre.code` (app.css:138-146) plus the editable
 * `.code` textarea variant (More.tsx:247-259 DailySolve's answer editor).
 *
 * Two render modes, one anatomy:
 *  - default  → `<pre class="x-code"><code>` — semantic, wraps per theme;
 *  - editable → `<textarea class="x-code x-code--edit">` — mono inset field
 *    with a real label (`aria-label`/`aria-labelledby`), not a bare box.
 *
 * `tone="output"` renders the terminal palette (was `pre.code.output` in
 * More.tsx / Practice.tsx run panes).
 */

import type { ChangeEvent } from "react";
import "./CodeBlock.css";

export interface CodeBlockProps {
  /** Display mode content. */
  code?: string;
  /** Editable mode: controlled value + change handler. */
  editable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  /** Accessible name in editable mode (required then). */
  label?: string;
  /** Line budget in editable mode (textarea rows). */
  rows?: number;
  readOnly?: boolean;
  /** "output" paints the terminal palette; default paints the inset surface. */
  tone?: "default" | "output";
  language?: string;
  className?: string;
}

export function CodeBlock({
  code,
  editable = false,
  value,
  onChange,
  label,
  rows = 4,
  readOnly = false,
  tone = "default",
  language,
  className = ""
}: CodeBlockProps) {
  const cls = `x-code${tone === "output" ? " x-code--out" : ""}${editable ? " x-code--edit" : ""}${className ? ` ${className}` : ""}`;

  if (editable) {
    return (
      <textarea
        className={cls}
        rows={rows}
        value={value ?? ""}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
        aria-label={label ?? "Code"}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        data-language={language}
      />
    );
  }

  return (
    <pre className={cls} data-language={language}>
      <code>{code}</code>
    </pre>
  );
}
