# GridTwo

The fixed-ratio two-column page split — and `GridThree`, its three-up sibling.
Canonicalises:

- `.grid-2` (app.css:35-42) → `ratio="lead"`, 1.2fr / 0.8fr
- `.split` (surfaces.css:37) → `ratio="balanced"`, 1.15fr / 0.85fr
- `.split--editor` (surfaces.css:46) → `ratio="editor"`, 0.42fr / 0.58fr + viewport floor
- `.grid-3` (app.css:44-51) → `GridThree`

All collapse to one column at the standard band edge (900px, restated as a
literal — custom properties cannot evaluate inside `@media`; the comment in the
CSS names the token it mirrors).

## Exports

| Export | What it is |
|---|---|
| `GridTwo` | `x-grid-two`, `data-ratio` picks the track weights. |
| `GridThree` | `x-grid-three`, the three-up form. |

## Props

- `ratio?: "lead" | "balanced" | "editor"` — `lead` (default) is the
  lead-column + aside split; `balanced` the near-even page split; `editor` the
  narrow statement + wide work pane, with a `52dvh` floor.

## States (states.ts)

`lead` · `balanced` · `editor` · `three`.

## Deviations / decisions

- `.split` and `.split--editor` were not in the coverage row for this family
  but are the same declaration with different weights and were unowned —
  folded in as ratios rather than left orphaned.
- `.split--editor` used an invented 1100px breakpoint → folded to the standard
  band (a component may never invent a global breakpoint).
- `min-height: 52vh` → `52dvh` — survives mobile chrome.

## Used on

- `/dashboard`, `/assess`, `/account`, `/more` — page-level two-column regions
- `/learn` — `.split` usage; `/more` — `.split--editor`
- `/kitchen-sink`, admin — `.grid-3` stat rows
