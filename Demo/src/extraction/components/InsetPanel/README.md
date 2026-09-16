# InsetPanel

The recessed surface inside a card — `--c-surface-inset` fill, `--radius-sm`,
small text. Canonicalises the hand-rolled inset block that recurred across the
pages:

- `Learn.tsx:199-208` — the accredited-verification fact box
- `Practice.tsx:399` — the constraints inset (bordered)
- `Practice.tsx:509` — the custom-input drawer (bordered)
- the same `padding + radius-sm + inset` literal at `Assess.tsx` and `More.tsx`

A panel carries layout only — rows inside it are sibling `x-key-value__row`
(containers/KeyValueRow) or free content.

## Props

- `bordered?: boolean` — draws the hairline (`data-bordered`); the drawer
  variant the demo reached for.
- `as?: "div" | "section" | "aside"` — element; `section`/`aside` take
  `label` as the landmark's accessible name.
- `children` — free content; typically `x-key-value__row` rows.

## States (states.ts)

`facts` · `bordered` · `free`.

## Legacy violations fixed

- `padding: "10px 12px"` → `--space-3` (10px is off-scale; the scale step is
  the honest snap — documented here).
- `fontSize: "12px"` → `--text-xs`; `borderRadius: "6px"` → `--radius-sm`.

## Used on

- `/learn` — verification fact box, constraints inset
- `/challenges/:id` — custom-input drawer (bordered variant)
- wherever a card needs a recessed region
