/**
 * DailyIndex — `/admin/daily`. The daily studio's three local destinations
 * in one Tabs row (never the global nav):
 *
 *   Calendar          the default — the month calendar and the per-date list
 *                     showing what occupies each product date, or the
 *                     affordance to fill an empty one
 *   Content           the catalog — the studio's drafts and scheduled
 *                     challenges, every CRUD verb on a row surface
 *   Schedule health   the next DAILY_SCHEDULE_HEALTH_DAYS product dates,
 *                     classified — the same panel /admin/daily/health
 *                     renders, here reading the calendar's live rows
 *
 * Row tails stay honest: one primary act per row (Assign… on an empty date,
 * Manage… on an occupied one, Edit content on a catalog row), the rest in a
 * labelled three-dot Menu. Edit content reaches the occupant's studio;
 * Move…, Unschedule and Archive stay scheduling acts through the date's
 * dialog — Archive behind its blast radius, Delete… typed-confirmed on a
 * pristine unscheduled draft alone.
 *
 * Spec truths carried (daily/01-pages.md "Scheduling calendar" +
 * 04-authoring.md §4.10):
 *  - Summary figures render as unknown while loading, never as zero.
 *  - A clash names the occupying challenge and its date and writes nothing.
 *  - A move and an unschedule reach only a Daily still ahead of its product
 *    date and untouched by any learner; begun dates refuse them by name, so
 *    the controls are absent there rather than failing.
 *  - Unscheduling frees the date behind a confirmation saying exactly that;
 *    archiving states its blast radius before the confirmation is accepted.
 *  - Nothing selects itself: every fill is an explicit administrative act.
 *
 * `?view=` selects the tab; `?date=<iso>` opens that date's dialog — the
 * schedule-health rows reach their fixes here. New challenge lands at
 * `/admin/daily/new`.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@icons/Icon";
import { Stat, StateBlock } from "@components/Card";
import { useStore } from "@state/useStore";
import { fillDailyGap, setChallengeLifecycle } from "@state/store";
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
import { ChipTabBar } from "../../../extraction/components/ChipTabBar/ChipTabBar";
import { ConfirmByTyping } from "../../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Dialog } from "../../../extraction/components/Dialog/Dialog";
import { ListRow } from "../../../extraction/components/ListRow/ListRow";
import { Menu, type MenuItem } from "../../../extraction/components/Menu/Menu";
import { Notice } from "../../../extraction/components/Notice/Notice";
import { StatusText } from "../../../extraction/components/StatusText/StatusText";
import { DateDialog, type DateDialogMode } from "./DateDialog";
import { DemoTools, ScheduleHealthPanel } from "./ScheduleHealth";
import {
  ACTION,
  addDays,
  countsUnread,
  DAILY_TODAY,
  DAY_HEADERS,
  formatProductDate,
  gapIso,
  healthDates,
  inHealthWindow,
  isBegun,
  isPristineCatalogDraft,
  monthCells,
  monthLabel,
  monthOfDate,
  nearestRisk,
  occupantsOf,
  seedCatalog,
  seedSchedule,
  shiftMonth,
  stateOf,
  type DailyCatalogEntry,
  type DailyOccupant,
  type MonthRef
} from "./fixtures";
import "./daily-admin.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused", "unverifiable"];

/** The studio's three local destinations — `?view=` keeps them deep-linkable. */
type DailyView = "calendar" | "content" | "health";

interface DialogTarget {
  date: string;
  mode?: DateDialogMode;
}

