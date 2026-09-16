/**
 * Responses — the response-rule studio, under Assistant (companion/01-pages.md
 * §"The five admin destinations"; companion/03-rules.md §the kind table;
 * companion/05 §"Response-rule authoring").
 *
 * Per moment kind the rule carries the fact, the flourish, the tone, the
 * expression, whether it celebrates and whether it sticks — over the closed
 * registry of thirty-nine kinds in thirteen families. The set publishes as a
 * version; an earlier one restores as a draft that must pass today's
 * publication gate. Publishing is refused, naming the kind, if it would
 * leave any registered kind without copy.
 *
 * The studio may carry two authoring validations — either, both or neither,
 * and no third: a coverage view (kinds with copy no page raises, kinds raised
 * with no copy) and a side-by-side companion and plain preview, so an author
 * sees whether the fact stands alone before publishing. Carrying neither
 * changes no gate and carrying both adds none.
 *
 * Separately permissioned under its own named action. Fixture state only —
 * no store writes, no network.
 */

import { useMemo, useState } from "react";
import { Card, CardHeader } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Notice } from "../../extraction/components/Notice/Notice";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import {
  EXPRESSIONS,
  FACT_MAX,
  FLOURISH_MAX,
  MOMENT_KINDS,
  RULE_VERSIONS,
  TONES,
  type Expression,
  type MomentKind,
  type ResponseRule,
  type Tone
} from "./fixtures";

const FAMILIES = [...new Set(MOMENT_KINDS.map((k) => k.family))];

interface Flash {
  tone: "success" | "error" | "info";
  text: string;
}

