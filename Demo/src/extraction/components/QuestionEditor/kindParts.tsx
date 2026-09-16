/**
 * kindParts — the per-kind bodies of QuestionEditor: the options editor for the
 * two choice kinds, the numerical key fields, the true/false key and the coding
 * case editor. Kept out of QuestionEditor.tsx for the file bound; these render
 * only inside it and export no behaviour of their own.
 */

import { Icon } from "@icons/Icon";
import type { AnswerKey, CaseComparison, EditorCase, EditorOption, QuestionDraft } from "./QuestionEditor";

interface PartProps {
  draft: QuestionDraft;
  uid: string;
  set: (patch: Partial<QuestionDraft>) => void;
  setKey: (key: AnswerKey) => void;
  id: (part: string) => string;
}

/** Options list for single choice (radio = exactly one correct) and multiple
 *  choice (checkboxes = the correct set; a set counts a repeated option once). */
export function OptionsPart({ draft, set, setKey, id }: PartProps) {
  return (
    <>
      {draft.options.map((option: EditorOption, i: number) => {
        const correct =
          draft.key?.kind === "single-choice"
            ? draft.key.optionId === option.id
            : draft.key?.kind === "multiple-choice"
              ? draft.key.optionIds.includes(option.id)
              : false;
        return (
          <div className="x-question-editor__option" key={option.id}>
            <input
              type={draft.kind === "single-choice" ? "radio" : "checkbox"}
              name={id("correct")}
              checked={correct}
              aria-label={`Option ${i + 1} correct`}
              onChange={() => {
                if (draft.kind === "single-choice") {
                  setKey({ kind: "single-choice", optionId: option.id });
                } else {
                  const set = new Set(draft.key?.kind === "multiple-choice" ? draft.key.optionIds : []);
                  if (set.has(option.id)) set.delete(option.id); else set.add(option.id);
                  setKey({ kind: "multiple-choice", optionIds: [...set] });
                }
              }}
            />
            <input
              className="x-question-editor__option-text"
              value={option.text}
              aria-label={`Option ${i + 1} text`}
              placeholder={`Option ${i + 1}`}
              onChange={(e) =>
                set({ options: draft.options.map((o) => (o.id === option.id ? { ...o, text: e.target.value } : o)) })
              }
            />
            <button
              type="button"
              className="x-question-editor__remove"
              aria-label={`Remove option ${i + 1}`}
              onClick={() => {
                const options = draft.options.filter((o) => o.id !== option.id);
                const key =
                  draft.key?.kind === "multiple-choice"
                    ? { ...draft.key, optionIds: draft.key.optionIds.filter((x) => x !== option.id) }
                    : draft.key?.kind === "single-choice" && draft.key.optionId === option.id
                      ? { ...draft.key, optionId: null }
                      : draft.key;
                set({ options, key });
              }}
            >
              <Icon name="x" size={13} />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="x-btn x-btn--secondary x-btn--sm"
        onClick={() => set({ options: [...draft.options, { id: `opt-${id("n")}-${draft.options.length + 1}`, text: "" }] })}
      >
        Add option
      </button>
    </>
  );
}

/** The numerical key: value + tolerance (exact | absolute ≥ 0 | relative 0–10%). */
export function NumericalKeyPart({ draft, setKey, id }: PartProps) {
  if (draft.key?.kind !== "numerical") return null;
  const key = draft.key;
  return (
    <div className="x-question-editor__key-grid">
      <div className="x-question-editor__field">
        <label className="x-question-editor__label" htmlFor={id("kval")}>Correct value</label>
        <input id={id("kval")} inputMode="decimal" value={key.value}
          onChange={(e) => setKey({ ...key, value: e.target.value })} />
      </div>
      <div className="x-question-editor__field">
        <label className="x-question-editor__label" htmlFor={id("kmode")}>Tolerance</label>
        <select id={id("kmode")} value={key.toleranceMode}
          onChange={(e) => setKey({ ...key, toleranceMode: e.target.value as "exact" | "absolute" | "relative" })}>
          <option value="exact">exact</option>
          <option value="absolute">absolute</option>
          <option value="relative">relative (percent)</option>
        </select>
      </div>
      {key.toleranceMode !== "exact" ? (
        <div className="x-question-editor__field">
          <label className="x-question-editor__label" htmlFor={id("ktol")}>
            {key.toleranceMode === "absolute" ? "Absolute tolerance" : "Relative tolerance (%)"}
          </label>
          <input id={id("ktol")} inputMode="decimal" value={key.tolerance}
            onChange={(e) => setKey({ ...key, tolerance: e.target.value })} />
        </div>
      ) : null}
    </div>
  );
}

/** The true/false key — two chips, one holds. */
export function TrueFalseKeyPart({ draft, setKey }: PartProps) {
  return (
    <div className="x-question-editor__tf" role="group" aria-label="True or false key">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          className="x-chip"
          data-on={(draft.key?.kind === "true-false" && draft.key.value === v) || undefined}
          aria-pressed={draft.key?.kind === "true-false" && draft.key.value === v}
          onClick={() => setKey({ kind: "true-false", value: v })}
        >
          {v ? "True" : "False"}
        </button>
      ))}
    </div>
  );
}

/** The coding question's cases — the grading contract: visible cases run in-test
 *  inside the section's allowance, hidden cases reduce to a count. */
export function CasesPart({ draft, set, id }: PartProps) {
  return (
    <>
      {draft.cases.map((c: EditorCase, i: number) => (
        <div className="x-question-editor__case" key={c.id} data-hidden={!c.visible || undefined}>
          <div className="x-question-editor__case-head">
            <label className="x-question-editor__case-vis">
              <input type="checkbox" checked={c.visible}
                onChange={(e) => set({ cases: draft.cases.map((x) => (x.id === c.id ? { ...x, visible: e.target.checked } : x)) })} />
              visible case
            </label>
            <span className="x-question-editor__hint">
              {c.visible ? "runs in-test inside the section's allowance" : "hidden — reduces to a count for the learner"}
            </span>
            <button type="button" className="x-question-editor__remove" aria-label={`Remove case ${i + 1}`}
              onClick={() => set({ cases: draft.cases.filter((x) => x.id !== c.id) })}>
              <Icon name="x" size={13} />
            </button>
          </div>
          <div className="x-question-editor__case-grid">
            <input value={c.input} placeholder={`Case ${i + 1} prepared input`} aria-label={`Case ${i + 1} prepared input`}
              onChange={(e) => set({ cases: draft.cases.map((x) => (x.id === c.id ? { ...x, input: e.target.value } : x)) })} />
            <input value={c.expected} placeholder="Expected output" aria-label={`Case ${i + 1} expected output`}
              onChange={(e) => set({ cases: draft.cases.map((x) => (x.id === c.id ? { ...x, expected: e.target.value } : x)) })} />
            <select value={c.comparison} aria-label={`Case ${i + 1} comparison mode`}
              onChange={(e) => set({ cases: draft.cases.map((x) => (x.id === c.id ? { ...x, comparison: e.target.value as CaseComparison } : x)) })}>
              <option value="exact">exact</option>
              <option value="trimmed">trimmed</option>
            </select>
          </div>
        </div>
      ))}
      <button type="button" className="x-btn x-btn--secondary x-btn--sm"
        onClick={() => set({ cases: [...draft.cases, { id: `case-${id("n")}-${draft.cases.length + 1}`, visible: true, input: "", expected: "", comparison: "exact" }] })}>
        Add case
      </button>
    </>
  );
}