export function DailyIndex() {
  const store = useStore();
  const navigate = useNavigate();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [month, setMonth] = useState<MonthRef>(() => monthOfDate(DAILY_TODAY));
  const [rows, setRows] = useState(seedSchedule);
  const [catalog, setCatalog] = useState(seedCatalog);
  const [params, setParams] = useSearchParams();
  const [dialog, setDialog] = useState<DialogTarget | null>(() => {
    const d = params.get("date");
    return d ? { date: d } : null;
  });
  const [notice, setNotice] = useState<string | null>(null);

  /* The local destinations ride the URL so the standalone health page's
     `?date=` deep links and a refresh land where they were. */
  const viewParam = params.get("view");
  const view: DailyView = viewParam === "content" || viewParam === "health" ? viewParam : "calendar";
  const dateParam = params.get("date");

  const updateParams = (mut: (p: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        mut(next);
        return next;
      },
      { replace: true }
    );

  /* The param is the deep-link surface: opening locally writes it, a pasted
     or row-followed `?date=` opens the same dialog, and removing it closes.
     An unchanged date keeps the mode a row already picked. */
  useEffect(() => {
    setDialog((cur) =>
      dateParam ? (cur?.date === dateParam ? cur : { date: dateParam }) : null
    );
  }, [dateParam]);
  /* The catalog's own confirms — a draft's archive is the ordinary tier, a
     pristine unscheduled draft's delete is the typed one. */
  const [archiveFor, setArchiveFor] = useState<DailyCatalogEntry | null>(null);
  const [deleteFor, setDeleteFor] = useState<DailyCatalogEntry | null>(null);
  const [echo, setEcho] = useState("");

  const gap = gapIso(store);
  const cells = useMemo(() => monthCells(month), [month]);
  const monthDates = cells.filter((c): c is string => c !== null);
  const scheduledThisMonth = monthDates.filter((d) => stateOf(occupantsOf(rows, d)) === "scheduled").length;
  const riskCount = healthDates().filter((d) => stateOf(occupantsOf(rows, d)) !== "scheduled").length;
  const nearest = nearestRisk(rows);

  /* The catalog list — drafts first (they are the CRUD surface), then the
     scheduled; archived leaves the list entirely, as it leaves the pick
     tray. */
  const catalogRows = useMemo(
    () =>
      catalog
        .filter((c) => c.lifecycle !== "archived")
        .sort((a, b) =>
          a.lifecycle === b.lifecycle
            ? a.title.localeCompare(b.title)
            : a.lifecycle === "draft"
              ? -1
              : 1
        ),
    [catalog]
  );
  /* Where a draft's Assign… lands — the nearest empty product date inside
     the health window, tomorrow as the floor. The picker's date field still
     moves the target from there. */
  const firstEmptyDate =
    healthDates().find((d) => occupantsOf(rows, d).length === 0) ?? addDays(DAILY_TODAY, 1);

  const openDialog = (date: string, mode?: DateDialogMode) => {
    setDialog({ date, mode });
    updateParams((p) => p.set("date", date));
  };
  const closeDialog = () => {
    setDialog(null);
    updateParams((p) => p.delete("date"));
  };

  /* The writes. Every scheduling change is audited as part of the change —
     the dialogs say so; the demo's audit lives in the store's trail. */
  const assign = (date: string, entry: DailyCatalogEntry) => {
    /* The write-side guards the dialog already makes unreachable: an
       occupied or already-begun target writes nothing, and a move never
       reaches out of a product date that has begun. */
    if (occupantsOf(rows, date).length > 0 || isBegun(date)) return;
    if (entry.holdsDate !== null && isBegun(entry.holdsDate)) return;
    setRows((prev) => {
      const next = { ...prev };
      if (entry.holdsDate) {
        next[entry.holdsDate] = occupantsOf(next, entry.holdsDate).filter((o) => o.id !== entry.id);
      }
      next[date] = [
        ...occupantsOf(next, date),
        { id: entry.id, title: entry.title, difficulty: entry.difficulty, xp: entry.xp, bonus: null, learnerActivity: false, submissions: 0, solvers: 0 }
      ];
      return next;
    });
    setCatalog((prev) =>
      /* Assigning is an act of publishing — everPublished turns true here so
         an unscheduled-back draft can never read pristine again. */
      prev.map((c) =>
        c.id === entry.id ? { ...c, holdsDate: date, lifecycle: "published", everPublished: true } : c
      )
    );
    if (gap === date) fillDailyGap();
    setNotice(
      entry.holdsDate
        ? `“${entry.title}” moved from ${formatProductDate(entry.holdsDate)} to ${formatProductDate(date)} — audited with the change.`
        : `“${entry.title}” published onto ${formatProductDate(date)} — assigning is an act of publishing, audited with the change.`
    );
  };

  const unschedule = (date: string, occupant: DailyOccupant) => {
    setRows((prev) => ({
      ...prev,
      [date]: occupantsOf(prev, date).filter((o) => o.id !== occupant.id)
    }));
    setCatalog((prev) =>
      prev.map((c) =>
        c.id === occupant.id ? { ...c, holdsDate: null, lifecycle: "draft" } : c
      )
    );
    if (store.adminChallenges.some((c) => c.id === occupant.id)) {
      setChallengeLifecycle(occupant.id, "draft");
    }
    setNotice(`“${occupant.title}” unscheduled — ${formatProductDate(date)} is free; the challenge returned to a draft in the catalog.`);
  };

  const archive = (date: string, occupant: DailyOccupant) => {
    setRows((prev) => ({
      ...prev,
      [date]: occupantsOf(prev, date).filter((o) => o.id !== occupant.id)
    }));
    setCatalog((prev) => prev.map((c) => (c.id === occupant.id ? { ...c, holdsDate: null, lifecycle: "archived" } : c)));
    if (store.adminChallenges.some((c) => c.id === occupant.id)) {
      setChallengeLifecycle(occupant.id, "archived");
    }
    setNotice(
      `“${occupant.title}” archived — ${occupant.submissions ?? "—"} submissions · ${occupant.solvers ?? "—"} solvers preserved.`
    );
  };

  /* The catalog-scope lifecycle acts — a draft's archive and the pristine
     unscheduled draft's delete are list acts; a scheduled row's unschedule
     and archive go through its date's dialog instead. */
  const archiveEntry = (entry: DailyCatalogEntry) => {
    setCatalog((prev) =>
      prev.map((c) => (c.id === entry.id ? { ...c, lifecycle: "archived" } : c))
    );
    if (store.adminChallenges.some((c) => c.id === entry.id)) {
      setChallengeLifecycle(entry.id, "archived");
    }
    setNotice(
      `“${entry.title}” archived — ${entry.submissions ?? "—"} submissions · ${entry.solvers ?? "—"} solvers preserved. Audited with the change.`
    );
  };

  const deleteEntry = (entry: DailyCatalogEntry) => {
    /* The write-side guard the typed confirm already makes unreachable: hard
       delete reaches a pristine unscheduled draft alone. */
    if (!isPristineCatalogDraft(entry)) return;
    setCatalog((prev) => prev.filter((c) => c.id !== entry.id));
    setDeleteFor(null);
    setEcho("");
    setNotice(
      `“${entry.title}” deleted — a pristine unscheduled draft; its statement, cases and hints went with it. Audited with the change.`
    );
  };

  const loading = preview === "loading";

  return (
    <AdminPage
      kicker="Content · Daily studio"
      title="Daily challenges"
      lead="One published challenge per product date. A day with no published pick is a silent product outage — the warning is for the operator, never the learner."
      actions={<Button variant="primary" icon="plus" to="/admin/daily/new">New challenge</Button>}
    >
      {/* The studio's local destinations — Calendar is the default. */}
      <ChipTabBar
        label="Daily studio sections"
        ruled
        value={view}
        onChange={(id) => updateParams((p) => (id === "calendar" ? p.delete("view") : p.set("view", id)))}
        tabs={[
          { id: "calendar", label: "Calendar", icon: "daily" },
          { id: "content", label: "Content", icon: "list" },
          { id: "health", label: "Schedule health", icon: "check" }
        ]}
      />

      {/* State previews live in the collapsed Demo tools drawer — the page's
          face keeps the one coherent product-date scenario (Finding 9). */}
      <DemoTools>
        <PreviewChips active={preview} onChange={setPreview} allowed={allowed} />
      </DemoTools>

      {/* Summary figures — the calendar's read; unknown while loading, never zero. */}
      {view === "calendar" && (preview === "loaded" || loading) ? (
        <div className="da-stats">
          <Stat
            icon="daily"
            label={`Scheduled in ${monthLabel(month)}`}
            value={loading ? null : `${scheduledThisMonth} of ${monthDates.length}`}
          />
          <Stat
            icon="alert"
            label="Schedule risk in the health window"
            value={loading ? null : riskCount}
          />
          <Stat
            icon="clock"
            label="Nearest gap"
            value={loading ? null : nearest ? formatProductDate(nearest) : "None in the window"}
          />
        </div>
      ) : null}

      {loading ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readSchedule} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The schedule could not be read — the calendar reports unavailable rather than drawing an empty month."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          {notice ? (
            <Notice tone="success" live="polite" action={
              <Button variant="quiet" size="sm" onClick={() => setNotice(null)}>Dismiss</Button>
            }>
              {notice}
            </Notice>
          ) : null}

          {view === "calendar" ? (
          <>
          <div className="da-calwrap">
            <div className="da-cal-bar">
              <div className="da-cal-bar__nav">
                <Button variant="quiet" size="sm" onClick={() => setMonth((m) => shiftMonth(m, -1))} label="Previous month">
                  <Icon name="chevron-left" size={14} />
                </Button>
                <strong className="da-cal-bar__month numeral">{monthLabel(month)}</strong>
                <Button variant="quiet" size="sm" onClick={() => setMonth((m) => shiftMonth(m, 1))} label="Next month">
                  <Icon name="chevron-right" size={14} />
                </Button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setMonth(monthOfDate(DAILY_TODAY))}>
                Today
              </Button>
              <span className="meta da-cal-bar__legend">
                <StatusText tone="success" variant="inline" icon="check">scheduled</StatusText>
                <StatusText tone="warning" variant="inline" icon="alert">empty</StatusText>
                <StatusText tone="error" variant="inline" icon="error">blocked</StatusText>
              </span>
            </div>

            <div className="da-cal" role="group" aria-label={`${monthLabel(month)} schedule`}>
              {DAY_HEADERS.map((h) => (
                <div key={h} className="da-cal__dow" aria-hidden="true">{h}</div>
              ))}
              {cells.map((key, i) =>
                key === null ? (
                  <div key={`pad-${i}`} className="da-cal__cell is-pad" aria-hidden="true" />
                ) : (
                  <CalendarCell
                    key={key}
                    date={key}
                    occupants={occupantsOf(rows, key)}
                    isGap={gap === key}
                    onOpen={() => openDialog(key)}
                  />
                )
              )}
            </div>
          </div>

          <LoadedLine loaded={monthDates.length} total={monthDates.length} />
          <p className="meta da-note">
            Every product date in {monthLabel(month)} — what occupies it, or the affordance to fill
            it. Selection is a human act: nothing rotates or auto-fills.
          </p>
          <div className="da-dates">
            {monthDates.map((date) => (
              <DateRow
                key={date}
                date={date}
                occupants={occupantsOf(rows, date)}
                isGap={gap === date}
                onOpen={(mode) => openDialog(date, mode)}
                onEdit={() => navigate(`/admin/daily/${date}`)}
              />
            ))}
          </div>
          </>
          ) : null}

          {/* The catalog — the studio's drafts and scheduled challenges as a
              list, so every CRUD verb has a row surface. Archived leaves
              the list; a draft's Assign… lands on the nearest empty product
              date in the health window. */}
          {view === "content" ? (
          <section className="da-catalog" aria-label="Challenge catalog">
            <div className="da-catalog__head">
              <h2 className="da-catalog__title">Challenge catalog</h2>
              <span className="meta da-catalog__meta">
                {catalogRows.length} challenge{catalogRows.length === 1 ? "" : "s"} — drafts first,
                then the scheduled; archived challenges leave the list.
              </span>
              <Button variant="quiet" size="sm" icon="plus" to="/admin/daily/new">New challenge</Button>
            </div>
            <div className="da-catalog__rows">
              {catalogRows.map((entry) => (
                <CatalogRow
                  key={entry.id}
                  entry={entry}
                  occupants={entry.holdsDate ? occupantsOf(rows, entry.holdsDate) : []}
                  assignTarget={firstEmptyDate}
                  onOpen={openDialog}
                  onEdit={() => entry.holdsDate && navigate(`/admin/daily/${entry.holdsDate}`)}
                  onArchive={() => setArchiveFor(entry)}
                  onDelete={() => { setDeleteFor(entry); setEcho(""); }}
                />
              ))}
            </div>
          </section>
          ) : null}

          {/* Schedule health — the same classified window the standalone
              page renders, here reading the calendar's own live rows so a
              fix shows up the moment it lands. Each row opens the date's
              dialog in place. */}
          {view === "health" ? (
            <ScheduleHealthPanel rows={rows} onOpenDate={(d) => openDialog(d)} />
          ) : null}
        </>
      ) : null}

      {dialog && preview === "loaded" ? (
        <DateDialog
          date={dialog.date}
          initialMode={dialog.mode}
          occupantsOf={(d) => occupantsOf(rows, d)}
          catalog={catalog}
          onClose={closeDialog}
          onAssign={assign}
          onUnschedule={unschedule}
          onArchive={archive}
        />
      ) : null}

      {/* The catalog's own confirms — a draft's archive states its blast
          radius first and stays unreachable where the count could not be
          produced; a pristine unscheduled draft's delete is the typed tier. */}
      <Dialog
        open={archiveFor !== null}
        title={archiveFor ? `Archive ${archiveFor.title}?` : "Archive?"}
        icon="inbox"
        tone="destructive"
        onClose={() => setArchiveFor(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setArchiveFor(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={archiveFor !== null && countsUnread(archiveFor)}
              onClick={() => { if (archiveFor) { archiveEntry(archiveFor); setArchiveFor(null); } }}
            >
              Archive
            </Button>
          </>
        }
      >
        {archiveFor ? (
          countsUnread(archiveFor) ? (
            <Notice tone="error" title="Blast radius unknown">
              The submissions and solver counts could not be produced — the confirmation stays
              unreachable rather than proceeding on a guessed figure.
            </Notice>
          ) : (
            <p>
              Archiving hides the challenge from the learner catalog. Blast radius:{" "}
              {archiveFor.submissions ?? "—"} submission{archiveFor.submissions === 1 ? "" : "s"} ·{" "}
              {archiveFor.solvers ?? "—"} solver{archiveFor.solvers === 1 ? "" : "s"} — learner
              progress rows are preserved. A zero blast radius is a real answer and proceeds.
            </p>
          )
        ) : null}
      </Dialog>

      <Dialog
        open={deleteFor !== null}
        title={deleteFor ? `Delete ${deleteFor.title} permanently?` : "Delete?"}
        icon="trash"
        tone="destructive"
        onClose={() => { setDeleteFor(null); setEcho(""); }}
      >
        {deleteFor ? (
          <>
            <p>
              Hard delete reaches a pristine unscheduled draft alone — never published, no learner
              contact, holding no product date. Its statement, cases and hints go with it; this
              cannot be undone.
            </p>
            <ConfirmByTyping phrase={deleteFor.title} value={echo} onChange={setEcho}>
              {(matched) => (
                <Button variant="destructive" disabled={!matched} onClick={() => deleteEntry(deleteFor)}>
                  Delete permanently
                </Button>
              )}
            </ConfirmByTyping>
          </>
        ) : null}
      </Dialog>
    </AdminPage>
  );
}

