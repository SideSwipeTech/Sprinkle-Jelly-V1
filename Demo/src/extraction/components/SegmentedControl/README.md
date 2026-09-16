# SegmentedControl

The inset pill group — `.segmented-control` (app.css:220-222). For choosing one of a
few mutually exclusive values in place, not for navigating sections (that's
`ChipTabBar`) and not for filtering lists (that's `ChipGroup`).

## Props (in words)

- `options` — `{id, label, icon?, disabled?}[]`.
- `value` / `onChange(id)` — controlled selection.
- `label` — accessible group name on `role="group"` (required; the demo set it right).
- `className`.

## States

Per option: `aria-pressed` + `data-on` (accent solid) · hover · `data-disabled`.
Track: inset surface, wraps on narrow.

## Used on

- `/settings` — companion presentation ("The companion" / "Plain messages") and
  companion volume ("Present" / "Quiet") — Account.tsx:234-259

## Notes

Selected cell is solid accent with `--c-on-accent-primary` text — never hardcoded
white (it is black in several dark palettes).
