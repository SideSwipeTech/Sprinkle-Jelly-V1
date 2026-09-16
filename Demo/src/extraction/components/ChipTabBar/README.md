# ChipTabBar

The chip row that switches **content**, not a filter — the course-hub section tabs and
the sink's top tabs. In the demo these were `.chip` buttons with `data-on` and no
tablist semantics; keyboard users got a row of unlabelled toggles.

## Props (in words)

- `tabs` — `{id, label, icon?, disabled?}[]`.
- `value` / `onChange(id)` — controlled active tab.
- `label` — accessible name for the `role="tablist"` (required).
- `ruled` — bottom border under the row (the course-hub variant's inline borderBottom).
- `className`.

## States

Per tab: `aria-selected` + `data-on` · hover · `data-disabled`. Navigation: roving
`tabIndex` (only the selected tab is in the order), ArrowLeft/Right, Home/End;
disabled tabs are skipped.

## Used on

- `/courses/:courseId` — the 5-section hub tabs (Curriculum / Video / Quiz / Project /
  Changelog) — Learn.tsx:213-233
- `/solutions` — archive view switcher
- `/element-lab` (Kitchen Sink) — the 6-tab showcase header
- `/challenges/history`, `/daily/archive` style list switchers

## Notes

Paints the sibling `x-chip` classes (CONTRACT §6). For filter semantics rather than
content switching, use `ChipGroup`; for the compact pill group, `SegmentedControl`.
