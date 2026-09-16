# VideoStage

The video-lesson chrome: idle/playing stage, chapter badge, transport controls, speed select,
captions toggle, scrubber — plus `TranscriptPane` and `ChapterList`, the two panes that travel
with it.

## Exports

- `VideoStage` — the stage + transport + scrubber. `playing` flips the stage between the play
  affordance and the live marker; `progress` is 0..1; `speed`/`speedOptions` drive the select;
  `captionsOn` toggles CC (`aria-pressed`).
- `TranscriptPane` — timestamped lines with optional speaker, `heading`/`actions` slots.
- `ChapterList` — chapter rows on `x-list-row` hooks; current via `aria-current`, covered via
  `data-done` + a check.

## States

`idle`, `playing`, plus the transcript and chapter-list panes — see `states.tsx`.

## Fixes vs the inline original (Learn.tsx:653-756)

- `#080B16` stage → `var(--editor-shell, var(--c-bg))` — themed deep surface, not a hex.
- Indigo/white/teal literals → `color-mix`/`--c-accent-primary`/`--c-text`/`--c-success`.
- Dead `pulse` animation (keyframes never existed) → the icon system's real `motion="pulse"`.
- `menu` misused as pause → drawn `x-video__pause` bars glyph (keyline ships no `pause`).
- Icon-only transport → labelled controls; `aria-pressed`/`aria-current`/`role="progressbar"`.

## Used on

- `/courses/:courseId/video/:videoId` (inventory: `/learn/lessons/:lesson/video`)
