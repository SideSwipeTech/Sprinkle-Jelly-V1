# ActionPanel

The staged-action inset under an admin record — eyebrow naming the operation,
lead stating the exact consequence, fields, confirm/cancel row, announced
outcome.

## Props

- `eyebrow: string` — also the `role="group"` label
- `lead?: ReactNode` — consequence copy
- `children` — `x-field` + `x-btn` rows
- `outcome?: ReactNode` — success note with `role="status"` (was `.form-message`)

## Composes

`x-field` (controls/Field), `x-btn` (controls/Button), global `.row`/`.meta`.

## Used on

- `/admin/certificates` — correct / reissue / revoke panels
