import type { ReactNode } from "react";
import { useState } from "react";
import { SandboxCard } from "./SandboxCard";
import { CodeEditorChrome } from "../CodeEditorChrome/CodeEditorChrome";

const SNIPPET = `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib(10))`;

const OUT = `Process finished with exit code 0
> Running snippet in isolated sandbox…
55`;

function Demo({ running = false }: { running?: boolean }) {
  const [code, setCode] = useState(SNIPPET);
  const [out, setOut] = useState<string | null>(null);
  return (
    <SandboxCard
      language="python"
      running={running}
      output={out}
      onReset={() => {
        setCode(SNIPPET);
        setOut(null);
      }}
      onRun={() => setOut(OUT)}
    >
      <CodeEditorChrome
        value={code}
        onChange={setCode}
        language="python"
        filename="snippet.py"
        engine="custom"
        hideHeader
        hideFooter
      />
    </SandboxCard>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "idle",
    label: "Idle — workbench toolbar chrome, no output rendered",
    render: () => <Demo />
  },
  {
    key: "running",
    label: "Running — run gated, live icon, output absent",
    render: () => <Demo running />
  },
  {
    key: "output",
    label: "With output — terminal surface, role=status",
    render: () => <DemoWithOut />
  }
];

function DemoWithOut() {
  const [code, setCode] = useState(SNIPPET);
  const [out, setOut] = useState<string | null>(OUT);
  return (
    <SandboxCard
      language="python"
      output={out}
      onReset={() => {
        setCode(SNIPPET);
        setOut(null);
      }}
      onRun={() => setOut(OUT)}
    >
      <CodeEditorChrome
        value={code}
        onChange={setCode}
        language="python"
        filename="snippet.py"
        engine="custom"
        hideHeader
        hideFooter
      />
    </SandboxCard>
  );
}
