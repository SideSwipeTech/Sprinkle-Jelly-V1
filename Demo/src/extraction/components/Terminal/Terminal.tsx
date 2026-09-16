/**
 * Terminal — the run-output dock: Output / Test Results / Verdict tabs, the
 * executing spinner, pass/fail test-case cards, and the judge box.
 *
 * Mostly a clean adoption of the kit `pro-terminal`; the changes:
 *  - the tab strip gains real tab semantics (`role="tablist"`/`role="tab"`,
 *    `aria-selected`, `aria-controls`, Arrow-key movement, `role="tabpanel"` on
 *    the body) — the kit had `is-active` classes only;
 *  - `is-active`/`is-pass`/`is-fail` classes → `data-on` / `data-verdict`;
 *  - indicator dots are `aria-hidden` — meaning rides the labels and counts,
 *    never colour alone;
 *  - the executing region is `role="status"`, and the spinner honours
 *    `prefers-reduced-motion`.
 */

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { StateBlock } from "@components/Card";
import "./Terminal.css";

export interface TerminalTestCase {
  name: string;
  passed: boolean;
  durationMs?: number;
  expected?: string;
  actual?: string;
  details?: string;
}

/** The verdict line pinned under a finished run — tone is icon + hue together. */
export interface TerminalStatusLine {
  tone: "pass" | "fail" | "info";
  text: string;
}

export interface TerminalProps {
  output: string | null;
  isExecuting?: boolean;
  /** Line shown while executing (overrides the default). */
  statusText?: string;
  /** The command echoed at the prompt, above the output — real consoles show it. */
  command?: string;
  /** Verdict line under the output (exit status, checks summary). */
  statusLine?: TerminalStatusLine;
  onClear?: () => void;
  onRun?: () => void;
  testCases?: TerminalTestCase[];
  label?: string;
  /** Which view opens first (sink demos land on tests/judge without a click). */
  initialTab?: TabKey;
}

export type TabKey = "output" | "tests" | "judge";

