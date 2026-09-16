/**
 * Reporting — Governance › reporting (admin pages: "Governance, The reporting
 * area"; analytics pages: the only reporting destination anywhere).
 *
 * Participation over daily, weekly and monthly buckets — figures prepared in
 * advance, never scanned live, staff in no bucket — and the per-area
 * content-review reports, one shape for all six: four headline statistics,
 * rows ordered most-reported-unresolved first, the row count, one freshness
 * caption and one export. Every figure states when it was recomputed — a page
 * answered from yesterday's figures is a yesterday page and says so.
 *
 * Exports are recorded reads: one comma-separated file carrying its
 * generated-at instant inside the file and in the name, bounded by
 * PLATFORM_EXPORT_ROW_CAP with truncation explicit in the filename — never
 * scheduled, never emailed, naming no learner.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { DataTable } from "../../extraction/components/DataTable/DataTable";
import { Field } from "../../extraction/components/Field/Field";
import { Notice } from "../../extraction/components/Notice/Notice";
import { SegmentedControl } from "../../extraction/components/SegmentedControl/SegmentedControl";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../assessments/shared";
import {
  ANALYTICS_REVIEW_RESOLVED_WINDOW_DAYS,
  PARTICIPATION,
  PLATFORM_EXPORT_ROW_CAP,
  PLATFORM_LIST_PAGE_ITEMS,
  REVIEW_AREAS,
  recordAudit,
  type Bucket,
  type ReviewArea
} from "./fixtures";
import "./governance.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

/** Text a spreadsheet would treat as a formula is neutralised. */
function csvCell(v: string | number): string {
  const s = String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * The whole bounded view, not just the visible page: the generated-at instant
 * inside the file and in the name; truncation at the cap is explicit in the
 * filename so a short file cannot read as complete.
 */
function downloadCsv(base: string, header: string[], rows: (string | number)[][]) {
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.slice(0, 19).replace(/[:T]/g, "-");
  const truncated = rows.length > PLATFORM_EXPORT_ROW_CAP;
  const body = rows.slice(0, PLATFORM_EXPORT_ROW_CAP);
  const csv = [
    `generated_at,${csvCell(generatedAt)}`,
    header.map(csvCell).join(","),
    ...body.map((r) => r.map(csvCell).join(","))
  ].join("\n");
  const name = `${base}-generated-${stamp}${truncated ? `-truncated-at-${PLATFORM_EXPORT_ROW_CAP}` : ""}.csv`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function Reporting() {
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [bucket, setBucket] = useState<Bucket>("daily");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [areaId, setAreaId] = useState(REVIEW_AREAS[0]?.id ?? "courses");
  const [retried, setRetried] = useState(false);

  const figures = PARTICIPATION[bucket];
  const area = REVIEW_AREAS.find((a) => a.id === areaId);

  /* The from-and-to range is validated against the chosen bucket size — a
     malformed one is refused with its reason, never answered with an empty
     window that would read as a finding. */
  function rangeError(): string | null {
    if (!from && !to) return null;
    const f = Date.parse(from);
    const t = Date.parse(to);
    if (!from || !to) return "Both ends of the range are required — from and to.";
    if (Number.isNaN(f) || Number.isNaN(t)) return "The range could not be parsed.";
    if (f >= t) return "The from date must fall before the to date.";
    const days = Math.round((t - f) / 86_400_000);
    if (bucket === "weekly" && days % 7 !== 0)
      return `The range spans ${days} days — a weekly bucket needs whole 7-day spans.`;
    if (bucket === "monthly") {
      const fd = new Date(f);
      const td = new Date(t);
      if (fd.getUTCDate() !== td.getUTCDate())
        return "A monthly bucket needs whole calendar months — the same day-of-month at both ends.";
    }
    return null;
  }
  const rangeFault = rangeError();

  function exportParticipation() {
    downloadCsv(
      `participation-${bucket}`,
      ["kind", "count"],
      figures.byKind.map(([k, n]) => [k, n])
    );
    /* An export is the fourth recorded read — committed with the download. */
    recordAudit(`Export taken — reporting: participation, bucket ${bucket}; the whole bounded view`);
  }

  function exportReview(a: ReviewArea) {
    downloadCsv(
      `content-review-${a.id}`,
      ["item", "unresolved_reports", "oldest_flag_age", "advisory_reasons"],
      a.rows.map((r) => [r.item, r.unresolved, r.oldestAge, r.reasons.join("; ")])
    );
    recordAudit(`Export taken — reporting: content review, ${a.id}; filters none; ${a.rows.length} rows`);
  }

  if (preview === "loading") {
    return (
      <AdminPage kicker="Governance" title="Reporting">
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        <StudioLoading />
      </AdminPage>
    );
  }

  const kindTotal = figures.byKind.reduce((s, [, n]) => s + n, 0);
  const areaSum = figures.byArea.reduce((s, [, n]) => s + n, 0);

  return (
    <AdminPage
      kicker="Governance"
      title="Reporting"
      lead="Participation, the per-area content-review reports, and the exports of those. Aggregate only — no per-learner row, ever — and there is no other reporting destination anywhere."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action="the reporting read" /> : null}

      {preview === "loaded" ? (
        <>
          <Card>
            <CardHeader title="Participation" icon="grid" eyebrow={`recomputed ${figures.recomputed}`} />
            <p className="meta">
              Prepared in advance rather than scanned live — a figure that is yesterday's says so.
              Staff are exempt and appear in no bucket.
            </p>
            <SegmentedControl
              label="Bucket"
              value={bucket}
              onChange={(v) => setBucket(v as Bucket)}
              options={[
                { id: "daily", label: "Daily" },
                { id: "weekly", label: "Weekly" },
                { id: "monthly", label: "Monthly" }
              ]}
            />
            <div className="admin-health" style={{ marginTop: "var(--space-3)" }}>
              <div className="admin-health__cell"><Stat label="Distinct active" value={figures.distinctActive} /></div>
              <div className="admin-health__cell"><Stat label="first_time active" value={figures.firstTime} /></div>
              <div className="admin-health__cell"><Stat label="returning active" value={figures.returning} /></div>
              <div className="admin-health__cell">
                <Stat label="Cross-bucket distinct sum" value={null} />
                <p className="meta">unavailable — never the sum of buckets</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <Field label="From (optional)" hint="Validated against the chosen bucket size.">
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="To (optional)" error={rangeFault ?? undefined}>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </div>
            {rangeFault ? (
              <Notice tone="error" compact title="Range refused">
                {rangeFault} Refused with its reason — never answered with an empty window.
              </Notice>
            ) : from && to ? (
              <Notice tone="info" compact>
                A ranged window reads the prepared buckets; distinct-user counts across buckets are
                reported as unavailable rather than summed.
              </Notice>
            ) : null}
            <div className="admin-form-grid">
              <div>
                <p className="micro">By area</p>
                <DataTable
                  label={`Activity by area — ${bucket}`}
                  columns={["Area", "Activity"]}
                  rows={figures.byArea.map(([a, n]) => ({ key: a, cells: [a, n] }))}
                  minWidth="0"
                />
              </div>
              <div>
                <p className="micro">By kind — the closed set of eight</p>
                <DataTable
                  label={`Activity by kind — ${bucket}`}
                  columns={["Kind", "Activity"]}
                  rows={figures.byKind.map(([k, n]) => ({ key: k, cells: [k, n] }))}
                  minWidth="0"
                />
              </div>
            </div>
            <p className="meta">
              Inside one bucket the two halves total it exactly — areas {areaSum} · kinds {kindTotal}
              {areaSum === kindTotal ? " — the identity checks" : " — the identity fails"}.
              An area or kind with no activity renders an explicit zero, never a dropped row.
            </p>
            <Button variant="secondary" size="sm" icon="download" onClick={exportParticipation}>
              Export participation
            </Button>
          </Card>

          <Card>
            <CardHeader
              title="Content review, per area"
              icon="inbox"
              eyebrow="most-reported unresolved first"
            />
            <p className="meta">
              One shape for all six areas. A count of unresolved learner reports — never a claim about
              quality — ordering content, never people. Rows are learner-anonymous and advisory
              reasons come from the closed vocabularies only.
            </p>
            <div className="gov-views" role="group" aria-label="Area">
              {REVIEW_AREAS.map((a) => (
                <Chip
                  key={a.id}
                  size="sm"
                  selected={areaId === a.id}
                  onClick={() => {
                    setAreaId(a.id);
                    setRetried(false);
                  }}
                >
                  {a.label}
                </Chip>
              ))}
            </div>
            {area ? (
              area.state === "data" ? (
                <>
                  <div className="admin-health" style={{ marginTop: "var(--space-3)" }}>
                    <div className="admin-health__cell"><Stat label="Flagged items" value={area.flagged} /></div>
                    <div className="admin-health__cell"><Stat label="Oldest unresolved flag" value={area.oldestUnresolved} /></div>
                    <div className="admin-health__cell">
                      <Stat
                        label={`Resolved in the last ${ANALYTICS_REVIEW_RESOLVED_WINDOW_DAYS} days`}
                        value={area.resolvedInWindow}
                      />
                    </div>
                    <div className="admin-health__cell"><Stat label="Median time to resolution" value={area.medianResolution} /></div>
                  </div>
                  <DataTable
                    label={`Most-reported unresolved content — ${area.label}`}
                    columns={["Item", "Unresolved reports", "Oldest flag", "Advisory reasons"]}
                    rows={area.rows.slice(0, PLATFORM_LIST_PAGE_ITEMS).map((r) => ({
                      key: r.item,
                      cells: [
                        r.item,
                        r.unresolved,
                        r.oldestAge,
                        r.reasons.length ? r.reasons.join(" · ") : "—"
                      ]
                    }))}
                  />
                  <LoadedLine loaded={area.rows.length} total={area.rows.length} />
                  <p className="meta">Recomputed {area.recomputed} — the report's own freshness caption.</p>
                  <Button variant="secondary" size="sm" icon="download" onClick={() => exportReview(area)}>
                    Export this report
                  </Button>
                </>
              ) : area.state === "empty" ? (
                <StateBlock state="empty" message={`${area.label}: nothing currently flagged.`} />
              ) : area.state === "unauthored" ? (
                <StateBlock state="empty" message={`${area.label}: nothing authored in this area yet.`} />
              ) : (
                <StateBlock
                  state="unavailable"
                  message={`${area.label}: the source could not be read.`}
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setRetried(true)}>
                      Retry
                    </Button>
                  }
                />
              )
            ) : null}
            {area?.state === "unavailable" ? (
              <p className="meta" role="status">
                {retried
                  ? "Retried — the source still could not be read. The rest of the page still serves."
                  : "A panel that cannot load renders unavailable while the rest still serves."}
              </p>
            ) : null}
          </Card>
        </>
      ) : null}
    </AdminPage>
  );
}
