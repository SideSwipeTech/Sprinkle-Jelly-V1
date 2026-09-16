# Slider

A styled `input[type=range]` — the demo's only ranges were unstyled natives with
`width:100%` inline (Weekly Goals, Learn.tsx:1384-1406). New component.

## Props (in words)

- `label` — visible + accessible name (real `<label htmlFor>`).
- `value` / `onChange(number)` — controlled; `min`, `max`, `step` pass through.
- `formatValue(value)` — the readout format ("5 / week"); raw number when omitted.
- `aside` — context at the right of the head row (the demo's "3 completed this week"
  quiet chip — compose it as `x-chip x-chip--quiet x-chip--sm`, sibling classes).
- `hint` — supporting line, wired through `aria-describedby`.
- `valueText` — `aria-valuetext` when the formatted number alone would mislead.
- `disabled`, `id`, `name`, `className`.

## States

default · hover/focus (thumb grows) · `data-disabled` (faint thumb, track loses its
accent progress) · reduced-motion (thumb transition off).

## Used on

- `/goals` — weekly problem target + active-time target (Learn.tsx `GoalsPage`)

## Notes

The fill is `--x-slider-pct`, a custom property set from the value — Charge's
data-var idiom, no pixel geometry in JS. WebKit track + Gecko `::-moz-range-progress`
carry the same accent fill; they can't share a selector so both are stated.
