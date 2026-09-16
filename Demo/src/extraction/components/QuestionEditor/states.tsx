/**
 * QuestionEditor state matrix for the Kitchen Sink — the five kinds, the fixed
 * kind on an existing question, the mismatched-key refusal, and the refused
 * save with every unmet requirement named.
 */
import { useState, type ReactNode } from "react";
import {
  emptyKeyFor,
  QuestionEditor,
  type QuestionDraft
} from "./QuestionEditor";

const blank: QuestionDraft = {
  kind: "single-choice",
  prompt: "",
  marks: "",
  negativeMarks: "",
  difficulty: "",
  skill: "",
  topic: "",
  explanation: "",
  targetSeconds: "",
  options: [],
  key: emptyKeyFor("single-choice"),
  language: "",
  cases: []
};

const singleChoice: QuestionDraft = {
  kind: "single-choice",
  prompt: "Which structure gives O(1) average lookup?",
  marks: "4",
  negativeMarks: "1",
  difficulty: "easy",
  skill: "Data structures",
  topic: "Arrays",
  explanation: "A hash table hashes the key once.",
  targetSeconds: "45",
  options: [
    { id: "o1", text: "Linked list" },
    { id: "o2", text: "Hash table" },
    { id: "o3", text: "Binary search tree" }
  ],
  key: { kind: "single-choice", optionId: "o2" },
  language: "",
  cases: []
};

const numerical: QuestionDraft = {
  kind: "numerical",
  prompt: "A fair coin is tossed 10 times. Expected number of heads?",
  marks: "2",
  negativeMarks: "",
  difficulty: "medium",
  skill: "Algorithms",
  topic: "Complexity",
  explanation: "",
  targetSeconds: "",
  options: [],
  key: { kind: "numerical", value: "5", toleranceMode: "absolute", tolerance: "0.01" },
  language: "",
  cases: []
};

const coding: QuestionDraft = {
  kind: "coding",
  prompt: "Write a function that returns the longest run of equal characters.",
  marks: "10",
  negativeMarks: "",
  difficulty: "hard",
  skill: "Algorithms",
  topic: "Syntax",
  explanation: "Two pointers suffice.",
  targetSeconds: "600",
  options: [],
  key: { kind: "coding" },
  language: "python",
  cases: [
    { id: "c1", visible: true, input: '"aabbb"', expected: "3", comparison: "exact" },
    { id: "c2", visible: true, input: '""', expected: "0", comparison: "exact" },
    { id: "c3", visible: false, input: '"abcccccde"', expected: "5", comparison: "trimmed" }
  ]
};

const mismatched: QuestionDraft = {
  ...singleChoice,
  kind: "single-choice",
  /* The refusal being demonstrated: a true/false key on a single-choice draft. */
  key: { kind: "true-false", value: true }
};

const unmet: QuestionDraft = {
  ...blank,
  options: [{ id: "o1", text: "" }],
  key: { kind: "single-choice", optionId: null }
};

function Demo({ draft: initial, exists = false, initialAttempted = false, locked = false }: { draft: QuestionDraft; exists?: boolean; initialAttempted?: boolean; locked?: boolean }) {
  const [draft, setDraft] = useState<QuestionDraft>(initial);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <QuestionEditor
        draft={draft}
        onChange={(d) => { setDraft(d); setSaved(false); }}
        onSave={() => setSaved(true)}
        exists={exists}
        initialAttempted={initialAttempted}
        locked={locked}
      />
      {saved ? <p className="x-question-editor__hint" role="status">Saved — every requirement met.</p> : null}
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "new",
    label: "New question — kind still a choice",
    render: () => <Demo draft={blank} />
  },
  {
    key: "single-choice",
    label: "Single choice — existing question, kind fixed",
    render: () => <Demo draft={singleChoice} exists />
  },
  {
    key: "numerical",
    label: "Numerical — key with absolute tolerance",
    render: () => <Demo draft={numerical} exists />
  },
  {
    key: "coding",
    label: "Coding — visible + hidden cases, hidden reduce to a count",
    render: () => <Demo draft={coding} exists />
  },
  {
    key: "mismatched",
    label: "Mismatched key — cannot be saved",
    render: () => <Demo draft={mismatched} exists initialAttempted />
  },
  {
    key: "unmet",
    label: "Save attempted — every unmet requirement named",
    render: () => <Demo draft={unmet} initialAttempted />
  },
  {
    key: "locked",
    label: "Published — content frozen, controls disabled",
    render: () => <Demo draft={singleChoice} exists locked />
  }
];
