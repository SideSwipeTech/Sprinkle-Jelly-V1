import type { ReactNode } from "react";
import { useState } from "react";
import { Terminal, type TerminalTestCase, type TabKey } from "./Terminal";

const CASES: TerminalTestCase[] = [
  { name: "Sample 1: Balanced brackets '([]){}'", passed: true, durationMs: 0.21 },
  { name: "Sample 2: Interleaved brackets '([)]'", passed: true, durationMs: 0.18 },
  { name: "Sample 3: Missing closer", passed: false, durationMs: 0.24, expected: "false", actual: "true", details: "Stack non-empty at end of input." }
];

const OUT = `main.py  ·  python
  sample 1  ([]){}              ok        (0.21ms)
  sample 2  ([)]                ok        (0.18ms)
  sample 3  missing closer      MISMATCH  (0.24ms)

2 of 3 visible checks passed.`;

function Demo({ output, executing = false, tests, tab }: { output: string | null; executing?: boolean; tests?: TerminalTestCase[]; tab?: TabKey }) {
  const [out, setOut] = useState(output);
  const passed = tests ? tests.filter((t) => t.passed).length : 0;
  return (
    <Terminal
      output={out}
      isExecuting={executing}
      command="python main.py --checks visible"
      statusLine={
        out
          ? tests && passed < tests.length
            ? { tone: "fail", text: `exit 1 · ${passed}/${tests.length} checks passed` }
            : { tone: "pass", text: `exit 0 · ${tests ? `${passed}/${tests.length}` : "all"} checks passed · 0.68ms` }
          : undefined
      }
      onRun={() => setOut(OUT)}
      onClear={() => setOut(null)}
      testCases={tests}
      initialTab={tab}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "output",
    label: "Output console — prompt line + verdict status line",
    render: () => <Demo output={OUT} tests={CASES} />
  },
  {
    key: "executing",
    label: "Executing — spinner + role=status, actions gated",
    render: () => <Demo output={null} executing />
  },
  {
    key: "empty",
    label: "No run yet — honest empty StateBlock",
    render: () => <Demo output={null} />
  },
  {
    key: "failing-tests",
    label: "Tests view — fail card shows expected/actual diff",
    render: () => <Demo output={OUT} tests={CASES} tab="tests" />
  },
  {
    key: "judge",
    label: "Verdict / Judge view",
    render: () => <Demo output={OUT} tests={CASES} tab="judge" />
  }
];
