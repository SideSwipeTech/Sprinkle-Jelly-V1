import type { ReactNode } from "react";
import { useState } from "react";
import { CodeEditorChrome, type EditorEngine } from "./CodeEditorChrome";

const SAMPLE = `def is_balanced(s: str) -> bool:
    # every opener must close in order
    stack = []
    pair = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pair:
            if not stack or stack.pop() != pair[ch]:
                return False
    return not stack

print(is_balanced("([]){}"))  # True
`;

/* The editor's height:100% chain needs a definite-size parent — every real
   mount wraps it in a sized box (Practice: `flex:1` + `minHeight:280-360px`
   wrappers). Seven row-heights reproduces that (~280-364px across densities);
   without it Monaco's container resolves 100% → auto and mounts at zero. */
const STAGE = { height: "calc(var(--row-height) * 7)" } as const;

function Demo({ engine, executing = false, bare = false }: { engine?: EditorEngine; executing?: boolean; bare?: boolean }) {
  const [code, setCode] = useState(SAMPLE);
  return (
    <div style={STAGE}>
      <CodeEditorChrome
        value={code}
        onChange={setCode}
        language="python"
        filename="main.py"
        engine={engine}
        isExecuting={executing}
        onRun={() => {}}
        hideHeader={bare}
        hideFooter={bare}
      />
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "monaco",
    label: "Monaco engine — theme generated from live tokens",
    render: () => <Demo engine="monaco" />
  },
  {
    key: "custom",
    label: "Theme Native engine (tokenized surface, --c-* only)",
    render: () => <Demo engine="custom" />
  },
  {
    key: "executing",
    label: "Executing — run gated, spinner in the chrome",
    render: () => <Demo engine="custom" executing />
  },
  {
    key: "bare",
    label: "hideHeader + hideFooter — the workbench-embedded form",
    render: () => <Demo engine="custom" bare />
  }
];
