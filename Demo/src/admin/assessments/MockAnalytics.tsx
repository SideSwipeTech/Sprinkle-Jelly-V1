/**
 * MockAnalytics — per-paper Mock aggregates (assessments.F25,
 * mocks/:paperId/analytics).
 *
 * The overview: learners who sat it, tests started, tests completed, completion
 * rate, average score, pass rate, accuracy, average time, score distribution,
 * per-section averages and counts by day. Per question: the tests that saw it,
 * accuracy, skip rate, measured time, partial-credit rate and the advisory
 * review reasons. Aggregate, never a person. A figure that cannot be read
 * renders an em dash, never a zero. Export hands staff a file of the same
 * numbers.
 */

import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, Stat, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { ACTION, getPaper, MOCK_ANALYTICS, type MockAnalyticsFixture } from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  formatPercent,
  LoadedLine,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

function exportCsv(paper: string, a: MockAnalyticsFixture) {
  const lines = [
    "metric,value",
    `learners who sat it,${a.learnersSat}`,
    `tests started,${a.started}`,
    `tests completed,${a.completed}`,
    `completion rate,${a.completionRate ?? ""}`,
    `average score,${a.averageScore ?? ""}`,
    `pass rate,${a.passRate ?? ""}`,
    `accuracy,${a.accuracy ?? ""}`,
    `average time (min),${a.averageTimeMinutes ?? ""}`,
    "",
    "score bucket,count",
    ...a.distribution.map((d) => `${d.bucket},${d.count}`),
    "",
    "question,tests,accuracy,skip rate,measured seconds,partial credit,review reasons",
    ...a.perQuestion.map((q) =>
      `"${q.prompt.replaceAll('"', '""')}",${q.tests},${q.accuracy ?? ""},${q.skipRate ?? ""},${q.measuredTimeSec ?? ""},${q.partialCreditRate ?? ""},"${q.reviewReasons.join("; ")}"`
    )
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const el = document.createElement("a");
  el.href = URL.createObjectURL(blob);
  el.download = `analytics-${paper}.csv`;
  el.click();
}

export function MockAnalytics() {
  const { paperId } = useParams();
  const paper = getPaper(paperId);
  const a = paper ? MOCK_ANALYTICS[paper.id] : undefined;
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);

  if (!paper) {
    return (
      <AdminPage kicker="Assessments · Analytics" title="Paper analytics" lead="Aggregate, never a person.">
        <StateBlock state="unavailable" message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>} />
      </AdminPage>
    );
  }
  if (paper.type !== "mock") {
    return (
      <AdminPage kicker="Assessments · Analytics" title="Paper analytics" lead="Aggregate, never a person.">
        <StateBlock state="refused" message="This paper is a Company paper — its analytics page is the Company analytics overview."
          action={<Link className="btn btn--secondary" to={`/admin/mocks/${paper.id}/company-analytics`}>Company analytics</Link>} />
      </AdminPage>
    );
  }

  const maxDist = a ? Math.max(...a.distribution.map((d) => d.count), 1) : 1;

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title}`}
      title="Paper analytics"
      lead="Aggregate, never a person — one Mock paper's counts, as computed at the fixture's stamp."
      actions={
        <div className="row">
          {a ? <button className="btn btn--secondary" type="button" onClick={() => exportCsv(paper.id, a)}>Export CSV</button> : null}
          <Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}`}>Back to the paper</Link>
        </div>
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readAnalytics} /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The completion rate" /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={paper.title} /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview !== "loading" && preview !== "refused" && preview !== "conflict" ? (
        !a ? (
          <StateBlock state="unavailable" message="The counts for this paper are not yet computable — figures render as em dashes, never zero." />
        ) : (
          <>
            <div className="admin-health">
              <div className="admin-health__cell"><Stat label="Learners who sat it" value={String(a.learnersSat)} /></div>
              <div className="admin-health__cell"><Stat label="Tests started" value={String(a.started)} /></div>
              <div className="admin-health__cell"><Stat label="Tests completed" value={String(a.completed)} /></div>
              <div className="admin-health__cell"><Stat label="Completion rate" value={formatPercent(a.completionRate) ?? "—"} /></div>
              <div className="admin-health__cell"><Stat label="Average score" value={a.averageScore === null ? "—" : `${a.averageScore}%`} /></div>
              <div className="admin-health__cell"><Stat label="Pass rate" value={formatPercent(a.passRate) ?? "—"} /></div>
              <div className="admin-health__cell"><Stat label="Accuracy" value={formatPercent(a.accuracy) ?? "—"} /></div>
              <div className="admin-health__cell"><Stat label="Average time" value={a.averageTimeMinutes === null ? "—" : `${a.averageTimeMinutes} min`} /></div>
            </div>

            <Card>
              <CardHeader title="Score distribution" icon="list" eyebrow="five equal buckets" />
              <div className="a-bars">
                {a.distribution.map((d) => (
                  <div className="a-bar" key={d.bucket}>
                    <span>{d.bucket}%</span>
                    <span className="a-bar__track"><span className="a-bar__fill" style={{ width: `${(d.count / maxDist) * 100}%` }} /></span>
                    <span className="a-bar__count">{d.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Per-section averages" icon="list" />
              <div className="list">
                {a.perSection.map((s) => (
                  <div className="list-row" key={s.name}>
                    <strong>{s.name}</strong>
                    <span className="meta">{s.average === null ? "—" : `${s.average}%`}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Counts by day" icon="clock" eyebrow="product days" />
              
                <table className="admin-table">
                  <thead><tr><th>Product day</th><th>Tests</th></tr></thead>
                  <tbody>
                    {a.byDay.map((d) => <tr key={d.day}><td>{d.day}</td><td>{d.count}</td></tr>)}
                  </tbody>
                </table>
              <p className="meta">{a.byDay.length} loaded, total unavailable — days with no tests are absent, not zero.</p>
            </Card>

            <Card>
              <CardHeader title="Per question" icon="list" eyebrow="the advisory view, never a verdict" />
              <LoadedLine loaded={a.perQuestion.length} total={a.perQuestion.length} />
              
                <table className="admin-table">
                  <thead>
                    <tr><th>Question</th><th>Tests</th><th>Accuracy</th><th>Skip rate</th><th>Measured time</th><th>Partial credit</th><th>Review reasons</th></tr>
                  </thead>
                  <tbody>
                    {a.perQuestion.map((q) => (
                      <tr key={q.questionId}>
                        <td>{q.prompt.slice(0, 56)}{q.prompt.length > 56 ? "…" : ""}</td>
                        <td>{q.tests}</td>
                        <td>{formatPercent(q.accuracy) ?? "—"}</td>
                        <td>{formatPercent(q.skipRate) ?? "—"}</td>
                        <td>{q.measuredTimeSec === null ? "—" : `${q.measuredTimeSec}s`}</td>
                        <td>{formatPercent(q.partialCreditRate) ?? "—"}</td>
                        <td>{q.reviewReasons.length ? q.reviewReasons.join(" · ") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              <p className="meta">Computed {a.computedAt}. Review reasons name the question a human should look at — they are advisory, not a verdict.</p>
            </Card>
          </>
        )
      ) : null}
    </AdminPage>
  );
}