export function AssistantResponses() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS.slice(0, 3));
  const [family, setFamily] = useState(FAMILIES[0]!);
  const [kindId, setKindId] = useState(MOMENT_KINDS[0]!.id);
  const [draft, setDraft] = useState<Record<string, ResponseRule>>(() =>
    Object.fromEntries(MOMENT_KINDS.map((k) => [k.id, { ...k.rule }]))
  );
  const [versions, setVersions] = useState(RULE_VERSIONS);
  const [restoredFrom, setRestoredFrom] = useState<number | null>(null);
  const [coverageOn, setCoverageOn] = useState(true);
  const [sideBySideOn, setSideBySideOn] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  const kindsInFamily = MOMENT_KINDS.filter((k) => k.family === family);
  const kind: MomentKind = MOMENT_KINDS.find((k) => k.id === kindId) ?? MOMENT_KINDS[0]!;
  const rule = draft[kind.id]!;

  /* The coverage view's two lists — an empty list is a real result. */
  const coverage = useMemo(() => {
    const withoutCopy = MOMENT_KINDS.filter((k) => draft[k.id]!.fact.trim() === "");
    const unraised = MOMENT_KINDS.filter((k) => !k.raisedBy);
    return { withoutCopy, unraised };
  }, [draft]);

  const dirty =
    restoredFrom !== null ||
    MOMENT_KINDS.some((k) => JSON.stringify(draft[k.id]) !== JSON.stringify(k.rule));

  function patch(patchRule: Partial<ResponseRule>) {
    setDraft((prev) => ({ ...prev, [kind.id]: { ...prev[kind.id]!, ...patchRule } }));
    setFlash(null);
  }

  /* The publication gate fires at the publish press — refused naming the
   *  kind before any confirmation opens. */
  function requestPublish() {
    const bare = MOMENT_KINDS.filter((k) => draft[k.id]!.fact.trim() === "");
    if (bare.length > 0) {
      setFlash({
        tone: "error",
        text: `Publish refused — ${bare.map((k) => k.label).join(", ")} would be left without copy. The refusal is about the copy and never about the registry.`
      });
      return;
    }
    const overFact = MOMENT_KINDS.filter((k) => draft[k.id]!.fact.length > FACT_MAX);
    const overFlourish = MOMENT_KINDS.filter((k) => draft[k.id]!.flourish.length > FLOURISH_MAX);
    if (overFact.length > 0 || overFlourish.length > 0) {
      setFlash({
        tone: "error",
        text: `Publish refused — ${[...overFact.map((k) => `${k.label} (fact over ${FACT_MAX})`), ...overFlourish.map((k) => `${k.label} (flourish over ${FLOURISH_MAX})`)].join(", ")}.`
      });
      return;
    }
    setConfirmOpen(true);
  }

  function publish() {
    const next = versions[0]!.version + 1;
    setVersions((prev) => [
      {
        version: next,
        at: "25 Aug 2026, 09:41 IST",
        actor: "this operator",
        kinds: MOMENT_KINDS.length,
        note: restoredFrom !== null ? `Restored from version ${restoredFrom}, passed today's gate.` : "Published from the studio draft."
      },
      ...prev
    ]);
    setRestoredFrom(null);
    setConfirmOpen(false);
    setFlash({
      tone: "success",
      text: `Published as version ${next} — effective on the next moment. It never re-delivers a past one and re-notifies nobody.`
    });
  }

  function restore(version: number) {
    setRestoredFrom(version);
    setFlash({
      tone: "info",
      text: `Version ${version} restored as a draft — it must pass today's publication gate before anything of it reaches a learner: covering all ${MOMENT_KINDS.length} current kinds, supplying the values each now needs, staying inside the fact and flourish bounds, and using only tone and expression names that currently exist.`
    });
  }

  return (
    <AdminPage
      kicker="Assistant"
      title="Response rules"
      lead="What every moment kind says — the fact, the flourish, the tone, the expression, whether it celebrates and whether it sticks. Published as a version; an earlier one restores as a draft."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action="companion.publish_response_rules" /> : null}
      {preview !== "loading" && preview !== "refused" ? (
        <>
          {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}

          {/* The two authoring validations — either, both or neither. */}
          <div className="a-preview" role="group" aria-label="Authoring validations">
            <span className="a-preview__label">Authoring validations</span>
            <Chip size="sm" selected={coverageOn} onClick={() => setCoverageOn((v) => !v)}>
              Coverage view
            </Chip>
            <Chip size="sm" selected={sideBySideOn} onClick={() => setSideBySideOn((v) => !v)}>
              Side-by-side preview
            </Chip>
          </div>

          {coverageOn ? (
            <Card>
              <CardHeader title="Coverage view" icon="list" eyebrow="validation · optional" />
              <div className="grid-2">
                <div>
                  <p className="meta"><strong>Kinds with copy no page raises</strong></p>
                  {coverage.unraised.length === 0 ? (
                    <p className="meta">None — a real result, not a failed check.</p>
                  ) : (
                    <p className="meta">{coverage.unraised.map((k) => k.label).join(" · ")}</p>
                  )}
                </div>
                <div>
                  <p className="meta"><strong>Kinds raised with no copy</strong></p>
                  {coverage.withoutCopy.length === 0 ? (
                    <p className="meta">None — a real result, not a failed check.</p>
                  ) : (
                    <p className="meta">{coverage.withoutCopy.map((k) => k.label).join(" · ")}</p>
                  )}
                </div>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title="The registry"
              icon="message"
              eyebrow={`${MOMENT_KINDS.length} moment kinds · ${FAMILIES.length} families`}
              action={
                <Select
                  size="sm"
                  value={family}
                  onChange={(v) => {
                    setFamily(v);
                    setKindId(MOMENT_KINDS.find((k) => k.family === v)!.id);
                  }}
                  options={FAMILIES.map((f) => ({ value: f, label: f }))}
                  aria-label="Family"
                />
              }
            />
            <List>
              {kindsInFamily.map((k) => (
                <ListRow key={k.id} selected={k.id === kindId} onClick={() => setKindId(k.id)}>
                  <div>
                    <strong>{k.label}</strong>
                    <p className="meta">
                      raised by {k.raisedBy} · {draft[k.id]!.tone} · {draft[k.id]!.expression}
                      {draft[k.id]!.celebrates ? " · celebrates" : ""}
                      {draft[k.id]!.sticks ? " · sticks" : ""}
                    </p>
                  </div>
                </ListRow>
              ))}
            </List>
          </Card>

          <div className="grid-2">
            <Card>
              <CardHeader title={kind.label} icon="edit" eyebrow={kind.family} />
              <Field
                label="The fact — required, stands alone"
                hint={`${draft[kind.id]!.fact.length} / ${FACT_MAX} characters (COMPANION_FACT_MAX_CHARACTERS)`}
                error={draft[kind.id]!.fact.trim() === "" ? "A kind with an empty fact cannot publish" : undefined}
              >
                <textarea
                  value={draft[kind.id]!.fact}
                  onChange={(e) => patch({ fact: e.target.value })}
                />
              </Field>
              <Field
                label="The flourish — optional"
                hint={`${draft[kind.id]!.flourish.length} / ${FLOURISH_MAX} characters (COMPANION_FLOURISH_MAX_CHARACTERS)`}
              >
                <textarea
                  value={draft[kind.id]!.flourish}
                  onChange={(e) => patch({ flourish: e.target.value })}
                />
              </Field>
              <div className="grid-2">
                <Field label="Tone">
                  <Select
                    value={rule.tone}
                    onChange={(v) => patch({ tone: v as Tone })}
                    options={TONES.map((t) => ({ value: t, label: t }))}
                    aria-label="Tone"
                  />
                </Field>
                <Field label="Expression">
                  <Select
                    value={rule.expression}
                    onChange={(v) => patch({ expression: v as Expression })}
                    options={EXPRESSIONS.map((t) => ({ value: t, label: t }))}
                    aria-label="Expression"
                  />
                </Field>
              </div>
              <div className="row" role="group" aria-label="Celebration and stickiness">
                <Chip selected={rule.celebrates} onClick={() => patch({ celebrates: !rule.celebrates })}>
                  celebrates
                </Chip>
                <Chip selected={rule.sticks} onClick={() => patch({ sticks: !rule.sticks })}>
                  sticks
                </Chip>
              </div>
              <p className="meta">
                Values the kind needs: {rule.values.length ? rule.values.join(", ") : "none"} —
                supplied data never overrides the words, tone, expression, celebration or stickiness.
              </p>
            </Card>

            {sideBySideOn ? (
              <Card>
                <CardHeader title="Both presentations" icon="message" eyebrow="validation · optional" />
                <p className="meta">Whether the fact stands alone before publishing.</p>
                <div>
                  <p className="meta"><strong>Companion</strong></p>
                  <p className="page__lead">
                    [{rule.expression}] {rule.fact || <em>— no fact —</em>} {rule.flourish}
                  </p>
                  <p className="meta"><strong>Plain messages</strong></p>
                  <p className="page__lead">{rule.fact || <em>— no fact —</em>} {rule.flourish}</p>
                </div>
              </Card>
            ) : null}
          </div>

          <div className="row">
            <Button icon="save" disabled={!dirty} onClick={requestPublish}>
              Publish as version {versions[0]!.version + 1}
            </Button>
            {restoredFrom !== null ? (
              <Chip variant="accent" size="sm">draft restored from version {restoredFrom}</Chip>
            ) : null}
          </div>

          <Card>
            <CardHeader title="Versions" icon="history" eyebrow="companion_response_rules · per version" />
            <List>
              {versions.map((v, i) => (
                <ListRow key={v.version} as="article">
                  <div>
                    <strong>version {v.version}</strong>
                    <p className="meta">{v.at} · {v.actor} · {v.kinds} kinds · {v.note}</p>
                  </div>
                  {i === 0 ? (
                    <Chip variant="quiet" size="sm">current</Chip>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => restore(v.version)}>
                      Restore as draft
                    </Button>
                  )}
                </ListRow>
              ))}
            </List>
          </Card>

          <Dialog
            open={confirmOpen}
            title={`Publish response rules as version ${versions[0]!.version + 1}`}
            icon="save"
            onClose={() => setConfirmOpen(false)}
            actions={
              <>
                <Button onClick={publish}>Confirm publish</Button>
                <Button variant="quiet" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              </>
            }
          >
            <p>
              All {MOMENT_KINDS.length} registered kinds carry copy — the release condition the
              published artifact must keep. The version takes effect on the next moment; it never
              re-delivers a past one and re-notifies nobody.
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
