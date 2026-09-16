/**
 * Daily — the learner's Daily overview and the dated archive.
 *
 * Today is the product clock's today (21 Aug 2026) — the demo's scenario is
 * fixed, so the page states the product date plainly instead of implying a
 * real clock runs. The hero carries exactly one legitimate action by state:
 * Solve, Continue (a device draft exists) or Review (the date is complete).
 * History stays secondary; a neutral day says so and offers an eligible past
 * item where one remains.
 */

import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { useStore } from "@state/useStore";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { xpFor, detailFor, languageLabel } from "../practice/data";
import {
  PRODUCT_TODAY,
  DAILY_BONUS_XP,
  VOIDED,
  formatProductDay,
  openCatchUp,
  pastEntries,
  stateForDate,
  weekStrip
} from "./schedule";
import { CHALLENGES } from "@data/catalog";

export function Daily() {
  const store = useStore();
  const today = stateForDate(PRODUCT_TODAY);
  const todaySolved = store.dailySolved.includes(PRODUCT_TODAY);
  const todayChallenge = today.kind === "scheduled" ? today.challenge : null;
  const draftKeys = Object.keys(store.challengeDrafts).filter((k) => k.startsWith(`${todayChallenge?.id ?? "\0"}:`));
  const hasDraft = todayChallenge ? draftKeys.length > 0 : false;
  const catchUp = openCatchUp(store.dailySolved);
  /* Only an eligible today can put the streak at risk — a neutral or voided
     date carries nothing to keep alive, so the marker is suppressed (daily
     §4.6: the walk steps over neutral dates, breaking nothing). */
  const streakAtRisk = today.kind === "scheduled" && !todaySolved;

  /* Exactly one legitimate primary action, decided by state. */
  const heroAction = todaySolved
    ? { to: `/daily/${PRODUCT_TODAY}`, label: "Review today's record" }
    : hasDraft
      ? { to: "/daily/solve", label: "Continue today's solve" }
      : { to: "/daily/solve", label: "Solve today's challenge" };

  return (
    <Page
      kind="sink"
      kicker={`Practice · ${formatProductDay(PRODUCT_TODAY)}`}
      title="Daily challenge"
      lead="One challenge per product date. The demo's product clock is fixed at 21 Aug 2026 — this window does not close on the real clock."
      actions={<Link className="btn btn--quiet" to="/daily/archive">History</Link>}
    >
      <div className="grid-2">
        <Card live>
          {today.kind === "scheduled" ? (
            todayChallenge ? (
              <>
                <CardHeader
                  eyebrow={todaySolved ? "Today — solved" : "Today"}
                  title={todayChallenge.title}
                  icon="daily"
                />
                <p className="page__lead">{todayChallenge.prompt.split("\n")[0]}</p>
                <div className="row" style={{ marginTop: "var(--space-2)" }}>
                  <span className="chip chip--quiet">{todayChallenge.difficulty}</span>
                  <span className="chip chip--quiet">{xpFor(todayChallenge.difficulty)} + {DAILY_BONUS_XP} bonus XP</span>
                  {detailFor(todayChallenge.id).languages.slice(0, 3).map((l) => (
                    <span className="chip chip--quiet" key={l}>{languageLabel(l)}</span>
                  ))}
                </div>
                <div className="row" style={{ marginTop: "var(--space-4)" }}>
                  <Link className="btn btn--primary" to={heroAction.to}>{heroAction.label}</Link>
                </div>
                {todaySolved ? (
                  <p className="meta" style={{ marginTop: "var(--space-3)" }}>Completed — today counts. The solve itself keeps its usual record.</p>
                ) : hasDraft ? (
                  <p className="meta" style={{ marginTop: "var(--space-3)" }}>A device draft is held for today — it restores when you continue.</p>
                ) : null}
              </>
            ) : (
              <StateBlock
                state="unavailable"
                message="Today's Daily is scheduled, but its content is not part of this demo's learner catalogue — the item cannot open here. The date itself is real."
              />
            )
          ) : today.kind === "voided" ? (
            <StateBlock state="refused" message={`Today was voided — ${today.reason}`} />
          ) : (
            <>
              <CardHeader eyebrow="Today" title="No Daily today" icon="daily" />
              <p className="page__lead">Nothing was scheduled for this product date — a neutral day, not an error.</p>
              {catchUp ? (
                <>
                  <p className="meta">An earlier Daily is still open for you — catch-up pays the full award.</p>
                  <div className="row" style={{ marginTop: "var(--space-3)" }}>
                    <Link className="btn btn--primary" to={`/daily/${catchUp.date}`}>
                      Solve {formatProductDay(catchUp.date)}'s Daily
                    </Link>
                  </div>
                </>
              ) : (
                <p className="meta">Every past Daily on this device is already complete — there is no catch-up to offer.</p>
              )}
            </>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-gap)" }}>
          <Card>
            <CardHeader title="Streak" icon="flame" />
            <p style={{ margin: "4px 0", fontSize: "var(--text-3xl)", fontWeight: 700 }}>
              {store.profile.streak}
              <span className="meta" style={{ fontSize: "var(--text-sm)", fontWeight: 400 }}> days</span>
            </p>
            <p className="meta">
              {streakAtRisk
                ? "At risk today — solving today's Daily keeps it."
                : today.kind === "scheduled"
                  ? "Today counts — the streak is safe."
                  : "Today is neutral — the streak is untouched either way."}
            </p>
          </Card>

          <Card>
            <CardHeader title="Last 7 days" icon="list" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginTop: "var(--space-2)" }}>
              {weekStrip().map(({ date, state }) => {
                const solved = store.dailySolved.includes(date);
                const isToday = date === PRODUCT_TODAY;
                const label =
                  state.kind === "scheduled"
                    ? solved ? "Solved" : "Open"
                    : state.kind === "voided" ? "Voided" : state.kind === "neutral" ? "Neutral" : "—";
                return (
                  <div
                    key={date}
                    title={`${formatProductDay(date)} — ${label}`}
                    style={{
                      textAlign: "center",
                      padding: "6px 2px",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${isToday ? "var(--c-accent-primary)" : "var(--c-border)"}`,
                      fontSize: "11px",
                      color: "var(--c-text-muted)"
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{date.slice(8)}</div>
                    <div style={{ fontSize: "10px", color: solved ? "var(--c-accent-primary)" : "var(--c-text-faint)" }}>
                      {state.kind === "scheduled" ? (solved ? "✓" : "○") : state.kind === "voided" ? "–" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="meta" style={{ marginTop: "var(--space-2)" }}>
              ✓ completed · ○ scheduled, still open · – voided · · nothing scheduled
            </p>
          </Card>

          {todaySolved && catchUp ? (
            <Card>
              <CardHeader title="Catch up" icon="zap" />
              <p className="meta">
                {formatProductDay(catchUp.date)}'s Daily is still open — catch-up pays the full award.
              </p>
              <div style={{ marginTop: "var(--space-2)" }}>
                <Link className="btn btn--secondary" to={`/daily/${catchUp.date}`}>
                  {CHALLENGES.find((c) => c.id === catchUp.challengeId)?.title ?? catchUp.challengeId}
                </Link>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </Page>
  );
}

export function DailyArchive() {
  const store = useStore();
  const past = pastEntries();
  /* Voided dates sit in the same list as recorded neutrals — an honest
     absence with its reason, never an error row. */
  const voidedRows = Object.entries(VOIDED)
    .filter(([date]) => date <= PRODUCT_TODAY)
    .map(([date, reason]) => ({ date, reason }));
  const rows = [
    ...past.map((e) => ({ kind: "entry" as const, entry: e, date: e.date })),
    ...voidedRows.map((v) => ({ kind: "voided" as const, reason: v.reason, date: v.date }))
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Daily history"
      lead="Past Dailies by product date — a missed day stays open, and catch-up pays the full award."
      actions={<Back to="/daily">Today</Back>}
    >
      {rows.length === 0 ? (
        <Card><StateBlock state="empty" message="No past Dailies are recorded for this learner." /></Card>
      ) : (
        <List>
          {rows.map((row) =>
            row.kind === "voided" ? (
              <ListRow key={row.date} as="div" align="center">
                <div style={{ flex: 1 }}>
                  <strong>Voided day</strong>
                  <p className="meta" style={{ margin: "2px 0 0" }}>{formatProductDay(row.date)} · {row.reason}</p>
                </div>
                <span className="chip chip--quiet" style={{ fontSize: "11px" }}>Neutral</span>
              </ListRow>
            ) : (
              <ArchiveEntryRow key={row.date} entry={row.entry} solved={store.dailySolved.includes(row.date)} />
            )
          )}
        </List>
      )}
      <p className="meta">That is the whole recorded run — there are no older entries to load.</p>
    </Page>
  );
}

function ArchiveEntryRow({ entry, solved }: { entry: { date: string; challengeId: string }; solved: boolean }) {
  const c = CHALLENGES.find((x) => x.id === entry.challengeId) ?? null;
  return (
    <ListRow to={`/daily/${entry.date}`} done={solved} align="center">
      <div style={{ flex: 1 }}>
        <strong>{c?.title ?? entry.challengeId}</strong>
        <p className="meta" style={{ margin: "2px 0 0" }}>
          {formatProductDay(entry.date)}
          {c ? ` · ${c.difficulty} · ${xpFor(c.difficulty)} + ${DAILY_BONUS_XP} bonus XP` : " · not in this demo's catalogue"}
        </p>
      </div>
      {solved ? (
        <span className="chip" style={{ fontSize: "11px" }}>✓ Solved</span>
      ) : (
        <span className="chip chip--quiet" style={{ fontSize: "11px" }}>Open — catch up</span>
      )}
      <Icon name="chevron-right" size={14} />
    </ListRow>
  );
}
