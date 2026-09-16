/**
 * InsetPanel — state matrix for the Kitchen Sink.
 * `x-key-value__row` is the containers/KeyValueRow sibling, referenced by class.
 */

import type { ReactNode } from "react";
import { InsetPanel } from "./InsetPanel";

function KV({ term, value, tone }: { term: string; value: ReactNode; tone?: string }) {
  return (
    <div className="x-key-value__row" data-tone={tone}>
      <span className="x-key-value__term">{term}</span>
      <strong className="x-key-value__value">{value}</strong>
    </div>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "facts",
    label: "Fact panel — key/value rows (Learn.tsx:199 shape)",
    render: () => (
      <InsetPanel>
        <KV term="Target Certificate:" value="Python Foundations Seal" tone="success" />
        <KV term="Verification Authority:" value="Wizly Labs Local Registry" />
      </InsetPanel>
    )
  },
  {
    key: "bordered",
    label: "Bordered — the drawer variant (Practice.tsx:509)",
    render: () => (
      <InsetPanel bordered>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="micro" style={{ color: "var(--c-text-faint)" }}>CUSTOM TEST INPUT (UNGRADED)</span>
          <button type="button" className="x-btn x-btn--quiet">Run Custom Input</button>
        </div>
      </InsetPanel>
    )
  },
  {
    key: "free",
    label: "Free content — prose block",
    render: () => (
      <InsetPanel as="aside" label="Constraints">
        <p style={{ margin: 0, color: "var(--c-text-muted)" }}>
          Exactly one valid solution exists per input fixture.
        </p>
      </InsetPanel>
    )
  }
];
