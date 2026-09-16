# Chip

The small pill. Two honest roles, one anatomy: an interactive **filter toggle**
(`<button>` with `aria-pressed` + `data-on`) or a **static tag** (`<span>`) for
metadata like "14 lessons" or "Console".

## Props (in words)

- `children` — the pill's text.
- `selected` — paints `data-on` (solid accent); on a button also drives `aria-pressed`.
- `variant` — `default` outlined pill; `quiet` recessive metadata pill; `accent`
  accent-tinted tag.
- `size` — `md` or `sm` (the `fontSize: 10–11px` overrides the demo sprinkled ~20 times).
- `icon` — a Keyline `IconName` drawn before the text.
- `onClick` — presence makes it a toggle button; absence keeps it a static tag.
- `disabled` — `disabled` + `data-disabled`; never `pointer-events:none`.
- `label` — accessible name override for icon-only or ambiguous chips.
- `className` — escape hatch, appended last.

## States

`data-on` selected · hover (buttons only) · `data-disabled` · quiet / accent / sm
modifiers. Verdict colouring (Accepted, Easy, TLE) is deliberately absent — that is the
states family's badge job.

## Used on

- `/courses` — track & level filters, course meta chips (Learn.tsx)
- `/challenges` — status & difficulty filters, tag cloud (Practice.tsx)
- `/challenges/:id` — tag row, difficulty tag, policy chip
- `/solutions`, `/solutions/:id` — type filter, language switch, verified tag
- `/daily`, `/daily/solve`, `/debug/:caseId` — meta and verdict tags
- `/assessments`, `/assessments/browse`, `/company/:id` — difficulty/duration/meta chips
- `/mock/:paperId` briefing — paper meta
- `/notifications` — category filters (Account.tsx)
- `/settings` — certificate visibility toggle
- `/` Dashboard — daily meta chips
- `/courses/video/:videoId` — chapter tag, CC toggle
- `/skills` — period filter, verdict chips (migrating to badges)
- Kitchen Sink `/element-lab` showcase

## Notes

Replaces both `.chip` definitions (`app.css` canonical, `home.css` duplicate — killed).
`chip--accent` and `chip--quiet` had markup call-sites but no backing styles; both are
real modifiers now.
