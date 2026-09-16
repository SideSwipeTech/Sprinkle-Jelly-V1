# AppFrame / ShellHeader

The learner application frame: `.x-app-frame` grid (`data-model` × `data-band`), skip
link, sticky `x-shell-header` (menu button, brand, `SearchTrigger` with kbd chip,
`HeaderPill`, actions slot), `main`, overlay/companion/notice slots.

Source: `src/nav/Shell.tsx:60-220`, `src/nav/shell.css:4-143,711-724`.

## Props

### `AppFrame`
| prop | type | notes |
|---|---|---|
| `model` | `NavModelKey \| "drawer"` | resolved presentation; omit to read appearance + band |
| `band` | `BandKey` | omit to track the live viewport (`useBand`) |
| `header` | `ReactNode` | render `<ShellHeader>` |
| `nav` | `ReactNode` | render `<NavModel>` — absent under drawer/command/dock |
| `breadcrumbs` | `ReactNode` | overlays family's `x-crumbs` |
| `children` | `ReactNode` | the surface |
| `overlays` | `ReactNode` | drawer / palette / sheets mount here |
| `companion` | `ReactNode` | the `x-companion` corner |
| `notices` | `ReactNode` | content for the `aria-live` notice slot (empty = hidden) |

### `ShellHeader`
| prop | type | notes |
|---|---|---|
| `menu` | `boolean` | show the menu button (drawer band, command, dock) |
| `menuOpen` / `onMenuOpen` | `boolean` / `() => void` | `aria-expanded` + open callback |
| `brand` | `{ to, icon, wordmark }` | defaults to Wizly Labs / flask / `/` |
| `search` | `{ label?, kbd?, onClick? } \| false` | `SearchTrigger`; `false` suppresses |
| `pill` | `ReactNode` | render `<HeaderPill icon>` |
| `actions` | `ReactNode` | `x-icon-btn` + `x-badge-dot` + `x-avatar` cluster |

`SearchTrigger`: `label`, `kbd`, `onClick`. `HeaderPill`: `icon?`, `children`.
Hooks exported: `useBand()`, `useNavModel()`, `isDrawerBand()`, `currentBand()`.

## States

- `data-model="rail|spine|command|dock|dual|drawer"` — grid changes, header/main never move.
- `data-band="compact|tabletNarrow|standard|wide"` — gutter + header compaction.
- Menu button: `aria-expanded`. Skip link: focus-revealed.

## Component tokens (declared on `.x-app-frame`)

`--x-hit-size` 34px · `--x-kbd-block` 1px · `--x-kbd-inline` 5px · `--x-pill-gap` 6px ·
`--x-search-min` 200px · `--x-search-max` 360px · `--x-header-bg-mix` 88%.
Candidates for promotion into the generated `--shell-*` family.

## Deviations / decisions

- Header `backdrop-filter` reads `var(--backdrop-blur)` (identity-owned) instead of the
  source's fixed `blur(12px)`; the meridian no-blur hook is kept as a
  `[data-theme="meridian"]` block (it also solidifies the background).
- The source's invented `820px` header breakpoint is not a band edge (SHR-R31 forbids
  new global breakpoints); the pill/gap compaction moved to the below-Standard edge
  `899px` (`--band-tablet-narrow-max`). Minor visual difference on 600–899px headers.
- `10px` pill padding → `--space-3` (12px); `6px` pill gap → `--x-pill-gap`.
- The source's `.shell__kbd` declared `margin-left: auto` then `margin: 0` — the second
  declaration swallowed the first, so the chip hugged the label. `x-kbd` keeps
  `margin-left: auto` (the intended right-aligned chip inside the trigger).
- `.shell__menu`'s border is kept; its mono/10px text metrics were dead for an icon
  button and are not carried.
- Sibling classes referenced, not styled: `x-icon-btn`, `x-badge-dot`, `x-avatar`
  (states/ family — IconButton, BadgeDot, Avatar; pending at time of writing),
  `x-crumbs` (overlays/ family Breadcrumbs).

## Used on

Every learner route (`/` … `/settings`, `/profile`, `/practice/*`, `/assess*`…) — the
shell wraps `Outlet` in `App.tsx`. Admin routes use `AdminFrame` instead.
