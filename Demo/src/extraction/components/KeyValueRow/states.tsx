/**
 * KeyValueRow — state matrix for the Kitchen Sink.
 * `x-inset-panel` is the containers/InsetPanel sibling, referenced by class.
 */

import type { ReactNode } from "react";
import { KeyValueRow, KeyValueTable } from "./KeyValueRow";

const rowStack = { display: "flex", flexDirection: "column", gap: "var(--space-2)" } as const;

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "inset-pills",
    label: "Inset pill rows — System Diagnostics (Assess.tsx:403)",
    render: () => (
      <div style={rowStack}>
        <KeyValueRow inset term="Local Storage Buffer:" value="✓ Available (Active)" tone="success" />
        <KeyValueRow inset term="Host Clock Sync:" value="✓ Accurate (IST Local)" tone="success" />
        <KeyValueRow inset term="Display Resolution:" value="✓ High-DPI Compliant" tone="success" />
      </div>
    )
  },
  {
    key: "inset-panel",
    label: "Bare pairs inside an InsetPanel (Learn.tsx:199)",
    render: () => (
      <div className="x-inset-panel">
        <KeyValueRow term="Target Certificate:" value="Python Foundations Seal" tone="success" />
        <KeyValueRow term="Verification Authority:" value="Wizly Labs Local Registry" />
      </div>
    )
  },
  {
    key: "tones",
    label: "Value tones — success / accent / warning / error / muted",
    render: () => (
      <div style={rowStack}>
        <KeyValueRow inset icon="check" term="Integrity:" value="Verified" tone="success" />
        <KeyValueRow inset icon="target" term="Archetype Provenance:" value="Inferred Pattern" tone="accent" />
        <KeyValueRow inset icon="alert" term="Clock drift:" value="Approaching tolerance" tone="warning" />
        <KeyValueRow inset icon="x" term="Camera check:" value="Refused by policy" tone="error" />
        <KeyValueRow inset term="Legacy field:" value="Not recorded" tone="muted" />
      </div>
    )
  },
  {
    key: "table",
    label: "Definition strip — .account-facts dl (app.css:213)",
    render: () => (
      <KeyValueTable label="Account facts">
        <KeyValueRow as="definition" term="Name" value="Ari" />
        <KeyValueRow as="definition" term="Membership" value="Active" tone="success" />
        <KeyValueRow as="definition" term="Labs access" value="All learning and practice areas" />
      </KeyValueTable>
    )
  },
  {
    key: "missing",
    label: "Missing value — em dash, never zero",
    render: () => (
      <KeyValueTable>
        <KeyValueRow as="definition" term="Started" value="2026-09-11 09:41" />
        <KeyValueRow as="definition" term="Expected end" value={null} />
      </KeyValueTable>
    )
  }
];
