# QuestionEditor

The assessment studio's question-authoring form (assessments.F15): five question
kinds — single choice, multiple choice, numerical, true/false, coding — each
enforcing its own requirements, with a staff-only answer key matched to the kind
and an optional explanation.

## Props

- `draft: QuestionDraft` — the whole draft; controlled.
- `onChange(draft)` — every edit flows through it.
- `onSave(draft)` — called only with a clean draft; refused saves never reach it.
- `exists?: boolean` — the kind is fixed once the question exists: the kind
  picker becomes a locked chip.
- `skills?`, `topics?`, `languages?: readonly string[]` — the live vocabularies
  classification and the coding language select from.
- `saveLabel?: string`, `initialAttempted?: boolean`.
- `locked?: boolean` — the published read: every control disabled inside one
  fieldset, a frozen note naming the state, and no save control. A content
  write after publish is the page's refusal, not a control here.

## Behaviour

- Kind switch on a new draft resets the key to the kind's empty key.
- `validateQuestion(draft)` (`./validate.ts`, re-exported) returns every unmet
  requirement as its own line; a save attempt renders them inline under each
  field plus one summary — a mismatched key refuses as itself and blocks alone.
- Multiple choice keys are sets; the checkbox toggles membership, a repeated
  option counts once.
- Coding questions carry a language and cases instead of an option key: visible
  cases run in-test inside the section's allowance, hidden cases reduce to a
  count for the learner.

## Composes

`x-chip` (controls/Chip) for the kind picker and the true/false key, `x-btn`
(controls/Button) for add/remove/save — by class, per the contract.

## Files

- `QuestionEditor.tsx` — types, the field chrome, the save refusal.
- `kindParts.tsx` — the per-kind bodies (options, numerical key, true/false,
  cases); internal.
- `validate.ts` — the per-kind requirements as pure logic.

## Used on

- `/admin/mocks/:paperId/sections/:sectionId/questions/:questionId` — question authoring
