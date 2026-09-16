/**
 * BulkImport — the one platform question importer, in the selected type's own
 * copy (assessments.F16). Template, upload and paste; the batch is mapped from
 * section names, validated per row across the whole batch and committed all or
 * none. A batch above JOBS_SWEEP_PAGE_RECORDS is refused whole, naming the
 * field and the bound; a validation that cannot run refuses as not yet
 * verifiable.
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { ACTION, getPaper, IMPORT_BATCH_BOUND, IMPORT_TEMPLATE, SAMPLE_BATCH, type ImportRow } from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  LoadedLine,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

/** One CSV line — quoted fields honoured, nothing cleverer. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { cells.push(cur); cur = ""; }
    else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

const KINDS = ["single-choice", "multiple-choice", "numerical", "true-false", "coding"];

/** Per-row validation against the paper's own section names. Every refused row
 *  names what failed; the batch commits all or none. */
function validateRow(row: number, cells: string[], sections: string[]): ImportRow {
  const [section = "", kind = "", prompt = "", marks = "", , options = "", correct = ""] = cells;
  const errors: string[] = [];
  if (!section) errors.push("section is empty");
  else if (!sections.includes(section)) errors.push(`section name maps to no section on the paper`);
  if (!KINDS.includes(kind)) errors.push(`kind must be one of ${KINDS.join(", ")}`);
  if (!prompt) errors.push("prompt is empty");
  if (!(Number(marks) > 0)) errors.push("marks must be a positive number");
  if (kind === "single-choice" || kind === "multiple-choice") {
    const opts = options.split("|").map((o) => o.trim()).filter(Boolean);
    const picks = correct.split("|").map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) errors.push("at least two options are required");
    if (picks.length === 0) errors.push("no correct option named");
    else if (picks.some((p) => !opts.includes(p))) errors.push("correct names no listed option");
    else if (kind === "single-choice" && picks.length !== 1) errors.push("single choice takes exactly one correct option");
  }
  if (kind === "numerical" && Number.isNaN(Number(correct))) errors.push("a numerical row's correct cell must be a number");
  if (kind === "true-false" && correct !== "true" && correct !== "false") errors.push("a true/false row's correct cell is true or false");
  return { row, section, kind, prompt, marks, status: errors.length ? "error" : "ok", errors };
}

export function BulkImport() {
  const { paperId } = useParams();
  const paper = getPaper(paperId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [overBound, setOverBound] = useState(false);
  const [committed, setCommitted] = useState<number | null>(null);

  const sections = useMemo(() => (paper ? paper.sections.map((s) => s.name) : []), [paper]);

  if (!paper) {
    return (
      <AdminPage kicker="Assessments · Bulk import" title="Bulk question import" lead="The one platform question importer.">
        <StateBlock state="unavailable" message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>} />
      </AdminPage>
    );
  }

  const batchCopy = paper.type === "mock"
    ? "One CSV column per field of the question record, mapped from this Mock paper's section names."
    : "One CSV column per field of the question record, mapped from this Company paper's section names.";

  function validate() {
    setCommitted(null);
    setOverBound(false);
    const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("section,"));
    if (lines.length > IMPORT_BATCH_BOUND) {
      setRows(null);
      setOverBound(true);
      return;
    }
    setRows(lines.map((line, i) => validateRow(i + 1, parseCsvLine(line), sections)));
  }

  const errorCount = rows?.filter((r) => r.status === "error").length ?? 0;
  const clean = rows !== null && rows.length > 0 && errorCount === 0;

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title}`}
      title="Bulk question import"
      lead={`The one platform question importer — ${batchCopy}`}
      actions={<Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}?tab=questions`}>Back to the paper</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.importQuestions} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="Batch validation" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={paper.title} /> : null}

      {preview === "loaded" || preview === "conflict" || preview === "out-of-date" || preview === "content-write" || preview === "unverifiable" || preview === "content-guard" ? (
        <>
          <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
          <Card>
            <CardHeader title="Template" icon="download" eyebrow="served by the studio" />
            <p className="meta">One column per field of the question record; the header row is the template.</p>
            <pre className="meta" style={{ whiteSpace: "pre-wrap" }}>{IMPORT_TEMPLATE}</pre>
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => {
                const blob = new Blob([IMPORT_TEMPLATE], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `question-import-${paper.id}.csv`;
                a.click();
              }}
            >
              Download template
            </button>
          </Card>

          <Card>
            <CardHeader title="Upload or paste" icon="save" />
            <div className="row">
              <label className="btn btn--secondary" style={{ cursor: "pointer" }}>
                Upload a CSV
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    file.text().then((t) => { setText(t); setRows(null); setCommitted(null); setOverBound(false); });
                  }}
                />
              </label>
              <button className="btn btn--quiet" type="button"
                onClick={() => { setText(IMPORT_TEMPLATE.split("\n")[1] ?? ""); setRows(null); setCommitted(null); setOverBound(false); }}>
                Paste the template row
              </button>
              <button className="btn btn--quiet" type="button"
                onClick={() => { setRows(SAMPLE_BATCH); setOverBound(false); setCommitted(null); }}>
                Load a five-row sample
              </button>
            </div>
            <label className="field">
              <span className="meta">Paste the batch — one row per line, header optional</span>
              <textarea rows={6} value={text} onChange={(e) => { setText(e.target.value); setRows(null); setCommitted(null); }} />
            </label>
            <div className="row">
              <button className="btn btn--primary" type="button" disabled={!text.trim()} onClick={validate}>
                Validate batch
              </button>
              <button className="btn btn--quiet" type="button"
                onClick={() => { setOverBound(true); setRows(null); setCommitted(null); }}>
                Simulate an over-bound batch
              </button>
            </div>
            {overBound ? (
              <StateBlock
                state="refused"
                compact
                message={`Batch refused whole — the rows field holds ${IMPORT_BATCH_BOUND + 1} against the bound JOBS_SWEEP_PAGE_RECORDS (${IMPORT_BATCH_BOUND}).`}
              />
            ) : null}
          </Card>

          {rows ? (
            <Card>
              <CardHeader title="Per-row validation" icon="list" eyebrow="the whole batch, every row named" />
              <LoadedLine loaded={rows.length} total={rows.length} />
              
                <table className="admin-table">
                  <thead><tr><th>Row</th><th>Section</th><th>Kind</th><th>Prompt</th><th>Marks</th><th>Verdict</th></tr></thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.row}>
                        <td>{r.row}</td>
                        <td>{r.section || "—"}</td>
                        <td>{r.kind || "—"}</td>
                        <td>{r.prompt ? `${r.prompt.slice(0, 44)}${r.prompt.length > 44 ? "…" : ""}` : "—"}</td>
                        <td>{r.marks || "—"}</td>
                        <td>
                          {r.status === "ok" ? (
                            <span className="chip chip--quiet">ready</span>
                          ) : (
                            <span>{r.errors.map((e) => <span key={e} className="meta" style={{ display: "block", color: "var(--c-error)" }}>{e}</span>)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              <div className="row">
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={!clean}
                  onClick={() => setCommitted(rows.length)}
                >
                  Commit batch — all or none
                </button>
                {!clean && errorCount > 0 ? (
                  <p className="meta">Nothing commits while a row is refused — fix the named rows or drop them; the batch commits all or none.</p>
                ) : null}
              </div>
              {committed !== null ? (
                <p className="page__lead" role="status">Committed — all {committed} rows, into the draft, as one audited change.</p>
              ) : null}
            </Card>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
