/**
 * StateBlock state matrix for the Kitchen Sink — all seven honesty keys plus
 * the compact cut and the action-bearing form.
 */
import type { ReactNode } from "react";
import { StateBlock } from "./StateBlock";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "data",
    label: "data — nominal / live",
    render: () => (
      <StateBlock state="data" message="Live and accurate — this figure reflects the device's own ledger." />
    )
  },
  {
    key: "stale",
    label: "stale — aged, says so (asOf)",
    render: () => (
      <StateBlock
        state="stale"
        message="Stale: the figure has an age and says so honestly."
        asOf="this device, 14 Aug 2026"
      />
    )
  },
  {
    key: "pending",
    label: "pending — working, not failed",
    render: () => (
      <StateBlock state="pending" message="Pending: waiting for processing. This is not a failure." />
    )
  },
  {
    key: "unavailable",
    label: "unavailable — cannot read it",
    render: () => <StateBlock state="unavailable" message="Unavailable: we cannot tell you right now." />
  },
  {
    key: "empty",
    label: "empty — nothing yet",
    render: () => <StateBlock state="empty" message="Empty: you have done nothing here yet." />
  },
  {
    key: "refused",
    label: "refused — bounded by policy",
    render: () => (
      <StateBlock state="refused" message="Refused: this capability is bounded by policy or not in the build." />
    )
  },
  {
    key: "pruned",
    label: "pruned — detail aged out",
    render: () => <StateBlock state="pruned" message="Pruned: detail aged out. The summary remains." />
  },
  {
    key: "compact",
    label: "compact — dense surfaces",
    render: () => (
      <StateBlock
        state="empty"
        compact
        message="Nothing has been authored yet — distinct from unavailable and refused."
      />
    )
  },
  {
    key: "with-action",
    label: "with action — a way onward",
    render: () => (
      <StateBlock
        state="unavailable"
        message="This lesson cannot be opened."
        action={<a className="x-btn x-btn--secondary" href="/courses">Courses</a>}
      />
    )
  }
];
