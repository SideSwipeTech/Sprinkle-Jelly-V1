# ConfirmByTyping

"Type the exact phrase to arm the destructive action" — the admin course lifecycle
gate (AdminPages.tsx:164-169).

## Props (in words)

- `phrase` — the exact string to echo (course title, resource name…). Rendered as a
  code chip (`user-select:none` — typed, not pasted-by-selection).
- `value` / `onChange(value)` — controlled echo input.
- `label` — overrides the default "Type {phrase} to confirm" lead-in.
- `children` — render prop `(matched) => ReactNode`; the action puts `disabled` on the
  gated control (same contract as `AcknowledgeGate`).
- `lax` — compare with trim + case-fold instead of exact match.
- `id`, `className`.

## States

`data-matched` (success border + check status) · dirty-mismatch (`aria-invalid` +
error border + status line) · empty. The status line is `role="status"` — "a bad echo
leaves the action unreachable" is announced, not just implied.

## Used on

- `/admin/*` — course lifecycle "Permanent delete…" gate (AdminPages.tsx:164-169);
  same pattern for any irreversible typed-confirmation

## Notes

The input is field-styled (mono — echoing a code-set phrase), `autoComplete=off` +
`spellCheck=false` so the browser doesn't "help" a confirmation.
