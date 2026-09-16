# ProvenanceChip

Where the material came from — the trust claim. Replaces the literal
teal-vs-indigo chips at `Assess.tsx:679-688` / `:779-788` ("Actual 2026 OA
Pattern" vs "Curated Archetype") and the accent "Active IST Window" tag at
`Practice.tsx:759`.

## Kinds (`data-kind`, closed set)

| Kind | Meaning | Tell |
|---|---|---|
| `actual` | observed in a real sitting | `shield` icon + success tone |
| `curated` | authored archetype | `layers` icon + accent tone |
| `device` | derived on this device (local ledger) | `user` icon + neutral tint |

The difference between "actually observed" and "authored approximation" is a
trust claim — the glyph carries it, so it survives greyscale (SHR-R38).

## Props

- `kind` — `actual | curated | device`.
- `children` — the claim text ("Actual 2026 OA Pattern").
- `className` — escape hatch.

## States

`data-kind` on the root drives icon + tone. Static tag — provenance is a fact.

## Used on

- `/assessments/browse` — company track cards (Assess.tsx:679-688)
- `/company/:id` — assessment structure header (Assess.tsx:779-788)
- `/daily` — "Active IST Window" (Practice.tsx:759 → `kind="device"`)
- `/skills` — device-derived ledger claims

## Notes

- `device` is new: the demo's "this device" claims borrowed accent paint,
  which read as *verified* — local truth is neither verified nor authored, so
  it gets a neutral tint and the `user` mark.
