# RequestForm

The topic-request form — topic + description spanning the grid, area select and
a length-gated submit on the last row, feedback announced with `role="status"`.

## Props

- `areas: string[]` — the select's options
- `onSubmit: (draft: { title, description, area }) => void` — the page owns
  persistence; the form owns and clears its draft
- `minTitleLength?: number` — submit gates under it (default 3)
- `submitLabel?: string`
- `feedback?: string` — the status line (was `.form-message`)

## Composes

`x-field` (controls/Field), `x-btn x-btn--primary` (controls/Button). A real
`<form>` + `type="submit"` — Enter submits.

## Used on

- `/requests` — RequestsPage "Request a topic" card
