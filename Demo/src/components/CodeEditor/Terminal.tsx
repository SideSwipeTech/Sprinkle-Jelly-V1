/**
 * Terminal — the console dock under the editor: program output, test results
 * and standard input on real tabs, with the run's verdict pinned above them.
 *
 * Output and errors stay visibly separate; a run that finishes switches to the
 * view that answers it (errors → Output, cases → Test results). Hidden cases
 * are only ever a count. Inside a CodeWorkbench the dock can collapse to its
 * tab strip; the workbench footer owns Run and Submit.
 */

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@icons/Icon";
import { StateBlock } from "@components/Card";
import { Kbd, SHORTCUTS } from "./EditorChrome";
import { useWorkbench } from "./workbench-context";
import "./terminal.css";

export interface TerminalTestCase {
  name: string;
  passed: boolean;
  durationMs?: number;
  input?: string;
  expected?: string;
  actual?: string;
  details?: string;
}

export interface TerminalStatusLine {
  tone: "pass" | "fail" | "warn" | "info";
  text: string;
}

export interface TerminalInput {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  note?: string;
  /** An action beside the note — e.g. "Run with this input". */
  action?: ReactNode;
}

export interface TerminalProps {
  output: string | null;
  errorOutput?: string | null;
  /** A plain-language note under the output. */
  hint?: string | null;
  statusLine?: TerminalStatusLine | null;
  isExecuting?: boolean;
  statusText?: string;
  onClear?: () => void;
  /** Standalone only — inside a workbench the footer owns Run. */
  onRun?: () => void;
  testCases?: TerminalTestCase[];
  hiddenCount?: number;
  input?: TerminalInput;
  /** Bump to bring the Input tab forward and focus it. */
  inputRequest?: number;
  /** The verdict, pinned above every tab. */
  banner?: ReactNode;
  label?: string;
}

type TabKey = "output" | "tests" | "input";

const TONE_ICON = { pass: "check", fail: "error", warn: "alert", info: "info" } as const;

function formatDuration(ms: number): string {
  return ms < 1 ? `${ms.toFixed(2)} ms` : `${Math.round(ms)} ms`;
}

