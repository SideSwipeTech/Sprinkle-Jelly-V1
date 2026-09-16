# RestrictedNotice

The account-restriction block — `refused` StateBlock + policy inset + onward
actions.

## Props

- `message: string` — the standing message inside the refused StateBlock
- `policy: { title, text }` — the appeal/policy inset (was an inline div)
- `actions?: ReactNode` — the way onward (`x-btn` links)

## Composes

Kit `StateBlock` (`refused` — word + icon + pattern do the work).

## Used on

- `/restricted` — RestrictedPage
