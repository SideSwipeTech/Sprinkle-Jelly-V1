# Select

The one styled select. Three versions existed — the canonical workbench select
(`lab.css` `.workbench__select`), a divergent dark-stage inline one (Learn.tsx
video speed), and an unstyled native one (Practice.tsx language picker). This replaces
all three while staying a real `<select>`: native popup, native keyboard,
`color-scheme`-aware.

## Props (in words)

- `options` — `{value, label, disabled?}[]`, or pass `<option>` children instead.
- `value` / `defaultValue`, `onChange(value, event)` — controlled or uncontrolled.
- `size` — `sm` compact mono toolbar register (workbench canonical); `md` field
  height (`--space-8`), inset surface, drops into `Field`.
- `disabled`, `required`, `name`, `id`, `aria-label` — forwarded to the `<select>`;
  `Field`'s injected `id`/`aria-*` land there too.
- `className` — appended to the wrapper.

## States

default · hover · focus-visible · `data-disabled` · per-size register.

## Used on

- `/codelab` — runtime starter select (workbench toolbar)
- `/courses/video/:videoId` — playback speed (was the white-on-dark inline hack)
- `/challenges/:id` — language picker (was unstyled native)
- `/projects/new` — template field
- `/admin/*` — person/direction/gate selects inside `.field`
- Kitchen Sink — dropdown demo

## Notes

The chevron is a kit `Icon`, not a background-image data URI — it recolours with the
theme and needs no per-scheme asset.
