/**
 * RecordedEventTimeline state matrix for the Kitchen Sink — counted and
 * uncounted entries, the empty record, and the unreadable record.
 */
import type { ReactNode } from "react";
import { RecordedEventTimeline, type RecordedEventEntry } from "./RecordedEventTimeline";

const TEST = "test T-2291";

const full: RecordedEventEntry[] = [
  { id: "e1", kind: "page-hidden", at: "2026-08-21T10:14:02Z", test: TEST, counted: true, source: "document.visibilitychange" },
  { id: "e2", kind: "window-blur", at: "2026-08-21T10:14:41Z", test: TEST, counted: true, source: "window blur listener" },
  { id: "e3", kind: "clipboard-action", at: "2026-08-21T10:17:09Z", test: TEST, counted: true, source: "clipboard/context-menu listener" },
  { id: "e4", kind: "restricted-navigation", at: "2026-08-21T10:21:55Z", test: TEST, counted: false, source: "keydown shortcut guard", note: "not counted — the paper's restricted-navigation switch was off" },
  { id: "e5", kind: "page-hidden", at: "2026-08-21T10:24:13Z", test: TEST, counted: true, source: "document.visibilitychange" },
  { id: "e6", kind: "fullscreen-exit", at: "2026-08-21T10:26:30Z", test: TEST, counted: false, source: "fullscreenchange listener", note: "not counted — the paper's fullscreen switch was off" }
];

const countedOnly: RecordedEventEntry[] = full.filter((e) => e.counted);

const single: RecordedEventEntry[] = [
  { id: "e1", kind: "page-hidden", at: "2026-08-22T09:02:11Z", test: "test T-2292", counted: true, source: "document.visibilitychange" }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "mixed",
    label: "Counted and not counted, ordered by instant",
    render: () => <RecordedEventTimeline events={full} />
  },
  {
    key: "counted",
    label: "All counted",
    render: () => <RecordedEventTimeline events={countedOnly} />
  },
  {
    key: "single",
    label: "One entry",
    render: () => <RecordedEventTimeline events={single} />
  },
  {
    key: "empty",
    label: "No Recorded Events on the test",
    render: () => <RecordedEventTimeline events={[]} />
  },
  {
    key: "unavailable",
    label: "Timeline cannot be read",
    render: () => <RecordedEventTimeline events={[]} status="unavailable" />
  }
];
