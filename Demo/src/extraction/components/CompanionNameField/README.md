# CompanionNameField

The learner's own name for the companion (AST-R34) — a draft/validation field
inside the `x-preference-row` frame.

## Props

- `value: string` — the stored name; `""` means the default is in effect
- `defaultName?: string` — platform default (AST-DR-02: "WizBit")
- `onSave(name)`, `onReset()`
- `reserved?: RegExp` — extra reserved labels beyond the canned platform list
  (staff/admin/administrator/wizly/wizly labs/instructor/support)

## Behaviour

- Draft resets when `value` changes; control chars and `<>` are stripped at save;
  2–32 displayed characters required.
- Validation refusals and confirmations arrive via `role="status"` — the field
  never silently refuses.
- Save is gated until the draft differs; Reset is gated while the default is
  already in effect.

## Composes

`x-preference-row` (domain/PreferenceRow classes), `x-field`, `x-btn`
(controls).

## Used on

- `/settings` (companion tab) — "Name your companion" row