/* ── The calendar cell ────────────────────────────────────────────────────── */

function CalendarCell({
  date,
  occupants,
  isGap,
  onOpen
}: {
  date: string;
  occupants: DailyOccupant[];
  isGap: boolean;
  onOpen: () => void;
}) {
  const state = stateOf(occupants);
  const begun = isBegun(date);
  const risk = !begun && inHealthWindow(date) && state !== "scheduled";
  const first = occupants[0];
  const label =
    state === "clash"
      ? `${formatProductDate(date)}: blocked — ${occupants.map((o) => o.title).join(" and ")} both hold the date`
      : first
        ? `${formatProductDate(date)}: ${first.title}`
        : begun
          ? `${formatProductDate(date)}: a neutral date — nothing was scheduled`
          : `${formatProductDate(date)}: empty — assign a challenge`;

  return (
    <button
      type="button"
      className="da-cal__cell"
      data-state={state}
      data-today={date === DAILY_TODAY || undefined}
      data-past={begun || undefined}
      data-risk={risk || undefined}
      aria-label={label}
      onClick={onOpen}
    >
      <span className="da-cal__num">{Number(date.slice(8))}</span>
      {state === "clash" ? (
        <span className="da-cal__pill" data-state="clash">clash — 2 hold it</span>
      ) : first ? (
        <span className="da-cal__pill" data-difficulty={first.difficulty}>
          {first.title}
        </span>
      ) : begun ? (
        <span className="da-cal__none" aria-hidden="true">·</span>
      ) : (
        <span className="da-cal__add" aria-hidden="true"><Icon name="plus" size={13} /></span>
      )}
      {isGap ? <span className="da-cal__gapflag">gap</span> : null}
      {risk && !isGap ? <span className="da-cal__riskflag">risk</span> : null}
    </button>
  );
}

