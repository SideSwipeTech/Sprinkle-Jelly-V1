/**
 * KnowledgeAdmin — knowledge-base administration, under Assistant
 * (companion/01-pages.md §"The five admin destinations"; companion/05
 * §"The knowledge base"; companion/02-records.md — companion_kb_gate).
 *
 * The two gate settings — COMPANION_KB_MINIMUM_SCORE and
 * COMPANION_KB_MINIMUM_MARGIN — are set in this one place and edited
 * nowhere else: the studio shows the answering gate in force and the effect
 * a change would have, never edits it. Changing either requires the
 * labelled evaluation-set preview, a change that takes effect whole or not
 * at all, a version record and an audit entry. The evaluation set is
 * private, held and maintained by super administrators alone.
 *
 * The gate answers only when the score and the margin both clear their
 * thresholds — a change to one shifts what answers and what falls to no
 * match.
 *
 * Separately permissioned under its own named action. Fixture state only —
 * no store writes, no network.
 */

import { useState } from "react";
import { Card, CardHeader } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Field } from "../../extraction/components/Field/Field";
import { Notice } from "../../extraction/components/Notice/Notice";
import { Chip } from "../../extraction/components/Chip/Chip";
import { DataTable } from "../../extraction/components/DataTable/DataTable";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { EVALUATION_SET, GATE_SETTINGS, GATE_VERSIONS, type GateVersion } from "./fixtures";

interface Flash {
  tone: "success" | "error" | "info";
  text: string;
}

/** The gate's rule, verbatim from the records: an answer returns only when
 *  the best match's score and its margin over the runner-up both clear. */
function answers(score: number, margin: number, probe: { bestScore: number; margin: number }) {
  return probe.bestScore >= score && probe.margin >= margin;
}

