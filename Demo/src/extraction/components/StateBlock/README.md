# StateBlock

The honest not-data state — adopted from the kit (`src/components/Card.tsx:128-141`,
styles `card.css:53-146`) and renamed into the `x-` space. Seven closed states
because PRODUCT.md §10 forbids collapsing them: **unavailable is not empty,
pending is not failed, missing is never zero.**

## The seven keys (`data-state`, from `tokens/values.ts`)

| Key | Tone | Non-colour tell |
|---|---|---|
| `data` | neutral | solid neutral frame + check icon |
| `stale` | warning | **dashed** border + clock icon + `asOf` age line |
| `pending` | info | solid border + loader icon looping (`flow` motion) |
| `unavailable` | muted | **45° hatch** background + alert icon |
| `empty` | muted | dashed open-field border + inbox icon (`trace` motion) |
| `refused` | error | solid border + **-45° barrier hatch** + lock icon |
| `pruned` | muted | **dotted** border + history icon |

The unavailable and refused hatches run in *opposing* directions so the two
muted/error states stay distinct without colour.

## Props

- `state` — one of the seven `StateKey`s (required).
- `message` — the plain sentence (required). Every one must say something true.
- `action` — optional way onward (a `x-btn` link/button), required by SHR-R23
  where the learner is stopped and cannot self-resolve.
- `asOf` — for `stale`, the figure's age. A number with no age invites a
  decision it cannot support.
- `compact` — tighter padding for dense surfaces (rails, table cells).

## States

`data-state` on the root drives everything; the sink renders all seven plus
compact and with-action.

## Used on

- `/error-states` — the canonical failure gallery (More.tsx `ErrorStates`)
- `/` Dashboard regions, `/courses/:courseId/lessons/:lessonId` (unavailable lesson)
- `/challenges`, `/challenges/dashboard`, `/tracks/:id`, `/daily`, `/daily/solve` (voided → refused)
- `/debug/:caseId`, `/solutions/:id`, `/achievements`, `/skills` (insufficient evidence → empty)
- `/recap` (out-of-season → empty), `/help`, `/restricted`, `/honesty`
- `/settings` erasure review (pending), `/admin/*` access refusal
- Kitchen Sink `/element-lab` — "7 Canonical Honesty States" card

## Notes

- The kit original (`state-block`, unprefixed) remains the live demo version;
  this is the parallel reference. Consuming pages switch when the library is adopted.
- No live-region role is baked in — these are rendered regions, not announcements.
  When a block is injected asynchronously, place it inside a `role="status"` host.
