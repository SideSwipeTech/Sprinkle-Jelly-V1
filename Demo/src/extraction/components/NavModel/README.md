# NavModel

One interface — `<NavModel sections={SIDEBAR} model={…}>` — behind the five learner
navigation presentations, plus `DrawerNav`, the below-Standard collapse every model
shares (a behaviour, never a preference — SHR-R31; OR-O2).

Source: `src/nav/Shell.tsx:222-455`, `src/nav/shell.css:145-505,711-720`.

## Props

### `NavModel`
| prop | type | notes |
|---|---|---|
| `model` | `NavModelKey` | `rail` (default) · `spine` · `command` · `dock` · `dual` |
| `sections` | `NavSection[]` | from `../../nav/nav-data` (allowed import for this component) |
| `lab` | `{ icon, title, caption }` | rail header block ("Ari's Lab · Workspace"); omit for bare rail |
| `stripItems` | `{ icon, label }[]` | command strip figures — the caller's store, never invented |
| `stripHint` | `ReactNode` | the trailing "Ctrl K" hint |
| `ariaLabel` | `string` | nav landmark label (default "Learner navigation") |

`RailNav`, `SpineNav`, `CommandStrip`, `DockNav`, `DualNav`, `DrawerNav` are also
exported individually for direct composition.

### `DrawerNav`
`sections`, `onClose`, `label`. Renders only while open; the frame owns `open` state.
Focus: first link on mount, opener restored on unmount, `Escape` closes, `Tab` wraps.

## The `.is-active` idioms — named, not merged

The source had five different active styles. Extraction carries them all under one
state carrier — `data-active` on the item + `aria-current="page"` — and names each
idiom on the nav root via `data-active-style`:

| `data-active-style` | used by | paint |
|---|---|---|
| `tint-seam` | rail items, drawer items | accent 14% tint + `x-nav-rail__seam` charge-gradient bar grows to 62% |
| `accent-text` | spine links, dock links, dual local links | `--c-accent-primary` + semibold |
| `solid` | dual dots, dock group `data-open` | solid `--c-accent-primary` fill, `--c-on-accent-primary` glyph |

`data-open` (spine/dock group buttons) is a separate axis — which section is expanded —
and also paints solid on the dock. `admin-nav`'s fourth idiom (tint + inset bar) lives
in AdminFrame as `data-active-style="tint-bar"`.

## `--shell-nav-*` wiring (was: every value a literal in shell.css)

| token | used for | was |
|---|---|---|
| `--shell-nav-rail-width` 224px | `.x-nav-rail` width | `224px` + dead `--shell-rail-expanded` 260px |
| `--shell-nav-rail-item-min-height` 36px | item min-height | `36px` |
| `--shell-nav-spine-width` 72px | spine rail | `var(--shell-rail-compact)` alias |
| `--shell-nav-spine-flyout-width` 220px | flyout | `220px` |
| `--shell-nav-spine-group-size` 44px | group button | `44px` |
| `--shell-nav-command-strip-padding-*` | strip padding | `var(--space-2) var(--space-4)` |
| `--shell-nav-dock-offset` 20px | dock bottom offset | `var(--space-5)` (coincidence) |
| `--shell-nav-dock-clearance` 56px | main scroll clearance | `+ 56px` |
| `--shell-nav-dock-popover-min-width` 220px | popover | `220px` |
| `--shell-nav-dual-spine-width` 56px | dual spine | `56px` |
| `--shell-nav-dual-local-width` 190px | dual local rail | `190px` |
| `--shell-drawer-width` / `--shell-drawer-max-width` | drawer panel | (already tokens) |

`--shell-nav-command-palette-*` belongs to the overlays family's CommandPalette.

## Component tokens (no package token exists)

`--x-nav-icon-size` 20px · `--x-nav-group-gap` 14px · `--x-nav-item-block`/`--inline`
7px/10px · `--x-nav-item-gap` 10px · `--x-nav-seam` 3px · `--x-nav-row-gap` 2px ·
`--x-nav-lab-*` 10px/12px · `--x-spine-tip-*` · `--x-strip-sep-h` 14px ·
`--x-dual-dot` 32px · `--x-drawer-close` 34px.

## Deviations / decisions

- `SpineNav`'s flyout leave timer was `180ms` — literally Halo's `--duration-fast`. It
  now reads the live token (`readDurationMs`), so each motion register sets its own
  hover-intent pace (forge 120ms, meridian 90ms).
- Active state rides `data-active` + `aria-current` instead of NavLink's `is-active`
  class — one carrier across all five models, accessible by default.
- Dock pill + drawer scrim blur read `--backdrop-blur` / `--x-scrim-blur`; the meridian
  no-blur/no-shadow block is kept as a `[data-theme="meridian"]` construction rule.
- Shadows use `rgba(var(--c-shadow-rgb), …)` per the contract map.
- Dead code not extracted: `.model-picker`, `.shell__band-readout`, `.shell__close`,
  `.drawer__panel .rail`, `.is-soon`/`.soon-pill`, `.header-pop` (overlays family's),
  palette + notes-panel (overlays family).

## Used on

Every learner route — the model rendered is the learner's Settings › Appearance choice
(`data-nav`). The drawer is the universal below-Standard form and command/dock's menu.
