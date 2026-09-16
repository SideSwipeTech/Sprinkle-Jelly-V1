/**
 * WorkbenchLayout — state matrix for the Kitchen Sink.
 *
 * Pane stand-ins carry the suite panel classes (`x-editor`, `x-terminal`,
 * `x-file-explorer`) the way work/Workbench's matrix does — the real panels are
 * siblings referenced by class, per contract §6.
 */

import type { ReactNode } from "react";
import { Card, CardHeader } from "@components/Card";
import {
  WorkbenchLayout,
  WorkbenchLayoutDock,
  WorkbenchLayoutFill,
  WorkbenchLayoutPane,
  WorkbenchLayoutPaneHead
} from "./WorkbenchLayout";

const code = { margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" } as const;
const out = { margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)" } as const;

function FakeEditor({ lines }: { lines: string }) {
  return (
    <div className="x-editor" style={{ padding: "var(--space-3)" }}>
      <pre style={code}>{lines}</pre>
    </div>
  );
}

function FakeTerminal({ text }: { text: string }) {
  return (
    <div className="x-terminal">
      <div className="x-terminal__body" style={{ padding: "var(--space-2) var(--space-3)" }}>
        <pre style={out}>{text}</pre>
      </div>
    </div>
  );
}

function FakeExplorer() {
  return (
    <div className="x-file-explorer">
      <ul className="x-file-explorer__tree">
        <li className="x-file-explorer__item" data-on>
          <span className="x-file-explorer__select" aria-current="true">main.py</span>
        </li>
        <li className="x-file-explorer__item">
          <span className="x-file-explorer__select">tests.py</span>
        </li>
        <li className="x-file-explorer__item">
          <span className="x-file-explorer__select">utils.py</span>
        </li>
      </ul>
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "statement",
    label: "Statement | solve — challenge shape (Practice.tsx:379)",
    render: () => (
      <WorkbenchLayout layout="statement" label="Challenge solve">
        <WorkbenchLayoutPane>
          {/* Fill lets the statement card occupy its pane — a bare card leaves
              a void under it once the grid's min-height stretches the row. */}
          <WorkbenchLayoutFill>
            <Card>
              <CardHeader title="Two Sum" icon="challenges" />
              <p className="meta" style={{ margin: 0 }}>Return indices of the two numbers that add to target.</p>
            </Card>
          </WorkbenchLayoutFill>
        </WorkbenchLayoutPane>
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Editor" title="main.py" meta="python" />
          <WorkbenchLayoutFill>
            <FakeEditor lines={"def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):"} />
          </WorkbenchLayoutFill>
          <WorkbenchLayoutDock>
            {/* First child of a dock → the dock's title bar (compacts to one
                line and picks up the header hairline). */}
            <WorkbenchLayoutPaneHead eyebrow="Output" title="visible checks" meta="1 passed" />
            <FakeTerminal text="1 visible check passed." />
          </WorkbenchLayoutDock>
        </WorkbenchLayoutPane>
      </WorkbenchLayout>
    )
  },
  {
    key: "split",
    label: "Even split — debug shape (Practice.tsx:879)",
    render: () => (
      <WorkbenchLayout layout="split" label="Debug session">
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Bug report" title="fib(0) returns 1 — expected 0" meta="repro" />
          <WorkbenchLayoutFill>
            <FakeEditor lines={"# the bug\nfib(0) == 1   # expected 0"} />
          </WorkbenchLayoutFill>
        </WorkbenchLayoutPane>
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Fix" title="fib.py" meta="Ln 1, Col 1" />
          <WorkbenchLayoutFill>
            <FakeEditor lines={"def fib(n):\n    if n <= 1: return n"} />
          </WorkbenchLayoutFill>
          <WorkbenchLayoutDock>
            <WorkbenchLayoutPaneHead eyebrow="Output" title="samples" meta="1/2" />
            <FakeTerminal text={"sample 1  ok\nsample 2  MISMATCH"} />
          </WorkbenchLayoutDock>
        </WorkbenchLayoutPane>
      </WorkbenchLayout>
    )
  },
  {
    key: "tri",
    label: "Rail | editor | output — workspace shape (Practice.tsx:1077)",
    render: () => (
      <WorkbenchLayout layout="tri" label="Project workspace">
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Files" title="workspace" meta="3" />
          <WorkbenchLayoutFill>
            <FakeExplorer />
          </WorkbenchLayoutFill>
        </WorkbenchLayoutPane>
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Editor" title="main.py" meta="python" />
          <WorkbenchLayoutFill>
            <FakeEditor lines={"# main.py\nfrom utils import slug"} />
          </WorkbenchLayoutFill>
        </WorkbenchLayoutPane>
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Output" title="dev server" meta="port 4173" />
          <WorkbenchLayoutFill>
            <FakeTerminal text="dev server simulated · port 4173" />
          </WorkbenchLayoutFill>
        </WorkbenchLayoutPane>
      </WorkbenchLayout>
    )
  },
  {
    key: "sidebar",
    label: "Rail | pane — canonical sidebar standing alone",
    render: () => (
      <WorkbenchLayout layout="sidebar" label="Files and editor">
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Explorer" title="files" />
          <WorkbenchLayoutFill>
            <FakeExplorer />
          </WorkbenchLayoutFill>
        </WorkbenchLayoutPane>
        <WorkbenchLayoutPane flush>
          <WorkbenchLayoutPaneHead eyebrow="Editor" title="scratch.py" />
          <WorkbenchLayoutFill>
            <FakeEditor lines={"# scratch\n"} />
          </WorkbenchLayoutFill>
          <WorkbenchLayoutDock>
            <WorkbenchLayoutPaneHead eyebrow="Output" title="console" />
            <FakeTerminal text="ready" />
          </WorkbenchLayoutDock>
        </WorkbenchLayoutPane>
      </WorkbenchLayout>
    )
  }
];
