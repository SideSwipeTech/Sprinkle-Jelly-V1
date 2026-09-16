/**
 * ScheduleHealth — `/admin/daily/health`. The next
 * `DAILY_SCHEDULE_HEALTH_DAYS` product dates, each classified scheduled,
 * empty or blocked, the date named and the fix reachable from its row.
 *
 * Spec truths carried (daily/01-pages.md "Schedule health", daily.F28):
 *  - Any empty or blocked date renders as schedule risk while there is still
 *    time to fix it; an empty tomorrow raises the higher-priority alert — the
 *    hub's `daily_challenge_schedule_gap` condition reads this window.
 *  - A window with no risk states its healthy state rather than rendering
 *    blank.
 *  - Unknown, where the check could not run, is a statement about the check —
 *    never drawn on a date's row as though the date were fine.
 *  - Nothing in this view selects or publishes anything: every fix is a link
 *    into the scheduling calendar, which owns the writes.
 */

import { useMemo, useState, type ReactNode } from "react";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewChips,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../../assessments/shared";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { ListRow } from "../../../extraction/components/ListRow/ListRow";
import { Notice } from "../../../extraction/components/Notice/Notice";
import { StatusText } from "../../../extraction/components/StatusText/StatusText";
import {
  ACTION,
  DAILY_TODAY,
  FIG,
  formatProductDate,
  healthClassOf,
  healthDates,
  occupantsOf,
  seedCleanWindow,
  seedSchedule,
  type DailyOccupant,
  type HealthClass
} from "./fixtures";
import "./daily-admin.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused", "unverifiable"];

const CLASS_TONE: Record<HealthClass, "success" | "warning" | "error"> = {
  scheduled: "success",
  empty: "warning",
  blocked: "error"
};

const CLASS_ICON = { scheduled: "check", empty: "alert", blocked: "error" } as const;

export function ScheduleHealth() {
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  /* The fixture's two windows: the mixed one the domain's data produces, and
     a clean one so the healthy state renders rather than going unseen. */
  const [windowKind, setWindowKind] = useState<"risk" | "clean">("risk");
  const rows = useMemo(
    () => (windowKind === "clean" ? seedCleanWindow() : seedSchedule()),
    [windowKind]
  );
  const loading = preview === "loading";

  return (
    <AdminPage
      kicker="Content · Daily studio"
      title="Schedule health"
      lead={`The next ${FIG.DAILY_SCHEDULE_HEALTH_DAYS} product dates, each classified scheduled, empty or blocked — the date named and the fix reachable from its row. Nothing here selects or publishes anything.`}
      actions={<Button variant="quiet" icon="arrow-left" to="/admin/daily">Scheduling calendar</Button>}
    >
      <DemoTools>
        <PreviewChips active={preview} onChange={setPreview} allowed={allowed} />
        <div className="a-preview" role="group" aria-label="Preview a fixture window">
          <span className="a-preview__label">Fixture window</span>
          <Chip size="sm" selected={windowKind === "risk"} onClick={() => setWindowKind("risk")}>
            Schedule risk
          </Chip>
          <Chip size="sm" selected={windowKind === "clean"} onClick={() => setWindowKind("clean")}>
            Clean window
          </Chip>
        </div>
      </DemoTools>

      {loading ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readSchedule} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The schedule-health check could not run — unknown is a statement about the check, never a date's row drawn as though the date were fine."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}

      {preview === "loaded" ? <ScheduleHealthPanel rows={rows} /> : null}
    </AdminPage>
  );
}

/**
 * DemoTools — the daily domain's collapsed fixture drawer. The page keeps one
 * coherent scenario on its face (the product date's month, the seeded
 * schedule); every state-preview and fixture switch lives behind this
 * disclosure instead. The scenario's one choice is inspectable here: the
 * product date the whole domain runs on, named in words — the real clock
 * never reaches the calendar.
 */
export function DemoTools({ children }: { children?: ReactNode }) {
  return (
    <details className="da-demotools">
      <summary>Demo tools</summary>
      <div className="da-demotools__body">
        <p className="meta da-demotools__clock">
          Product date{" "}
          <strong className="numeral">{formatProductDate(DAILY_TODAY)}</strong> — the daily studio
          runs on this one fixed product date; begun, today and ahead all read from it, never from
          the real clock.
        </p>
        {children}
      </div>
    </details>
  );
}

/**
 * The health window itself — the classified rows, the notices and the
 * per-row fix. Shared between this page and the scheduling calendar's
 * Schedule health tab: embedded there it reads the calendar's own live rows
 * and opens the date's dialog in place (`onOpenDate`); standalone it keeps
 * real links into the calendar's `?date=` deep link.
 */
