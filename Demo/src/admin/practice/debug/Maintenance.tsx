/**
 * Maintenance — `debug/maintenance`. The maintenance path: the ONLY place
 * permanent removal of a pristine draft is offered (debug.F22, debug/01
 * "Maintenance path"). No case-list row action and no editor control offers
 * it — the index carries publish, return-to-draft and archive, and the
 * studio's controls stop at the same set.
 *
 * A pristine draft is a draft nobody has met — no open, no submission, no
 * fix. Where the shared content guard refuses (a draft with learner contact,
 * or anything past draft), archive stands in the control's place rather than
 * a control that can only error.
 *
 * Permanent removal is the console's typed-confirmation tier: the draft's
 * title echoed exactly, a preview of what goes, and the action unreachable
 * until the echo matches — a mistyped confirmation leaves the action
 * unreachable rather than warning afterwards.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { useStore } from "@state/useStore";
import { setDebugLifecycle } from "@state/store";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { ConfirmByTyping } from "../../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Notice } from "../../../extraction/components/Notice/Notice";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../../assessments/shared";
import {
  ACTION,
  DEBUG_CASE_STATS,
  DEBUG_FIXTURE_ROWS,
  isPristineDraft,
  recordAudit,
  type DebugCaseRow
} from "./fixtures";
import { DebugTabs } from "./DebugTabs";
import "./debug-admin.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

type Lifecycle = DebugCaseRow["lifecycle"];

function asLifecycle(v: string): Lifecycle {
  return v === "published" || v === "archived" ? v : "draft";
}

interface MaintRow extends DebugCaseRow {
  /** Where the row's lifecycle is held — the store's list or this fixture. */
  storeBacked: boolean;
  /** False where no count read exists — pristine cannot be confirmed. */
  countsKnown: boolean;
}

