# CompletionFactPanel

The factual record panel on a completed (ungraded) sitting — a `dl` of facts,
an optional inset note, an optional action slot.

## Props

- `facts: { term: string; value: ReactNode | null }[]` — caller order is render
  order; `null` value renders an em dash.
- `note?: ReactNode` — closing inset note (was `.settings-note`).
- `children?: ReactNode` — action row under the facts.
- `label?: string` — aria-label (default "Sitting record").

## Composes (sibling classes, not imports)

- `x-key-value` / `x-key-value__row` / `x-key-value__term` / `x-key-value__value`
  — the containers family's KeyValueRow (merges `.account-facts`, DiagnosticRow
  and ProfileFactRow). This panel owns only the frame spacing.

## Used on

- `/company/:companyId/result` — CompanyResult "Sitting record"
- `/admin/credits` — the same dl anatomy hosts the AdminCredits live preview
