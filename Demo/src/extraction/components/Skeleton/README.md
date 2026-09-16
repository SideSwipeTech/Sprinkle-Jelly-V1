# Skeleton

The shape-of-the-thing placeholder. **New to the platform** — the demo had no
skeletons at all; async regions either showed the bare `.spinner`
(`code-editor.css:691`) or popped content in unannounced.

## Variants

- `text` — a run of line-bones; the last line shortens like real copy
  (`lines` prop).
- `row` — disc + two stacked lines, `--row-height` tall: the `list-row` silhouette.
- `card` — a framed panel of bones (title / two lines / cta bar).
- `block` — one freeform bone; `width`/`height` in `--space-4` units.

Named conveniences exported alongside `Skeleton`: `SkeletonText`, `SkeletonRow`,
`SkeletonCard`, `SkeletonBlock`.

## Motion

The shimmer is a single sheen sweep on the outer container — composite variants
read as ONE loading object, not a scatter of blinking bars. Duration is
`calc(var(--duration-slow) * 4)`, so each identity's motion register scales it
(Meridian's near-instant register produces a barely-moving shimmer, which is the
honest read for a low-stimulus identity).

**Reduced motion:** the sheen is removed under both `prefers-reduced-motion`
and the platform's `data-reduced-motion="true"` signal. The bones stay as a
static matte — shape, not motion, is the loading tell.

## Accessibility

Every skeleton renders `aria-hidden` — it is decoration. Pair with
`LoadingState` (announced, `role="status"`) or `aria-busy` on the loading
region so loading is stated, not implied.

## Props

- `variant` — `text` | `row` | `card` | `block` (default `block`).
- `lines` — `text` only, number of line-bones (default 3).
- `height` — `block`/`card`, in `--space-4` units.
- `width` — `block`/`text`, in `--space-4` units; omitted = full width.
- `className` — escape hatch.

## Used on

- `/codelab` — Monaco mount + workbench regions loading
- `/challenges/:id`, `/daily/solve`, `/debug/:caseId` — run/verdict panels while executing
- `/` Dashboard regions and `/skills` ledger while derived figures resolve
- `/assessments*` — scorecard and question palette while a sitting restores
- Anywhere content loads asynchronously: the skeleton owns shape, `LoadingState`
  owns the announcement.

## Notes

- Replaces no demo class — it is the missing half of the loading contract
  (`LoadingState` is the other half).
- The `--card-padding` token is honoured where a theme defines one (Halo 24px).
