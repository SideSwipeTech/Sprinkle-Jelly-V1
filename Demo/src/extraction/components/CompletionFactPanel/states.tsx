import type { ReactNode } from "react";
import { CompletionFactPanel } from "./CompletionFactPanel";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "company-record",
    label: "Company sitting record",
    render: () => (
      <CompletionFactPanel
        facts={[
          { term: "Paper type", value: "Company" },
          { term: "Completed", value: "16 Aug 2026, 14:02" },
          { term: "Items recorded", value: 12 },
          { term: "Pass/fail", value: "Not produced" },
          { term: "Reward", value: "None" }
        ]}
      />
    )
  },
  {
    key: "with-note",
    label: "With privacy note + actions",
    render: () => (
      <CompletionFactPanel
        facts={[
          { term: "Paper type", value: "Company" },
          { term: "Items recorded", value: 12 },
          { term: "Verified at", value: null }
        ]}
        note={
          <>
            <strong>Private by design</strong>
            No recruiter, employer, or other learner can read this record.
          </>
        }
      >
        <button type="button" className="x-btn x-btn--primary">Assessment history</button>
        <button type="button" className="x-btn x-btn--secondary">Sit again</button>
      </CompletionFactPanel>
    )
  }
];