/* ── The per-date list row ────────────────────────────────────────────────── */

function DateRow({
  date,
  occupants,
  isGap,
  onOpen,
  onEdit
}: {
  date: string;
  occupants: DailyOccupant[];
  isGap: boolean;
  onOpen: (mode?: DateDialogMode) => void;
  /** Opens the occupant's studio — content editing, distinct from the
      scheduling acts in the menu. */
  onEdit: () => void;
}) {
  const state = stateOf(occupants);
  const begun = isBegun(date);
  const today = date === DAILY_TODAY;
  const risk = !begun && inHealthWindow(date) && state !== "scheduled";
  const first = occupants[0];

  /* The occupied row's tail: the assignment's Manage… is the primary act;
     everything else lives in the three-dot menu — Edit content reaches the
     studio while Move…/Unschedule keep their begun-date and learner-contact
     refusals (absent where refused, never failing). */
  const occupantMenu: MenuItem[] = first
    ? [
        { id: "edit", label: "Edit content", icon: "edit" },
        ...(!begun && !first.learnerActivity
          ? ([
              { id: "move", label: "Move…", icon: "daily" },
              { id: "unschedule", label: "Unschedule", icon: "minus" }
            ] satisfies MenuItem[])
          : []),
        { id: "archive", label: "Archive…", icon: "inbox", destructive: true }
      ]
    : [];

  return (
    <ListRow
      as="article"
      align="center"
      className="da-date-row"
      data-state={state}
      data-today={today || undefined}
      data-risk={risk || undefined}
    >
      <div className="da-date-row__date">
        <strong className="numeral">{formatProductDate(date, true)}</strong>
        {today ? <StatusText tone="info" icon="clock">today</StatusText> : null}
        {isGap ? <StatusText tone="warning" icon="alert">the registered gap</StatusText> : null}
        {risk && !isGap ? <StatusText tone="warning" icon="alert">schedule risk</StatusText> : null}
      </div>

      <div className="da-date-row__body">
        {state === "clash" ? (
          <>
            <StatusText tone="error" icon="error">blocked</StatusText>
            <span>
              {occupants.map((o) => `“${o.title}”`).join(" and ")} both hold this product date — a
              duplicate-date fault; keep one published, return the other to draft.
            </span>
          </>
        ) : first ? (
          <>
            <StatusText tone="success" icon="check">scheduled</StatusText>
            <span>
              <strong>{first.title}</strong>{" "}
              <span className="meta">
                {first.difficulty} · {first.xp} XP{first.bonus ? ` · +${first.bonus} bonus` : ""}
                {first.learnerActivity ? " · carries learner activity" : ""}
              </span>
            </span>
          </>
        ) : begun ? (
          <span className="meta">A neutral date — nothing was scheduled, and the date has begun.</span>
        ) : (
          <>
            <StatusText tone="neutral">empty</StatusText>
            <span className="meta">Nothing published occupies this product date.</span>
          </>
        )}
      </div>

      <div className="row da-date-row__acts">
        {state === "empty" && !begun ? (
          <Button variant="secondary" size="sm" onClick={() => onOpen()}>Assign…</Button>
        ) : null}
        {state === "scheduled" && first ? (
          <>
            <Button variant="secondary" size="sm" onClick={() => onOpen()}>Manage…</Button>
            <Menu
              align="end"
              trigger={<Icon name="more" size={16} />}
              triggerLabel={`Actions for ${first.title}`}
              items={occupantMenu}
              onSelect={(id) => {
                if (id === "edit") onEdit();
                else if (id === "move") onOpen({ kind: "assign", entryId: first.id, freshTarget: true });
                else if (id === "unschedule") onOpen({ kind: "unschedule", occupant: first });
                else if (id === "archive") onOpen({ kind: "archive", occupant: first });
              }}
            />
          </>
        ) : null}
        {state === "clash" ? (
          <Button variant="secondary" size="sm" onClick={() => onOpen()}>Resolve…</Button>
        ) : null}
      </div>
    </ListRow>
  );
}

