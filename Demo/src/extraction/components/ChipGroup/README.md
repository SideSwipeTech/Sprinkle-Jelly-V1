# ChipGroup

The labelled chip row the demo built ad hoc out of `.filters` + `.chip` buttons — a
micro prefix ("TRACK:", "STATUS:") plus a single-select run of toggles.

## Props (in words)

- `options` — `{id, label, icon?, disabled?}[]`.
- `value` / `onChange(id)` — controlled single selection (pass `null` for none).
- `label` — the group name: rendered as the micro prefix AND used as `aria-label` on
  the `role="group"`, so it is announced, not just shown. `hideLabel` drops the visible
  prefix while keeping the accessible name.
- `variant` / `size` — passthrough to the emitted `x-chip` classes (`quiet` rows like
  the tag filter).
- `className`.

## States

Each option: `data-on` + `aria-pressed` · hover · `data-disabled`. Row: wrap.

## Used on

- `/courses` — TRACK + level filter rows (Learn.tsx)
- `/challenges` — STATUS + difficulty rows (Practice.tsx)
- `/notifications` — category filter (Account.tsx)
- `/assessments/browse` — paper type filter
- `/skills` — period filter
- `/solutions` — type filter

## Notes

Emits the sibling `x-chip` classes rather than importing `Chip` (CONTRACT §6 —
siblings by class, not import). For content-switching rather than filtering, use
`ChipTabBar` (tablist semantics); for non-chip segmented pills, `SegmentedControl`.
