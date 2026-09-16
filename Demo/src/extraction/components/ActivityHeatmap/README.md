# ActivityHeatmap

The 365-day accepted-solutions grid with three grains (daily cells / 12-week bars /
monthly cards), a hover readout, and the ramp.

Source: `src/components/ActivityHeatmap.tsx` — used on `/` (Dashboard).

## Props

| prop | type | notes |
|---|---|---|
| `days` | `HeatmapDay[]` | `{ date: "YYYY-MM-DD", count }` — the caller's measured window; never invented |
| `state` | `"grid" \| "empty" \| "unavailable"` | the two absence states render StateBlock |
| `windowDays` | `number` | label only (default 365) |
| `weekCount` | `number` | weekly grain columns (default 12) |
| `weeklyDenominator` | `number` | count that draws a full-height bar (default 15) |

`intensityFor(count)` maps a count to ramp level 0–4 — exported for reuse.

## States

- `state` prop — `grid` / `empty` / `unavailable` (honest absence; no grid drawn).
- `data-level="0..4"` on cells — the ramp: `0` inset track, `1–3` accent-light at
  25/50/75% over transparent, `4` solid `--c-accent-primary`.
- `data-on` + `aria-pressed` on the grain chips (sibling `x-chip` — controls/ family).

## Decisions

- The ramp reads `--c-accent-light` → `--c-accent-primary` — the same accent trio
  ChargeRing's stops read (`useChargeStops` provides gradient *offsets*, which a
  discrete 5-step ramp does not consume; the token provenance is identical). The
  hardcoded `rgba(45,212,191,*)` was Halo's accent-light restated as a literal.
- `transition: "transform 0.1s ease"` → `var(--duration-fast) var(--ease-hover)` — the
  hover pop now runs at each identity's fast pace.
- Hover glow → `var(--charge-edge-glow) var(--c-accent-primary)`: halo 14px, voyage
  20px, forge 8px, meridian `0` — Meridian's cells honestly do not glow.
- `9px` weekday labels → `--text-2xs` (11px — the scale floor; a readability win).
- The cell matrix is `aria-hidden`; totals + the `aria-live` readout carry the same
  information. Cells are hover probes, not controls (364 tab stops would be hostile).
- Bar heights are data — expressed as the `--x-h` custom property per cell, the same
  mechanism kit Card uses for `--enter-index`.
- The demo's `generateYearActivity` (deterministic placement from `solved.length`) is
  caller-side demo machinery — not extracted; `days` is the honest interface.

## Component tokens

`--x-heatmap-cell` 10px · `--x-heatmap-gap` 3px · `--x-heatmap-readout-h` 22px ·
`--x-heatmap-weeks-h` 120px · `--x-heatmap-bar-max` 28px · `--x-heatmap-month-min` 80px.

## Used on

`/` (Dashboard — activity card).
