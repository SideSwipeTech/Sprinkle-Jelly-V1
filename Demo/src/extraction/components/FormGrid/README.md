# FormGrid (+ FormGridWide)

The two-column admin form layout; `FormGridWide` spans the full row for
textareas and long inputs.

## Props

- `FormGrid` — `children` (`x-field` labels)
- `FormGridWide` — `children` (one full-span cell)

## Composes

`x-field` (controls/Field). Below the standard band the grid collapses to one
column and wide cells un-span.

## Used on

- `/admin/credits` — credit correction form
- `/admin/maintenance` — window declaration form
