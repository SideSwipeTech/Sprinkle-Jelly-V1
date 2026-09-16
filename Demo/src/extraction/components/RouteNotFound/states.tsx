import type { ReactNode } from "react";
import { RouteNotFound } from "./RouteNotFound";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "default",
    label: "Not found — with way back",
    render: () => (
      <RouteNotFound action={<button type="button" className="x-btn x-btn--primary">Dashboard</button>} />
    )
  },
  {
    key: "custom",
    label: "Hidden-record copy",
    render: () => (
      <RouteNotFound
        title="That record is not available"
        detail="Missing, hidden and inaccessible records answer the same way."
        action={<button type="button" className="x-btn x-btn--secondary">Go back</button>}
      />
    )
  }
];
