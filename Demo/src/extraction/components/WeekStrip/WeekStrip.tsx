/**
 * WeekStrip — the 7-day completion strip, extracted from Practice.tsx:787-799
 * (the inset grid inside "Current Streak Status" on /daily).
 *
 * Each day is a dot + micro label. The demo encoded done purely as teal fill
 * vs border fill — the extraction gives every status a shape tell so the
 * strip reads in greyscale (SHR-R38):
 *
 *   done     filled dot + check glyph
 *   today    accent-ringed hollow dot — "you are here"
 *   open     hollow dot — still to come, or simply not done
 *   missed   hollow dot with an x — the day passed without a solve
 *
 * (The demo only had done/open; `today` and `missed` are the honest completes —
 * a missed day is stated, not zeroed.)
 *
 * a11y: an ordered list — each item announces "Mon: completed" etc. via
 * `aria-label`; the glyphs are aria-hidden.
 */

import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./WeekStrip.css";

export type WeekDayStatus = "done" | "today" | "open" | "missed";

export interface WeekDay {
  /** Short label — "Mon", "Tue". */
  label: string;
  status: WeekDayStatus;
  /** Accessible announcement override — default derived from status. */
  accessibleLabel?: string;
}

const STATUS_WORD: Record<WeekDayStatus, string> = {
  done: "completed",
  today: "today, not yet solved",
  open: "not completed",
  missed: "missed"
};

const STATUS_ICON: Record<WeekDayStatus, IconName | null> = {
  done: "check-mark",
  today: null,
  open: null,
  missed: "x"
};

export interface WeekStripProps {
  days: WeekDay[];
  /** Region label — default "This week's daily challenges". */
  label?: string;
  className?: string;
}

export function WeekStrip({ days, label = "This week's daily challenges", className = "" }: WeekStripProps) {
  return (
    <ol className={`x-week-strip ${className}`.trim()} aria-label={label}>
      {days.map((day) => {
        const icon = STATUS_ICON[day.status];
        return (
          <li
            key={day.label}
            className="x-week-strip__day"
            aria-label={`${day.label}: ${day.accessibleLabel ?? STATUS_WORD[day.status]}`}
          >
            <span className="x-week-strip__label" aria-hidden="true">
              {day.label}
            </span>
            <span className="x-week-strip__dot" data-status={day.status} aria-hidden="true">
              {icon ? <Icon name={icon} size={10} /> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
