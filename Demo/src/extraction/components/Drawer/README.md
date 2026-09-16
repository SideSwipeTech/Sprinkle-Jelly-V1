# Drawer

The edge-anchored overlay panel. One implementation covers the learner shell's
`DrawerNav` (`Shell.tsx:434-455`) and the admin mobile nav
(`admin-shell.css:189-233` — `.admin-nav.is-open` + `.admin-nav-scrim`).

## Anatomy

`x-drawer` (fixed inset layer, `--z-modal`) → `x-drawer__scrim` (button, click = close)
+ `x-drawer__panel` (`role="dialog"`, `aria-modal="true"`, edge-anchored,
`--shell-drawer-width` / `--shell-drawer-max-width`). Optional `x-drawer__head`
(heading + `x-drawer__close`) and `x-drawer__body`.

## Props

- `open` — closed renders `null`.
- `onClose` — scrim click, Escape, and the close button all call it.
- `label` — accessible name for the dialog (e.g. `"Navigation"`).
- `side: "left" | "right"` — edge anchor (default `left`; nav drawers are left).
- `heading` — optional head content (the admin `__mobile-head` pattern).
- `hideClose` — suppress the built-in close button when the consumer renders its own.

## Behaviour

Focus moves into the panel on open (first focusable, else the panel) and returns to
the opener on close. Escape closes. The panel traps nothing — Tab order runs through
it in DOM order (it is modal visually, not a focus prison; the scrim is the only
outside target).

## States

`closed` · `open-left` · `open-heading` · `open-right`.

## Used on

- Learner shell below Standard — every nav model collapses to this (OR-O2, `SHR-R31`).
- `command`/`dock` nav models — the drawer is their menu at every band.
- `/admin/*` below Standard — the admin nav becomes this drawer with a heading.
