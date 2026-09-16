# StatusText

The tonal status label — kills the ~20 hand-coloured status chips and texts
scattered across the demo (`rgba(45,212,191,.15)` on `#2dd4bf` and friends).

## Tones (`data-tone`, each with a default glyph — SHR-R38)

| Tone | Glyph | For |
|---|---|---|
| `neutral` | square dot — the shape of "no signal" | Draft, inert states |
| `info` | `info` | Under review, pending checks |
| `success` | `check` | Accepted, Active, Completed, Enrolled, 100% Score |
| `warning` | `alert` | Runtime error, degraded, time warnings |
| `error` | `error` | Time limit exceeded, failed syncs |
| `accent` | `sparkles` | NEW, Benchmark met, featured claims |

`icon` overrides the glyph; `icon={null}` suppresses it (neutral loses its dot).

## Variants (`variant`)

- `chip` (default) — tinted pill, the ~15 literal chip sites.
- `inline` — bare text + icon, no frame (`.status-good`, diagnostic values).
- `solid` — filled pill, on-tone ink (DEGRADED / SEALED / NEW / Score) — uses
  the `--c-on-*` tokens so the fill stays readable in both schemes.

## Props

- `tone`, `variant`, `icon`, `children`, `className`.

## Used on

- `/settings` — `.status-good` "Active" (Account.tsx:221) → `inline success`
- `/mock/:paperId` briefing — exam flags "Active" (Assess.tsx:420-427) → `chip success`
- `/mock/:paperId` briefing diagnostics — "✓ Available (Active)" (Assess.tsx:403-414) → `inline success`
- `/challenges/:id` verdicts — ACCEPTED / TLE / RUNTIME / BENCHMARK (KitchenSink.tsx:289-292)
- `/notifications` — "NEW" (Account.tsx:79) → `solid accent`
- `/` — "+50 XP On-Time Bonus" (Practice.tsx:766) → `chip success icon="zap"`
- `/honesty` receipts — "Accepted", "100% Score" (More.tsx:55-71)
- `/courses` — "Enrolled" (Learn.tsx:113); `/courses/:id` — "Completed" (:248)
- `/quiz` score — `solid accent`
- `/requests` — "Under Review"/"Withdrawn" request status (Account.tsx:612) → `chip info`/`neutral`
- Notice `action` slot — the interceptor chips pair `x-status-text--solid`

## Notes

- Boundary with `Chip` (controls/): Chip is a filter toggle or neutral metadata
  tag; StatusText is a *status claim* — it owns the tone ramp. SolvedBadge is
  the one fixed-purpose member (always tick + "Solved").