export function KnowledgeAdmin() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS.slice(0, 3));
  const [gate, setGate] = useState({ score: GATE_SETTINGS[0]!.value, margin: GATE_SETTINGS[1]!.value });
  const [draft, setDraft] = useState({ score: String(gate.score), margin: String(gate.margin) });
  const [versions, setVersions] = useState<GateVersion[]>(GATE_VERSIONS);
  const [previewed, setPreviewed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  const proposed = { score: Number(draft.score), margin: Number(draft.margin) };
  const dirty = proposed.score !== gate.score || proposed.margin !== gate.margin;

  /* Whole-or-nothing validation — an out-of-bound or off-step value names
   *  its setting and rejects the whole change. */
  function invalid(): string | null {
    for (const [i, key] of (["score", "margin"] as const).entries()) {
      const s = GATE_SETTINGS[i]!;
      const v = proposed[key];
      if (Number.isNaN(v) || v < s.bound[0] || v > s.bound[1]) {
        return `${s.key} is outside its operable bound (${s.bound[0]} to ${s.bound[1]}, steps of ${s.step}). The whole change is rejected.`;
      }
      if (Math.abs(v / s.step - Math.round(v / s.step)) > 1e-9) {
        return `${s.key} moves in steps of ${s.step}. The whole change is rejected.`;
      }
    }
    return null;
  }

  function requestPreview() {
    const bad = invalid();
    if (bad) {
      setFlash({ tone: "error", text: `Refused — ${bad}` });
      setPreviewed(false);
      return;
    }
    setPreviewed(true);
    setFlash(null);
  }

  function commit() {
    const ref = `AUD-2026-${String(856 + versions.length)}`;
    const next: GateVersion = {
      version: versions[0]!.version + 1,
      at: "25 Aug 2026, 09:48 IST",
      actor: "this operator",
      score: proposed.score,
      margin: proposed.margin,
      auditRef: ref
    };
    setVersions((prev) => [next, ...prev]);
    setGate({ score: proposed.score, margin: proposed.margin });
    setConfirmOpen(false);
    setPreviewed(false);
    setFlash({
      tone: "success",
      text: `Version ${next.version} recorded — the change took effect whole, and committed with ${ref}.`
    });
  }

  const flips = previewed
    ? EVALUATION_SET.filter((p) => answers(gate.score, gate.margin, p) !== answers(proposed.score, proposed.margin, p))
    : [];

  return (
    <AdminPage
      kicker="Assistant"
      title="Knowledge-base administration"
      lead="The answering gate's two settings live here and are edited nowhere else — each change is previewed against the labelled evaluation set, takes effect whole or not at all, and carries a version record and an audit entry."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action="companion.edit_kb_gate" /> : null}
      {preview !== "loading" && preview !== "refused" ? (
        <>
          {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}

          <div className="grid-2">
            <Card>
              <CardHeader title="The answering gate" icon="lock" eyebrow="companion_kb_gate · one row" />
              <p className="meta">
                An answer returns only when the best match's own score and its margin over the
                runner-up both clear their thresholds.
              </p>
              {GATE_SETTINGS.map((s, i) => {
                const key = (["score", "margin"] as const)[i]!;
                return (
                  <Field
                    key={s.key}
                    label={<code>{s.key}</code>}
                    hint={`${s.what} · in force ${s.value} · operable ${s.bound[0]} to ${s.bound[1]}, steps of ${s.step}`}
                  >
                    <input
                      type="number"
                      step={s.step}
                      min={s.bound[0]}
                      max={s.bound[1]}
                      value={draft[key]}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, [key]: e.target.value }));
                        setPreviewed(false);
                        setFlash(null);
                      }}
                    />
                  </Field>
                );
              })}
              <div className="row">
                <Button size="sm" icon="search" disabled={!dirty} onClick={requestPreview}>
                  Preview against the evaluation set
                </Button>
              </div>
            </Card>

            <Card live={previewed}>
              <CardHeader
                title="Evaluation-set preview"
                icon="flask"
                eyebrow="private — super administrators' own set"
              />
              {!previewed ? (
                <p className="meta">
                  Changing either setting requires this preview first — it writes nothing and the
                  change takes effect whole or not at all.
                </p>
              ) : (
                <>
                  <p className="meta">
                    {flips.length === 0
                      ? "No probe changes outcome under the proposed settings."
                      : `${flips.length} of ${EVALUATION_SET.length} probes change outcome under the proposed settings.`}
                  </p>
                  <DataTable
                    label="Outcome per probe — current against proposed"
                    columns={["Probe", "Best score", "Margin", "In force", "Proposed"]}
                    rows={EVALUATION_SET.map((p) => ({
                      key: p.id,
                      cells: [
                        p.question,
                        String(p.bestScore),
                        String(p.margin),
                        answers(gate.score, gate.margin, p) ? "answers" : "no match",
                        <strong className="x-data-table__value">
                          {answers(proposed.score, proposed.margin, p) ? "answers" : "no match"}
                        </strong>
                      ]
                    }))}
                  />
                  <div className="row">
                    <Button icon="check" onClick={() => setConfirmOpen(true)}>
                      Apply whole, as version {versions[0]!.version + 1}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader title="Version record" icon="history" eyebrow="one per change · each with its audit entry" />
            <List>
              {versions.map((v, i) => (
                <ListRow key={v.version} as="article">
                  <div>
                    <strong>
                      version {v.version} — score {v.score} · margin {v.margin}
                    </strong>
                    <p className="meta">
                      {v.at} · {v.actor} · {v.auditRef}
                    </p>
                  </div>
                  {i === 0 ? <Chip variant="quiet" size="sm">in force</Chip> : null}
                </ListRow>
              ))}
            </List>
          </Card>

          <Dialog
            open={confirmOpen}
            title={`Apply the gate as version ${versions[0]!.version + 1}`}
            icon="lock"
            onClose={() => setConfirmOpen(false)}
            actions={
              <>
                <Button onClick={commit}>Confirm — takes effect whole</Button>
                <Button variant="quiet" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              </>
            }
          >
            <p>
              COMPANION_KB_MINIMUM_SCORE {gate.score} → <strong>{proposed.score}</strong> and
              COMPANION_KB_MINIMUM_MARGIN {gate.margin} → <strong>{proposed.margin}</strong>.{" "}
              {flips.length} of {EVALUATION_SET.length} evaluation probes change outcome. The change
              takes effect whole or not at all, records a version and commits with an audit entry.
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
