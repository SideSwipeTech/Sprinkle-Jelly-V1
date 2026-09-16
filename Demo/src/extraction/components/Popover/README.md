# Popover

The anchored panel primitive — generalises `.header-menu` + `.header-pop`
(`shell.css:641-647`) and kills the ~15 inline literals in the demo's notification
popover (`Shell.tsx:135-179`).

## Anatomy

`x-pop` (relative anchor) → render-prop `trigger` + `x-pop__panel` (absolute,
`--z-popover`, `role="dialog"`). Panel chrome slots: `x-pop__head`, `x-pop__title`,
`x-pop__list`, `x-pop__foot`.

## Props

- `trigger(args)` — render prop; receives `open`, `toggle`, `triggerProps`
  (`aria-expanded`, `aria-controls`, `aria-haspopup`), `triggerRef`. Spread
  `triggerProps` onto the trigger element and attach `triggerRef`.
- `align: "start" | "end"` — which trigger edge the panel aligns to (default `end`).
- `label` — accessible name for the panel region.
- `focusOnOpen` — move focus to the panel's first focusable on open (default off:
  focus stays on the trigger, Tab reaches the panel in DOM order).
- `defaultOpen` — start open (state matrix / stories).

## Behaviour

- Pointer-down outside the root closes; `Escape` anywhere inside closes and returns
  focus to the trigger.
- Not modal — no focus trap. For item lists with roving focus use `Menu`; for
  modality use `Dialog`.

## States

`closed` (trigger only) · `open` (content panel, focus inside).

## Used on

- `Shell.tsx:135-179` — notification popover in the learner header.
- Admin topbar popovers (`.admin-top .header-pop`, `admin-shell.css:96-106`).
