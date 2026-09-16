import type { ReactNode } from "react";
import { ExamFlagRow } from "./ExamFlagRow";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "list",
    label: "Flag list (MCK-R42)",
    render: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <ExamFlagRow name="Timer Display" on hint="On-screen countdown rendered throughout sitting" />
        <ExamFlagRow name="Question Palette" on hint="Full numbered navigation rail with question states" />
        <ExamFlagRow name="Review Flag" on hint="Mark questions for review with star indicators" />
        <ExamFlagRow name="Skip Permitted" on hint="Forward navigation past unanswered items" />
        <ExamFlagRow name="Revisit Permitted" on hint="Return freely to any viewed item" />
        <ExamFlagRow name="Section Switching" on={false} hint="Single unified assessment sequence" />
      </div>
    )
  },
  { key: "on", label: "Flag — active", render: () => <ExamFlagRow name="Timer Display" on /> },
  { key: "off", label: "Flag — off", render: () => <ExamFlagRow name="Section Switching" on={false} /> }
];
