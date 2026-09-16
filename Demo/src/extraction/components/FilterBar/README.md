# FilterBar

The catalogue filter row — search + filter chips + result count. Kills the duplicated
`.filters` (app.css:60-64 vs courses.css:89-94, same name, two gaps) and folds in
`.filters__search` + `.filters__count` (courses.css:96-129).

## Props (in words)

- `children` — the filter controls: `ChipGroup`s, a `TagCloud`, a `Select`, or bare
  `x-chip` buttons.
- `search` — `{value, onChange, placeholder?, label?}`; renders the sibling
  `x-searchfield` markup (per CONTRACT §6 — no sibling import).
- `count` — result count text ("12 challenges"), pinned to the row's end. Rendered
  only when given — never an empty element.
- `label` — accessible name on `role="group"`.
- `className`.

## States

Wrap layout · search focus-within (accent border, via `x-searchfield`) · count pinned
right.

## Used on

- `/courses` — search + level chips + subject count (Learn.tsx:87-96)
- `/challenges` — search + difficulty chips + challenge count (Practice.tsx:151-160)
- `/assessments/browse` — search + type chips (Assess.tsx:105-119)
- `/company` browse — search + difficulty chips (Assess.tsx:665-673)
- `/notifications` — category chips (Account.tsx:37-57)
- `/challenges/history`, `/solutions`, `/skills` — chip-only rows
- `/admin/*` — list filters (AdminPages.tsx:254,328)

## Notes

The dead `.filters__select` (courses.css:118-127) is deliberately absent — dead code
stays dead. A select in the row today renders the sibling `x-select` classes.
