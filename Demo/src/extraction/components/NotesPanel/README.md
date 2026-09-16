# NotesPanel

The quick-notes sheet — `Shell.tsx:458-499`, styles from `shell.css:726-763`.

## Anatomy

`x-notes` (fixed right sheet under `--shell-header-height`, `--z-modal`; full-width
below the Standard band) → `x-notes__head` (`x-notes__kicker` + `x-notes__title` +
`x-notes__close`), `x-notes__lead`, `x-notes__area` (textarea), `x-notes__foot`
(`x-notes__save[data-saving]` + `x-notes__count`).

## Props

- `value`, `onChange(value)` — controlled; the consumer persists.
- `open`, `onClose` — Escape closes; focus moves in on open, restores on close.
- `maxLength` (default 50000) — drives the `N / max` count.
- `kicker`, `title`, `lead`, `placeholder` — copy slots.
- `settleMs` — debounce before the indicator returns to "Saved" (default 350).
- `saveState` — optional external `"saved" | "saving"` override for async persistence.

## Behaviour

- No scrim — the reference usage keeps the page live while you write.
- Save-state is colour AND text (`Saving…`/`Saved`), never colour alone; the dot is
  `currentColor` so the tone follows `--c-success`/`--c-warning` tokens.
- `role="status"` on the indicator announces transitions politely.

## States

`closed` · `open-empty` · `open-draft` · `saving` · `near-cap`.

## Used on

- Learner shell header — sticky-note icon toggles it (`Shell.tsx:181-183, 458-499`).
