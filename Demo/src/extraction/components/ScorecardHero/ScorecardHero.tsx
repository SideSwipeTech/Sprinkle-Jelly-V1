/**
 * ScorecardHero — the verdict block that heads a mock result.
 *
 * Extracted from Assess.tsx:586-596. The demo painted pass/fail as bare colour
 * (#2dd4bf vs #fbbf24); here `data-verdict` drives tone AND an icon + label —
 * the verdict is never carried by colour alone (SHR-R38).
 *
 * `ungraded` exists because company sittings produce a completion record, never
 * a pass/fail — and a missing grade renders an em dash, not a zero.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ScorecardHero.css";

export type ScorecardVerdict = "met" | "below" | "ungraded";

const VERDICT_ICON: Record<ScorecardVerdict, IconName> = {
  met: "check-mark",
  below: "alert",
  ungraded: "shield"
};

const VERDICT_LABEL: Record<ScorecardVerdict, string> = {
  met: "Meets assessment benchmark",
  below: "Additional drills recommended",
  ungraded: "Completion record — no pass/fail"
};

export interface ScorecardHeroProps {
  verdict: ScorecardVerdict;
  /** Overrides the canned label when the surface needs different wording. */
  verdictLabel?: string;
  /** Percentage figure. null → "—", never a fabricated zero. */
  pct: number | null;
  /** Raw correct count; null when the sitting does not score. */
  score?: number | null;
  total: number;
  /** e.g. a formatted completion timestamp. */
  when?: string;
  actions?: ReactNode;
}

export function ScorecardHero({ verdict, verdictLabel, pct, score, total, when, actions }: ScorecardHeroProps) {
  return (
    <div className="x-scorecard-hero" data-verdict={verdict}>
      <div className="x-scorecard-hero__main">
        <p className="x-scorecard-hero__verdict">
          <Icon name={VERDICT_ICON[verdict]} size={14} />
          <span className="micro">{verdictLabel ?? VERDICT_LABEL[verdict]}</span>
        </p>
        <h2 className="x-scorecard-hero__score numeral numeral--hero">
          {pct === null ? "—" : `${pct}%`}
          <span className="x-scorecard-hero__score-unit"> Score</span>
        </h2>
        <p className="x-scorecard-hero__meta">
          {score === null || score === undefined
            ? `${total} items recorded`
            : `${score} of ${total} items correct`}
          {when ? ` · ${when}` : ""}
        </p>
      </div>
      <div className="x-scorecard-hero__dial" aria-hidden="true">
        {/* The dial is always the raw fraction — an unreadable numerator is an
            em dash, never zero, so ungraded reads "—/total" like the graded
            "n/total" instead of a bare dash that duplicates the headline's. */}
        {score ?? "—"}/{total}
      </div>
      {actions ? <div className="x-scorecard-hero__actions">{actions}</div> : null}
    </div>
  );
}
