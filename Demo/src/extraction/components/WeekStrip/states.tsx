/**
 * WeekStrip state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { WeekStrip, type WeekDay } from "./WeekStrip";

const WEEK: WeekDay[] = [
  { label: "Mon", status: "done" },
  { label: "Tue", status: "done" },
  { label: "Wed", status: "done" },
  { label: "Thu", status: "done" },
  { label: "Fri", status: "done" },
  { label: "Sat", status: "today" },
  { label: "Sun", status: "open" }
];

const WITH_MISS: WeekDay[] = [
  { label: "Mon", status: "done" },
  { label: "Tue", status: "missed" },
  { label: "Wed", status: "done" },
  { label: "Thu", status: "done" },
  { label: "Fri", status: "today" },
  { label: "Sat", status: "open" },
  { label: "Sun", status: "open" }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "week", label: "Mid-week — five done, today, one open", render: () => <WeekStrip days={WEEK} /> },
  { key: "with-miss", label: "With a missed day — stated, not zeroed", render: () => <WeekStrip days={WITH_MISS} /> },
  {
    key: "fresh",
    label: "Fresh week — nothing done yet",
    render: () => (
      <WeekStrip days={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({ label: d, status: "open" as const }))} />
    )
  }
];
