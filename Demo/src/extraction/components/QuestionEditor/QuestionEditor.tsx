/**
 * QuestionEditor — the studio's question-authoring form (assessments.F15).
 *
 * Five question kinds, each enforcing its own requirements, with a staff-only
 * answer key matched to the kind and an optional explanation. The kind is fixed
 * once the question exists (`exists` locks the selector into a chip), and a key
 * whose kind does not match the question's cannot be saved — the refusal is an
 * inline state, never a thrown-away draft.
 *
 * Requirements enforced per kind (the publish gate repeats them):
 *   single-choice    prompt + at least two options + exactly one correct option
 *   multiple-choice  prompt + at least two options + a correct set of one or
 *                    more (the key is a set: a repeated option counts once)
 *   numerical        prompt + a numerical key with its tolerance: exact, an
 *                    absolute tolerance of 0 or more, or a relative one of
 *                    0 to 10 percent (ASSESSMENT_NUMERICAL_TOLERANCE)
 *   true-false       prompt + a true or false key
 *   coding           prompt + a language + at least one case; hidden cases are
 *                    authored in full and reduce to a count for the learner
 *
 * Shared fields: prompt, marks, one absolute negative-marks value, difficulty,
 * a classification against a live skill and topic, an optional explanation and
 * an optional authored target time (10 s to 60 min — the pace reason's honest
 * denominator). The per-kind bodies live in kindParts.tsx (file bound).
 */

import { useId, useState, type ReactNode } from "react";
import { Icon } from "@icons/Icon";
import { CasesPart, NumericalKeyPart, OptionsPart, TrueFalseKeyPart } from "./kindParts";
import { validateQuestion } from "./validate";
import "./QuestionEditor.css";

export type QuestionKind =
  | "single-choice"
  | "multiple-choice"
  | "numerical"
  | "true-false"
  | "coding";

export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  "single-choice": "Single choice",
  "multiple-choice": "Multiple choice",
  numerical: "Numerical",
  "true-false": "True/false",
  coding: "Coding"
};

export const QUESTION_KINDS = Object.keys(QUESTION_KIND_LABEL) as QuestionKind[];

const KIND_REQUIREMENT: Record<QuestionKind, string> = {
  "single-choice": "A prompt, at least two options and exactly one correct option.",
  "multiple-choice":
    "A prompt, at least two options and a correct set of one or more — the answer is a set, a repeated option counts once.",
  numerical:
    "A prompt and a numerical key with its tolerance: exact, an absolute tolerance of 0 or more, or a relative one of 0 to 10 percent.",
  "true-false": "A prompt and a true or false key.",
  coding:
    "A prompt, a language and at least one case. Hidden cases are authored in full and reduce to a count for the learner."
};

export interface EditorOption {
  id: string;
  text: string;
}

export type CaseComparison = "exact" | "trimmed";

export interface EditorCase {
  id: string;
  /** Visible cases run in-test against the section's allowance; hidden reduce to a count. */
  visible: boolean;
  input: string;
  expected: string;
  comparison: CaseComparison;
}

/** The staff-only answer key, matched to the question's kind. A coding question's
 *  grading contract is its case set, so its key carries no further shape. */
export type AnswerKey =
  | { kind: "single-choice"; optionId: string | null }
  | { kind: "multiple-choice"; optionIds: string[] }
  | {
      kind: "numerical";
      value: string;
      toleranceMode: "exact" | "absolute" | "relative";
      tolerance: string;
    }
  | { kind: "true-false"; value: boolean | null }
  | { kind: "coding" };

export interface QuestionDraft {
  kind: QuestionKind;
  prompt: string;
  /** Marks and negative marks stay strings while typed; validation reads numbers. */
  marks: string;
  negativeMarks: string;
  difficulty: "" | "easy" | "medium" | "hard" | "extreme";
  /** Classification against a live skill and topic — required, never free text. */
  skill: string;
  topic: string;
  explanation: string;
  /** Optional authored target time in seconds — the pace reason's honest denominator. */
  targetSeconds: string;
  options: EditorOption[];
  key: AnswerKey | null;
  language: string;
  cases: EditorCase[];
}

export function emptyKeyFor(kind: QuestionKind): AnswerKey {
  switch (kind) {
    case "single-choice":
      return { kind, optionId: null };
    case "multiple-choice":
      return { kind, optionIds: [] };
    case "numerical":
      return { kind, value: "", toleranceMode: "exact", tolerance: "" };
    case "true-false":
      return { kind, value: null };
    case "coding":
      return { kind };
  }
}

export interface QuestionError {
  /** Region the message points at — matched to data-field on the editor's parts. */
  field: string;
  message: string;
}

export { validateQuestion } from "./validate";

