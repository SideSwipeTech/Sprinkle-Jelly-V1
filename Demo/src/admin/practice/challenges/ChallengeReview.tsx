/**
 * ChallengeReview — `challenges/review`. The content review for the practice
 * catalogue (challenges.F25):
 *
 *   per challenge   worst first by lowest acceptance rate, unmeasured rows at
 *                   the bottom, filterable by review reason — the six-member
 *                   coding-practice namespace, each raised reason stating what
 *                   it measured, its denominator, its threshold, its period
 *                   and when it was calculated
 *   per track       how many learners started and completed each track and
 *                   where they stopped
 *
 * Both export. A challenge with no activity shows an honest zero of zero, or
 * a dash where a rate cannot be computed; every figure states when it was
 * computed; analytics that could not be read are stated as unavailable —
 * never as nothing needs review. The lists rank content, never learners.
 *
 * Fixture state only.
 */

import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { useStore } from "@state/useStore";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { Select } from "../../../extraction/components/Select/Select";
import { DataTable } from "../../../extraction/components/DataTable/DataTable";
import { FilterBar } from "../../../extraction/components/FilterBar/FilterBar";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../../assessments/shared";
import {
  ACTION,
  acceptanceLabel,
  acceptanceOf,
  challengeRows,
  exportCsv,
  FIG,
  fmtInstant,
  languageLabel,
  REVIEW,
  REVIEW_REASON_LABEL,
  REVIEW_REASONS,
  type ReviewReason
} from "./fixtures";
import "./challenges-admin.css";

