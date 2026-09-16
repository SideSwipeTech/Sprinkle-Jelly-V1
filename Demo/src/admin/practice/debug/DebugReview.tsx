/**
 * DebugReview — `debug/review`. The domain's content review (debug.F23,
 * debug/01 "Content review", debug/05 K04):
 *
 *   - cases ordered worst fix rate first; a case never submitted to sorts
 *     below every case carrying a real rate;
 *   - each case shows the opened → submitted → fixed funnel (unique eligible
 *     learners, so repeats stay diagnostics), the reasons it needs review,
 *     and actual solve times against the authored budget;
 *   - timed and practice figures are reported separately and never averaged;
 *   - a rate with no denominator is a dash, a loading tile is a dash, and
 *     every time figure carries a quality label scoped to itself — the closed
 *     four honesty labels, this domain inventing no freshness word;
 *   - figures carry their computed-at — when they were recalculated, never
 *     when the screen was opened;
 *   - the ONE export carries the same bounded view, capped at
 *     PLATFORM_EXPORT_ROW_CAP and saying in its own name when it truncated.
 *
 * Aggregate only — identifiers, counts, categories and dates, never learner
 * text. This domain judges no learner. Read-only: each card's Open reaches
 * the case studio, the single way into a case from this surface.
 */

import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { useStore } from "@state/useStore";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { StaleNote } from "../../../extraction/components/StaleNote/StaleNote";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  formatPercent,
  usePreview,
  type PreviewKey
} from "../../assessments/shared";
import {
  ACTION,
  DEBUG_CASE_STATS,
  DEBUG_FIXTURE_ROWS,
  FIG,
  fixRate,
  fmtMinutes,
  recordAudit,
  reviewOrder,
  reviewReasons,
  type DebugCaseRow,
  type DebugModeStats
} from "./fixtures";
import { DebugTabs } from "./DebugTabs";
import "./debug-admin.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

function asLifecycle(v: string): DebugCaseRow["lifecycle"] {
  return v === "published" || v === "archived" ? v : "draft";
}

