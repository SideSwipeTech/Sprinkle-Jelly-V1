/**
 * RecordedEventTimeline — the ordered integrity timeline of one test
 * (assessments.F22, recorded-event review).
 *
 * Each entry carries its kind (one of the five counted kinds, and only those),
 * its instant on the platform's clock, its test, whether it counted, and the
 * technical source that reported it. Neutral throughout: a count is never a
 * finding about a person, and nothing beyond the counts and their timeline is
 * taken, stored or shown.
 *
 * The order is the record's own — entries sort by instant, and identical
 * signals inside the coalesce window never arrive here as two. An unreadable
 * timeline renders `status="unavailable"`, never an empty list pretending.
 */

import { StateBlock } from "../../../components/Card";
import { Icon } from "@icons/Icon";
import "./RecordedEventTimeline.css";

export type RecordedEventKind =
  | "fullscreen-exit"
  | "page-hidden"
  | "window-blur"
  | "clipboard-action"
  | "restricted-navigation";

/** The five counted kinds, labelled as `02-records.md` states them. */
export const RECORDED_EVENT_KIND_LABEL: Record<RecordedEventKind, string> = {
  "fullscreen-exit": "Leaving required fullscreen",
  "page-hidden": "The page became hidden",
  "window-blur": "The window lost focus",
  "clipboard-action": "A copy, cut, paste or context-menu action",
  "restricted-navigation": "A restricted navigation or browser shortcut"
};

export interface RecordedEventEntry {
  id: string;
  kind: RecordedEventKind;
  /** The instant on the platform's clock — an ISO string sorts correctly. */
  at: string;
  /** The test this entry belongs to — every entry carries it. */
  test: string;
  counted: boolean;
  /** The technical source that reported it — the listener, not a person. */
  source: string;
  /** Why an uncounted entry did not count — e.g. the paper's switch for the
   *  kind was off. Never a motive. */
  note?: string;
}

export interface RecordedEventTimelineProps {
  events: RecordedEventEntry[];
  /** `unavailable` when the record cannot be read — said, never guessed. */
  status?: "ready" | "unavailable";
  /** Accessible name for the ordered list. */
  label?: string;
}

export function RecordedEventTimeline({
  events,
  status = "ready",
  label = "Recorded Event timeline"
}: RecordedEventTimelineProps) {
  if (status === "unavailable") {
    return <StateBlock state="unavailable" message="The Recorded Event timeline cannot be read." compact />;
  }
  if (events.length === 0) {
    return <StateBlock state="empty" message="No Recorded Events were recorded on this test." compact />;
  }

  const ordered = [...events].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));

  return (
    <ol className="x-event-timeline" aria-label={label}>
      {ordered.map((entry) => (
        <li className="x-event-timeline__entry" key={entry.id} data-counted={entry.counted || undefined}>
          <span className="x-event-timeline__mark" aria-hidden="true">
            <Icon name={entry.counted ? "check" : "minus"} size={11} />
          </span>
          <div className="x-event-timeline__body">
            <span className="x-event-timeline__kind">{RECORDED_EVENT_KIND_LABEL[entry.kind]}</span>
            <span className="x-event-timeline__meta">
              <time dateTime={entry.at}>{entry.at}</time>
              {" · test "}
              <code className="x-event-timeline__test">{entry.test}</code>
              {" · reported by "}
              <code className="x-event-timeline__source">{entry.source}</code>
            </span>
            {entry.note ? <span className="x-event-timeline__note">{entry.note}</span> : null}
          </div>
          <span className="x-event-timeline__counted">
            {entry.counted ? "counted" : "not counted"}
          </span>
        </li>
      ))}
    </ol>
  );
}