export function Terminal({
  output,
  errorOutput = null,
  hint = null,
  statusLine = null,
  isExecuting = false,
  statusText,
  onClear,
  onRun,
  testCases,
  hiddenCount,
  input,
  inputRequest = 0,
  banner,
  label = "Console"
}: TerminalProps) {
  const workbench = useWorkbench();
  const baseId = useId();
  const [tab, setTab] = useState<TabKey>("output");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ output: null, tests: null, input: null });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasExecuting = useRef(isExecuting);

  const collapsed = workbench?.consoleCollapsed ?? false;
  const tabs: TabKey[] = ["output", ...(testCases ? (["tests"] as const) : []), ...(input ? (["input"] as const) : [])];
  const passed = testCases?.filter((t) => t.passed).length ?? 0;
  const total = testCases?.length ?? 0;
  const hasOutput = Boolean(output || errorOutput || hint || statusLine);

  /* A finished run lands on the view that answers it. */
  useEffect(() => {
    if (wasExecuting.current && !isExecuting) {
      setExpanded(new Set());
      if (!errorOutput && testCases && testCases.length > 0) setTab("tests");
      else setTab("output");
    }
    wasExecuting.current = isExecuting;
  }, [isExecuting, errorOutput, testCases]);

  useEffect(() => {
    if (inputRequest === 0 || !input) return;
    setTab("input");
    workbench?.setConsoleCollapsed(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRequest]);

  useEffect(() => {
    if (!tabs.includes(tab)) setTab("output");
  }, [tab, tabs]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const select = (key: TabKey) => {
    setTab(key);
    if (collapsed) workbench?.setConsoleCollapsed(false);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.indexOf(tab);
    let next: TabKey | undefined;
    if (e.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    else if (e.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (e.key === "Home") next = tabs[0];
    else if (e.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const copyText = [output, errorOutput].filter(Boolean).join("\n\n");

  const tabLabel = (key: TabKey): ReactNode => {
    if (key === "output") {
      return (
        <>
          <Icon name="terminal" size={13} />
          <span>Output</span>
          {errorOutput ? <span className="pro-terminal__dot" data-tone="fail" aria-label="has errors" /> : null}
        </>
      );
    }
    if (key === "tests") {
      return (
        <>
          <Icon name="check-mark" size={13} />
          <span>Test results</span>
          {total > 0 ? (
            <span className="pro-terminal__count" data-tone={passed === total ? "pass" : "fail"}>
              {passed}/{total}
            </span>
          ) : null}
        </>
      );
    }
    return (
      <>
        <Icon name="edit" size={13} />
        <span>{input?.label ?? "Input"}</span>
        {input?.value.trim() ? <span className="pro-terminal__dot" data-tone="info" aria-label="has input" /> : null}
      </>
    );
  };

  return (
    <section className="pro-terminal" aria-label={label} data-collapsed={collapsed || undefined}>
      <div className="pro-terminal__header">
        <div className="pro-terminal__tabs" role="tablist" aria-label={`${label} views`}>
          {tabs.map((key) => (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`${baseId}-panel`}
              tabIndex={tab === key ? 0 : -1}
              className="pro-terminal__tab"
              data-on={(tab === key && !collapsed) || undefined}
              onClick={() => select(key)}
              onKeyDown={onTabKey}
            >
              {tabLabel(key)}
            </button>
          ))}
        </div>
        <div className="pro-terminal__actions">
          {isExecuting ? (
            <span className="pro-terminal__running" aria-hidden="true">
              <Icon name="loader" size={12} motion="orbit" />
            </span>
          ) : null}
          {copyText ? (
            <button
              type="button"
              className="pro-terminal__action"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(copyText);
                  setCopied(true);
                } catch {
                  /* Clipboard refused — the output is still selectable. */
                }
              }}
              title={copied ? "Copied" : "Copy output"}
              aria-label={copied ? "Copied" : "Copy output"}
            >
              <Icon name={copied ? "check" : "copy"} size={13} />
            </button>
          ) : null}
          {onClear && (hasOutput || total > 0 || banner) ? (
            <button type="button" className="pro-terminal__action" onClick={onClear} title="Clear console" aria-label="Clear console">
              <Icon name="trash" size={13} />
            </button>
          ) : null}
          {onRun && !workbench ? (
            <button type="button" className="pro-terminal__run" onClick={onRun} disabled={isExecuting}>
              <Icon name="play" size={12} />
              <span>Run</span>
            </button>
          ) : null}
          {workbench ? (
            <button
              type="button"
              className="pro-terminal__action"
              onClick={() => workbench.setConsoleCollapsed(!collapsed)}
              aria-expanded={!collapsed}
              title={collapsed ? "Expand console" : "Collapse console"}
              aria-label={collapsed ? "Expand console" : "Collapse console"}
            >
              <Icon name={collapsed ? "chevron-up" : "chevron-down"} size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {!collapsed ? (
        <div
          className="pro-terminal__body"
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab}`}
          aria-busy={isExecuting || undefined}
        >
          {banner && tab !== "input" ? <div className="pro-terminal__banner">{banner}</div> : null}

          {isExecuting && tab !== "input" ? (
            <div className="pro-terminal__executing" role="status">
              <Icon name="loader" size={14} motion="orbit" />
              <span>{statusText ?? "Running in the sandbox…"}</span>
            </div>
          ) : tab === "output" ? (
            hasOutput ? (
              <div className="pro-terminal__output">
                {output ? <pre className="pro-terminal__stream">{output}</pre> : null}
                {errorOutput ? (
                  <pre className="pro-terminal__stream" data-stream="stderr">
                    {errorOutput}
                  </pre>
                ) : null}
                {hint ? (
                  <p className="pro-terminal__hint">
                    <Icon name="info" size={13} />
                    <span>{hint}</span>
                  </p>
                ) : null}
                {statusLine ? (
                  <p className="pro-terminal__status" data-tone={statusLine.tone}>
                    <Icon name={TONE_ICON[statusLine.tone]} size={13} />
                    <span>{statusLine.text}</span>
                  </p>
                ) : null}
              </div>
            ) : banner ? null : (
              <div className="pro-terminal__empty">
                <StateBlock state="empty" compact message="Nothing has run yet." />
                <p className="pro-terminal__empty-hint">
                  Press Run or <Kbd keys={SHORTCUTS.run} />
                </p>
              </div>
            )
          ) : tab === "tests" ? (
            total === 0 ? (
              <div className="pro-terminal__empty">
                <StateBlock state="empty" compact message="No results yet — Run checks the visible cases." />
                {hiddenCount ? (
                  <p className="pro-terminal__empty-hint">
                    {hiddenCount} hidden case{hiddenCount === 1 ? "" : "s"} run only on submission.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="pro-terminal__tests">
                <p className="pro-terminal__summary" data-tone={passed === total ? "pass" : "fail"}>
                  <Icon name={passed === total ? "check" : "error"} size={14} />
                  <strong>
                    {passed} of {total} passed
                  </strong>
                  {hiddenCount ? (
                    <span className="pro-terminal__summary-note">
                      · {hiddenCount} hidden case{hiddenCount === 1 ? "" : "s"} not shown
                    </span>
                  ) : null}
                </p>
                <ol className="pro-terminal__cases">
                  {testCases!.map((tc, idx) => {
                    const hasDetail = Boolean(tc.input || tc.expected || tc.actual || tc.details);
                    const open = !tc.passed || expanded.has(idx);
                    return (
                      <li key={idx} className="pro-terminal__case" data-verdict={tc.passed ? "pass" : "fail"}>
                        <button
                          type="button"
                          className="pro-terminal__case-head"
                          aria-expanded={hasDetail ? open : undefined}
                          disabled={!hasDetail || !tc.passed}
                          onClick={() =>
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(idx)) next.delete(idx);
                              else next.add(idx);
                              return next;
                            })
                          }
                        >
                          <Icon name={tc.passed ? "check" : "x"} size={13} />
                          <span className="pro-terminal__case-name">{tc.name}</span>
                          <span className="pro-terminal__case-verdict">{tc.passed ? "Passed" : "Failed"}</span>
                          {tc.durationMs !== undefined ? (
                            <span className="pro-terminal__case-time">{formatDuration(tc.durationMs)}</span>
                          ) : null}
                        </button>
                        {hasDetail && open ? (
                          <dl className="pro-terminal__case-detail">
                            {tc.input ? (
                              <div>
                                <dt>Input</dt>
                                <dd>
                                  <code>{tc.input}</code>
                                </dd>
                              </div>
                            ) : null}
                            {tc.expected ? (
                              <div>
                                <dt>Expected</dt>
                                <dd>
                                  <code>{tc.expected}</code>
                                </dd>
                              </div>
                            ) : null}
                            {tc.actual && !tc.passed ? (
                              <div data-tone="fail">
                                <dt>Actual</dt>
                                <dd>
                                  <code>{tc.actual}</code>
                                </dd>
                              </div>
                            ) : null}
                            {tc.details ? <p>{tc.details}</p> : null}
                          </dl>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )
          ) : input ? (
            <div className="pro-terminal__input">
              <label className="pro-terminal__input-label" htmlFor={`${baseId}-stdin`}>
                {input.label ?? "Standard input"}
              </label>
              <textarea
                ref={inputRef}
                id={`${baseId}-stdin`}
                className="pro-terminal__textarea"
                value={input.value}
                onChange={(e) => input.onChange(e.target.value)}
                placeholder={input.placeholder ?? "One value per line"}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
              />
              <div className="pro-terminal__input-foot">
                {input.note ? <span>{input.note}</span> : <span />}
                {input.action}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
