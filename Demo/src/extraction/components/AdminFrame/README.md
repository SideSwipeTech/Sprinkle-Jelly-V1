# AdminFrame / AdminNav / AdminPage

The staff console shell — a `236px × 64px` grid (brand corner · nav · top bar · main),
the ungrouped operations-hub row above the spec's closed seven groups, the stacked
crumb riding `x-crumbs` (the sibling Breadcrumbs' `current` variant), the compact
operational-health chip, the user chip, and the mobile drawer at the
below-Standard edge. `AdminPage` is the admin page head.

Source: `src/admin/AdminShell.tsx`, `src/admin/admin-shell.css`, `src/admin/admin-nav.ts`.

## Props

### `AdminFrame`
| prop | type | notes |
|---|---|---|
| `access` | `"granted" \| "refused"` | the staff gate; `refused` renders the refusal surface |
| `refusalMessage` / `refusalAction` | `string` / `ReactNode` | StateBlock `refused` + way onward (SHR-R23) |
| `sections` | `AdminNavSection[]` | `{ title, items: { label, to, icon }[] }` — the spec's closed seven groups in order (Assessments, Content, People, Governance, Credentials, Operations, Assistant); caller supplies ADMIN_NAV |
| `home` | `AdminNavHome` | `{ label, to, icon }` — the operations hub at `/admin`, rendered above the groups under no legend |
| `crumb` | `{ group, title }` | from `adminBreadcrumb(pathname)`; the hub reads `Administration` — under no group |
| `health` | `{ verdict: "healthy" \| "degraded" \| "unknown", note? }` | the compact operational-health indication; absent ⇒ the chip renders `unknown` — an unread signal is never painted healthy |
| `user` | `{ name }` | user chip; initial rendered via sibling `x-avatar x-avatar--sm` |
| `brandTitle` / `brandCaption` / `backTo` | `string` / `string` / `{to,label}` | brand corner |

Drawer state is internal (`Escape` is the learner drawer's job; here route change and
the scrim/close buttons close it).

### `AdminPage`
`kicker`, `title`, `lead`, `actions`, `children` — kit Page's props minus `kind`.
**Separate on purpose**: kit `Page` hardcodes `enter` + `data-reveal` (the entrance
animation admin deliberately lacks) and a closed `kind` union. Fold path: a
`reveal?: boolean` prop on kit Page, then `AdminPage = Page kind="sink" reveal={false}`.
Until then this is the reference.

## States

- `access` — granted shell / refused surface (StateBlock `refused`).
- `data-open` on `.x-admin-nav` — the mobile drawer (≤899px, the `--band-tablet-narrow-max` edge).
- `data-active` + `aria-current="page"` on items; nav root carries `data-active-style="tint"`
  (accent tint alone — the inset accent edge bar was removed per the no-accent-edge-stripes ruling).
- `data-verdict` on `.x-admin-health` — `healthy` / `degraded` / `unknown`; `unknown` reads dashed.
- `data-state="unavailable"` on `.x-admin-attention__cell` — a condition panel that cannot
  load renders unavailable and is not a link, while the rest of the strip still serves.

## `--admin-*` proposal (was: zero tokens, all literals)

| proposed token | value | literal site |
|---|---|---|
| `--admin-nav-width` | 236px | `.admin-shell` columns |
| `--admin-top-height` | 64px | rows, sticky top, drawer offset |
| `--admin-page-max` | 1220px | `.admin-page` |
| `--admin-health-cell-min` | 175px | `.admin-health` minmax — domain/ family's HealthTileGrid |
| `--admin-health-cell-height` | 116px | `.admin-health__cell` min-height — domain/ family |
| `--admin-table-min` | 680px | `.admin-table` min-width — domain/ family's DataTable |

This component declares the ones it owns as `--x-admin-*` component tokens
(`--x-admin-nav-width`, `--x-admin-top-height`, `--x-admin-page-max`,
`--x-admin-nav-drawer-width` 320px, `--x-admin-refusal-max` 440px, plus the sub-scale
metrics: `--x-admin-hit-size` 38px, `--x-admin-brand-gap` 2px, `--x-admin-nav-item-*`
35/7/10/10px, `--x-admin-user-gap` 8px, `--x-admin-scrim-blur` 2px,
`--x-admin-title-size` clamp(2rem,4vw,3rem)).
The health/table figures are restated here for the proposal only — the domain agent
wires them.

## Deviations / decisions

- Crumb folded onto the sibling `Breadcrumbs` component's own anatomy — this frame
  emits `x-crumbs x-crumbs--current` + `x-crumbs__context`/`x-crumbs__here` (the
  classes `variant="current"` produces), adding only `x-admin-frame__crumb` for topbar
  truncation. Class reference, not import — consolidation may promote it.
- Top bar blur reads `var(--backdrop-blur)`; the meridian flat rule is kept (and now
  also solidifies the top bar, matching its header treatment in AppFrame — the source
  left `blur(14px)` running under meridian, an inconsistency this fixes).
- The source's `520px` tweak block (non-band breakpoint, SHR-R31 forbids new global
  breakpoints) folded into the compact edge `599px` (`--band-compact-max`).
- `.admin-user`'s `font-size: 0` name-hiding replaced with a visually-hidden
  `.x-admin-frame__user-name` — the name stays available to screen readers.
- The active item's inset accent edge bar (`box-shadow: inset 2px 0 0 accent`,
  `--x-admin-nav-bar`) removed — accent edge stripes are ruled out; active reads as
  tint alone. `data-active-style` is now `tint`.
- `.x-admin-attention` mirrors the hub's admin-local `.admin-attention` strip (four
  named conditions, each a linked panel) so the sink can render it inside the frame;
  a domain component may promote it later.
- Dead/not extracted: `.admin-top .header-pop` (dead in source), health/table/tools/
  filterbar/form-grid/maintenance styles (domain/ family's components).

## Used on

`/admin/*` — every staff route (`AdminLayout` gate → `AdminShell` → `AdminPage` per
screen in `AdminPages.tsx`).
