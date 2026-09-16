/**
 * validate — QuestionEditor's per-kind requirements as pure logic, kept beside
 * the component for the file bound. Every failure is its own actionable line:
 * the editor reports all of them and never stops at the first, and a key whose
 * kind does not match the question's is refused on its own.
 */

import {
  QUESTION_KIND_LABEL,
  type QuestionDraft,
  type QuestionError
} from "./QuestionEditor";

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export function validateQuestion(draft: QuestionDraft): QuestionError[] {
  const errors: QuestionError[] = [];
  const push = (field: string, message: string) => errors.push({ field, message });

  if (!draft.prompt.trim()) push("prompt", "The prompt is empty.");
  if (!(num(draft.marks) > 0)) push("marks", "Marks must be a positive number.");
  if (draft.negativeMarks.trim() !== "" && !(num(draft.negativeMarks) >= 0))
    push("negativeMarks", "Negative marks is one absolute value, 0 or more.");
  if (!draft.skill) push("skill", "Classify the question against a live skill.");
  if (!draft.topic) push("topic", "Classify the question against a topic.");
  if (draft.targetSeconds.trim() !== "") {
    const t = num(draft.targetSeconds);
    if (!(t >= 10 && t <= 3600))
      push("targetSeconds", "An authored target time is 10 seconds to 60 minutes.");
  }

  /* A saved key of another kind is the hard refusal: reported as itself and it
     blocks the save on its own — the kind's own key checks stay quiet under it. */
  const keyMismatched = draft.key !== null && draft.key.kind !== draft.kind;
  if (keyMismatched)
    push(
      "key",
      `The saved key is a ${QUESTION_KIND_LABEL[draft.key!.kind]} key on a ${QUESTION_KIND_LABEL[draft.kind]} question — a mismatched key cannot be saved.`
    );

  const optionErrors = () => {
    if (draft.options.length < 2)
      push("options", `${QUESTION_KIND_LABEL[draft.kind]} needs at least two options.`);
    draft.options.forEach((option, i) => {
      if (!option.text.trim()) push("options", `Option ${i + 1} has no text.`);
    });
  };

  if (draft.kind === "single-choice" || draft.kind === "multiple-choice") {
    optionErrors();
    if (!keyMismatched) {
      if (draft.kind === "single-choice") {
        const key = draft.key?.kind === "single-choice" ? draft.key : null;
        if (!key?.optionId || !draft.options.some((o) => o.id === key.optionId))
          push("key", "Mark exactly one option correct.");
      } else {
        const key = draft.key?.kind === "multiple-choice" ? draft.key : null;
        if (new Set(key?.optionIds ?? []).size === 0)
          push("key", "The correct set needs at least one option.");
      }
    }
  } else if (draft.kind === "numerical") {
    if (!keyMismatched) {
      const key = draft.key?.kind === "numerical" ? draft.key : null;
      if (!key || Number.isNaN(num(key.value))) push("key", "The numerical key needs a value.");
      else if (key.toleranceMode === "absolute" && !(num(key.tolerance) >= 0))
        push("key", "An absolute tolerance is 0 or more.");
      else if (key.toleranceMode === "relative") {
        const t = num(key.tolerance);
        if (!(t >= 0 && t <= 10)) push("key", "A relative tolerance is 0 to 10 percent.");
      }
    }
  } else if (draft.kind === "true-false") {
    if (!keyMismatched) {
      const key = draft.key?.kind === "true-false" ? draft.key : null;
      if (key?.value !== true && key?.value !== false)
        push("key", "Choose true or false for the key.");
    }
  } else {
    if (!draft.language) push("language", "Choose the language.");
    if (draft.cases.length === 0) push("cases", "A coding question needs at least one case.");
    draft.cases.forEach((c, i) => {
      if (!c.input.trim()) push("cases", `Case ${i + 1} needs its prepared input.`);
      if (!c.expected.trim()) push("cases", `Case ${i + 1} needs its expected output.`);
    });
  }
  return errors;
}
