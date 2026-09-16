# ScorecardHero

The verdict block heading a mock scorecard — verdict label + hero percentage +
raw-fraction dial + facts line. On a company record the same anatomy renders
`ungraded` and never produces a percentage.

## Props

- `verdict: "met" | "below" | "ungraded"` — drives `data-verdict`, the icon
  (check-mark / alert / shield) and the canned label.
- `verdictLabel?: string` — override the label.
- `pct: number | null` — null renders an em dash, never zero (honest-absence rule).
- `score?: number | null`, `total: number`, `when?: string` — the meta line;
  a null score reads "n items recorded" rather than "0 of n".
- `actions?: ReactNode` — optional CTA row below the hero.

## States

`met`, `below`, `ungraded`.

## Legacy violations fixed

- `#2dd4bf`/`#fbbf24` verdict paint → `data-verdict` tokens (`--c-success`/`--c-warning`).
- Bare-colour verdict → icon + label + attribute (SHR-R38 non-colour tell).
- `rgba(45,212,191,.15)`/`rgba(251,191,36,.15)` dial → `color-mix` on state tokens.

## Used on

- `/mock/:paperId/result` — MockResult (scorecard head)
- `/company/:companyId/result` — CompanyResult may reuse with `ungraded` if it
  ever shows the hero anatomy (the demo currently uses CompletionFactPanel there).