export function Maintenance() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [echo, setEcho] = useState<Record<string, string>>({});
  /* gone[id]: "removed" — the draft no longer exists; "archived" — the guard
     refused removal and archive stood in the control's place. */
  const [gone, setGone] = useState<Record<string, "removed" | "archived">>({});
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  /* Every draft the studio knows — store rows first, then fixture-only
     drafts the store's list does not hold. Counts decide pristine. */
  const drafts: MaintRow[] = [
    ...store.adminDebugCases.map((c) => {
      const stats = DEBUG_CASE_STATS[c.id];
      const base: DebugCaseRow = stats ?? {
        id: c.id,
        title: c.title,
        lifecycle: "draft",
        difficulty: "",
        primarySkill: "",
        bugTypes: [],
        bugCount: null,
        mode: "practice",
        budgetMinutes: null,
        createdAt: "",
        publishedAt: null,
        opened: 0,
        submitted: 0,
        fixed: 0,
        timed: null,
        practice: null,
        computedAt: ""
      };
      return {
        ...base,
        title: c.title,
        lifecycle: gone[c.id] === "archived" ? "archived" : asLifecycle(c.lifecycle),
        storeBacked: true,
        countsKnown: stats !== undefined
      };
    }),
    ...DEBUG_FIXTURE_ROWS.map((d) => ({
      ...d,
      lifecycle: gone[d.id] === "archived" ? ("archived" as const) : d.lifecycle,
      storeBacked: false,
      countsKnown: true
    }))
  ].filter((r) => r.lifecycle === "draft" && gone[r.id] !== "removed");

  function removeDraft(row: MaintRow) {
    setGone((g) => ({ ...g, [row.id]: "removed" }));
    recordAudit(`Debug case ${row.id} — pristine draft removed permanently (${ACTION.removePristineDraft})`);
    setFlash({ tone: "success", text: `“${row.title}” removed permanently — the draft record and its authored material are gone. No learner ever met it, so nothing else followed it.` });
  }

  function archiveInstead(row: MaintRow) {
    if (row.storeBacked) setDebugLifecycle(row.id, "archived");
    setGone((g) => ({ ...g, [row.id]: "archived" }));
    recordAudit(`Debug case ${row.id} → archived — removal refused by the shared content guard, archive stood in its place`);
    setFlash({ tone: "success", text: `“${row.title}” archived — removal was refused because the draft carries learner contact. Archive is terminal and keeps its history.` });
  }

  return (
    <AdminPage
      kicker="Content · Debug studio"
      title="Maintenance path"
      lead="The only place permanent removal is offered — for a pristine draft nobody has met, and nowhere else in the studio. Anything else is refused by the shared content guard, and archive stands in the control's place."
    >
      <DebugTabs current="maintenance" />

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.removePristineDraft} /> : null}

      {preview === "loaded" ? (
        <Card>
          <CardHeader
            title="Drafts"
            icon="trash"
            eyebrow={`${ACTION.removePristineDraft} — typed confirmation, audited`}
          />
          <p className="meta dbg-flush">
            No case-list row action and no editor control offers removal — this path is the only
            place it exists. Removal is permanent and reaches the draft record and its authored
            material; it is refused where the draft is not pristine.
          </p>
          {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}
          {drafts.length === 0 ? (
            <StateBlock state="empty" compact message="No drafts — nothing the maintenance path can act on." />
          ) : (
            <>
              <div className="dbg-maint">
                {drafts.map((row) => {
                  const pristine = row.countsKnown && isPristineDraft(row);
                  return (
                    <section key={row.id} className="dbg-draft" data-pristine={pristine || undefined}>
                      <header className="dbg-draft__head">
                        <div>
                          <strong>{row.title}</strong>
                          <p className="meta">
                            {row.id} · authored {row.createdAt || "—"}
                            {row.publishedAt ? ` · once published ${row.publishedAt}` : ""}
                          </p>
                        </div>
                        <Chip size="sm" variant={pristine ? "accent" : "quiet"}>
                          {pristine ? "pristine" : row.countsKnown ? "touched" : "counts unread"}
                        </Chip>
                      </header>

                      {/* Preview what goes — identifiers, counts, categories and dates. */}
                      <dl className="dbg-figures dbg-draft__preview">
                        <div className="dbg-figure"><dt>Difficulty</dt><dd>{row.difficulty || "—"}</dd></div>
                        <div className="dbg-figure"><dt>Primary skill</dt><dd>{row.primarySkill || "—"}</dd></div>
                        <div className="dbg-figure"><dt>Bug types</dt><dd>{row.bugTypes.join(", ") || "—"}</dd></div>
                        <div className="dbg-figure"><dt>Mode</dt><dd>{row.mode}</dd></div>
                        <div className="dbg-figure"><dt>Opened</dt><dd>{row.countsKnown ? row.opened : "—"}</dd></div>
                        <div className="dbg-figure"><dt>Submitted</dt><dd>{row.countsKnown ? row.submitted : "—"}</dd></div>
                        <div className="dbg-figure"><dt>Fixed</dt><dd>{row.countsKnown ? row.fixed : "—"}</dd></div>
                      </dl>

                      {pristine ? (
                        <ConfirmByTyping
                          phrase={row.title}
                          value={echo[row.id] ?? ""}
                          onChange={(v) => setEcho((e) => ({ ...e, [row.id]: v }))}
                          label={
                            <>
                              Type <code className="x-confirm__phrase">{row.title}</code> to confirm permanent removal
                            </>
                          }
                        >
                          {(matched) => (
                            <Button
                              variant="destructive"
                              size="sm"
                              icon="trash"
                              disabled={!matched}
                              label={matched ? undefined : "Remove permanently — the echo must match exactly"}
                              onClick={() => removeDraft(row)}
                            >
                              Remove permanently
                            </Button>
                          )}
                        </ConfirmByTyping>
                      ) : (
                        <div className="dbg-refused">
                          <p className="meta">
                            {row.countsKnown
                              ? `Removal refused — the shared content guard: this draft carries learner contact (${row.opened} opened · ${row.submitted} submitted · ${row.fixed} fixed), so it is not pristine.`
                              : "Removal refused — the contact counts could not be read, so the draft cannot be confirmed pristine. A refusal never reads as an absence."}
                            {" "}Archive stands in the control's place.
                          </p>
                          <Button variant="secondary" size="sm" onClick={() => archiveInstead(row)}>
                            Archive instead — terminal
                          </Button>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
              <LoadedLine loaded={drafts.length} total={drafts.length} />
            </>
          )}
        </Card>
      ) : null}
    </AdminPage>
  );
}
