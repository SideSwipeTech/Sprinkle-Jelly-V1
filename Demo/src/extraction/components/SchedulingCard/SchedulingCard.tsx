/**
 * SchedulingCard — the daily studio's one addition to the shared practice
 * editing space: the product-date schedule card.
 *
 * It states the product date a Daily occupies (or would), the date's
 * classification — scheduled, empty or blocked, the schedule-health
 * vocabulary — and the gap indicator: an empty date inside the health window
 * is schedule risk while there is still time to fix it.
 *
 * Spec truths carried (daily/01-pages.md + 04-authoring.md):
 *  - A draft carries no date — assigning one is an act of publishing.
 *  - A clash names the occupying challenge and its date and writes nothing.
 *  - An empty date is a neutral date, never an error and never a dead card.
 *  - Unscheduling frees the date — behind a control, not silently.
 */

import { Icon } from "@icons/Icon";
import { StatusText } from "../StatusText/StatusText";
import { Button } from "../Button/Button";
import "./SchedulingCard.css";

/** The schedule-health classification, plus `unscheduled` for a draft. */
export type ScheduleStatus = "unscheduled" | "scheduled" | "empty" | "blocked";

const STATUS_TONE: Record<ScheduleStatus, "neutral" | "success" | "warning" | "error"> = {
  unscheduled: "neutral",
  scheduled: "success",
  empty: "warning",
  blocked: "error"
};

const STATUS_ICON = {
  unscheduled: "sticky-note",
  scheduled: "check",
  empty: "alert",
  blocked: "error"
} as const;

export interface SchedulingCardProps {
  /** The product date — ISO "2026-08-22". Absent on a draft that carries none. */
  date?: string;
  status: ScheduleStatus;
  /** The occupying challenge on a clash — named with its date, per spec. */
  occupyingTitle?: string;
  occupyingDate?: string;
  /** An empty date inside the health window — schedule risk while fixable. */
  isGap?: boolean;
  readOnly?: boolean;
  onDateChange?: (iso: string) => void;
  /** Unschedule — frees the date; offered only where the state allows it. */
  onUnschedule?: () => void;
  className?: string;
}

function formatProductDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function SchedulingCard({
  date,
  status,
  occupyingTitle,
  occupyingDate,
  isGap = false,
  readOnly = false,
  onDateChange,
  onUnschedule,
  className = ""
}: SchedulingCardProps) {
  return (
    <aside className={`x-schedule-card ${className}`.trim()} data-status={status} aria-label="Scheduling">
      <header className="x-schedule-card__head">
        <span className="x-schedule-card__mark" aria-hidden="true">
          <Icon name="daily" size={16} />
        </span>
        <span className="x-schedule-card__title">Scheduling</span>
        <StatusText tone={STATUS_TONE[status]} icon={STATUS_ICON[status]}>
          {status}
        </StatusText>
      </header>

      <div className="x-schedule-card__body">
        <div className="x-schedule-card__date-row">
          <span className="x-schedule-card__date-label">Product date</span>
          {readOnly || !onDateChange ? (
            <strong className="numeral x-schedule-card__date">
              {date ? formatProductDate(date) : "—"}
            </strong>
          ) : (
            <input
              type="date"
              className="x-schedule-card__date-input"
              value={date ?? ""}
              aria-label="Product date"
              onChange={(e) => onDateChange(e.target.value)}
            />
          )}
          {onUnschedule && status === "scheduled" && !readOnly ? (
            <Button variant="quiet" size="sm" onClick={onUnschedule}>
              Unschedule — frees the date
            </Button>
          ) : null}
        </div>

        {status === "unscheduled" ? (
          <p className="x-schedule-card__note">
            A draft carries no date — assigning one is an act of publishing.
          </p>
        ) : null}

        {status === "empty" ? (
          <p className="x-schedule-card__note" data-tone="warning">
            {isGap
              ? "Schedule gap — nothing published occupies this date, and there is still time to fix it."
              : "A neutral date — nothing is scheduled for it."}
          </p>
        ) : null}

        {status === "blocked" ? (
          <p className="x-schedule-card__note" data-tone="error">
            Occupied by {occupyingTitle ?? "another challenge"}
            {occupyingDate ? ` on ${formatProductDate(occupyingDate)}` : ""} — a clash writes nothing.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
