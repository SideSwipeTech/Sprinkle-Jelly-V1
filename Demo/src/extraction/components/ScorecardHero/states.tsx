import type { ReactNode } from "react";
import { ScorecardHero } from "./ScorecardHero";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "met",
    label: "Verdict — benchmark met",
    render: () => (
      <ScorecardHero verdict="met" pct={83} score={10} total={12} when="16 Aug 2026, 14:02" />
    )
  },
  {
    key: "below",
    label: "Verdict — below benchmark",
    render: () => (
      <ScorecardHero verdict="below" pct={42} score={5} total={12} when="16 Aug 2026, 14:02" />
    )
  },
  {
    key: "ungraded",
    label: "Verdict — ungraded (company record)",
    render: () => (
      <ScorecardHero verdict="ungraded" pct={null} score={null} total={12} when="16 Aug 2026, 14:02" />
    )
  }
];
