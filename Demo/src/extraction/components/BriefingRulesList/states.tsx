import type { ReactNode } from "react";
import { BriefingRulesList } from "./BriefingRulesList";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "mock-rules",
    label: "Mock briefing rules (lead + text)",
    render: () => (
      <BriefingRulesList
        rules={[
          { icon: "clock", lead: "45 Minutes Allocation:", text: "Continuous timer begins upon clicking Start." },
          { icon: "target", lead: "12 Precision Questions:", text: "Algorithmic invariants, time complexity, and syntax edge cases." },
          { icon: "shield", lead: "Sealed Posture:", text: "Navigation is constrained. Answers auto-save to local device ledger." }
        ]}
      />
    )
  },
  {
    key: "company-rules",
    label: "Company briefing rules (plain)",
    render: () => (
      <BriefingRulesList
        rules={[
          { icon: "check", text: "Integrity events are recorded as deterministic local logs" },
          { icon: "check", text: "Clock runs on-device; submitting locks and archives the sitting" },
          { icon: "check", text: "Zero-employer-disclosure contract in effect" }
        ]}
      />
    )
  }
];
