import type { ReactNode } from "react";
import { ProficiencyPanel, ProficiencyRow } from "./ProficiencyRow";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "panel",
    label: "Panel — met / gap / unknown",
    render: () => (
      <ProficiencyPanel title="Category proficiency">
        <ProficiencyRow label="Language & Scoping Semantics" pct={100} />
        <ProficiencyRow label="Sliding Window & Invariants" pct={100} />
        <ProficiencyRow label="HTTP & Relational SQL Logic" pct={85} />
        <ProficiencyRow label="Async Runtime" pct={null} />
      </ProficiencyPanel>
    )
  },
  {
    key: "row-met",
    label: "Row — full marks",
    render: () => <ProficiencyRow label="Language & Scoping Semantics" pct={100} />
  },
  {
    key: "row-gap",
    label: "Row — gap (explicit verdict override)",
    render: () => <ProficiencyRow label="HTTP & Relational SQL Logic" pct={72} verdict="gap" />
  }
];
