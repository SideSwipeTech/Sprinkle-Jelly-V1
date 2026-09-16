# CardGrid

The auto-fit card field — `repeat(auto-fit, minmax(min(N, 100%), 1fr))`.
Canonicalises the same declaration written four times with four column floors:

- `.sink__grid` / `.assess__grid` (surfaces.css:29-35) — 280px
- `.courses__grid` (courses.css:133-138) — 320px
- `.home__grid` (home.css:26-38) — 300px

## Props

- `trackSize?: "sm" | "md" | "lg"` — the column floor: `sm` 280px (default),
  `md` 300px, `lg` 320px. Held as the component token `--x-card-min`.
- `as?: "div" | "section" | "aside"` + `label` — landmark + accessible name
  when a landmark element is chosen.
- Children may set `data-span="2"` — spans two tracks at the wide band
  (1280px), the `home__continue` / `home__activity` behaviour as a data hook.
  Scoped to the wide band because auto-fit cannot promise two tracks below it.

## States (states.ts)

`standard` · `roomy` · `span` · `single`.

## Needed tokens (reported, not invented)

- `--card-grid-min-*` — the three column floors are off-scale metrics; held as
  the component token `--x-card-min` (280/300/320) until a named family lands.

## Intentionally not ported

Per-identity arrangements scoped to the legacy classes in `identity/layout.css`
— Voyage's horizontal filmstrip, Meridian's ruled column, Halo's stagger,
Forge's four-up, Atlas/Atelier's three-up — are identity-level overrides of the
page classes, not of this component. If a Kitchen Sink theme inspection shows
`x-card-grid` flat under Voyage/Meridian, that is the point: the identity
arrangement only binds the legacy classes today. Promote deliberately if the
arrangements should apply to the extracted grid.

## Used on

- `/courses` — course cards (`lg`)
- `/certificates`, `/assess`, `/kitchen-sink` — card fields (`sm`)
- `/` Dashboard — the home grid (`md` + `data-span` tiles)
