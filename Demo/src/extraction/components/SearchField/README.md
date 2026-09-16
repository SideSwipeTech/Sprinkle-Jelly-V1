# SearchField

The icon + `type="search"` input from `.filters__search` (courses.css:96-116), used
identically on the Learn, Practice and Assess browse surfaces.

## Props (in words)

- `value` / `defaultValue`, `onChange(value)` — controlled or uncontrolled text.
- `label` — accessible name; falls back to `placeholder`, so the demo's placeholders
  keep doing the naming job they were already doing.
- `placeholder` — search hint text (default "Search…").
- `grow` — flex-grow row behaviour inside a `FilterBar` (default on).
- `disabled`, plus standard input attributes (`name`, `id`, `autoComplete`, …)
  forwarded to the `<input>`.

## States

default · focus-within (accent border + lifted icon tone) · `data-disabled`.

## Used on

- `/courses` — subject/keyword search (Learn.tsx)
- `/challenges` — problem & tag search (Practice.tsx)
- `/assessments/browse` — paper/company/skill search (Assess.tsx)
- `/company` browse — target company search
- Kitchen Sink

## Notes

The icon lives inside the `<label>`, so it still focuses the field. The input is
`type="search"` — native clear affordance where the platform provides one.
