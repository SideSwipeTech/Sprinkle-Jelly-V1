# CertificateSeal

The public verification panel — emblem, credential title, recipient line, the
mono verification record, copy-URL action. Anything unverifiable is a
`StateBlock`, never a half-empty seal.

## Props

- `certificate: { id, title, awarded, hash, issuer, valid, visibility } | null`
  — verifiable = `valid && visibility === "public"`; everything else gets the
  honest `unavailable` state.
- `recipient: string` — display name awarded to
- `verifyUrl: string` — clipboard target for the copy action
- `actions?: ReactNode` — trailing links

## Notes

- "Link copied" is an icon swap + word change + `role="status"` line — never
  colour alone. The demo used `name="link"`, an icon that does not exist in the
  Keyline set; `copy`/`check` replaces it.
- The frame's shadow is `rgba(var(--c-shadow-rgb), .4)` — was `rgba(0,0,0,.4)`
  (breaks light schemes).

## Used on

- `/certificates/:certId/verify` — CertificateVerify