export function ScheduleHealthPanel({
  rows,
  onOpenDate
}: {
  rows: Record<string, DailyOccupant[]>;
  /** Embedded mode: open the date's dialog without leaving the calendar. */
  onOpenDate?: (date: string) => void;
}) {
  const dates = healthDates();
  const classified = dates.map((date) => ({
    date,
    occupants: occupantsOf(rows, date)
  }));
  const risks = classified.filter((r) => healthClassOf(r.occupants) !== "scheduled");
  const tomorrow = dates[0]!;
  const tomorrowEmpty = healthClassOf(occupantsOf(rows, tomorrow)) === "empty";

  return (
    <>
      {risks.length === 0 ? (
        <Notice tone="success" title="Healthy window">
          Every product date in the next {FIG.DAILY_SCHEDULE_HEALTH_DAYS} is scheduled — nothing
          to fix. The window states its health rather than rendering blank.
        </Notice>
      ) : (
        <Notice tone="warning" title="Schedule risk">
          {risks.length} of the next {FIG.DAILY_SCHEDULE_HEALTH_DAYS} product dates carry
          schedule risk while there is still time to fix it.
          {tomorrowEmpty
            ? ` ${formatProductDate(tomorrow)} is tomorrow — its gap raises the higher-priority alert.`
            : ""}{" "}
          Each fix is reachable from its row.
        </Notice>
      )}

      <LoadedLine loaded={classified.length} total={FIG.DAILY_SCHEDULE_HEALTH_DAYS} />
      <p className="meta da-note">
        Product dates from {formatProductDate(tomorrow)}, tomorrow first — today (
        {formatProductDate(DAILY_TODAY)}) has begun and is out of the window.
      </p>

      <div className="da-health">
        {classified.map(({ date, occupants }) => (
          <HealthRow
            key={date}
            date={date}
            occupants={occupants}
            isTomorrow={date === tomorrow}
            onOpenDate={onOpenDate}
          />
        ))}
      </div>
    </>
  );
}

/* ── The per-date health row ──────────────────────────────────────────────── */

function HealthRow({
  date,
  occupants,
  isTomorrow,
  onOpenDate
}: {
  date: string;
  occupants: DailyOccupant[];
  isTomorrow: boolean;
  onOpenDate?: (date: string) => void;
}) {
  const cls = healthClassOf(occupants);
  const risk = cls !== "scheduled";
  const first = occupants[0];

  return (
    <ListRow
      as="article"
      align="center"
      className="da-health-row"
      data-state={cls}
      data-risk={risk || undefined}
    >
      <div className="da-health-row__date">
        <strong className="numeral">{formatProductDate(date, true)}</strong>
        {isTomorrow ? <StatusText tone="info" icon="clock">tomorrow</StatusText> : null}
      </div>

      <div className="da-health-row__body">
        <StatusText tone={CLASS_TONE[cls]} icon={CLASS_ICON[cls]}>
          {cls}{risk ? " — schedule risk" : ""}
        </StatusText>
        {cls === "scheduled" && first ? (
          <span className="meta">
            {first.title} · {first.difficulty} · {first.xp} XP
          </span>
        ) : null}
        {cls === "empty" ? (
          <span className="meta">Nothing published occupies this product date — a neutral date.</span>
        ) : null}
        {cls === "blocked" ? (
          <span className="meta">
            {occupants.map((o) => `“${o.title}”`).join(" and ")} both hold the date — the
            duplicate-date fault. Keep one published, return the other to draft.
          </span>
        ) : null}
      </div>

      <div className="row da-health-row__acts">
        {cls === "empty" ? (
          <>
            {onOpenDate ? (
              <Button variant="secondary" size="sm" onClick={() => onOpenDate(date)}>Assign…</Button>
            ) : (
              <Button variant="secondary" size="sm" to={`/admin/daily?date=${date}`}>Assign…</Button>
            )}
            <Button variant="quiet" size="sm" to="/admin/daily/new">New challenge</Button>
          </>
        ) : null}
        {cls === "blocked" ? (
          onOpenDate ? (
            <Button variant="secondary" size="sm" onClick={() => onOpenDate(date)}>Resolve the clash</Button>
          ) : (
            <Button variant="secondary" size="sm" to={`/admin/daily?date=${date}`}>Resolve the clash</Button>
          )
        ) : null}
        {cls === "scheduled" ? (
          onOpenDate ? (
            <Button variant="quiet" size="sm" onClick={() => onOpenDate(date)}>Open</Button>
          ) : (
            <Button variant="quiet" size="sm" to={`/admin/daily/${date}`}>Open</Button>
          )
        ) : null}
      </div>
    </ListRow>
  );
}
