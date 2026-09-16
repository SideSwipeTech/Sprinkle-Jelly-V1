import type { ReactNode } from "react";
import { useState } from "react";
import { SchedulingCard } from "./SchedulingCard";

function Editable({ status = "scheduled" as const, date = "2026-08-20" }) {
  const [d, setD] = useState(date);
  return <SchedulingCard date={d} status={status} onDateChange={setD} onUnschedule={() => setD("")} />;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "scheduled",
    label: "Scheduled — product date set, editable, unschedule frees the date",
    render: () => <Editable />
  },
  {
    key: "empty-gap",
    label: "Empty date inside the health window — the gap indicator, schedule risk",
    render: () => <SchedulingCard date="2026-08-22" status="empty" isGap onDateChange={() => {}} />
  },
  {
    key: "blocked-clash",
    label: "Blocked — the clash names the occupying challenge and its date",
    render: () => (
      <SchedulingCard
        date="2026-08-24"
        status="blocked"
        occupyingTitle="Two Sum"
        occupyingDate="2026-08-24"
        onDateChange={() => {}}
      />
    )
  },
  {
    key: "unscheduled-draft",
    label: "Unscheduled — a draft carries no date; assigning one is an act of publishing",
    render: () => <SchedulingCard status="unscheduled" onDateChange={() => {}} />
  },
  {
    key: "read-only",
    label: "Read-only — the date as a fact, no controls",
    render: () => <SchedulingCard date="2026-08-18" status="scheduled" readOnly />
  }
];