/* ── The catalog row — a draft or a scheduled challenge with its verbs ───── */

function CatalogRow({
  entry,
  occupants,
  assignTarget,
  onOpen,
  onEdit,
  onArchive,
  onDelete
}: {
  entry: DailyCatalogEntry;
  /** The occupants of the entry's held date — empty for a draft. */
  occupants: DailyOccupant[];
  /** Where a draft's Assign… lands — the nearest empty product date. */
  assignTarget: string;
  onOpen: (date: string, mode?: DateDialogMode) => void;
  /** Opens the held date's studio — only a scheduled entry has one. */
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const held = entry.holdsDate;
  const occ = held ? occupants.find((o) => o.id === entry.id) ?? null : null;
  const clash = held !== null && stateOf(occupants) === "clash";
  /* Move and unschedule reach only a Daily still ahead of its product date
     and untouched by any learner — the controls are absent where refused,
     never failing. */
  const movable = held !== null && !isBegun(held) && occ !== null && !occ.learnerActivity;
  const pristine = isPristineCatalogDraft(entry);
  const unread = countsUnread(entry);

  return (
    <ListRow
      as="article"
      align="center"
      className="da-cat-row"
      data-state={clash ? "clash" : entry.lifecycle}
    >
      <div className="da-cat-row__body">
        {clash ? (
          <StatusText tone="error" icon="error">blocked</StatusText>
        ) : held ? (
          <StatusText tone="success" icon="check">scheduled</StatusText>
        ) : (
          <StatusText tone="neutral">draft</StatusText>
        )}
        <span>
          <strong>{entry.title}</strong>{" "}
          <span className="meta">
            {entry.difficulty} · {entry.xp} XP
            {held ? ` · holds ${formatProductDate(held)}` : " · assigning publishes it"}
            {entry.lifecycle === "draft" && entry.gateReady === false
              ? ` · the publish gate refuses: ${entry.gateMissing}`
              : ""}
          </span>
        </span>
        {unread ? (
          <span className="meta da-cat-row__unread">
            learner-contact counts unread — destructive acts stay unreachable
          </span>
        ) : null}
      </div>

      <div className="row da-cat-row__acts">
        {held ? (
          <>
            {/* A scheduled challenge's next level is its studio; the
                scheduling and lifecycle verbs live in the menu. */}
            <Button variant="secondary" size="sm" onClick={onEdit}>Edit content</Button>
            <Menu
              align="end"
              trigger={<Icon name="more" size={16} />}
              triggerLabel={`Actions for ${entry.title}`}
              items={[
                ...(movable && occ
                  ? ([
                      { id: "move", label: "Move…", icon: "daily" },
                      { id: "unschedule", label: "Unschedule", icon: "minus" }
                    ] satisfies MenuItem[])
                  : []),
                { id: "archive", label: "Archive…", icon: "inbox", destructive: true }
              ]}
              onSelect={(id) => {
                if (id === "move") onOpen(held, { kind: "assign", entryId: entry.id, freshTarget: true });
                else if (id === "unschedule" && occ) onOpen(held, { kind: "unschedule", occupant: occ });
                else if (id === "archive") (occ ? onOpen(held, { kind: "archive", occupant: occ }) : onArchive());
              }}
            />
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpen(assignTarget, { kind: "assign", entryId: entry.id })}
            >
              Assign…
            </Button>
            <Menu
              align="end"
              trigger={<Icon name="more" size={16} />}
              triggerLabel={`Actions for ${entry.title}`}
              items={[
                { id: "archive", label: "Archive…", icon: "inbox", destructive: true },
                ...(pristine
                  ? ([{ id: "delete", label: "Delete…", icon: "trash", destructive: true }] satisfies MenuItem[])
                  : [])
              ]}
              onSelect={(id) => {
                if (id === "archive") onArchive();
                else if (id === "delete") onDelete();
              }}
            />
          </>
        )}
      </div>
    </ListRow>
  );
}
