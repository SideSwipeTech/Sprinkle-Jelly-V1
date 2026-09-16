# PracticeEditorSpace

The shared practice editing space — one studio surface every practice domain
mounts (challenges "Challenge studio", daily "Studio", debug "Case studio").
Domains slot their own material in through `children` (daily's scheduling
card), `domainFields` (extra metadata-grid fields — debug's timed
duration/allowance, daily's bonus) and `domainSections` (debug's debrief and
optional hint ladder, before the checklist).

## Files

- `PracticeEditorSpace.tsx` — the space: head, guard notices, metadata,
  statement, comparison & limits, editorial, checklist.
- `PracticeCodeSection.tsx` — the Code section: language strip (EditorTabs)
  over the starter / staff-only reference-solution side tabs +
  CodeEditorChrome.
- `PracticeCaseTable.tsx` — the Cases section: inline-edited DataTable +
  honest absence line.
- `PracticeSection.tsx` — the shared section frame.
- `types.ts` — the vocabulary: `PracticeDraft`, `PracticeLanguage`,
  `PracticeCase`, `PracticeChecklistItem`, `PRACTICE_DIFFICULTIES` (the
  platform's four authored values), `COMPARISON_POLICIES` (the three — there
  is no fourth), `emptyPracticeDraft()`. All re-exported from the root.

## Props

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | studio name — "Challenge studio" |
| `state` | `data \| pending \| unavailable` | honesty state of the space |
| `onRetry` | `() => void` | the unavailable state's retry |
| `lifecycle` | `draft \| published \| archived` | status chip in the head |
| `revision` | `number` | shown beside the lifecycle chip |
| `readOnly` | `boolean` | locked surface — controls inert, no Save |
| `dirty` | `boolean` | unsaved-work guard: dirty dot + Notice |
| `draft` | `PracticeDraft` | the whole editable record, controlled |
| `onDraftChange` | `(patch) => void` | every field patches through it |
| `xpAward` | `number \| null` | resolved from difficulty — read-only; `null` → — |
| `starterWord` / `referenceWord` | `string` | code-side labels ("Buggy program" / "Reference fix" for debug) |
| `checklist` | `PracticeChecklistItem[]` | the gate's result; `met: null` = not yet verifiable |
| `readinessLine` | `string` | overrides the derived "N of M gate conditions met" |
| `conflict` | `{message, onReload?, onKeepMine?}` | a concurrent-change clash, raised with a choice |
| `onSave` / `onPublish` | `() => void` | head actions — never disabled by the checklist |
| `children` | `ReactNode` | domain card under the head (SchedulingCard) |
| `domainFields` | `ReactNode` | extra metadata-grid fields |
| `domainSections` | `ReactNode` | extra sections before the checklist |

## States

`draft` · `published-read-only` · `validation-warning` · `unsaved-work-guard`
(Notice + Dialog confirm) · `loading` · `unavailable-retry` · `empty-draft`

## Spec truths carried

- **The checklist renders the gate's result and never disables Save or
  Publish** — both actions stay live on a failing checklist; unmet and
  not-yet-verifiable conditions are named individually.
- **Reference solution is administrator-only** — its side tab carries a
  `staff only` tag and the section head says so; it never reaches a learner.
- **Console default is fixed** — not an author's choice; the ordered /
  unordered select appears only on the SQL interface, per the spec.
- **Draft says so** — no languages, no cases, no gate run each get their own
  honest line rather than an empty box.
- The award is **resolved from difficulty, never authored** — rendered as a
  read-only fact (`—` when unknown).

## Depends on

Sibling extraction components imported directly (a §6 deviation the brief
sanctions — behaviour is shared, not just chrome): `Button`, `Field`,
`Select`, `Notice`, `StatusText`, `EditorTabs`, `CodeEditorChrome`,
`DataTable`, plus kit `StateBlock` and `Icon`.

## Used on

- `/admin/challenges/:id` — ChallengeEditor
- `/admin/daily/:date` — DailyEditor (+ SchedulingCard)
- `/admin/debug/:id` — DebugCaseEditor (+ duration/allowance, debrief, hint ladder)
