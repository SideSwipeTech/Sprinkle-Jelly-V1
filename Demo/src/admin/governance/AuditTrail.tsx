/**
 * AuditTrail — Governance › audit (admin pages: "Governance, Audit Trail").
 *
 * The whole trail, filterable by actor, target, action and date, newest first
 * and paged. Every row names actor, action, target, time and the reason where
 * one was captured — never learner content. A filter matching nothing says so
 * explicitly, and the loaded count is stated only because it was counted under
 * the same filters and snapshot.
 */

import { useMemo, useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Button } from "../../extraction/components/Button/Button";
import { DataTable } from "../../extraction/components/DataTable/DataTable";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../assessments/shared";
import { AUDIT_ROWS, displayInstant } from "./fixtures";
import "./governance.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];
/** The page size — real paging, capped by `API_PAGE_LIMIT` on the platform. */
const PAGE_SIZE = 8;

interface TrailRow {
  id: string;
  at: string;
  epoch: number;
  actor: string;
  action: string;
  target: string | null;
  reason: string | null;
}

export function AuditTrail() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  /* The store's live rows carry actor, action and time; the fixture's older
     rows also carry target and the captured reason. Merged, newest first,
     stable ordering — the trail is one list, not two sources shown twice. */
  const all = useMemo<TrailRow[]>(() => {
    const live: TrailRow[] = store.adminAudit.map((r) => ({
      id: r.id,
      at: displayInstant(r.at),
      epoch: Date.parse(r.at) || 0,
      actor: r.actor,
      action: r.action,
      target: null,
      reason: null
    }));
    const fixture: TrailRow[] = AUDIT_ROWS.map((r) => ({ ...r }));
    return [...live, ...fixture].sort((a, b) => b.epoch - a.epoch || b.id.localeCompare(a.id));
  }, [store.adminAudit]);

  const actors = useMemo(
    () => ["all", ...Array.from(new Set(all.map((r) => r.actor)))],
    [all]
  );

  const filtered = all.filter((r) => {
    if (actor !== "all" && r.actor !== actor) return false;
    if (action && !r.action.toLowerCase().includes(action.toLowerCase())) return false;
    if (target && !(r.target ?? "").toLowerCase().includes(target.toLowerCase())) return false;
    if (date && !r.at.toLowerCase().includes(date.toLowerCase())) return false;
    return true;
  });

  function refilter(update: () => void) {
    update();
    setShown(PAGE_SIZE);
  }

  if (preview === "loading") {
    return (
      <AdminPage kicker="Governance" title="Audit trail">
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        <StudioLoading />
      </AdminPage>
    );
  }

  const rows = filtered.slice(0, shown);

  return (
    <AdminPage
      kicker="Governance"
      title="Audit trail"
      lead="Every administrative change and each recorded read, newest first — what was done, by whom, to what, and the reason where one was captured. Never learner content."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action="the audit-trail read" /> : null}

      {preview === "loaded" ? (
        <Card>
          <CardHeader title="The trail" icon="history" eyebrow="newest first · paged" />
          <div className="gov-filterbar">
            <Field label="Actor">
              <Select
                value={actor}
                onChange={(v) => refilter(() => setActor(v))}
                options={actors.map((a) => ({ value: a, label: a === "all" ? "All actors" : a }))}
              />
            </Field>
            <Field label="Action">
              <input
                value={action}
                onChange={(e) => refilter(() => setAction(e.target.value))}
                placeholder="Filter actions"
              />
            </Field>
            <Field label="Target">
              <input
                value={target}
                onChange={(e) => refilter(() => setTarget(e.target.value))}
                placeholder="Filter targets"
              />
            </Field>
            <Field label="Date">
              <input
                value={date}
                onChange={(e) => refilter(() => setDate(e.target.value))}
                placeholder="e.g. 16 Aug 2026"
              />
            </Field>
          </div>

          {filtered.length === 0 ? (
            <StateBlock state="empty" message="No audit entries match these filters." />
          ) : (
            <>
              <DataTable
                label="Audit trail entries"
                columns={["When", "Actor", "Action", "Target", "Reason"]}
                rows={rows.map((r) => ({
                  key: r.id,
                  cells: [r.at, r.actor, r.action, r.target ?? "—", r.reason ?? "—"]
                }))}
              />
              <div className="gov-pager">
                {/* The total was counted under the same authorization, filters
                    and snapshot as the list — so it is stated, not guessed. */}
                <LoadedLine loaded={rows.length} total={filtered.length} />
                {rows.length < filtered.length ? (
                  <Button variant="secondary" size="sm" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                    Load next {Math.min(PAGE_SIZE, filtered.length - rows.length)}
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </Card>
      ) : null}
    </AdminPage>
  );
}