export interface QuestionEditorProps {
  draft: QuestionDraft;
  onChange: (draft: QuestionDraft) => void;
  /** Called only with a clean draft — a mismatched key or unmet requirement
   *  refuses inline and never reaches this callback. */
  onSave: (draft: QuestionDraft) => void;
  /** Set once the question exists: the kind stops being a choice. */
  exists?: boolean;
  /** Skill and topic vocabularies the classification selects from — live
   *  classification is never free text. */
  skills?: readonly string[];
  topics?: readonly string[];
  languages?: readonly string[];
  saveLabel?: string;
  /** Reopen with requirements already reported — e.g. a draft returned to the
   *  author with its refusals still showing. */
  initialAttempted?: boolean;
  /** Read-only rendering for a published paper — every control is disabled and
   *  the editor announces the freeze. A content write is the page's refusal,
   *  not a control here. */
  locked?: boolean;
}

const DEFAULT_SKILLS = ["Algorithms", "Data structures", "Language foundations", "System design"];
const DEFAULT_TOPICS = ["Arrays", "Graphs", "Complexity", "Syntax"];
const DEFAULT_LANGUAGES = ["python", "typescript", "java", "sql"];

/** One labelled field row: label, control, hint and per-field error lines. */
function EditorField({
  label,
  field,
  errors,
  hint,
  htmlFor,
  children
}: {
  label: string;
  field: string;
  errors: QuestionError[];
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  const mine = errors.filter((e) => e.field === field);
  return (
    <div className="x-question-editor__field" data-field={field} data-invalid={mine.length > 0 || undefined}>
      <label className="x-question-editor__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="x-question-editor__hint">{hint}</p> : null}
      {mine.map((e) => <p key={e.message} className="x-question-editor__error" role="alert">{e.message}</p>)}
    </div>
  );
}

export function QuestionEditor({
  draft,
  onChange,
  onSave,
  exists = false,
  skills = DEFAULT_SKILLS,
  topics = DEFAULT_TOPICS,
  languages = DEFAULT_LANGUAGES,
  saveLabel = "Save question",
  initialAttempted = false,
  locked = false
}: QuestionEditorProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [attempted, setAttempted] = useState(initialAttempted);
  const errors = validateQuestion(draft);
  const shown = attempted ? errors : [];
  const keyMismatch = draft.key !== null && draft.key.kind !== draft.kind;

  const set = (patch: Partial<QuestionDraft>) => onChange({ ...draft, ...patch });
  const setKey = (key: AnswerKey) => set({ key });
  const id = (part: string) => `x-qe-${part}-${uid}`;
  const partProps = { draft, uid, set, setKey, id };

  function save() {
    setAttempted(true);
    if (errors.length === 0) onSave(draft);
  }

  return (
    <div className="x-question-editor" data-kind={draft.kind} data-locked={locked || undefined}>
      {locked ? (
        <p className="x-question-editor__frozen" role="status">
          <Icon name="lock" size={13} /> Published — content is frozen permanently; nothing here writes.
        </p>
      ) : null}
      <fieldset className="x-question-editor__fieldset" disabled={locked}>
      {/* ── Kind — selected at creation, fixed once the question exists ── */}
      <div className="x-question-editor__kind">
        <span className="x-question-editor__label">Question kind</span>
        {exists ? (
          <span className="x-chip x-question-editor__kind-chip">
            <Icon name="lock" size={12} />
            <span className="x-chip__text">{QUESTION_KIND_LABEL[draft.kind]} — fixed once created</span>
          </span>
        ) : (
          <span className="x-question-editor__kind-pick" role="group" aria-label="Question kind">
            {QUESTION_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className="x-chip"
                data-on={draft.kind === kind || undefined}
                aria-pressed={draft.kind === kind}
                onClick={() => set({ kind, key: emptyKeyFor(kind) })}
              >
                {QUESTION_KIND_LABEL[kind]}
              </button>
            ))}
          </span>
        )}
        <p className="x-question-editor__hint">This kind requires: {KIND_REQUIREMENT[draft.kind]}</p>
      </div>

      <EditorField label="Prompt" field="prompt" errors={shown} htmlFor={id("prompt")}>
        <textarea id={id("prompt")} value={draft.prompt} rows={3}
          aria-invalid={shown.some((e) => e.field === "prompt") || undefined}
          onChange={(e) => set({ prompt: e.target.value })} />
      </EditorField>

      <div className="x-question-editor__grid">
        <EditorField label="Marks" field="marks" errors={shown} htmlFor={id("marks")}>
          <input id={id("marks")} inputMode="decimal" value={draft.marks}
            onChange={(e) => set({ marks: e.target.value })} />
        </EditorField>
        <EditorField label="Negative marks" field="negativeMarks" errors={shown} htmlFor={id("neg")}
          hint="One absolute value per question; empty means none.">
          <input id={id("neg")} inputMode="decimal" value={draft.negativeMarks}
            onChange={(e) => set({ negativeMarks: e.target.value })} />
        </EditorField>
        <EditorField label="Difficulty" field="difficulty" errors={shown} htmlFor={id("diff")}>
          <select id={id("diff")} value={draft.difficulty}
            onChange={(e) => set({ difficulty: e.target.value as QuestionDraft["difficulty"] })}>
            <option value="">—</option>
            {(["easy", "medium", "hard", "extreme"] as const).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </EditorField>
        <EditorField label="Target time (seconds)" field="targetSeconds" errors={shown} htmlFor={id("tt")}
          hint="Optional — the pace review reason's honest denominator.">
          <input id={id("tt")} inputMode="numeric" value={draft.targetSeconds}
            onChange={(e) => set({ targetSeconds: e.target.value })} />
        </EditorField>
        <EditorField label="Skill" field="skill" errors={shown} htmlFor={id("skill")}>
          <select id={id("skill")} value={draft.skill} onChange={(e) => set({ skill: e.target.value })}>
            <option value="">—</option>
            {skills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </EditorField>
        <EditorField label="Topic" field="topic" errors={shown} htmlFor={id("topic")}>
          <select id={id("topic")} value={draft.topic} onChange={(e) => set({ topic: e.target.value })}>
            <option value="">—</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </EditorField>
      </div>

      {/* ── Options (choice kinds) ── */}
      {(draft.kind === "single-choice" || draft.kind === "multiple-choice") && (
        <fieldset className="x-question-editor__options" data-field="options"
          data-invalid={shown.some((e) => e.field === "options") || undefined}>
          <legend className="x-question-editor__label">
            Options — {draft.kind === "single-choice" ? "mark exactly one correct" : "the correct answer is a set"}
          </legend>
          <OptionsPart {...partProps} />
          {shown.filter((e) => e.field === "options").map((e) => (
            <p key={e.message} className="x-question-editor__error" role="alert">{e.message}</p>
          ))}
        </fieldset>
      )}

      {/* ── The staff-only answer key, matched to the kind ── */}
      <section className="x-question-editor__key" data-field="key"
        data-invalid={shown.some((e) => e.field === "key") || undefined}>
        <header className="x-question-editor__key-head">
          <Icon name="lock" size={13} />
          <span className="x-question-editor__label">Staff-only answer key — {QUESTION_KIND_LABEL[draft.kind]}</span>
        </header>
        <p className="x-question-editor__hint">
          Matched to the question's kind and never rendered to a learner. A key of another kind cannot be saved.
        </p>

        {keyMismatch ? (
          <p className="x-question-editor__mismatch" role="alert">
            <Icon name="alert" size={14} />
            <span>
              This draft carries a {QUESTION_KIND_LABEL[draft.key!.kind]} key on a {QUESTION_KIND_LABEL[draft.kind]}{" "}
              question — a mismatched key cannot be saved.
            </span>
            <button type="button" className="x-btn x-btn--secondary x-btn--sm"
              onClick={() => setKey(emptyKeyFor(draft.kind))}>
              Replace with a {QUESTION_KIND_LABEL[draft.kind]} key
            </button>
          </p>
        ) : null}

        {!keyMismatch && draft.kind === "numerical" ? <NumericalKeyPart {...partProps} /> : null}
        {!keyMismatch && draft.kind === "true-false" ? <TrueFalseKeyPart {...partProps} /> : null}
        {!keyMismatch && draft.kind === "single-choice" ? (
          <p className="x-question-editor__hint">The marked option above is the key — exactly one is correct.</p>
        ) : null}
        {!keyMismatch && draft.kind === "multiple-choice" ? (
          <p className="x-question-editor__hint">The ticked options above are the key set — an empty set cannot be saved.</p>
        ) : null}

        {shown.filter((e) => e.field === "key").map((e) => (
          <p key={e.message} className="x-question-editor__error" role="alert">{e.message}</p>
        ))}
      </section>

      {/* ── Coding: language + cases are the grading contract ── */}
      {draft.kind === "coding" && (
        <section className="x-question-editor__cases" data-field="cases"
          data-invalid={shown.some((e) => e.field === "cases" || e.field === "language") || undefined}>
          <EditorField label="Language" field="language" errors={shown} htmlFor={id("lang")}>
            <select id={id("lang")} value={draft.language} onChange={(e) => set({ language: e.target.value })}>
              <option value="">—</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </EditorField>
          <CasesPart {...partProps} />
          {shown.filter((e) => e.field === "cases").map((e) => (
            <p key={e.message} className="x-question-editor__error" role="alert">{e.message}</p>
          ))}
        </section>
      )}

      <EditorField label="Explanation (optional)" field="explanation" errors={shown} htmlFor={id("expl")}
        hint="Staff-authored; shown only where the paper's reveal flags allow it.">
        <textarea id={id("expl")} value={draft.explanation} rows={2}
          onChange={(e) => set({ explanation: e.target.value })} />
      </EditorField>

      {/* ── Refusal summary + save ── */}
      {attempted && errors.length > 0 ? (
        <div className="x-question-editor__errors" role="alert">
          <strong>Cannot be saved — {errors.length} {errors.length === 1 ? "requirement" : "requirements"} unmet:</strong>
          <ul>
            {errors.map((e) => <li key={`${e.field}:${e.message}`}>{e.message}</li>)}
          </ul>
        </div>
      ) : null}
      </fieldset>

      {!locked ? (
        <div className="x-question-editor__save">
          <button type="button" className="x-btn x-btn--primary" onClick={save}>
            {saveLabel}
          </button>
          {attempted && errors.length > 0 ? (
            <span className="x-question-editor__save-note">Save refused — each unmet requirement is named above.</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
