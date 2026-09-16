/**
 * StaleNote state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { StaleNote } from "./StaleNote";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "asof",
    label: "With as-of stamp",
    render: () => (
      <StaleNote asOf="this device, 14 Aug 2026">
        Derived from completed lessons and local terminal runs
      </StaleNote>
    )
  },
  {
    key: "plain",
    label: "Provenance only",
    render: () => <StaleNote>Readiness figures are not a public credential</StaleNote>
  }
];
