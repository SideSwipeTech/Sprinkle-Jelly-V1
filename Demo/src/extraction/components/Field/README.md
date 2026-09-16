# Field

The labelled form control: visible label, one control, optional hint, optional error.
Replaces `.field` (app.css:121-136).

## Props (in words)

- `label` — the control's name, rendered as a real `<label htmlFor>`.
- `children` — **exactly one** control element (`<input>`, `<textarea>`, `<select>` or a
  sibling `Select`). The component clones it with a generated `id`,
  `aria-describedby` (hint + error), `aria-invalid`, `required` and `disabled`.
- `hint` — supporting line under the control.
- `error` — validation message; sets `data-invalid` + `aria-invalid` and announces via
  `role="alert"`.
- `required` — `required` on the control + an `aria-hidden` asterisk on the label.
- `disabled` — dims the whole field; `disabled` is pushed onto the control itself.
- `controlId` — override the generated id.
- `className`.

## States

default · focus (interactive border) · `data-invalid` (error border + message) ·
`data-disabled` · `data-required`.

## Used on

- `/search` — the query field (Account.tsx `SearchPage`)
- `/requests` — topic + description fields (`request-form`)
- `/projects/new` — name + template fields (Practice.tsx)
- `/settings` — companion name field (`CompanionNameField`)
- `/admin/*` — ~20 sites: course/challenge editors, credit adjustments, audit filters,
  broadcast composer, maintenance windows, gates
- Kitchen Sink form section

## Notes

The legacy `.field` was a wrapping `<label>`; this version is `<div>` + explicit
`htmlFor`/`id`, which survives control wrappers (e.g. `Select`'s chevron span) that
implicit association can't reach through.
