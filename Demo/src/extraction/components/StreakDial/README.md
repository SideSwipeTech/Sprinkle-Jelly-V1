# StreakDial

The streak figure — rebuilt as a **`ChargeRing` usage** (no new ring code).

The demo (`Practice.tsx:778-784`) drew a 56px amber-literal disc with `{n}d`
inside — a static circle that looked like a gauge but measured nothing.

## The `centre=` pattern

`ChargeRing` owns the arc, the hatch-on-unavailable, and `role="progressbar"`.
This component supplies:

- `centre={`${days}d`}` — replaces the default `"n%"` readout. **This is the
  pattern for any ring whose unit is not a percentage** (levels, streaks,
  counts). Documented here so future dials don't fork the ring.
- `value = days / goal` — the arc fills toward the weekly ritual window
  (`goal` default 7). A 23-day streak shows a full ring: an honest "goal met",
  not a painted disc.
- `days: null` → hatched track + em-dash centre, never `"0d"`.

The row beside the ring (title + window meta) is included because that pairing
is what the demo rendered.

## Props

- `days` — consecutive days on the ledger; `null` → unavailable.
- `goal` — the window the arc fills toward (default 7).
- `size` — ring diameter (default 56, the demo's disc).
- `title` — heading beside the ring (default `"{days}-Day Active Streak"`).
- `meta` — the meta line ("Window closes at 23:59:59 IST · …").
- `label` — progressbar accessible name.
- `className` — escape hatch.

## Used on

- `/daily` — Current Streak Status card
- `/profile` — streak stat context

## Notes

- Ring internals are kit `charge.css` — including Meridian's no-transition arc
  and Halo's breathing head, which the dial inherits for free.
