# SolvedBadge

The "✓ Solved" marker — replaces the literal `rgba(45,212,191,.15)`/`#2dd4bf`
chips at `Practice.tsx:213` and `:276` and gives the solved state a real home.
(`Practice.tsx:184`'s solved-row `borderLeft: 3px solid #2dd4bf` becomes this
badge inside the row instead of a coloured edge.)

## Tell

The `check-mark` glyph — a bare tick, not a circle-check, so it reads at 12px
inside a dense row — plus the word itself. `data-done` on the root is the
contract's complete/answered attribute (CONTRACT §3). Success tone reinforces;
it never carries it alone.

## Props

- `children` — default `"Solved"`; callers may render "Accepted on this device".
- `className` — escape hatch.

## States

`data-done` always present — the badge only exists in the done state. Static
tag; solved is a fact, never a toggle.

## Used on

- `/challenges` — catalogue rows (Practice.tsx:213)
- `/tracks/:id` — curriculum sequence rows (Practice.tsx:276)
- `/challenges/:id` — accepted-on-device marker (the Practice.tsx:439-448 panel
  becomes `Notice tone="success"` + this badge)
- `/daily` — today's pick when solved
- `/challenges/history`, `/solutions` — attempt outcomes

## Notes

- Deliberately narrower than `StatusText`: SolvedBadge is THE solved marker,
  always the same tick and tone, so a learner learns the shape once.
