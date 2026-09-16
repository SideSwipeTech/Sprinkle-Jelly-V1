# LessonBlockEditor

The course studio's block editor and live preview — courses/01-pages.md "The
lesson editor and its preview" (courses.F08, F31, F34).

The six authored block types, a closed set: **heading, rich text, callout,
image, display-only code, runnable code.** Quizzes, videos, integration
references and course-assigned projects are lesson types, never a seventh
block.

## Props (in words)

- `blocks` / `onChange(blocks)` — the controlled block list; reorder (up/down),
  remove and add are emitted through `onChange`.
- `dirty` — the unsaved-work marker (dot + "Unsaved work" on the save line).
- `saveState` — `saved` · `saving` · `retry` ("Not saved — tap to retry") ·
  `saved-locally` ("Saved locally — not yet on the server", never renders as
  saved) · `conflict`.
- `onSave` — shows the Save button; in `retry` it is the retry.
- `conflict` — `{ savedBy, savedAt, theirBlocks }`; renders the named refusal
  with a side-by-side comparison (saved revision vs your draft). Resolutions:
  `onConflictResolve("reload" | "keep")` — never an overwrite.
- `leaveGuard` — `{ open, onStay, onLeave }`; the page owns navigation, the
  editor renders the Dialog.
- `children` — slot under the block list for a lesson's non-block fields.

## States

`data-state` on the save line carries the save reading. Blocks are plain
sections; tools carry real `disabled` and `aria-label`s. The preview is the
learner's read-only rendering: runnable blocks show "Preview only" with no
run affordance; an unsupported language reads "coming soon"; a missing or
failing image reads "Image unavailable".

## Used on

- `/admin/curriculum/lessons/:id` — the lesson editor
- (preview contract mirrors the lesson reader's `courses` editor variant)

## Notes

- Every code-typing region renders `CodeEditorChrome` — the `courses`
  variant, compact and inline in the reader's measure.
- Sibling imports (`Button`, `Field`, `Select`, `CodeEditorChrome`, `Dialog`)
  are composed directly — a deliberate §6 deviation, the same licence
  `PracticeEditorSpace` carries: behaviour, not just chrome, is shared.
- `blocks.tsx` holds the six per-type field editors and preview renderers —
  split for the file bound.
