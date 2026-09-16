# DataTable

The admin table: uppercase micro heads, block-level self-scroll, `data-on`
selected rows.

## Props

- `columns: ReactNode[]` — `<th scope="col">` labels
- `rows: { key, cells: ReactNode[], on? }[]` — one node per column; `on` paints
  the staged/selected row on `--c-surface-inset`
- `label: string` — rendered as `<caption>` (quiet but announced)
- `minWidth?: string` — overflow threshold, default `42.5rem` (was 680px)

## Cell helper classes

- `x-data-table__code` — mono accent key
- `x-data-table__sub` — small sub-line under a cell's main content
- `x-data-table__value` — the enforced/current figure (was a `#2dd4bf` strong;
  a recorded fact is plain strong type, not a verdict colour)

## The Economy staged-edit pattern (AdminPages.tsx:1188-1232)

Selection rides `data-on` on the row; staging rides a real `x-btn x-btn--quiet`
in the Action cell with `aria-pressed`. The original's `alert()` is dead — the
page confirms staging through the overlays family's `Dialog` (contract §7).

## Used on

- `/admin` — AdminHub work-health table
- `/admin/economy` — AdminEconomy configuration variables
