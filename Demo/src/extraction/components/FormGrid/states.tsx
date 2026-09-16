import type { ReactNode } from "react";
import { FormGrid, FormGridWide } from "./FormGrid";

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="x-field">
      <label className="x-field__label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "credit-correction",
    label: "Credit correction form",
    render: () => (
      <FormGrid>
        <Field label="Person" id="fg-person"><select id="fg-person"><option>Yash</option></select></Field>
        <Field label="Direction" id="fg-dir"><select id="fg-dir"><option>Grant</option><option>Deduct</option></select></Field>
        <Field label="Amount" id="fg-amt"><input id="fg-amt" type="number" min={1} placeholder="0" /></Field>
        <Field label="Incident reference" id="fg-inc"><input id="fg-inc" placeholder="INC-2026-…" /></Field>
        <FormGridWide>
          <Field label="Reason" id="fg-reason"><textarea id="fg-reason" placeholder="Why this compensating entry is required" /></Field>
        </FormGridWide>
      </FormGrid>
    )
  },
  {
    key: "maintenance",
    label: "Maintenance declaration form",
    render: () => (
      <FormGrid>
        <Field label="Start" id="fg-start"><input id="fg-start" type="datetime-local" /></Field>
        <Field label="Expected end" id="fg-end"><input id="fg-end" type="datetime-local" /></Field>
        <FormGridWide>
          <Field label="Affected paths" id="fg-paths"><input id="fg-paths" placeholder="Batch execution, assessment grading" /></Field>
        </FormGridWide>
        <FormGridWide>
          <Field label="Learner-safe message" id="fg-msg"><textarea id="fg-msg" placeholder="Some results may take longer to appear." /></Field>
        </FormGridWide>
      </FormGrid>
    )
  }
];