/** Text a spreadsheet would treat as a formula is neutralised. */
function csvCell(v: string | number): string {
  const s = String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** One side of a case: its figures or an honest absence. */
function ModePanel({ kind, stats }: { kind: "Timed" | "Practice"; stats: DebugModeStats | null }) {
  if (!stats) {
    return (
      <div className="dbg-mode" data-absent>
        <p className="micro dbg-mode__kind">{kind}</p>
        <p className="meta">Not offered on this case — an honest absence, not a zero.</p>
      </div>
    );
  }
  const rate = stats.starters > 0 ? stats.accepted / stats.starters : null;
  const carriedOn = stats.carriedOn && stats.carriedOn.of > 0 ? stats.carriedOn.count / stats.carriedOn.of : null;
  const failures = stats.platformFailures && stats.platformFailures.of > 0
    ? stats.platformFailures.count / stats.platformFailures.of
    : null;
  return (
    <div className="dbg-mode">
      <p className="micro dbg-mode__kind">{kind}</p>
      <dl className="dbg-figures">
        <div className="dbg-figure"><dt>Unique starters</dt><dd>{stats.starters}</dd></div>
        <div className="dbg-figure"><dt>Accepted</dt><dd>{stats.accepted}</dd></div>
        <div className="dbg-figure"><dt>Acceptance rate</dt><dd>{formatPercent(rate) ?? "—"}</dd></div>
        <div className="dbg-figure">
          <dt>{kind === "Timed" ? "Median timed period" : "Median time to fix"}</dt>
          <dd>
            {fmtMinutes(stats.medianSolve.minutes)}{" "}
            <span className="dbg-quality">· {stats.medianSolve.label}</span>
          </dd>
        </div>
        {kind === "Timed" ? (
          <>
            <div className="dbg-figure"><dt>Allowance exhausted</dt><dd>{stats.allowanceExhausted ?? "—"}</dd></div>
            <div className="dbg-figure">
              <dt>Carried on into practice</dt>
              <dd>{stats.carriedOn ? `${formatPercent(carriedOn) ?? "—"} (${stats.carriedOn.count} of ${stats.carriedOn.of})` : "—"}</dd>
            </div>
          </>
        ) : (
          <>
            <div className="dbg-figure">
              <dt>Median validations before acceptance</dt>
              <dd>
                {stats.medianValidations?.value ?? "—"}{" "}
                <span className="dbg-quality">· {stats.medianValidations?.label ?? "unavailable"}</span>
              </dd>
            </div>
            <div className="dbg-figure"><dt>Hint reveals</dt><dd>{stats.hintReveals ?? "—"}</dd></div>
            <div className="dbg-figure">
              <dt>Platform-failure rate</dt>
              <dd>{stats.platformFailures ? `${formatPercent(failures) ?? "—"} (${stats.platformFailures.count} of ${stats.platformFailures.of})` : "—"}</dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
}

export function DebugReview() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);

  /* The review reads published and archived cases — a draft nobody has met
     carries no funnel. Lifecycle reads the store row where one exists; the
     fixture rows carry their own. Read-only here — the per-card Open reaches
     the case studio, the only way into a case from this surface. */
  const rows = reviewOrder(
    [...Object.values(DEBUG_CASE_STATS), ...DEBUG_FIXTURE_ROWS]
      .map((s) => {
        const row = store.adminDebugCases.find((c) => c.id === s.id);
        return row ? { ...s, title: row.title, lifecycle: row.lifecycle as DebugCaseRow["lifecycle"] } : s;
      })
      .filter((r) => r.lifecycle !== "draft")
  );
  const ratedCount = rows.filter((r) => r.submitted > 0).length;
  const unratedCount = rows.length - ratedCount;
  const computedAt = rows[0]?.computedAt ?? null;
  const loading = preview === "loading";

  /* The studio list's lifecycle read — moved here from the case list, which
     is for authoring. It counts the same whole list the index draws: the
     store's rows plus the fixture-only rows, drafts included — a draft
     simply enters no review figure below. */
  const lifecycleCounts = { published: 0, draft: 0, archived: 0 };
  for (const c of store.adminDebugCases) lifecycleCounts[asLifecycle(c.lifecycle)] += 1;
  for (const d of DEBUG_FIXTURE_ROWS) lifecycleCounts[d.lifecycle] += 1;

  function exportReview() {
    const generatedAt = new Date().toISOString();
    const stamp = generatedAt.slice(0, 19).replace(/[:T]/g, "-");
    const truncated = rows.length > FIG.PLATFORM_EXPORT_ROW_CAP;
    const body = rows.slice(0, FIG.PLATFORM_EXPORT_ROW_CAP);
    const csv = [
      `generated_at,${csvCell(generatedAt)}`,
      "case,lifecycle,opened,submitted,fixed,fix_rate,budget_minutes,timed_starters,timed_accepted,timed_rate,timed_median_minutes,timed_median_label,allowance_exhausted,carried_on,practice_starters,practice_accepted,practice_rate,practice_median_minutes,practice_median_label,median_validations,hint_reveals,platform_failures,computed_at",
      ...body.map((r) =>
        [
          r.id,
          r.lifecycle,
          r.opened,
          r.submitted,
          r.fixed,
          fixRate(r)?.toFixed(3) ?? "",
          r.budgetMinutes ?? "",
          r.timed?.starters ?? "",
          r.timed?.accepted ?? "",
          r.timed && r.timed.starters > 0 ? (r.timed.accepted / r.timed.starters).toFixed(3) : "",
          r.timed?.medianSolve.minutes ?? "",
          r.timed?.medianSolve.label ?? "",
          r.timed?.allowanceExhausted ?? "",
          r.timed?.carriedOn ? `${r.timed.carriedOn.count}/${r.timed.carriedOn.of}` : "",
          r.practice?.starters ?? "",
          r.practice?.accepted ?? "",
          r.practice && r.practice.starters > 0 ? (r.practice.accepted / r.practice.starters).toFixed(3) : "",
          r.practice?.medianSolve.minutes ?? "",
          r.practice?.medianSolve.label ?? "",
          r.practice?.medianValidations?.value ?? "",
          r.practice?.hintReveals ?? "",
          r.practice?.platformFailures ? `${r.practice.platformFailures.count}/${r.practice.platformFailures.of}` : "",
          r.computedAt
        ].map(csvCell).join(",")
      )
    ].join("\n");
    const name = `debug-content-review-generated-${stamp}${truncated ? `-truncated-at-${FIG.PLATFORM_EXPORT_ROW_CAP}` : ""}.csv`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    /* The export is a recorded read — committed with the download. */
    recordAudit(`Export taken — debug content review; the whole bounded view, ${body.length} rows${truncated ? `, truncated at ${FIG.PLATFORM_EXPORT_ROW_CAP}` : ""}`);
  }

  return (
    <AdminPage
      kicker="Content · Debug studio"
      title="Content review"
      lead="Cases ordered worst fix rate first — a case never submitted to sits below every case carrying a real rate. Aggregate only; this domain judges no learner."
      actions={
        <Button variant="secondary" size="sm" icon="download" onClick={exportReview} disabled={rows.length === 0}>
          Export the bounded view
        </Button>
      }
    >
      <DebugTabs current="review" />

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readReview} /> : null}

      {preview === "loaded" || loading ? (
        <>
          <div className="admin-health">
            {/* A loading tile is a dash — never a manufactured zero. */}
            <div className="admin-health__cell"><Stat label="Cases in review" value={loading ? null : rows.length} /></div>
            <div className="admin-health__cell"><Stat label="Carrying a real fix rate" value={loading ? null : ratedCount} /></div>
            <div className="admin-health__cell"><Stat label="Never submitted to" value={loading ? null : unratedCount} /></div>
          </div>

          <div className="dbg-strip">
            <p className="micro dbg-strip__label">
              The studio list by lifecycle — the read the case list used to carry; a draft carries no
              funnel and enters no review figure
            </p>
            <div className="admin-health">
              <div className="admin-health__cell"><Stat label="Published" value={loading ? null : lifecycleCounts.published} /></div>
              <div className="admin-health__cell"><Stat label="Drafts" value={loading ? null : lifecycleCounts.draft} /></div>
              <div className="admin-health__cell"><Stat label="Archived" value={loading ? null : lifecycleCounts.archived} /></div>
            </div>
          </div>

          {computedAt && !loading ? (
            <StaleNote asOf={computedAt}>
              Figures recomputed — the caption is when they were recalculated, not when this screen opened.
            </StaleNote>
          ) : null}

          {loading ? (
            <StudioLoading />
          ) : rows.length === 0 ? (
            <Card>
              <StateBlock state="empty" message="Nothing to review — no case carries learner contact yet. An empty review is a reading in its own right." />
            </Card>
          ) : (
            <>
              {rows.map((r, i) => {
                const rate = fixRate(r);
                const reasons = reviewReasons(r, i === 0 && r.submitted > 0);
                return (
                  <Card key={r.id}>
                    <CardHeader
                      title={r.title}
                      icon="debug"
                      eyebrow={`${r.id} · ${r.lifecycle} · ${r.mode} · recomputed ${r.computedAt}`}
                      action={
                        <span className="dbg-card-acts">
                          <Chip size="sm" variant="quiet">fix rate {formatPercent(rate) ?? "—"}</Chip>
                          <Button variant="quiet" size="sm" icon="edit" to={`/admin/debug/${r.id}`}>Open</Button>
                        </span>
                      }
                    />
                    <div className="dbg-funnel" role="group" aria-label={`${r.title} funnel`}>
                      <div className="dbg-funnel__cell"><span className="numeral dbg-funnel__num">{r.opened}</span><span className="micro">opened</span></div>
                      <span className="dbg-funnel__arrow" aria-hidden="true">→</span>
                      <div className="dbg-funnel__cell"><span className="numeral dbg-funnel__num">{r.submitted}</span><span className="micro">submitted</span></div>
                      <span className="dbg-funnel__arrow" aria-hidden="true">→</span>
                      <div className="dbg-funnel__cell"><span className="numeral dbg-funnel__num">{r.fixed}</span><span className="micro">fixed</span></div>
                      <div className="dbg-funnel__cell dbg-funnel__rate" data-empty={rate === null || undefined}>
                        <span className="numeral dbg-funnel__num">{formatPercent(rate) ?? "—"}</span>
                        <span className="micro">fix rate{rate === null ? " — no denominator" : ""}</span>
                      </div>
                    </div>

                    <div className="dbg-review-grid">
                      <div className="dbg-budget">
                        <p className="micro dbg-mode__kind">Solve times against the authored budget</p>
                        <dl className="dbg-figures">
                          <div className="dbg-figure">
                            <dt>Authored budget</dt>
                            <dd>{r.budgetMinutes !== null ? fmtMinutes(r.budgetMinutes) : "—"}{r.budgetMinutes === null ? <span className="dbg-quality"> · none authored</span> : null}</dd>
                          </div>
                          <div className="dbg-figure">
                            <dt>Actual — timed</dt>
                            <dd>{r.timed ? <>{fmtMinutes(r.timed.medianSolve.minutes)} <span className="dbg-quality">· {r.timed.medianSolve.label}</span></> : "—"}</dd>
                          </div>
                          <div className="dbg-figure">
                            <dt>Actual — practice</dt>
                            <dd>{r.practice ? <>{fmtMinutes(r.practice.medianSolve.minutes)} <span className="dbg-quality">· {r.practice.medianSolve.label}</span></> : "—"}</dd>
                          </div>
                        </dl>
                        {reasons.length > 0 ? (
                          <ul className="dbg-reasons" aria-label="Review reasons">
                            {reasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="meta dbg-flush">No review reason derived — the figures stand on their own.</p>
                        )}
                      </div>
                      <div className="dbg-modes">
                        <ModePanel kind="Timed" stats={r.timed} />
                        <ModePanel kind="Practice" stats={r.practice} />
                      </div>
                    </div>
                    <p className="meta dbg-flush">
                      Timed and practice are reported separately and never averaged. Rates count unique
                      eligible learners — a refusal, a run and an open enter no figure.
                    </p>
                  </Card>
                );
              })}
              <LoadedLine loaded={rows.length} total={rows.length} />
              <p className="meta dbg-flush">
                The export carries this same bounded view and says in its own name when it truncated at{" "}
                {FIG.PLATFORM_EXPORT_ROW_CAP} rows — the only export in this domain.
              </p>
            </>
          )}
        </>
      ) : null}
    </AdminPage>
  );
}
