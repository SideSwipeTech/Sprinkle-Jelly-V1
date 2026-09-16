import type { ReactNode } from "react";
import { StateBlock } from "@components/Card";
import { MaintenancePreview } from "./MaintenancePreview";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "declared",
    label: "Declared window",
    render: () => (
      <MaintenancePreview
        status="Declared"
        title="Batch execution, assessment grading"
        message="Some results may take longer to appear. Interactive work remains available."
        facts={[
          { term: "Starts", value: "2026-08-24 02:00" },
          { term: "Expected end", value: "2026-08-24 04:00" }
        ]}
        note="The window ends only when affected health signals recover. There is no manual End control."
      />
    )
  },
  {
    key: "undeclared",
    label: "Not yet declared — empty state",
    render: () => (
      <StateBlock state="empty" message="Complete all four fields to preview and declare the window." />
    )
  }
];
