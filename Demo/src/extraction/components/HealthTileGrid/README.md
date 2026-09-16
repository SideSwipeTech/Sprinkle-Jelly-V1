# HealthTileGrid (+ HealthTile)

The dependency-health cell grid — `data-verdict` cells that host either a
name+reading or the kit `Stat`.

## Props

`HealthTileGrid` — `children`, `label?: string` (aria-label on a `role="list"`).

`HealthTile`
- `name: string`
- `reading?: ReactNode` — e.g. "degraded · batch healthy"
- `verdict?: "healthy" | "degraded" | "unknown"` — closed set. Unknown renders
  dashed, never painted safe; each verdict also gets an icon (check/alert/help).
- `children?: ReactNode` — a kit `Stat` slots here for metric cells.

## Used on

- `/admin` — AdminHub "Dependency health"
- `/admin/analytics` — the Stat-hosting cells
