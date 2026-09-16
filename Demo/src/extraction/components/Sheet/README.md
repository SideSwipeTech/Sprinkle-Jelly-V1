# Sheet

The edge panel that docks under the header — the `NotesPanel` anatomy
(`Shell.tsx:458-499`, `shell.css:726-760`) generalised.

## Anatomy

`x-sheet` (fixed layer under `--shell-header-height`, `--z-modal`,
`pointer-events:none` so the page stays live) → optional `x-sheet__scrim` +
`x-sheet__panel` (`role="dialog"`, `aria-modal="true"`, `x-sheet__head` with
`x-sheet__heading` + `x-sheet__close`).

## Props

- `open` — closed renders `null`.
- `onClose` — Escape + close button (and scrim, when enabled).
- `label` — accessible name.
- `side: "right" | "left"` — anchored edge (default `right`).
- `scrim` — render the dimming scrim. Default **off**: the reference usage (quick
  notes) is a working panel you type in while the page stays visible.
- `heading` — head row content (kicker + title block).

## Behaviour

- Full-width on compact dock contexts (`@container max-width: 599px` — the
  source notes-panel rule measured on the sheet's own box: the viewport in the
  app, the state cell in the sink — so a narrow cell shows the compact form and
  a wide cell shows the docked panel).
- Focus moves in on open, restores on close; Escape closes.
- Scrim, accent radial wash, shadow, radii — all tokens.

## States

`closed` · `open-right` (no scrim) · `open-scrim` · `open-left`.

## Used on

- Learner shell header — Quick Notes panel (`Shell.tsx:458-499`; the concrete
  `NotesPanel` component composes this anatomy).
- Any edge-docked inspector / details panel.
