# WorkbenchLayout

The bare pane split the Practice pages hand-rolled as inline grids —
canonicalised into one layout with four arrangements.

**Boundary with the work/ family:** `Workbench` (work/) already owns the full
`.workbench` chrome — the framed `<section>`, toolbar, stdin strip, status bar
and its own main split (sidebar/plain). This component is the *arrangement*
only: no chrome, separate bordered panels in a grid, which is what Practice's
three surfaces actually are. A bench surface composes the two — `x-workbench`
outside, this grid where `WorkbenchMain`'s sidebar/plain cannot express the
multi-pane forms.

## Sources

| Practice.tsx | Surface | `layout` | Tracks (≥ standard band) |
|---|---|---|---|
| :379 | ChallengeSolve — statement \| solve | `statement` | 1fr / 1.35fr |
| :879 | DebugSolve — bug \| fix | `split` | 1fr / 1fr |
| :1077 | ProjectWorkspace — files \| editor \| output | `tri` | rail / 1.4fr / 1fr |
| — | canonical rail + pane standing alone | `sidebar` | rail / 1fr |

## Exports

| Export | What it is |
|---|---|
| `WorkbenchLayout` | `x-workbench-layout` — the grid; `label` is required (region landmark). |
| `WorkbenchLayoutPane` | `x-workbench-layout__pane` — a column slot (`min-width/height: 0`); `flush` removes the inner gap for a joined editor stack. |
| `WorkbenchLayoutPaneHead` | `x-workbench-layout__pane-head` — caption row (accent-tick eyebrow + title + right `meta`). As a dock's first child it becomes the dock's title bar (one compact line, header hairline, chrome tint) — position, not a second component. |
| `WorkbenchLayoutFill` | `x-workbench-layout__fill` — the flex region a suite panel fills (was `flex:1 + minHeight:280px` literals). |
| `WorkbenchLayoutDock` | `x-workbench-layout__dock` — fixed output dock at a pane's foot, `4 × --row-height` (density-aware; was `height:200px` / `flex:0 0 240px`). |

## States (states.ts)

`statement` · `split` · `tri` · `sidebar`.

## Token decisions

- 16px/12px gaps → `var(--stack-gap)` (density-aware page-grid gap).
- 220px workspace rail → `--shell-nav-rail-width` (224px); 200px canonical
  rail → `--shell-nav-dual-local-width` (190px) — matches work/Workbench's
  mapping.
- ~540-620px inline min-heights → `min(78dvh, --band-tablet-narrow-content-max)`,
  the same floor the canonical bench uses.
- Below the standard band every layout collapses to one column — the demo's
  grids never did (narrow viewports clipped).

## Dead code not carried

`lab-workspace`, `stack--md` and the unused `.lab` areas-grid (lab.css:3-29)
are explicitly dead per coverage — not extracted.

## Used on

- `/challenges/:challengeId` — ChallengeSolve
- `/debug/:caseId` — DebugSolve
- `/projects/:projectId`, `/workspace` — ProjectWorkspace
