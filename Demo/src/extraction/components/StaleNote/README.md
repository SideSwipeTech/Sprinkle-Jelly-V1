# StaleNote

The freshness banner — extracted from `.stale` (`src/pages/surfaces.css:113-119`;
live site `Learn.tsx:1356`, the device measurement ledger on `/skills`).

The inline cousin of `StateBlock state="stale"`: where that is a whole region,
this is a one-line provenance strip — *these figures have an age, and the age
is stated*.

## Tells

- **Dashed border** — the same freshness tell `StateBlock[stale]` uses.
- **Clock mark** — the tokenised `--state-stale-tell` (`tokens.css:151`).
- `data-state="stale"` on the root, consistent with the state model.

## Props

- `children` — the freshness statement ("derived from completed lessons…").
- `asOf` — the figures' age, rendered as " · as of …". A stale claim with no
  age is noise.
- `className` — escape hatch.

## States

Static — declared at render, not announced (no live region). When the age
changes, the caller re-renders the prop.

## Used on

- `/skills` — device measurement ledger header
- Any derived-figures region that must declare its age inline.

## Notes

- `data-state="stale"` is intentional and safe: the state-block selectors are
  scoped to `.x-state-block[data-state]`, so this never inherits those styles.
