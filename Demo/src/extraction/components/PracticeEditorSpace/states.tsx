import type { ReactNode } from "react";
import { useState } from "react";
import { PracticeEditorSpace } from "./PracticeEditorSpace";
import type { PracticeChecklistItem, PracticeDraft } from "./types";
import { emptyPracticeDraft } from "./types";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";

const DRAFT: PracticeDraft = {
  title: "Balanced Brackets",
  difficulty: "medium",
  topics: "stacks, strings",
  statement:
    "Given a string of brackets, decide whether every closer matches the most recent unmatched opener.",
  inputDescription: "A single line holding the bracket string `s`.",
  outputDescription: "`true` when the string is balanced, `false` otherwise.",
  constraints: "1 ≤ s.length ≤ 10⁵\ns carries only ( ) [ ] { }",
  interfaceKind: "console",
  comparisonPolicy: "console-default",
  tolerance: "",
  timeLimit: "",
  memoryLimit: "128",
  editorial: "A linear stack pass. Push openers; a closer must match the most recent unmatched opener.",
  languages: [
    {
      key: "python",
      label: "Python 3",
      language: "python",
      starter: "def is_balanced(s: str) -> bool:\n    # your solution here\n    return False\n",
      reference:
        "def is_balanced(s: str) -> bool:\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        elif not stack or stack.pop() != pairs[ch]:\n            return False\n    return not stack\n"
    },
    {
      key: "javascript",
      label: "JavaScript (ES6)",
      language: "javascript",
      starter: "function isBalanced(s) {\n  // your solution here\n  return false;\n}\n",
      reference:
        "function isBalanced(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const ch of s) {\n    if ('([{'.includes(ch)) stack.push(ch);\n    else if (stack.pop() !== pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}\n"
    }
  ],
  cases: [
    { key: "c1", visibility: "visible", input: "([]){}", expected: "true" },
    { key: "c2", visibility: "visible", input: "([)]", expected: "false" },
    { key: "c3", visibility: "hidden", input: "((({{{}}})))", expected: "true" }
  ]
};

const MET_CHECKLIST: PracticeChecklistItem[] = [
  { key: "statement", label: "Non-empty title and statement with structured input and output descriptions and constraints", met: true },
  { key: "cases", label: "At least one visible case and at least one hidden case, each with an expected output", met: true },
  { key: "policy", label: "An explicit comparison policy", met: true },
  { key: "limits", label: "Time and memory limits valid within the platform's execution bounds", met: true },
  { key: "starter", label: "Per offered language: a learner-visible starter that does not already pass", met: true },
  { key: "reference", label: "Per offered language: a reference solution that passes every case, validated by execution", met: true }
];

const WARN_CHECKLIST: PracticeChecklistItem[] = MET_CHECKLIST.map((item) =>
  item.key === "cases" ? { ...item, met: false } : item.key === "reference" ? { ...item, met: null } : item
);

function Editable({ initial, lifecycle = "draft", dirty = false, readOnly = false, checklist = MET_CHECKLIST }: {
  initial: PracticeDraft;
  lifecycle?: "draft" | "published" | "archived";
  dirty?: boolean;
  readOnly?: boolean;
  checklist?: PracticeChecklistItem[];
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <PracticeEditorSpace
      label="Challenge studio"
      lifecycle={lifecycle}
      revision={lifecycle === "draft" ? 1 : 4}
      readOnly={readOnly}
      dirty={dirty}
      draft={draft}
      onDraftChange={(p) => setDraft((d) => ({ ...d, ...p }))}
      xpAward={40}
      checklist={checklist}
      conflict={
        dirty
          ? {
              message: "Meera saved revision 5 while you were editing — the clash is raised with a choice.",
              onReload: () => {},
              onKeepMine: () => {}
            }
          : undefined
      }
      onSave={readOnly ? undefined : () => {}}
      onPublish={readOnly ? undefined : () => {}}
    />
  );
}

function DirtyGuardDemo() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div>
      <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", color: "var(--c-text-muted)" }}>
        The guard: a Notice + a confirm on the navigation attempt.{" "}
        <Button variant="quiet" size="sm" onClick={() => setConfirmOpen(true)}>Leave the space</Button>
      </p>
      <Editable initial={DRAFT} dirty />
      <Dialog
        open={confirmOpen}
        title="Leave with unsaved work?"
        icon="alert"
        onClose={() => setConfirmOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Stay</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(false)}>Leave without saving</Button>
          </>
        }
      >
        <p>Unsaved edits to this draft are lost if you leave. Save first, or leave anyway.</p>
      </Dialog>
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "draft",
    label: "Draft — editable, checklist reporting the gate, Save never gated",
    render: () => <Editable initial={DRAFT} />
  },
  {
    key: "published-read-only",
    label: "Published — read-only surface, revision shown, no Save control",
    render: () => <Editable initial={DRAFT} lifecycle="published" readOnly />
  },
  {
    key: "validation-warning",
    label: "Validation warning — unmet + not-yet-verifiable conditions named; Save still live",
    render: () => <Editable initial={{ ...DRAFT, cases: DRAFT.cases.slice(0, 2) }} checklist={WARN_CHECKLIST} />
  },
  {
    key: "unsaved-work-guard",
    label: "Unsaved-work guard — dirty notice + confirm dialog on a navigation attempt",
    render: () => <DirtyGuardDemo />
  },
  {
    key: "loading",
    label: "Loading — pending StateBlock, never a blank editor",
    render: () => (
      <PracticeEditorSpace label="Challenge studio" state="pending" draft={emptyPracticeDraft()} />
    )
  },
  {
    key: "unavailable-retry",
    label: "Unavailable — honesty state with a retry",
    render: () => (
      <PracticeEditorSpace label="Challenge studio" state="unavailable" onRetry={() => {}} draft={emptyPracticeDraft()} />
    )
  },
  {
    key: "empty-draft",
    label: "New draft — no cases, no languages: the space says so",
    render: () => <Editable initial={emptyPracticeDraft()} checklist={[]} />
  }
];
