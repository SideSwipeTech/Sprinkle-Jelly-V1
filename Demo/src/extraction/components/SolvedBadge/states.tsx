/**
 * SolvedBadge state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { SolvedBadge } from "./SolvedBadge";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "solved", label: "Solved (default)", render: () => <SolvedBadge /> },
  {
    key: "accepted",
    label: "Accepted on this device",
    render: () => <SolvedBadge>Accepted on this device</SolvedBadge>
  }
];
