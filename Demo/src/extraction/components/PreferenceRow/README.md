# PreferenceRow

A settings row — title + hint left, control right. Two element shapes:

- `asLabel` → `<label>` — required when the control is a checkbox so the whole
  row toggles
- default → `<div>` — required when the control is a segmented group or buttons
  (a label containing buttons is broken semantics)

## Props

- `title: string`, `hint?: ReactNode`
- `control: ReactNode` — checkbox / segmented chips / field+buttons
- `note?: ReactNode` — status line under the hint (`role="status"`)

## Composes

`x-field`, `x-chip`, `x-btn` (controls) inside `control`. The
`x-segmented` class in the state is the controls family's segmented control.

## Used on

- `/settings` — motion cues, companion presence, any settings row
