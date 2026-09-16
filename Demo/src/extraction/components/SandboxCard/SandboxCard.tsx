/**
 * SandboxCard — the in-lesson mini runner (Learn.tsx:351-388).
 *
 * The original hand-rolled its chrome inline; here the header IS the workbench
 * toolbar and the controls ARE workbench parts — `x-workbench__toolbar`,
 * `x-workbench__tools`, `x-workbench__tool`, `x-workbench__run` are referenced
 * by class per contract §6 (the sibling Workbench component owns them; a
 * consolidation pass may promote them to imports). The editor surface is a slot:
 * drop a `CodeEditorChrome` with `hideHeader`/`hideFooter`, or any surface.
 *
 * Kills: `#050810`/`#2dd4bf` output literals, the `11px`/`12px`/`4px 8px`
 * inline metrics, and the bordered box that duplicated panel chrome.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./SandboxCard.css";

export interface SandboxCardProps {
  /** Shown in the strip — "Runnable sandbox · python". */
  language: string;
  /** Editing surface — e.g. `<CodeEditorChrome hideHeader hideFooter/>`. */
  children: ReactNode;
  onRun?: () => void;
  onReset?: () => void;
  running?: boolean;
  /** Run output; `null`/`undefined` renders nothing (honest absence). */
  output?: string | null;
  label?: string;
}

export function SandboxCard({
  language,
  children,
  onRun,
  onReset,
  running = false,
  output,
  label = "Runnable sandbox"
}: SandboxCardProps) {
  return (
    <section className="x-sandbox" aria-label={`${label} · ${language}`}>
      {/* Workbench part classes — owned by the sibling Workbench component. */}
      <header className="x-workbench__toolbar">
        <div className="x-workbench__tools">
          <span className="x-workbench__hint">
            <Icon name="code" size={12} />
            <span>
              {label} · {language}
            </span>
          </span>
        </div>
        <div className="x-workbench__tools">
          {onReset ? (
            <button type="button" className="x-workbench__tool" onClick={onReset} disabled={running} aria-disabled={running || undefined}>
              <Icon name="reset" size={13} />
              <span>Reset code</span>
            </button>
          ) : null}
          {onRun ? (
            <button
              type="button"
              className="x-workbench__run"
              onClick={onRun}
              disabled={running}
              aria-disabled={running || undefined}
              data-running={running || undefined}
            >
              <Icon name={running ? "loader" : "play"} size={13} motion={running ? "flow" : "none"} />
              <span>{running ? "Running…" : "Run snippet"}</span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="x-sandbox__editor">{children}</div>

      {output != null ? (
        <pre className="x-sandbox__out" role="status">
          {output}
        </pre>
      ) : null}
    </section>
  );
}
