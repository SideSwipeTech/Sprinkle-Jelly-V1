/**
 * CompanyAnalytics — the Company paper's analytics (assessments.F26,
 * mocks/:paperId/company-analytics).
 *
 * Three families — participation, outcome, trend — plus a per-question view,
 * a per-company view and an overview listing every Company paper with its
 * completion rate, ordered worst-completion-first with ties broken oldest
 * first. No pass rate or pass figure exists in this type — a figure that
 * cannot be read renders an em dash, never a zero. Exports hand staff a file.
 */

import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { ACTION, COMPANY_ANALYTICS, getPaper, type CompanyAnalyticsFixture } from "./fixtures";
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

function exportCsv(paper: string, a: CompanyAnalyticsFixture) {
  const lines = [
    "family,label,value,unit",
    ...a.families.flatMap((f) => f.rows.map((r) => `${f.family},"${r.label}",${r.value ?? ""},${r.unit ?? ""}`)),
    "",
    "company,papers,tests,completion rate,average score,trend",
    ...a.perCompany.map((c) => `"${c.company}",${c.papers},${c.tests},${c.completionRate ?? ""},${c.averageScore ?? ""},"${c.trend}"`)
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const el = document.createElement("a");
  el.href = URL.createObjectURL(blob);
  el.download = `company-analytics-${paper}.csv`;
  el.click();
}

export function CompanyAnalytics() {
  const { paperId } = useParams();
  const paper = getPaper(paperId);
  const a = paper ? COMPANY_ANALYTICS[paper.id] : undefined;
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);

  if (!paper) {
    return (
      <AdminPage kicker="Assessments · Company analytics" title="Company analytics" lead="Aggregate, never a person.">
        <StateBlock state="unavailable" message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>} />
      </AdminPage>
    );
  }
  if (paper.type !== "company") {
    return (
      <AdminPage kicker="Assessments · Company analytics" title="Company analytics" lead="Aggregate, never a person.">
        <StateBlock state="refused" message="This paper is a Mock — its analytics page is the per-paper overview."
          action={<Link className="btn btn--secondary" to={`/admin/mocks/${paper.id}/analytics`}>Paper analytics</Link>} />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title}`}
      title="Company analytics"
      lead="Three families — participation, outcome, trend. No pass rate or pass figure exists in this type."
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
      {preview === "unverifiable" ? <NotVerifiableNote subject="The trend family" /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={paper.title} /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview !== "loading" && preview !== "refused" && preview !== "conflict" ? (
        !a ? (
          <StateBlock state="unavailable" message="The counts for this paper are not yet computable — figures render as em dashes, never zero." />
        ) : (
          <>
            {a.families.map((f) => (
              <Card key={f.family}>
                <CardHeader title={f.family} icon="dashboard" eyebrow="aggregate, never a person" />
                
                  <table className="admin-table">
                    <thead><tr><th>Figure</th><th>Value</th></tr></thead>
                    <tbody>
                      {f.rows.map((r) => (
                        <tr key={r.label}>
                          <td>{r.label}</td>
                          <td>{r.value === null ? "—" : `${typeof r.value === "number" && r.value <= 1 && r.unit === undefined ? formatPercent(r.value) : r.value}${r.unit ?? ""}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </Card>
            ))}

            <Card>
              <CardHeader title="Per question" icon="list" />
              <LoadedLine loaded={a.perQuestion.length} total={a.perQuestion.length} />
              
                <table className="admin-table">
                  <thead><tr><th>Question</th><th>Tests</th><th>Accuracy</th><th>Skip rate</th><th>Partial credit</th></tr></thead>
                  <tbody>
                    {a.perQuestion.map((q) => (
                      <tr key={q.questionId}>
                        <td>{q.prompt.slice(0, 56)}{q.prompt.length > 56 ? "…" : ""}</td>
                        <td>{q.tests}</td>
                        <td>{formatPercent(q.accuracy) ?? "—"}</td>
                        <td>{formatPercent(q.skipRate) ?? "—"}</td>
                        <td>{formatPercent(q.partialCreditRate) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </Card>

            <Card>
              <CardHeader title="Per company" icon="companies" />
              
                <table className="admin-table">
                  <thead><tr><th>Company</th><th>Papers</th><th>Tests</th><th>Completion</th><th>Average score</th><th>Trend</th></tr></thead>
                  <tbody>
                    {a.perCompany.map((c) => (
                      <tr key={c.company}>
                        <td>{c.company}</td><td>{c.papers}</td><td>{c.tests}</td>
                        <td>{formatPercent(c.completionRate) ?? "—"}</td>
                        <td>{c.averageScore === null ? "—" : `${c.averageScore}%`}</td>
                        <td>{c.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </Card>

            <Card>
              <CardHeader title="Overview — every Company paper" icon="list" eyebrow="worst completion first, ties oldest first" />
              
                <table className="admin-table">
                  <thead><tr><th>Paper</th><th>Company</th><th>Completion</th><th>Oldest finalize</th><th></th></tr></thead>
                  <tbody>
                    {a.overview.map((o) => (
                      <tr key={o.paperId}>
                        <td><Link to={`/admin/mocks/${o.paperId}`}>{o.title}</Link></td>
                        <td>{o.company}</td>
                        <td>{formatPercent(o.completionRate) ?? "—"}</td>
                        <td>{o.oldestFinalizeAt || "—"}</td>
                        <td>{o.marked ? <span className="chip chip--quiet">marked for export</span> : null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              <p className="meta">Computed {a.computedAt}. A completion that cannot be read renders —, never zero.</p>
            </Card>
          </>
        )
      ) : null}
    </AdminPage>
  );
}
