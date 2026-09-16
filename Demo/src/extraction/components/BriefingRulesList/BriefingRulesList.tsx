/**
 * BriefingRulesList — the icon + text rules block from the sitting briefings.
 *
 * Extracted from Assess.tsx:364-377 (MockBriefing) and 835-848 (CompanyBriefing),
 * which borrowed Dashboard's `home__list`/`home__row` classes. Rehomed here as
 * `x-briefing-rules` — a rules list is an assessment concern, not a home concern.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./BriefingRulesList.css";

export interface BriefingRule {
  icon: IconName;
  /** Bolded lead, e.g. "45 Minutes Allocation:". Optional — plain rules skip it. */
  lead?: string;
  text: ReactNode;
}

export function BriefingRulesList({ rules, label = "Sitting rules" }: { rules: BriefingRule[]; label?: string }) {
  return (
    <ul className="x-briefing-rules" aria-label={label}>
      {rules.map((rule, idx) => (
        <li className="x-briefing-rules__row" key={idx}>
          <span className="x-briefing-rules__icon">
            <Icon name={rule.icon} size={16} />
          </span>
          <span className="x-briefing-rules__text">
            {rule.lead ? <strong>{rule.lead} </strong> : null}
            {rule.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
