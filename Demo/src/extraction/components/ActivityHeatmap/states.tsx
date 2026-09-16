/**
 * ActivityHeatmap states — live grid plus the two honest-absence states.
 * The demo's deterministic generator stays with the caller; states feed a small
 * synthetic window through the real prop.
 */

import type { ReactNode } from "react";
import { ActivityHeatmap, type HeatmapDay } from "./ActivityHeatmap";

function demoDays(): HeatmapDay[] {
  const out: HeatmapDay[] = [];
  const now = new Date();
  for (let i = 363; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const offsets = [0, 2, 5, 9, 14, 21, 34, 55, 89, 144, 233];
    out.push({ date: d.toISOString().split("T")[0]!, count: offsets.includes(i) ? 1 : 0 });
  }
  // A few denser days so levels 2–4 of the ramp show in the sink.
  out[out.length - 1]!.count = 7;
  out[out.length - 3]!.count = 4;
  out[out.length - 8]!.count = 2;
  return out;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "grid",
    label: "Grid — daily/weekly/monthly grains, token-derived ramp",
    render: () => <ActivityHeatmap days={demoDays()} />
  },
  {
    key: "empty",
    label: "Empty — no recorded activity (StateBlock empty)",
    render: () => <ActivityHeatmap days={[]} state="empty" />
  },
  {
    key: "unavailable",
    label: "Unavailable — ledger unreadable (StateBlock unavailable)",
    render: () => <ActivityHeatmap days={[]} state="unavailable" />
  }
];
