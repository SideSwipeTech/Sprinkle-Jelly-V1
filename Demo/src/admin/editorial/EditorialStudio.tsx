/**
 * EditorialStudio — the editorial solution studio: platform-authored worked
 * solutions per item and per language (admin 01-pages.md; challenges.F30).
 *
 * One worked solution per item per language — the authored approach, its
 * explanation, its complexity notes, and its code in the shared editor. Its
 * own review checklist and its own execution gate are on-screen and separate:
 * the gate is held to the same execution check as the reference solution, and
 * a check that cannot run is stated "not yet verifiable" — never passed off
 * as a pass. This is never the reference solution and never derived from a
 * learner's code; a language with none says so rather than substituting one.
 *
 * Fixture state only — no store writes, no network.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { canPublishDirect } from "../roles";
import { useStore } from "@state/useStore";
import { CodeEditorChrome } from "../../extraction/components/CodeEditorChrome/CodeEditorChrome";
import { Terminal } from "../../extraction/components/Terminal/Terminal";
import { Button } from "../../extraction/components/Button/Button";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { FormGrid, FormGridWide } from "../../extraction/components/FormGrid/FormGrid";
import { Notice } from "../../extraction/components/Notice/Notice";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Chip } from "../../extraction/components/Chip/Chip";
import { ChipTabBar } from "../../extraction/components/ChipTabBar/ChipTabBar";
import { ToolCluster } from "../../extraction/components/ToolCluster/ToolCluster";
import { LoadedLine } from "../assessments/shared";
import {
  EDITORIAL_ITEMS,
  LANGUAGE_LABEL,
  type EditorialItem,
  type EditorialLanguage,
  type WorkedSolution
} from "./fixtures";
import "./editorial-studio.css";

const KIND_LABEL: Record<EditorialItem["kind"], string> = {
  challenge: "challenge",
  daily: "daily challenge",
  debug: "debug case"
};

const LIFECYCLE_LABEL: Record<WorkedSolution["lifecycle"], string> = {
  draft: "draft",
  "in-review": "in review",
  published: "published"
};

interface Flash {
  tone: "success" | "error" | "info" | "warning";
  text: string;
}

/* ── The pick-list — the studio's index ───────────────────────────────────── */

/* The three facts the index filters on, read off the item's own languages.
   They are not exclusive — an item can be missing a language and carry a
   stale check at once, so the filter asks "which items carry this fact":
     authored — every supported language carries a worked solution
     missing  — at least one supported language carries none (the spec's
                "not authored in this language", stated honestly)
     stale    — an authored solution's execution check fails or cannot run;
                it cannot publish until the check holds again */
interface ItemFacts {
  authoredCount: number;
  publishedCount: number;
  missing: boolean;
  stale: boolean;
}

function itemFacts(item: EditorialItem): ItemFacts {
  const authoredCount = item.languages.filter((l) => item.solutions[l]).length;
  return {
    authoredCount,
    publishedCount: item.languages.filter(
      (l) => item.solutions[l]?.lifecycle === "published"
    ).length,
    missing: authoredCount < item.languages.length,
    stale: item.languages.some((l) => {
      const status = item.solutions[l]?.gate.status;
      return status === "failing" || status === "unverifiable";
    })
  };
}

type IndexFilter = "all" | "authored" | "missing" | "stale";

