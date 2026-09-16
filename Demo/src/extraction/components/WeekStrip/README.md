# WeekStrip

The 7-day completion strip — extracted from `Practice.tsx:787-799` (the inset
grid inside "Current Streak Status" on `/daily`).

## Statuses (`data-status` per dot)

| Status | Tell |
|---|---|
| `done` | filled success disc + check glyph |
| `today` | accent-ringed hollow dot — "you are here" |
| `open` | hollow dot — still to come |
| `missed` | hollow dot + x — the day passed without a solve |

The demo only had done/open; `today` and `missed` are the honest completes —
a missed day is stated, not zeroed.

## Props

- `days` — `{ label, status, accessibleLabel? }[]` (seven in the demo's week).
- `label` — region `aria-label` (default "This week's daily challenges").
- `className` — escape hatch.

## Accessibility

Ordered list; each item announces `"Mon: completed"` (or the
`accessibleLabel` override); glyphs are `aria-hidden`.

## Used on

- `/daily` — Current Streak Status card
- `/profile` — rhythm/activity recaps (any 7-day window)

## Notes

- Dot is `--space-5` (20px) — matches the demo's literal exactly.
