/**
 * ProficiencyRow — one per-category figure on the scorecard, plus the inset
 * panel that hosts the set (`ProficiencyPanel`).
 *
 * Extracted from Assess.tsx:598-614, where the figure's tone was a bare
 * `#2dd4bf`/`#fbbf24` literal. Now `data-verdict` carries the tone and a meter
 * bar + icon carry the meaning: a viewer who cannot read the hue still gets the
 * bar length, the glyph and the number.
 */

import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import type { ReactNode } from "react";
import "./ProficiencyRow.css";

export type ProficiencyVerdict = "met" | "gap" | "unknown";

const VERDICT_ICON: Record<ProficiencyVerdict, IconName> = {
  met: "check",
  gap: "alert",
  unknown: "minus"
};

export interface ProficiencyRowProps {
  label: string;
  /** 0–100. null → em dash and an empty track, never a zero bar. */
  pct: number | null;
  /** Explicit verdict; defaults to `met` at 100, `gap` below, `unknown` when null. */
  verdict?: ProficiencyVerdict;
}

export function ProficiencyRow({ label, pct, verdict }: ProficiencyRowProps) {
  const resolved: ProficiencyVerdict =
    verdict ?? (pct === null ? "unknown" : pct >= 100 ? "met" : "gap");
  const fill = pct === null ? 0 : Math.max(0, Math.min(100, pct));

  return (
    <div className="x-proficiency-row" data-verdict={resolved}>
      <span className="x-proficiency-row__label">{label}</span>
      <span
        className="x-proficiency-row__track"
        role="img"
        aria-label={pct === null ? `${label}: unavailable` : `${label}: ${fill}%`}
      >
        <span className="x-proficiency-row__fill" style={{ width: `${fill}%` }} />
      </span>
      <span className="x-proficiency-row__value numeral">
        <Icon name={VERDICT_ICON[resolved]} size={12} />
        {pct === null ? "—" : `${fill}%`}
      </span>
    </div>
  );
}

export interface ProficiencyPanelProps {
  /** The eyebrow over the inset, e.g. "Category proficiency". */
  title: string;
  children: ReactNode;
}

/** The inset host — was an anonymous `surface-inset` div in the page. */
export function ProficiencyPanel({ title, children }: ProficiencyPanelProps) {
  return (
    <div className="x-proficiency-panel">
      <p className="micro x-proficiency-panel__title">{title}</p>
      <div className="x-proficiency-panel__rows">{children}</div>
    </div>
  );
}