export function EditorialIndex() {
  const [status, setStatus] = useState<IndexFilter>("all");

  const filtered = EDITORIAL_ITEMS.filter((item) => {
    if (status === "all") return true;
    const f = itemFacts(item);
    return status === "authored"
      ? f.authoredCount === item.languages.length
      : status === "missing"
        ? f.missing
        : f.stale;
  });

  return (
    <AdminPage
      kicker="Content / Editorial studio"
      title="Editorial"
      lead="Platform-authored worked solutions per item and per language — never the reference solution, never derived from a learner's code. A learner meets one only after their own accepted solve."
    >
      {EDITORIAL_ITEMS.length === 0 ? (
        <StateBlock
          state="empty"
          message="No items carry an editorial yet — an intentionally empty shelf is not an outage."
        />
      ) : (
        <>
          <div className="filters" role="group" aria-label="Editorial coverage filter">
            {(["all", "authored", "missing", "stale"] as const).map((s) => {
              /* Each chip states its count — the same three facts the rows
                 carry, counted live under this authorization and snapshot. */
              const count =
                s === "all"
                  ? EDITORIAL_ITEMS.length
                  : EDITORIAL_ITEMS.filter((item) => {
                      const f = itemFacts(item);
                      return s === "authored"
                        ? f.authoredCount === item.languages.length
                        : s === "missing"
                          ? f.missing
                          : f.stale;
                    }).length;
              return (
                <Chip key={s} size="sm" selected={status === s} onClick={() => setStatus(s)}>
                  {s} <span className="estudio-filter-count">{count}</span>
                </Chip>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message="No items carry this fact — a filtered nothing is not an empty shelf."
              action={
                <Button variant="secondary" size="sm" onClick={() => setStatus("all")}>
                  Clear the filter
                </Button>
              }
            />
          ) : (
            <>
              <LoadedLine loaded={filtered.length} total={EDITORIAL_ITEMS.length} />
              <List>
                {filtered.map((item) => {
                  const f = itemFacts(item);
                  return (
                    /* A static record row — the title keeps its own link and
                       Open is a visible verb; the per-language lifecycle acts
                       live inside the studio, never on the item's row. */
                    <ListRow key={item.id} as="article">
                      <div className="estudio-row-main">
                        <Link className="estudio-name" to={`/admin/editorial/${item.id}`}>
                          <strong>{item.title}</strong>
                        </Link>
                        <p className="meta estudio-facts">
                          {KIND_LABEL[item.kind]} · {f.authoredCount} of {item.languages.length}{" "}
                          languages authored · {f.publishedCount} published
                          {f.missing
                            ? ` · ${item.languages.length - f.authoredCount} not authored`
                            : ""}
                          {" · "}
                          {item.languages.map((l, i) => (
                            <span key={l}>
                              {i > 0 ? ", " : ""}
                              <span
                                className="estudio-lang"
                                data-authored={item.solutions[l] ? true : undefined}
                                title={
                                  item.solutions[l]
                                    ? undefined
                                    : "not authored in this language"
                                }
                              >
                                {LANGUAGE_LABEL[l]}
                              </span>
                            </span>
                          ))}
                        </p>
                      </div>
                      <span className="estudio-row-side">
                        {f.stale ? (
                          <span className="estudio-flag">
                            <Icon name="clock" size={11} /> check stale
                          </span>
                        ) : null}
                        <Button variant="secondary" size="sm" to={`/admin/editorial/${item.id}`}>
                          Open
                        </Button>
                      </span>
                    </ListRow>
                  );
                })}
              </List>
              <p className="meta">
                Counted under this authorization, this filter and this snapshot. A language with no
                worked solution says so on the item — the reference solution is never offered in its
                place. Stale marks an authored solution whose execution check fails or cannot run —
                it cannot publish until the check holds.
              </p>
            </>
          )}
        </>
      )}
    </AdminPage>
  );
}

/* ── The studio ───────────────────────────────────────────────────────────── */

export function EditorialStudio({ itemId }: { itemId: string }) {
  const store = useStore();
  const item = EDITORIAL_ITEMS.find((i) => i.id === itemId);

  const [language, setLanguage] = useState<EditorialLanguage | null>(
    item?.languages[0] ?? null
  );
  /* Edits and locally-authored languages — fixture state held per render. */
  const [edits, setEdits] = useState<Partial<Record<EditorialLanguage, WorkedSolution>>>({});
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [lifecycle, setLifecycle] = useState<Partial<Record<EditorialLanguage, WorkedSolution["lifecycle"]>>>({});
  const [flash, setFlash] = useState<Flash | null>(null);
  const [running, setRunning] = useState(false);

  if (!item) {
    return (
      <AdminPage kicker="Content / Editorial studio" title="Item unavailable">
        <StateBlock
          state="unavailable"
          message="This item does not resolve — an editorial is never shown where the thing it explains is absent."
          action={<Button variant="secondary" to="/admin/editorial">Editorial</Button>}
        />
      </AdminPage>
    );
  }

  const lang = language ?? item.languages[0];
  const fixtureSolution = lang ? item.solutions[lang] : undefined;
  const solution = (lang && edits[lang]) ?? fixtureSolution;
  const effectiveLifecycle = (lang && lifecycle[lang]) ?? solution?.lifecycle;

  /* The review checklist — evidence before the decision; the execution gate
     is a separate row of state, not an item the author ticks. */
  const review = solution
    ? [
        {
          id: "approach",
          label: "The approach is named",
          state: solution.approach.trim() ? "met" : "open",
          evidence: solution.approach.trim() || "the title a learner reads first",
          authored: false
        },
        {
          id: "explanation",
          label: "The explanation stands alone",
          state: solution.explanation.trim() ? "met" : "open",
          evidence: solution.explanation.trim()
            ? `${solution.explanation.trim().length} characters — reads without the code beside it`
            : "nothing written yet",
          authored: false
        },
        {
          id: "complexity",
          label: "Complexity notes state time and space",
          state: solution.timeComplexity.trim() && solution.spaceComplexity.trim() ? "met" : "open",
          evidence: `time — ${solution.timeComplexity || "—"} · space — ${solution.spaceComplexity || "—"}`,
          authored: false
        },
        {
          id: "not-reference",
          label: "Separately authored — not the reference solution",
          state: ticks["not-reference"] ? "met" : "open",
          evidence: "your tick is the record — the object is never derived from the reference or a learner's code",
          authored: true
        },
        {
          id: "reviewed",
          label: "I reviewed it as a learner will meet it",
          state: ticks["reviewed"] ? "met" : "open",
          evidence: "unlocked only by the learner's own accepted solve",
          authored: true
        }
      ]
    : [];

  function patchSolution(patch: Partial<WorkedSolution>) {
    if (!lang) return;
    const base =
      edits[lang] ??
      fixtureSolution ?? {
        language: lang,
        approach: "",
        explanation: "",
        timeComplexity: "",
        spaceComplexity: "",
        code: "",
        lifecycle: "draft" as const,
        gate: { status: "unrun" as const, detail: "not yet run — the execution check is owed before publish" }
      };
    setEdits((prev) => ({ ...prev, [lang]: { ...base, ...patch } }));
  }

  function runGate() {
    if (!lang) return;
    const gate = fixtureSolution?.gate;
    if (!gate || gate.status === "unverifiable") {
      setFlash({
        tone: "warning",
        text: "The check cannot run — this language's gate reads not yet verifiable. A failed or missing check names what is owed; a check that cannot run says so."
      });
      return;
    }
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setFlash(
        gate.status === "failing"
          ? { tone: "error", text: `The execution check ran — ${gate.detail}.` }
          : { tone: "success", text: "The execution check ran clean — the gate holds." }
      );
    }, 700);
  }

  function publish() {
    if (!lang || !solution) return;
    const gate = fixtureSolution?.gate;
    if (gate?.status !== "passing") {
      setFlash({
        tone: "error",
        text: `Publish refused — ${gate?.detail ?? "the execution check has not run"}. The editorial is held to the same execution check as the reference solution.`
      });
      return;
    }
    setLifecycle((prev) => ({ ...prev, [lang]: "published" }));
    setFlash({
      tone: "success",
      text: `Published — the ${LANGUAGE_LABEL[lang]} worked solution is now what a learner unlocks.`
    });
  }

  return (
    <AdminPage
      kicker="Content / Editorial studio"
      title={item.title}
      lead="One worked solution per language — the authored approach, its explanation, its complexity notes and its code, each with its own review and execution gate. Hidden tests and the reference solution stay administrator-only and are never exposed here."
      actions={
        <span className="row">
          <Chip size="sm" variant="quiet">
            {KIND_LABEL[item.kind]}
          </Chip>
          <Button variant="secondary" to="/admin/editorial" icon="arrow-left">
            All items
          </Button>
        </span>
      }
    >
      <Card>
        <CardHeader title="Language" icon="code" eyebrow={`${item.languages.length} supported`} />
        <ChipTabBar
          label="Worked solution language"
          value={lang ?? ""}
          onChange={(v) => setLanguage(v as EditorialLanguage)}
          tabs={item.languages.map((l) => {
            const s = edits[l] ?? item.solutions[l];
            const lc = lifecycle[l] ?? s?.lifecycle;
            return {
              id: l,
              label: `${LANGUAGE_LABEL[l]} — ${lc ? LIFECYCLE_LABEL[lc] : "not authored"}`
            };
          })}
        />
        <p className="meta estudio-facts">
          {item.languages.filter((l) => (edits[l] ?? item.solutions[l])).length} of{" "}
          {item.languages.length} languages authored — a language with none says so on its
          tab rather than substituting the reference solution.
        </p>
      </Card>

      {flash ? (
        <Notice tone={flash.tone} live="polite">
          {flash.text}
        </Notice>
      ) : null}

      {!lang ? (
        <StateBlock state="empty" message="This item supports no languages — nothing to author." />
      ) : !solution ? (
        <Card>
          <StateBlock
            state="empty"
            message={`Not authored in this language — ${LANGUAGE_LABEL[lang]} carries no worked solution yet, and the reference solution is never offered in its place.`}
            action={
              <Button onClick={() => patchSolution({})}>Author the worked solution</Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader
              title={`Worked solution — ${LANGUAGE_LABEL[lang]}`}
              icon="sticky-note"
              eyebrow={LIFECYCLE_LABEL[effectiveLifecycle ?? "draft"]}
            />
            <FormGrid>
              <Field label="Approach" required hint="The title a learner reads first.">
                <input
                  value={solution.approach}
                  onChange={(e) => patchSolution({ approach: e.target.value })}
                />
              </Field>
              <Field
                label="Lifecycle"
                hint="Draft and in review move freely; published is reachable only through the rail's Publish, behind the execution gate."
              >
                <Select
                  value={effectiveLifecycle ?? "draft"}
                  onChange={(v) =>
                    setLifecycle((prev) => ({ ...prev, [lang]: v as WorkedSolution["lifecycle"] }))
                  }
                  options={(
                    [
                      ["draft", "draft"],
                      ["in-review", "in review"],
                      ["published", "published"]
                    ] as const
                  ).map(([v, l]) => ({ value: v, label: l, disabled: v === "published" }))}
                  aria-label="Lifecycle"
                />
              </Field>
              <FormGridWide>
                <Field
                  label="Explanation"
                  hint="The editorial body — stands alone; a learner reads it after their own accepted solve."
                >
                  <textarea
                    value={solution.explanation}
                    onChange={(e) => patchSolution({ explanation: e.target.value })}
                  />
                </Field>
              </FormGridWide>
              <Field label="Time complexity">
                <input
                  value={solution.timeComplexity}
                  onChange={(e) => patchSolution({ timeComplexity: e.target.value })}
                />
              </Field>
              <Field label="Space complexity">
                <input
                  value={solution.spaceComplexity}
                  onChange={(e) => patchSolution({ spaceComplexity: e.target.value })}
                />
              </Field>
            </FormGrid>
          </Card>

          <Card>
            <CardHeader title="Code" icon="code" eyebrow="the shared editor" />
            <CodeEditorChrome
              value={solution.code}
              onChange={(code) => patchSolution({ code })}
              language={lang}
              filename={`editorial.${lang === "python" ? "py" : lang === "javascript" ? "js" : lang === "typescript" ? "ts" : lang === "java" ? "java" : lang === "cpp" ? "cpp" : "go"}`}
              showMinimap={false}
            />
          </Card>

          <div className="estudio-split">
            <Card>
              <CardHeader title="Review checklist" icon="check" eyebrow="evidence before the decision" />
              <ul className="estudio-review">
                {review.map((r) => (
                  <li className="estudio-check" key={r.id} data-state={r.state}>
                    {r.authored ? (
                      <input
                        type="checkbox"
                        checked={Boolean(ticks[r.id])}
                        onChange={(e) => setTicks((t) => ({ ...t, [r.id]: e.target.checked }))}
                        aria-label={r.label}
                      />
                    ) : (
                      <span className="estudio-check__mark">
                        <Icon name={r.state === "met" ? "check" : "alert"} size={12} />
                      </span>
                    )}
                    <span className="estudio-check__body">
                      <span className="estudio-check__label">{r.label}</span>
                      <span className="estudio-check__evidence">{r.evidence}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Execution gate" icon="zap" eyebrow="separate from review" />
              <GatePanel
                gateStatus={fixtureSolution?.gate}
                running={running}
                onRun={runGate}
              />
            </Card>
          </div>

          <Card>
            <CardHeader title="Lifecycle" icon="shield" eyebrow={LIFECYCLE_LABEL[effectiveLifecycle ?? "draft"]} />
            <ToolCluster
              label="Worked solution"
              readout={
                fixtureSolution?.gate.status === "passing"
                  ? "The gate holds — publish is open."
                  : "Publish stays closed until the execution check passes — the same check the reference solution answers to."
              }
            >
              <Button
                icon="save"
                onClick={() =>
                  setFlash({ tone: "success", text: "Saved — only what changed was submitted." })
                }
              >
                Save
              </Button>
              {canPublishDirect(store.session.role) ? (
                <Button variant="secondary" onClick={publish}>
                  Publish directly
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setFlash({
                      tone: "info",
                      text: "Submitted for approval — Publish Approvals carries the studio, the submitter and both halves of the change record."
                    })
                  }
                >
                  Submit for approval
                </Button>
              )}
              {effectiveLifecycle === "published" ? (
                <Button
                  variant="quiet"
                  onClick={() => {
                    setLifecycle((prev) => ({ ...prev, [lang]: "draft" }));
                    setFlash({ tone: "info", text: "Returned to draft — a learner no longer unlocks this language's worked solution." });
                  }}
                >
                  Return to draft
                </Button>
              ) : null}
            </ToolCluster>
          </Card>
        </>
      )}

      <p className="meta">
        <Link to="/admin/editorial">Editorial</Link>
      </p>
    </AdminPage>
  );
}

/* ── The gate panel ───────────────────────────────────────────────────────── */

function GatePanel({
  gateStatus,
  running,
  onRun
}: {
  gateStatus: WorkedSolution["gate"] | undefined;
  running: boolean;
  onRun: () => void;
}) {
  const gate = gateStatus ?? { status: "unrun" as const, detail: "not yet run" };

  if (gate.status === "unverifiable") {
    return (
      <>
        <p className="estudio-gate" data-status="unverifiable">
          <Icon name="alert" size={14} /> not yet verifiable
        </p>
        <Notice tone="warning" title="The check cannot run">
          <p>{gate.detail}. A worked solution in this state cannot publish — the gate owes a run, and nothing here pretends otherwise.</p>
        </Notice>
        <div className="admin-tools">
          <Button variant="secondary" size="sm" onClick={onRun} disabled={running}>
            Re-try the execution check
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="estudio-gate" data-status={gate.status}>
        <Icon
          name={gate.status === "passing" ? "check" : gate.status === "failing" ? "x" : "terminal"}
          size={14}
        />
        {gate.status === "passing"
          ? "passing — held to the same execution check as the reference solution"
          : gate.status === "failing"
            ? `failing — ${gate.detail}`
            : "not yet run — the execution check is owed before publish"}
      </p>
      <Terminal
        output={gate.output ?? null}
        isExecuting={running}
        onRun={onRun}
        testCases={gate.cases}
        statusLine={
          gate.status === "passing"
            ? { tone: "pass", text: "the execution check passes" }
            : gate.status === "failing"
              ? { tone: "fail", text: "exit 1 — a refused publish names the failing case" }
              : undefined
        }
        label="Execution check"
      />
      {gate.status === "unrun" ? (
        <p className="meta">
          The check has never run for this draft — a publish attempted now is refused, named as owed.
        </p>
      ) : null}
    </>
  );
}
