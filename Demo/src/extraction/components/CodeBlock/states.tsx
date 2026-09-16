import type { ReactNode } from "react";
import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

const SNIPPET = `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`;

function EditableDemo() {
  const [v, setV] = useState("x = fib(10)\nprint(x)");
  return <CodeBlock editable value={v} onChange={setV} label="Your solution" rows={4} />;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "display",
    label: "Display pre — canonical .code",
    render: () => <CodeBlock code={SNIPPET} language="python" />
  },
  {
    key: "editable",
    label: "Editable textarea variant (DailySolve's answer editor)",
    render: () => <EditableDemo />
  },
  {
    key: "output",
    label: "Output tone — terminal palette",
    render: () => <CodeBlock code={"exit code 0\n55"} tone="output" />
  },
  {
    key: "editable-readonly",
    label: "Editable shell, read-only (review state)",
    render: () => <CodeBlock editable value="print(42)" readOnly label="Submitted solution" />
  }
];
