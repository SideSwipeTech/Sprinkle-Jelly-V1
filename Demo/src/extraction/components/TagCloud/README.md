# TagCloud

The dense wrapped tag selector on `/challenges` (Practice.tsx:162-175) — small quiet
chips, single-select. Every chip in the demo carried `style={{ fontSize: "11px" }}`;
`x-chip--sm` owns that now.

## Props (in words)

- `tags` — the tag strings.
- `selected` / `onSelect(tag)` — controlled single selection; omit `onSelect` for a
  static tag display (spans, not buttons).
- `label` — accessible group name on `role="group"`.
- `className`.

## States

Per tag: `data-on` + `aria-pressed` (selectable) · static `data-on` (display).

## Used on

- `/challenges` — the tag cloud under the filter bar (Practice.tsx:162-175)

## Notes

Composes sibling `x-chip x-chip--quiet x-chip--sm` classes — no `Chip` import
(CONTRACT §6).
