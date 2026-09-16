# ToolCluster

The admin "declared tools" strip — a wrapped row of named operations plus the
line reporting what the last one touched.

## Props

- `children` — `x-btn` operation buttons/links
- `readout?: ReactNode` — `role="status"`; announces "Move recorded…" without
  moving focus
- `label?: string` — toolbar aria-label (default "Tools")

## Composes

`x-btn` / `x-btn--secondary` / `x-btn--quiet` (controls/Button). The container is
`role="toolbar"`.

## Used on

- `/admin/curriculum`, `/admin/challenges` — declared tools + readout
- `/admin/users/:id` — focused actions
- `/admin/certificates` — per-certificate action row
