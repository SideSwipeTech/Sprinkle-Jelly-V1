/**
 * ReviewQueue — `review`. Every learner content report, oldest first, across
 * the four statuses — open, investigating, resolved, dismissed — with
 * per-status counts, asymmetric filters and one controlled set of moves
 * (admin.F14, admin/05 "The review queue").
 *
 * The graph: open and investigating reach all three others; resolved and
 * dismissed reach open only, behind a required staff reason. A resolution
 * records its closed kind — corrected, no-action, escalated, duplicate — and a
 * dismissal requires a reason. The current status control is inert: a no-op
 * change is impossible. Moves are `admin.move_review_item`.
 *
 * Fixture state only.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  REPORTS,
  REPORT_STATUSES,
  RESOLUTION_KINDS,
  REVIEW_GRAPH,
  fmtInstant,
  type ContentReport,
  type ReportStatus,
  type ResolutionKind
} from "./fixtures";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

const AREA_LABEL: Record<ContentReport["area"], string> = {
  courses: "courses",
  challenges: "challenges",
  daily: "daily challenges",
  debug: "debug cases",
  templates: "project templates"
};

interface PendingMove {
  report: ContentReport;
  to: ReportStatus;
}

export function ReviewQueue() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused"]);
  const [reports, setReports] = useState<ContentReport[]>(REPORTS);
  const [area, setArea] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(REPORTS[0]?.id ?? null);
  const [triageNote, setTriageNote] = useState("");
  const [move, setMove] = useState<PendingMove | null>(null);
  const [reason, setReason] = useState("");
  const [kind, setKind] = useState<ResolutionKind>("corrected");
  const [flash, setFlash] = useState<string | null>(null);

  /* Asymmetric filters: the area narrows the page AND the counts; the status
     narrows only the page. The page total honours both. */
  const inArea = reports.filter((r) => area === "all" || r.area === area);
  const counts = REPORT_STATUSES.map((s) => ({
    status: s,
    n: inArea.filter((r) => r.status === s).length
  }));
  const rows = inArea
    .filter((r) => status === "all" || r.status === status)
    .slice()
    .sort((a, b) => (a.filedAt < b.filedAt ? -1 : 1)); // oldest first

  const selected = reports.find((r) => r.id === selectedId) ?? null;
  const moves = selected ? REVIEW_GRAPH[selected.status] : [];

  function applyMove(report: ContentReport, to: ReportStatus, note: string, closeKind?: ResolutionKind, ref?: string) {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== report.id) return r;
        const reopening = (r.status === "resolved" || r.status === "dismissed") && to === "open";
        return {
          ...r,
          status: to,
          triageNote: note || r.triageNote,
          /* Reopening clears the stored closer and closing time. */
          closer: reopening
            ? undefined
            : to === "resolved" || to === "dismissed"
              ? { by: "you", at: new Date().toISOString(), kind: closeKind, reason: note || undefined, reference: ref }
              : r.closer
        };
      })
    );
    setFlash(`${report.target}: ${report.status} → ${to} — one move of the controlled graph, recorded with its audit.`);
    setMove(null);
    setReason("");
  }

  function requestMove(report: ContentReport, to: ReportStatus) {
    const needsDialog =
      to === "resolved" ||
      to === "dismissed" ||
      ((report.status === "resolved" || report.status === "dismissed") && to === "open");
    if (needsDialog) {
      setMove({ report, to });
      setReason("");
      setKind("corrected");
    } else {
      /* investigating, and open←investigating: an optional triage note only. */
      applyMove(report, to, triageNote.trim());
    }
  }

  return (
    <AdminPage
      kicker="Content"
      title="Review Queue"
      lead="Every learner content report, oldest first. Four statuses, one controlled graph. No assignment, no ranking, no public moderation history."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.moveReviewItem} /> : null}

      {preview === "loaded" ? (
        <>
          {/* Per-status counts always total every status, zeroes included. */}
          <div className="row" role="group" aria-label="Reports per status">
            {counts.map((c) => (
              <Chip key={c.status} size="sm" variant="quiet">
                {c.status} {c.n}
              </Chip>
            ))}
          </div>

          <div className="filters" role="group" aria-label="Filters — the area narrows the counts too; the status narrows only the page">
            <Select
              size="sm"
              value={area}
              onChange={setArea}
              aria-label="Filter by area"
              options={[
                { value: "all", label: "all areas" },
                ...(Object.keys(AREA_LABEL) as (keyof typeof AREA_LABEL)[]).map((a) => ({
                  value: a,
                  label: AREA_LABEL[a]
                }))
              ]}
            />
            {["all", ...REPORT_STATUSES].map((s) => (
              <Chip key={s} size="sm" selected={status === s} onClick={() => setStatus(s)}>
                {s}
              </Chip>
            ))}
          </div>

          {flash ? <Notice tone="success" live="polite">{flash}</Notice> : null}
          <LoadedLine loaded={rows.length} total={rows.length} />

          {rows.length === 0 ? (
            <StateBlock
              state="empty"
              message={
                reports.length === 0
                  ? "No learner content reports — a counted zero."
                  : "No reports match this filter."
              }
              action={
                reports.length > 0 ? (
                  <Button variant="secondary" size="sm" onClick={() => { setArea("all"); setStatus("all"); }}>
                    Clear the filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <List>
              {rows.map((r) => (
                <ListRow
                  key={r.id}
                  as="article"
                  align="center"
                  selected={r.id === selectedId}
                >
                  <div className="ct-row__body">
                    <strong>{r.target}</strong>
                    <p className="meta">
                      {AREA_LABEL[r.area]} · {r.reason} · filed {fmtInstant(r.filedAt)}
                      {r.note ? ` · “${r.note}”` : ""}
                      {r.movedOn ? " · the content has moved on — the editor shows it current" : ""}
                      {r.editorTo === null ? " · the content is gone — its editor would render not-found" : ""}
                    </p>
                  </div>
                  <span className="ct-row__acts">
                    <Chip size="sm" variant="quiet">{r.status}</Chip>
                    {/* The queue moves things forward, never merges — the graph's
                        moves surface once the report is open, beside its frozen
                        reference, triage note and stored closer. */}
                    <Button
                      variant="secondary"
                      size="sm"
                      label={`Open the report on ${r.target}`}
                      onClick={() => { setSelectedId(r.id); setTriageNote(r.triageNote ?? ""); setFlash(null); }}
                    >
                      Open
                    </Button>
                  </span>
                </ListRow>
              ))}
            </List>
          )}

          {selected ? (
            <Card>
              <CardHeader
                title={selected.target}
                icon="inbox"
                eyebrow={`${selected.status} · filed ${fmtInstant(selected.filedAt)}`}
              />
              <p className="meta">
                A frozen reference — the report reads as filed. Any setting beside it is labelled
                current.
              </p>
              {selected.closer ? (
                <p className="meta">
                  Closed by {selected.closer.by}, {fmtInstant(selected.closer.at)}
                  {selected.closer.kind ? ` · resolution kind: ${selected.closer.kind}` : ""}
                  {selected.closer.reason ? ` · “${selected.closer.reason}”` : ""}.
                </p>
              ) : null}
              <Field label="Triage note" hint="Optional — travels with the report, never to the reporter.">
                <input value={triageNote} onChange={(e) => setTriageNote(e.target.value)} />
              </Field>
              {/* One controlled set of moves: the graph's and no others. The
                  current status renders inert — a no-op change is impossible. */}
              <div className="admin-tools" role="group" aria-label="Permitted moves">
                <Chip size="sm" selected disabled label={`Current status: ${selected.status}`}>
                  {selected.status} — current
                </Chip>
                {moves.map((to) => (
                  <Button key={to} variant="secondary" size="sm" onClick={() => requestMove(selected, to)}>
                    → {to}
                  </Button>
                ))}
                {selected.editorTo ? (
                  <Button variant="quiet" size="sm" to={selected.editorTo} iconEnd="external-link">
                    Current editor
                  </Button>
                ) : null}
              </div>
              {moves.length === 0 ? null : (
                <p className="meta">
                  A dismissal requires a reason; a resolution records its closed kind; resolved and
                  dismissed reopen to open only, behind a required staff reason. A move the graph does
                  not offer is not offered here.
                </p>
              )}
            </Card>
          ) : null}

          {move ? (
            <Dialog
              title={`${move.report.target} — ${move.report.status} → ${move.to}`}
              icon={move.to === "dismissed" ? "alert" : "check"}
              tone={move.to === "dismissed" ? "destructive" : "default"}
              onClose={() => setMove(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setMove(null)}>Cancel</Button>
                  <Button
                    variant={move.to === "dismissed" ? "destructive" : "primary"}
                    disabled={
                      (move.to === "dismissed" ||
                        ((move.report.status === "resolved" || move.report.status === "dismissed") && move.to === "open")) &&
                      !reason.trim()
                    }
                    onClick={() => applyMove(move.report, move.to, reason.trim() || triageNote.trim(), move.to === "resolved" ? kind : undefined)}
                  >
                    Move to {move.to}
                  </Button>
                </>
              }
            >
              {move.to === "resolved" ? (
                <>
                  <p>A resolution records exactly one closed kind.</p>
                  <Field label="Resolution kind" required>
                    <Select
                      value={kind}
                      onChange={(v) => setKind(v as ResolutionKind)}
                      options={RESOLUTION_KINDS.map((k) => ({ value: k, label: k }))}
                      aria-label="Resolution kind"
                    />
                  </Field>
                  <Field label="Reason or reference" hint="Optional — the correcting revision or action may be named.">
                    <input value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                </>
              ) : (
                <>
                  <p>
                    {move.to === "dismissed"
                      ? "A dismissal requires a reason — it is recorded with the move."
                      : "Reopening requires a staff reason and clears the stored closer and closing time."}
                  </p>
                  <Field label="Staff reason" required>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                </>
              )}
            </Dialog>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
