# BriefingRulesList

Icon + text rules rows for sitting briefings — rehomed from Dashboard's
`home__list`/`home__row` (coverage §3: borrowed classes get their own home).

## Props

- `rules: { icon: IconName; lead?: string; text: ReactNode }[]` — `lead` renders bolded before the text ("45 Minutes Allocation: …").
- `label?: string` — aria-label for the list (default "Sitting rules").

## States

`mock-rules` (lead + text), `company-rules` (plain text rows).

## Notes

- Icons are decorative markers — accent tint, `aria-hidden` via the Icon default.
- Rows keep `min-height: var(--row-height)` and divide on `--c-border`, matching the
  original `home__row` rhythm.

## Used on

- `/mock/:paperId` — MockBriefing (Sealed Sitting Rules)
- `/company/:companyId/briefing` — CompanyBriefing (Pre-Sitting Briefing)
