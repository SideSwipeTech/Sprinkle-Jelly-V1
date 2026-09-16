/**
 * Debug board — the case list.
 *
 * Each row says what the case is (difficulty, bug types, planted-bug count)
 * and how it can be run (timed-then-practice with its budget and allowance,
 * or practice-only) before the learner opens it — the mode is chosen on the
 * case file, never inside a running solve. An active timed window surfaces
 * here as the continue region, resumable until its clock ends.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, StateBlock } from "@components/Card";
import { Page } from "@components/Page";
import { Icon } from "@icons/Icon";
import { DEBUG_CASES } from "@data/catalog";
import { useStore } from "@state/useStore";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { FilterBar } from "../../extraction/components/FilterBar/FilterBar";
import { ChipGroup } from "../../extraction/components/ChipGroup/ChipGroup";
import { debugMetaFor, debugXp } from "./cases";

type CaseState = "new" | "submitted" | "fixed";

function caseState(id: string, resolved: string[], submitted: string[]): CaseState {
  if (resolved.includes(id)) return "fixed";
  if (submitted.includes(id)) return "submitted";
  return "new";
}

export function Debug() {
  const store = useStore();
  const [status, setStatus] = useState<"all" | CaseState>("all");
  const [mode, setMode] = useState<"all" | "practice" | "timed">("all");
  const [diff, setDiff] = useState("all");
  const [q, setQ] = useState("");

  const rows = DEBUG_CASES.filter((c) => {
    const meta = debugMetaFor(c.id);
    const st = caseState(c.id, store.debugResolved, store.debugSubmitted);
    if (status !== "all" && st !== status) return false;
    if (mode !== "all" && meta && meta.mode !== mode) return false;
    if (diff !== "all" && c.difficulty.toLowerCase() !== diff) return false;
    if (q && !`${c.title} ${meta?.bugTypes.join(" ") ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const windowCase = store.debugWindow ? DEBUG_CASES.find((c) => c.id === store.debugWindow!.caseId) ?? null : null;
  const remainingMs = store.debugWindow ? Math.max(0, Date.parse(store.debugWindow.endsAt) - Date.now()) : 0;

  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Debug Detective"
      lead={`${DEBUG_CASES.length} published cases — read the failing program, repair the planted bug, submit the fix. Timed cases state their window before you start one.`}
    >
      {store.debugWindow && windowCase ? (
        <Card live>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="micro" style={{ margin: 0, color: "var(--c-text-faint)" }}>TIMED WINDOW IN PROGRESS</p>
              <strong>{windowCase.title}</strong>
              <p className="meta" style={{ margin: "2px 0 0" }}>
                {remainingMs > 0 ? `${Math.ceil(remainingMs / 60000)} min left — the clock keeps running` : "the window's clock has run out — it finalises on the case page"}
              </p>
            </div>
            <Link className="btn btn--primary" to={`/debug/${windowCase.id}`}>Resume window</Link>
          </div>
        </Card>
      ) : null}

      <FilterBar
        label="Case filters"
        search={{ value: q, onChange: setQ, placeholder: "Search cases or bug types…" }}
        count={`${rows.length} of ${DEBUG_CASES.length} cases`}
      >
        <ChipGroup
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          options={[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "submitted", label: "Submitted" },
            { id: "fixed", label: "Fixed" }
          ]}
        />
        <ChipGroup
          label="Mode"
          value={mode}
          onChange={(v) => setMode(v as typeof mode)}
          options={[
            { id: "all", label: "All" },
            { id: "timed", label: "Timed" },
            { id: "practice", label: "Practice" }
          ]}
        />
        <ChipGroup
          label="Difficulty"
          value={diff}
          onChange={setDiff}
          options={[
            { id: "all", label: "All" },
            { id: "easy", label: "Easy" },
            { id: "medium", label: "Medium" },
            { id: "hard", label: "Hard" }
          ]}
        />
      </FilterBar>

      {rows.length === 0 ? (
        <Card>
          <StateBlock
            state="empty"
            message="Nothing matches the current filters — the board itself loaded fine."
            action={
              <button className="btn btn--secondary" type="button" onClick={() => { setStatus("all"); setMode("all"); setDiff("all"); setQ(""); }}>
                Clear filters
              </button>
            }
          />
        </Card>
      ) : (
        <List>
          {rows.map((c) => {
            const meta = debugMetaFor(c.id);
            const st = caseState(c.id, store.debugResolved, store.debugSubmitted);
            return (
              <ListRow key={c.id} to={`/debug/${c.id}`} done={st === "fixed"} align="center">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <strong>{c.title}</strong>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{debugXp(c.difficulty)} XP</span>
                      <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{c.difficulty}</span>
                      {st === "fixed" ? <span className="chip" style={{ fontSize: "11px" }}>✓ Fixed</span> : null}
                      {st === "submitted" ? <span className="chip chip--quiet" style={{ fontSize: "11px" }}>Submitted</span> : null}
                    </div>
                  </div>
                  <p className="meta" style={{ margin: "4px 0 0" }}>
                    {meta
                      ? `${meta.bugTypes.join(", ")} · ${meta.bugCount} planted bug${meta.bugCount === 1 ? "" : "s"} · ${
                          meta.mode === "timed"
                            ? `timed-then-practice · ${meta.timedMinutes} min window · ${meta.timedAllowance} allowed`
                            : "practice only"
                        }`
                      : "case detail unavailable in this demo"}
                  </p>
                </div>
                <Icon name="chevron-right" size={14} />
              </ListRow>
            );
          })}
        </List>
      )}
    </Page>
  );
}