export function ChallengeReview() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [reason, setReason] = useState<"all" | ReviewReason>("all");

  /* Studio-resolvable ids — a review row links into the studio where the
     challenge resolves, and renders unlinked where it does not. */
  const resolvable = useMemo(() => new Set(store.adminChallenges.map((c) => c.id)), [store]);

  /* The library's lifecycle figures — the strip the authoring index used to
     carry. Counted over the whole catalogue, so the tiles always sum to the
     library count; the tables below rank measured performance. */
  const lifecycleCounts = useMemo(() => {
    const c = { published: 0, draft: 0, submitted: 0, archived: 0 };
    for (const r of challengeRows(store)) c[r.lifecycle] += 1;
    return c;
  }, [store]);

  /* Worst first by lowest acceptance rate; unmeasured rows at the bottom. */
  const sorted = useMemo(() => {
    const rows = REVIEW.challenges
      .filter((r) => reason === "all" || r.reasons.some((x) => x.reason === reason))
      .map((row) => ({ row, acc: acceptanceOf(row.attempted, row.solved) }));
    const measured = rows
      .filter((d): d is { row: typeof d.row; acc: { kind: "rate"; value: number } } => d.acc.kind === "rate")
      .sort((a, b) => a.acc.value - b.acc.value);
    const unmeasured = rows.filter((d) => d.acc.kind !== "rate");
    return [...measured, ...unmeasured];
  }, [reason]);

  function exportChallenges() {
    exportCsv(
      "challenge-content-review",
      "challenge,title,lifecycle,attempted_unique,solved_unique,acceptance,review_reasons,computed_at",
      sorted.map(({ row, acc }) =>
        [
          row.id,
          `"${row.title.replace(/"/g, "'")}"`,
          row.lifecycle,
          row.attempted ?? "",
          row.solved ?? "",
          acc.kind === "rate" ? `${Math.round(acc.value * 100)}%` : "",
          `"${row.reasons.map((r) => REVIEW_REASON_LABEL[r.reason]).join("; ")}"`,
          row.computedAt ?? ""
        ].join(",")
      ),
      sorted.length > FIG.PLATFORM_EXPORT_ROW_CAP
    );
  }

  function exportTracks() {
    exportCsv(
      "track-rollup",
      "track,name,language,started,completed,stopped_at,computed_at",
      REVIEW.tracks.map((t) =>
        [
          t.trackId,
          `"${t.name.replace(/"/g, "'")}"`,
          t.language,
          t.started ?? "",
          t.completed ?? "",
          `"${t.stoppedAt.map((s) => `${s.entryTitle} ×${s.learners}`).join("; ")}"`,
          t.computedAt ?? ""
        ].join(",")
      ),
      REVIEW.tracks.length > FIG.PLATFORM_EXPORT_ROW_CAP
    );
  }

  return (
    <AdminPage
      kicker="Content · Challenges"
      title="Content review"
      lead="Per challenge, worst first by lowest acceptance rate; per track, who started and finished and where they stopped. Advisory reasons, never verdicts — the lists rank content, never learners."
      actions={<Button variant="quiet" to="/admin/challenges" icon="challenges">Challenge studio</Button>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readReview} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="Content review unavailable — the analytics could not be read. Stated as unavailable, never as nothing needing review."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          {/* The library at a glance — every lifecycle accounted, so the tiles
              always sum to the catalogue count. */}
          <div className="ch-stats">
            <Stat icon="check" label="Published" value={lifecycleCounts.published} />
            <Stat icon="edit" label="Drafts" value={lifecycleCounts.draft} />
            <Stat icon="clock" label="Awaiting approval" value={lifecycleCounts.submitted} />
            <Stat icon="inbox" label="Archived" value={lifecycleCounts.archived} />
          </div>

          <Card className="ch-table">
            <CardHeader
              title="Challenges"
              icon="challenges"
              eyebrow="worst first · unmeasured at the bottom"
              action={
                <Button variant="quiet" size="sm" icon="download" onClick={exportChallenges}>
                  Export
                </Button>
              }
            />
            <FilterBar className="ch-filterbar" label="Review filters">
              <Select
                size="sm"
                value={reason}
                onChange={(v) => setReason(v as "all" | ReviewReason)}
                aria-label="Filter by review reason"
                options={[
                  { value: "all", label: "all review reasons" },
                  ...REVIEW_REASONS.map((r) => ({ value: r, label: REVIEW_REASON_LABEL[r] }))
                ]}
              />
            </FilterBar>
            <LoadedLine loaded={sorted.length} total={sorted.length} />
            {sorted.length === 0 ? (
              <StateBlock
                state="empty"
                message={
                  reason === "all"
                    ? "No challenge carries activity yet — an honest zero of zero."
                    : `No challenge currently raises ${REVIEW_REASON_LABEL[reason]}.`
                }
                action={
                  reason !== "all" ? (
                    <Button variant="secondary" size="sm" onClick={() => setReason("all")}>
                      Clear the reason filter
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <DataTable
                label="Per-challenge content review, worst acceptance first"
                columns={[
                  "Challenge",
                  <span key="a" className="ch-th--num">Attempted</span>,
                  <span key="s" className="ch-th--num">Solved</span>,
                  <span key="r" className="ch-th--num">Acceptance</span>,
                  "Review reasons"
                ]}
                rows={sorted.map(({ row, acc }) => ({
                  key: row.id,
                  cells: [
                    <div className="ch-cell">
                      {resolvable.has(row.id) ? (
                        <Link to={`/admin/challenges/${row.id}`}><strong>{row.title}</strong></Link>
                      ) : (
                        <strong>{row.title}</strong>
                      )}
                      <p className="ch-cell__meta">
                        /{row.id} · {row.lifecycle}
                        {row.computedAt ? ` · computed ${fmtInstant(row.computedAt)}` : " · not yet computed"}
                      </p>
                    </div>,
                    <span className="ch-td--num">{row.attempted === null ? "—" : row.attempted.toLocaleString()}</span>,
                    <span className="ch-td--num">{row.solved === null ? "—" : row.solved.toLocaleString()}</span>,
                    <span className="ch-acc" data-kind={acc.kind}>
                      <span className="ch-acc__value">{acceptanceLabel(acc)}</span>
                      {acc.kind === "rate" ? (
                        <span
                          className="ch-acc__bar"
                          aria-hidden="true"
                          style={{ "--ch-acc-w": `${Math.round(acc.value * 100)}%` } as CSSProperties}
                        />
                      ) : acc.kind === "none" && row.attempted === 0 ? (
                        <span className="ch-acc__sub">0 of 0</span>
                      ) : null}
                    </span>,
                    row.reasons.length === 0 ? (
                      <span className="meta">—</span>
                    ) : (
                      <div className="ch-reason">
                        {row.reasons.map((r) => (
                          <div key={r.reason}>
                            <Chip size="sm" variant="quiet">{REVIEW_REASON_LABEL[r.reason]}</Chip>
                            <p className="ch-reason__facts">
                              {r.measured} · of {r.denominator} · {r.threshold} · {r.period} ·
                              calculated {fmtInstant(r.calculatedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  ]
                }))}
              />
            )}
            <p className="ch-note">
              Attempted and solved are unique learners over valid submissions — staff, seed, preview
              and platform-failure activity leave the denominator. Below{" "}
              {FIG.ANALYTICS_REVIEW_RATE_MINIMUM} attempters the rate reads Not enough data.
              Reasons clear after {FIG.ANALYTICS_REVIEW_CLEARING_CALCULATIONS} calculations that do
              not meet them, with history kept.
            </p>
          </Card>

          <Card className="ch-table">
            <CardHeader
              title="Tracks"
              icon="tracks"
              eyebrow="started · completed · where they stopped"
              action={
                <Button variant="quiet" size="sm" icon="download" onClick={exportTracks}>
                  Export
                </Button>
              }
            />
            {REVIEW.tracks.length === 0 ? (
              <StateBlock state="empty" compact message="No tracks carry a start record yet." />
            ) : (
              <DataTable
                label="Per-track rollup — starts, completions, stop-off points"
                columns={[
                  "Track",
                  <span key="s" className="ch-th--num">Started</span>,
                  <span key="c" className="ch-th--num">Completed</span>,
                  "Where they stopped"
                ]}
                rows={REVIEW.tracks.map((t) => {
                  const maxStop = Math.max(1, ...t.stoppedAt.map((s) => s.learners));
                  return {
                    key: t.trackId,
                    cells: [
                      <div className="ch-cell">
                        <Link to={`/admin/tracks/${t.trackId}`}><strong>{t.name}</strong></Link>
                        <p className="ch-cell__meta">
                          {languageLabel(t.language)}
                          {t.computedAt ? ` · computed ${fmtInstant(t.computedAt)}` : " · not yet computed"}
                        </p>
                      </div>,
                      <span className="ch-td--num">{t.started === null ? "—" : t.started.toLocaleString()}</span>,
                      <span className="ch-td--num">
                        {t.completed === null ? "—" : t.completed.toLocaleString()}
                        {t.started !== null && t.started > 0 && t.completed !== null ? (
                          <span className="ch-td__sub">{Math.round((t.completed / t.started) * 100)}% finished</span>
                        ) : t.started === 0 ? (
                          <span className="ch-td__sub">0 of 0</span>
                        ) : null}
                      </span>,
                      t.stoppedAt.length === 0 ? (
                        <span className="meta">—</span>
                      ) : (
                        <div className="ch-stop">
                          {t.stoppedAt.map((s) => (
                            <span key={s.entryTitle} className="ch-stop__row">
                              <span>{s.entryTitle}</span>
                              <span className="ch-stop__count">{s.learners.toLocaleString()}</span>
                              <span
                                className="ch-stop__bar"
                                aria-hidden="true"
                                style={{ "--ch-stop-w": `${(s.learners / maxStop) * 100}%` } as CSSProperties}
                              />
                            </span>
                          ))}
                        </div>
                      )
                    ]
                  };
                })}
              />
            )}
            <p className="ch-note">
              Started counts a track start record; completed counts the durable completion fact;
              stopped-at is the last published entry each starter was on. Figures computed{" "}
              {fmtInstant(REVIEW.computedAt)}.
            </p>
          </Card>

          <p className="ch-note">
            Both exports are aggregate and learner-anonymous, bounded by {FIG.PLATFORM_EXPORT_ROW_CAP}{" "}
            rows; a truncated file names itself partial. An export is a recorded read.
          </p>
        </>
      ) : null}
    </AdminPage>
  );
}
