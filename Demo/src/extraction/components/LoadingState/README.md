# LoadingState

The announced "working" indicator. **New** — the demo's only loading UI was the
bare `.spinner` (`code-editor.css:691`, used by the Monaco mount and the
Terminal), which said nothing and announced nothing.

## Anatomy

Keyline `loader` glyph in `orbit` motion + a visible sentence, inside
`role="status"`. "Working" is always a sentence, never a silent spin.

## Props

- `label` — the visible + announced sentence (required).
- `icon` — Keyline glyph override (default `loader`).
- `compact` — inline density for toolbars / status bars.
- `className` — escape hatch.

## Accessibility

- `role="status"` — polite announcement on mount.
- The icon is `aria-hidden`; the words carry the meaning.
- Reduced motion: `orbit` is already suppressed by `icon.css` under
  `prefers-reduced-motion` and `data-reduced-motion`, leaving a fully drawn
  circle — no extra fallback needed.

## Used on

- `/codelab` — Monaco mount (`pro-editor__loading`), terminal run state
- `/challenges/:id`, `/daily/solve` — "Running visible samples…", submission pending
- `/mock/:paperId` — "Restoring your sitting…"
- Anywhere `Skeleton` owns the shape — this owns the announcement.

## Notes

- Distinct from `StateBlock state="pending"`: that is a whole-region placeholder
  with a frame; this is the in-flow indicator for toolbars, editors and rows.
