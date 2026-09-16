# ExamChrome

The sealed-sitting chrome — one anatomy, two data shapes. Extracted from
`Assess.tsx` `MockSitting` (435–566) and `CompanySitting` (890–1011), which were
~90% identical. The differences (posture label, timer length, whether `finish`
computes a score) are now props and hook inputs, not copies.

## Parts

| Export | What it is |
|---|---|
| `IntegrityBanner` | Posture strip — status dot + shield/alert icon + label + `n of m answered` (role=status). `tone="warning"` for a degraded posture. |
| `TimerStrip` | Clock bar — mono `mm:ss`, `data-urgent` under 300 s (error tone + alert icon + "(under five minutes)" text — never colour alone). `role="timer"` with `aria-live="off"` so the per-second tick is not announced. |
| `QuestionPalette` | The `.q-rail` index. Per item: `data-on` (current, `aria-current`), `data-done` (answered — tint + hard bottom edge tell), `data-marked` (dashed border + ★ marker). Full state names go in `aria-label`. |
| `QuestionCard` | `ITEM n OF m` micro + mark-for-review toggle (`aria-pressed`, star icon, label changes) + prompt + `radiogroup` of choices. |
| `AnswerChoice` | One lettered option — `role="radio"` + `aria-checked`, letter prefix, check tick as the selected tell. |
| `SittingNav` | Previous / Next / Submit. Real `disabled` on first item; submit replaces Next on the last. |
| `ExamChrome` | The assembled frame: banner + strip + palette + carded question + nav. |

## Hooks (`./hooks.ts`)

- `useCountdown(totalSeconds, onExpire?)` → `{ remain, mmss, urgent, expired }`. Floors at 0; `urgent` < `URGENT_THRESHOLD_SECONDS` (300).
- `useSitting(items, onFinish)` → cursor (`i`, `goTo/next/prev`, `isFirst/isLast`), `answers` (−1 = unanswered), `pick`, `marked`/`toggleMark`, `answeredCount`, `markedCount`, `finish()`.
- `finish()` hands `{ answers, marked, answeredCount, score }` to `onFinish`. `score` is `null` when no item carries an `answer` key — company sittings produce no grade, and the hook never invents one. `-1` means unanswered, never coerced to 0.
- `SittingItem`: `{ id, prompt, choices[], answer?, explanation? }`. Mock items carry `answer`/`explanation`; company items omit `answer`.

## States

`sitting-mock` (live hooks), `sitting-company` (live, ungraded), `palette-states`,
`timer-urgent`, `timer-expired`, `banner-warning`, `choice-selected`, `nav-last`,
`nav-first`, `sitting-unavailable`.

## Legacy violations fixed

- `#2dd4bf` dot → `var(--c-success)`; `#fbbf24` marks → `var(--c-warning)`; `#fb7185` urgent clock → `var(--c-error)`; `rgba(99,102,241,.12)` banner → `color-mix` on `--c-accent-primary`; `color:"white"` → `var(--c-on-accent-primary)`.
- Palette buttons were `chip` + inline paint; now `x-question-palette__item` with `data-on`/`data-done`/`data-marked` and `aria-current`.
- Choices were div-buttons; now `role="radio"`/`aria-checked` inside `radiogroup`.
- Mark toggle text `☆/★` swapped for `Icon name="star"` + `aria-pressed` + changing label.

## Composes (sibling classes, not imports)

`x-btn` / `x-btn--primary` / `x-btn--secondary` (controls/Button). `micro`,
`meta`, `numeral` are global utility classes. The question frame is `x-exam-chrome__card`
here; consolidation may swap it for kit `Card` (it is plain surface, not `live`).

## Used on

- `/mock/:paperId/sitting` — MockSitting
- `/company/:companyId/sitting` — CompanySitting
