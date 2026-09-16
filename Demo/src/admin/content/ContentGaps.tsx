/**
 * ContentGaps — `gaps`. Two panels from two sources, side by side and never a
 * merged gap count (admin.F17, requests/01 "Content Gaps", admin/05):
 *
 *   Asked for                    the requests rollup by context — produced by
 *                                the Topic Requests domain; a live aggregate
 *                                over one of four windows
 *   Searched for and not found   WizBit's knowledge-base no-match count, by
 *                                safe generic phrase over the rolling window
 *
 * Each panel carries its own empty statement, either may be unavailable alone
 * without taking the other down, and a period containing a search that could
 * not run is marked incomplete rather than counted. Both export — counts only,
 * no learner, no request text.
 *
 * Fixture state only.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Select } from "../../extraction/components/Select/Select";
import { Notice } from "../../extraction/components/Notice/Notice";
import { DataTable } from "../../extraction/components/DataTable/DataTable";
import {
  ACTION,
  ASKED_FOR,
  FIG,
  GAP_WINDOWS,
  SEARCHED_FOR,
  exportCsv,
  type GapWindow
} from "./fixtures";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { Field } from "../../extraction/components/Field/Field";
import "./content.css";

export function ContentGaps() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [window_, setWindow_] = useState<GapWindow>("90 days");

  const asked = ASKED_FOR[window_];
  /* "unverifiable" previews the searched-for source unreadable — one panel
     down while the other still serves, the partial-page rule. */
  const searched = preview === "unverifiable" ? { ...SEARCHED_FOR, available: false } : SEARCHED_FOR;

  function exportAsked() {
    exportCsv(
      `asked-for-${window_.replace(/\s+/g, "-")}`,
      "context,total,still_open,pending,approved,implemented,rejected",
      asked.rows.map(
        (r) => `${r.context.replace(/,/g, ";")},${r.total},${r.stillOpen},${r.byStatus.pending},${r.byStatus.approved},${r.byStatus.implemented},${r.byStatus.rejected}`
      ),
      asked.rows.length > FIG.PLATFORM_EXPORT_ROW_CAP
    );
  }

  function exportSearched() {
    exportCsv(
      "searched-for-and-not-found",
      "phrase,occurrences",
      searched.phrases.map((p) => `${p.phrase.replace(/,/g, ";")},${p.count}`),
      searched.phrases.length > FIG.PLATFORM_EXPORT_ROW_CAP
    );
  }

  return (
    <AdminPage
      kicker="Content"
      title="Content Gaps"
      lead="Two panels from two sources, side by side and never a merged gap count. Aggregate counts only — no requester identity, no free text."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readGaps} /> : null}

      {preview === "loaded" || preview === "unverifiable" ? (
        <div className="ct-gaps">
          <Card>
            <CardHeader
              title="Asked for"
              icon="inbox"
              eyebrow="the requests rollup — a live aggregate"
              action={
                <Button variant="quiet" size="sm" icon="download" onClick={exportAsked} disabled={!asked.available}>
                  Export
                </Button>
              }
            />
            <Field label="Window" hint="Four windows and no fifth — 90 days is the default.">
              <Select
                value={window_}
                onChange={(v) => setWindow_(v as GapWindow)}
                options={GAP_WINDOWS.map((w) => ({ value: w, label: w }))}
                aria-label="Rollup window"
              />
            </Field>
            {!asked.available ? (
              <StateBlock
                state="unavailable"
                compact
                message="The rollup cannot be derived for this window — no figure is shown, and no blank panel poses as zero demand."
              />
            ) : asked.rows.length === 0 ? (
              <StateBlock state="empty" compact message="Zero demand in this window — a counted zero." />
            ) : (
              <>
                <DataTable
                  label={`Asked for, rolled up by context over ${window_}`}
                  columns={["Context", "Total", "Still open", "pending", "approved", "implemented", "rejected"]}
                  rows={asked.rows.map((r) => ({
                    key: r.context,
                    cells: [
                      <strong>{r.context}</strong>,
                      r.total,
                      r.stillOpen,
                      r.byStatus.pending,
                      r.byStatus.approved,
                      r.byStatus.implemented,
                      r.byStatus.rejected
                    ]
                  }))}
                />
                <p className="meta">
                  Ordered by demand over {window_}, generated {asked.generatedAt.slice(0, 16).replace("T", " ")}Z.
                  Still open is pending or approved; implemented and rejected stay in the total —
                  demand is what was asked for, not what was agreed to.
                </p>
              </>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Searched for and not found"
              icon="search"
              eyebrow={`WizBit's no-match count · the rolling ${searched.windowDays}-day window`}
              action={
                <Button variant="quiet" size="sm" icon="download" onClick={exportSearched} disabled={!searched.available}>
                  Export
                </Button>
              }
            />
            {!searched.available ? (
              <StateBlock
                state="unavailable"
                compact
                message="The no-match count cannot be read — this panel is unavailable alone and the other still serves. A missing panel never reads as no demand."
              />
            ) : searched.phrases.length === 0 ? (
              <StateBlock state="empty" compact message="No phrase cleared the visibility threshold in this window — a counted zero." />
            ) : (
              <>
                {searched.incomplete ? (
                  <Notice tone="warning" compact title="Incomplete period">
                    <p>
                      This window contains at least one search that could not run — it is marked
                      incomplete rather than counted.
                    </p>
                  </Notice>
                ) : null}
                <DataTable
                  label={`Searched for and not found, by safe generic phrase, over ${searched.windowDays} days`}
                  columns={["Phrase", "Occurrences"]}
                  rows={searched.phrases.map((p) => ({
                    key: p.phrase,
                    cells: [<strong>{p.phrase}</strong>, p.count]
                  }))}
                />
                <p className="meta">
                  Only phrases at or above {FIG.COMPANION_GAP_MINIMUM_OCCURRENCES} occurrences appear;
                  a question that cannot be made safely generic contributes no term at all. Generated{" "}
                  {searched.generatedAt.slice(0, 16).replace("T", " ")}Z.
                </p>
              </>
            )}
          </Card>
        </div>
      ) : null}

      {preview === "loaded" || preview === "unverifiable" ? (
        <p className="meta">
          Both exports are counts-only and bounded by {FIG.PLATFORM_EXPORT_ROW_CAP} rows; a truncated
          file names itself partial in the filename. An export is a recorded read.
        </p>
      ) : null}
    </AdminPage>
  );
}
