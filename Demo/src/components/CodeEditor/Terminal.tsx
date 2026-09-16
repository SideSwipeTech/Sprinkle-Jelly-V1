import { useState } from "react";
import { Icon } from "@icons/Icon";
import { StateBlock } from "@components/Card";

export interface TerminalProps {
  output: string | null;
  isExecuting?: boolean;
  statusText?: string;
  onClear?: () => void;
  onRun?: () => void;
  testCases?: Array<{
    name: string;
    passed: boolean;
    durationMs?: number;
    expected?: string;
    actual?: string;
    details?: string;
  }>;
}

export function Terminal({
  output,
  isExecuting = false,
  statusText,
  onClear,
  onRun,
  testCases,
}: TerminalProps) {
  const [activeTab, setActiveTab] = useState<"terminal" | "tests" | "judge">("terminal");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const passCount = testCases ? testCases.filter((t) => t.passed).length : 0;
  const totalCount = testCases ? testCases.length : 0;

  return (
    <div className="pro-terminal">
      <div className="pro-terminal__header">
        <div className="pro-terminal__tabs">
          <button
            type="button"
            className={`pro-terminal__tab ${activeTab === "terminal" ? "is-active" : ""}`}
            onClick={() => setActiveTab("terminal")}
          >
            <Icon name="terminal" size={14} />
            <span>Output Console</span>
            {output && <span className="pro-terminal__indicator is-ready" />}
          </button>

          {testCases && testCases.length > 0 && (
            <button
              type="button"
              className={`pro-terminal__tab ${activeTab === "tests" ? "is-active" : ""}`}
              onClick={() => setActiveTab("tests")}
            >
              <Icon name="check-mark" size={14} />
              <span>Test Results ({passCount}/{totalCount})</span>
              <span
                className={`pro-terminal__indicator ${
                  passCount === totalCount ? "is-pass" : "is-fail"
                }`}
              />
            </button>
          )}

          <button
            type="button"
            className={`pro-terminal__tab ${activeTab === "judge" ? "is-active" : ""}`}
            onClick={() => setActiveTab("judge")}
          >
            <Icon name="zap" size={14} />
            <span>Verdict / Judge</span>
          </button>
        </div>

        <div className="pro-terminal__actions">
          {onRun && (
            <button
              type="button"
              className="term-btn term-btn--run"
              onClick={onRun}
              disabled={isExecuting}
              title="Run simulation"
            >
              <Icon name="zap" size={13} />
              <span>Run</span>
            </button>
          )}

          {output && (
            <button
              type="button"
              className="term-btn"
              onClick={handleCopy}
              title="Copy terminal output"
            >
              <Icon name={copied ? "check-mark" : "clipboard"} size={13} />
            </button>
          )}

          {onClear && (
            <button
              type="button"
              className="term-btn"
              onClick={onClear}
              title="Clear terminal"
            >
              <Icon name="x" size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="pro-terminal__body">
        {isExecuting ? (
          <div className="pro-terminal__executing">
            <div className="exec-pulse">
              <span className="spinner" />
              <span>{statusText || "Compiling & executing in isolated sandbox…"}</span>
            </div>
          </div>
        ) : activeTab === "terminal" ? (
          output ? (
            <pre className="pro-terminal__output">{output}</pre>
          ) : (
            <div className="pro-terminal__empty">
              <StateBlock
                state="empty"
                compact
                message="No run yet. Click 'Run Code' or press Ctrl+Enter to execute."
              />
            </div>
          )
        ) : activeTab === "tests" ? (
          <div className="pro-terminal__tests">
            {testCases?.map((tc, idx) => (
              <div
                key={idx}
                className={`test-case-card ${tc.passed ? "is-pass" : "is-fail"}`}
              >
                <div className="test-case-head">
                  <span className="test-case-status">
                    <Icon name={tc.passed ? "check-mark" : "x"} size={14} />
                  </span>
                  <span className="test-case-name">{tc.name}</span>
                  {tc.durationMs !== undefined && (
                    <span className="test-case-time">{tc.durationMs}ms</span>
                  )}
                </div>
                {tc.details && <p className="test-case-details">{tc.details}</p>}
                {!tc.passed && tc.expected && tc.actual && (
                  <div className="test-case-diff">
                    <div className="diff-col">
                      <span className="diff-label">Expected:</span>
                      <code>{tc.expected}</code>
                    </div>
                    <div className="diff-col">
                      <span className="diff-label">Actual:</span>
                      <code>{tc.actual}</code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pro-terminal__judge">
            <div className="judge-box">
              <div className="judge-status-header">
                <span className="judge-badge">Deterministic Engine</span>
                <span className="judge-rule">Rules strictly enforced · Honest measurement</span>
              </div>
              <p className="judge-lead">
                {output
                  ? "Execution verified by local sandbox runner. Memory and execution time bounded within declared constraints."
                  : "Submit your solution to generate a verified verdict recorded on this device."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