export function Terminal({
  output,
  isExecuting = false,
  statusText,
  command,
  statusLine,
  onClear,
  onRun,
  testCases,
  label = "Run output",
  initialTab = "output"
}: TerminalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [copied, setCopied] = useState(false);
  const baseId = useId();
  const stripRef = useRef<HTMLDivElement>(null);

  const passCount = testCases ? testCases.filter((t) => t.passed).length : 0;
  const totalCount = testCases?.length ?? 0;

  /* The tests tab only exists when cases were supplied — an absent tab never
     renders an empty panel (honest-absence rule). */
  const view: TabKey = activeTab === "tests" && totalCount === 0 ? "output" : activeTab;

  const tabs: { key: TabKey; icon: IconName; label: string; tone?: "ready" | "pass" | "fail" }[] = [
    {
      key: "output",
      icon: "terminal",
      label: "Output Console",
      tone: output ? "ready" : undefined
    },
    ...(testCases && testCases.length > 0
      ? [
          {
            key: "tests" as const,
            icon: "check-mark" as const,
            label: `Test Results (${passCount}/${totalCount})`,
            tone: (passCount === totalCount ? "pass" : "fail") as "pass" | "fail"
          }
        ]
      : []),
    { key: "judge", icon: "zap", label: "Verdict / Judge" }
  ];

  const onStripKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((t) => t.key === view);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    if (next === null) return;
    e.preventDefault();
    setActiveTab(tabs[next]!.key);
    stripRef.current
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      [next]?.focus();
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="x-terminal" aria-label={label}>
      <div className="x-terminal__head">
        <div
          className="x-terminal__tabs"
          role="tablist"
          aria-label={`${label} views`}
          ref={stripRef}
          onKeyDown={onStripKeyDown}
        >
          {tabs.map((tab) => {
            const isActive = view === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                id={`${baseId}-tab-${tab.key}`}
                className="x-terminal__tab"
                role="tab"
                data-on={isActive || undefined}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon name={tab.icon} size={14} />
                <span>{tab.label}</span>
                {tab.tone ? (
                  <span className="x-terminal__dot" data-tone={tab.tone} aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="x-terminal__actions">
          {onRun ? (
            <button
              type="button"
              className="x-terminal__btn x-terminal__btn--run"
              onClick={onRun}
              disabled={isExecuting}
              aria-disabled={isExecuting || undefined}
            >
              <Icon name={isExecuting ? "loader" : "zap"} size={13} motion={isExecuting ? "flow" : "none"} />
              <span>Run</span>
            </button>
          ) : null}
          {output ? (
            <button
              type="button"
              className="x-terminal__btn"
              onClick={handleCopy}
              aria-label={copied ? "Copied output" : "Copy output"}
              title="Copy output"
            >
              <Icon name={copied ? "check-mark" : "clipboard"} size={13} />
            </button>
          ) : null}
          {onClear ? (
            <button type="button" className="x-terminal__btn" onClick={onClear} disabled={isExecuting} aria-disabled={isExecuting || undefined}>
              <Icon name="x" size={13} />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="x-terminal__body"
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${view}`}
      >
        {isExecuting ? (
          <div className="x-terminal__executing" role="status">
            <span className="x-terminal__spinner" aria-hidden="true" />
            <span>{statusText ?? "Compiling & executing in isolated sandbox…"}</span>
          </div>
        ) : view === "output" ? (
          output ? (
            <>
              {command ? (
                <div className="x-terminal__prompt">
                  <span className="x-terminal__prompt-sign" aria-hidden="true">$</span>
                  <span>{command}</span>
                </div>
              ) : null}
              <pre className="x-terminal__output">{output}</pre>
              {statusLine ? (
                <div className="x-terminal__status" data-tone={statusLine.tone} role="status">
                  <Icon
                    name={statusLine.tone === "pass" ? "check-mark" : statusLine.tone === "fail" ? "x" : "info"}
                    size={12}
                  />
                  <span>{statusLine.text}</span>
                </div>
              ) : null}
            </>
          ) : (
            <StateBlock
              state="empty"
              compact
              message="No run yet. Click 'Run' or press Ctrl+Enter to execute."
            />
          )
        ) : view === "tests" ? (
          <ul className="x-terminal__tests">
            {testCases?.map((tc, idx) => (
              <li key={idx} className="x-terminal__case" data-verdict={tc.passed ? "pass" : "fail"}>
                <div className="x-terminal__case-head">
                  <span className="x-terminal__case-status">
                    <Icon name={tc.passed ? "check-mark" : "x"} size={14} />
                  </span>
                  <span className="x-terminal__case-name">{tc.name}</span>
                  {tc.durationMs !== undefined ? (
                    <span className="x-terminal__case-time">{tc.durationMs}ms</span>
                  ) : null}
                </div>
                {tc.details ? <p className="x-terminal__case-details">{tc.details}</p> : null}
                {!tc.passed && tc.expected !== undefined && tc.actual !== undefined ? (
                  <div className="x-terminal__diff">
                    <div className="x-terminal__diff-col">
                      <span className="x-terminal__diff-label">Expected:</span>
                      <code>{tc.expected}</code>
                    </div>
                    <div className="x-terminal__diff-col">
                      <span className="x-terminal__diff-label">Actual:</span>
                      <code>{tc.actual}</code>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="x-terminal__judge">
            <div className="x-terminal__judge-head">
              <span className="x-terminal__judge-badge">Deterministic Engine</span>
              <span className="x-terminal__judge-rule">Rules strictly enforced · Honest measurement</span>
            </div>
            <p className="x-terminal__judge-lead">
              {output
                ? "Execution verified by local sandbox runner. Memory and execution time bounded within declared constraints."
                : "Submit your solution to generate a verified verdict recorded on this device."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
