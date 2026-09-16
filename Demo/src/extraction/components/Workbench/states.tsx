import type { ReactNode } from "react";
import { useState } from "react";
import { Icon } from "@icons/Icon";
import {
  Workbench,
  WorkbenchToolbar,
  WorkbenchTools,
  WorkbenchHint,
  ToolButton,
  RunButton,
  StdinRow,
  WorkbenchMain,
  WorkbenchPane,
  WorkbenchEditorArea,
  WorkbenchOutput,
  StatusBar,
  StatusGroup
} from "./Workbench";

/* Panel stand-ins: the real surfaces are sibling components (x-file-explorer,
   x-editor, x-terminal) referenced by class per contract §6 — these divs carry
   the same hooks so the fusion rules demonstrate in the sink. */
function FakeExplorer({ selected = true }: { selected?: boolean }) {
  return (
    <div className="x-file-explorer">
      <div className="x-file-explorer__head">
        <span className="x-file-explorer__title">Explorer</span>
      </div>
      <ul className="x-file-explorer__tree">
        <li className="x-file-explorer__item" data-on={selected || undefined}>
          <button type="button" className="x-file-explorer__select" aria-current={selected || undefined}>
            main.py
          </button>
        </li>
        <li className="x-file-explorer__item">
          <button type="button" className="x-file-explorer__select">tests.py</button>
        </li>
      </ul>
    </div>
  );
}

function FakeEditor() {
  /* flex:1 comes from the workbench's editor-area fusion rule — no inline sizing. */
  return <div className="x-editor" />;
}

function FakeTerminal({ text, verdict }: { text: string; verdict?: { tone: "pass" | "fail"; text: string } }) {
  return (
    <div className="x-terminal">
      <div className="x-terminal__body">
        <div className="x-terminal__prompt">
          <span className="x-terminal__prompt-sign" aria-hidden="true">$</span>
          <span>python main.py --checks visible</span>
        </div>
        <pre className="x-terminal__output">{text}</pre>
        {verdict ? (
          <div className="x-terminal__status" data-tone={verdict.tone} role="status">
            <Icon name={verdict.tone === "pass" ? "check-mark" : "x"} size={12} />
            <span>{verdict.text}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Bench({ running = false, stdin = false, side = true, editor = true }: { running?: boolean; stdin?: boolean; side?: boolean; editor?: boolean }) {
  const [showStdin, setShowStdin] = useState(stdin);
  const [stdinValue, setStdinValue] = useState("[2, 7, 11, 15]\n9");
  return (
    <Workbench label="Demo workbench">
      <WorkbenchToolbar>
        <WorkbenchTools>
          <WorkbenchHint title="The editor language follows the active file's extension">
            {editor ? "main.py · python" : "no file open"}
          </WorkbenchHint>
        </WorkbenchTools>
        <WorkbenchTools>
          <ToolButton icon="terminal" on={showStdin} onClick={() => setShowStdin((s) => !s)}>
            stdin
          </ToolButton>
          <ToolButton icon="reset">Reset starter</ToolButton>
          <RunButton running={running} />
        </WorkbenchTools>
      </WorkbenchToolbar>
      {showStdin ? <StdinRow value={stdinValue} onChange={setStdinValue} /> : null}
      <WorkbenchMain side={side ? <FakeExplorer selected={editor} /> : undefined}>
        <WorkbenchPane>
          {editor ? (
            <WorkbenchEditorArea>
              <FakeEditor />
            </WorkbenchEditorArea>
          ) : (
            /* No children → the area renders its own honest empty StateBlock. */
            <WorkbenchEditorArea />
          )}
          <WorkbenchOutput>
            <FakeTerminal
              text={
                running
                  ? "Compiling & executing in isolated sandbox…"
                  : "main.py  ·  python\n  sample 1  ([]){}   ok  (0.21ms)\n\n1 visible check passed."
              }
              verdict={running ? undefined : { tone: "pass", text: "exit 0 · 1 visible check passed · 0.21ms" }}
            />
          </WorkbenchOutput>
        </WorkbenchPane>
      </WorkbenchMain>
      <StatusBar>
        <StatusGroup items={editor ? ["Ln 12, Col 5", "84 lines", "2 files"] : ["—", "2 files"]} />
        <StatusGroup items={editor ? ["PYTHON · auto", "UTF-8", "Ctrl+Enter to run", "Saved locally"] : ["UTF-8", "Saved locally"]} />
      </StatusBar>
    </Workbench>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "sidebar-idle",
    label: "Sidebar layout · idle (CodeLab shape, Learn.tsx:998)",
    render: () => <Bench />
  },
  {
    key: "stdin-open",
    label: "stdin strip revealed (ToolButton toggles, aria-pressed)",
    render: () => <Bench stdin />
  },
  {
    key: "running",
    label: "Run in flight (RunButton gated + spinner icon)",
    render: () => <Bench running stdin />
  },
  {
    key: "plain",
    label: "No side rail (Practice challenge/debug/workspace splits)",
    render: () => <Bench side={false} />
  },
  {
    key: "empty-editor",
    label: "No file open — the editor well's honest empty StateBlock",
    render: () => <Bench editor={false} />
  }
];
