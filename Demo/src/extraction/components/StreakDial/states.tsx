/**
 * StreakDial state matrix for the Kitchen Sink.
 * The ring is kit ChargeRing; these states exercise the centre= pattern and
 * the honest unavailable cut.
 */
import type { ReactNode } from "react";
import { StreakDial } from "./StreakDial";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "active",
    label: "23-day streak — goal met, ring full",
    render: () => <StreakDial days={23} meta="Window closes at 23:59:59 IST · 14h 22m remaining" />
  },
  {
    key: "building",
    label: "3 of 7 — arc still filling",
    render: () => <StreakDial days={3} meta="4 more daily solves to close the week" />
  },
  {
    key: "unavailable",
    label: "unavailable — ledger unreadable, never zero",
    render: () => <StreakDial days={null} meta="The streak ledger could not be read on this device." />
  }
];
