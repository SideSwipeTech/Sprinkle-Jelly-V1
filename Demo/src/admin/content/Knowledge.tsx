/**
 * Knowledge — `knowledge`. The companion's knowledge-base studio (admin.F06,
 * companion/01 "The five admin destinations", admin/04 "The knowledge base"):
 * authoring, publishing, unpublishing and synonym upkeep on the shared
 * lifecycle; review sorted stale-first — a never-reviewed entry sorts as the
 * stalest — and the answering gate shown but edited nowhere here.
 *
 * An entry citing no rule is refused at publish, naming what is missing.
 * *Unpublished*, *not authored* and *could not be read* are three facts, and
 * only the first has a control that changes it.
 *
 * Every corpus row carries its verbs: Open into the author form, and — on a
 * draft alone — Delete, a hard delete behind a typed confirmation. The spec
 * names no delete for the knowledge base; the studio offers it on drafts only,
 * so a published entry is unpublished back into a draft before it can be
 * removed (chosen, not stated — `companion.delete_kb_entry`).
 *
 * Fixture state only.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Field } from "../../extraction/components/Field/Field";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  FIG,
  KB_ENTRIES,
  KB_GATE,
  TODAY,
  fmtInstant,
  type KbEntry,
  type KbLifecycle
} from "./fixtures";
import {
  CapabilityRefusal,
  ConflictDialog,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

/** Days since a review, measured on the fixture's product date. Never-reviewed
 *  sorts as the stalest. */
function staleness(entry: KbEntry): number {
  if (!entry.lastReviewed) return Number.MAX_SAFE_INTEGER;
  const days = Math.floor((Date.parse(TODAY) - Date.parse(entry.lastReviewed)) / 86_400_000);
  return days;
}

function isDue(entry: KbEntry): boolean {
  return staleness(entry) >= FIG.COMPANION_KB_REVIEW_DUE_DAYS;
}

export function Knowledge() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "conflict"]);
  const [entries, setEntries] = useState<KbEntry[]>(KB_ENTRIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<KbEntry | null>(null);
  const [synonym, setSynonym] = useState("");
  const [flash, setFlash] = useState<{ tone: "success" | "error" | "warning"; text: string } | null>(null);
  const [confirming, setConfirming] = useState<"publish" | "unpublish" | null>(null);
  const [deleting, setDeleting] = useState<KbEntry | null>(null);
  const [echo, setEcho] = useState("");

  /* Review sorted stale-first: never-reviewed first, then oldest review. */
  const sorted = entries.slice().sort((a, b) => staleness(b) - staleness(a));
  const selected = entries.find((e) => e.id === selectedId) ?? null;
  /* An unreadable entry never counts as due — "could not be read" is a third
     fact, not staleness. */
  const dueCount = entries.filter((e) => e.readable !== false && isDue(e)).length;

  function openEntry(entry: KbEntry) {
    setSelectedId(entry.id);
    setDraft(entry.readable === false ? null : { ...entry, synonyms: [...entry.synonyms] });
    setSynonym("");
    setFlash(null);
    setConfirming(null);
  }

  /* A new entry starts as an unsaved draft in the author form — it joins the
     corpus only when a save lands, so an abandoned authoring never leaves a
     placeholder row behind. */
  function openNew() {
    setSelectedId(null);
    setDraft({
      id: `kb-${Date.now().toString(36)}`,
      question: "",
      answer: "",
      synonyms: [],
      tags: [],
      rule: "",
      lifecycle: "draft",
      lastReviewed: null,
      author: "you",
      changedAt: ""
    });
    setSynonym("");
    setFlash(null);
    setConfirming(null);
  }

  function patch(patch: Partial<KbEntry>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  function addSynonym() {
    const word = synonym.trim();
    if (!word || !draft) return;
    if (!draft.synonyms.includes(word)) patch({ synonyms: [...draft.synonyms, word] });
    setSynonym("");
  }

  function save(lifecycle: KbLifecycle) {
    if (!draft) return;
    if (!selected && !draft.question.trim()) {
      setFlash({
        tone: "error",
        text: "Nothing to save — a new entry needs its question before it joins the corpus."
      });
      return;
    }
    if (lifecycle === "published" && !draft.rule.trim()) {
      setFlash({
        tone: "error",
        text: "Publish refused — the entry cites no rule, and an entry nobody can check against actual behavior cannot publish. Name the rule it explains."
      });
      return;
    }
    if (selected) {
      setEntries((prev) => prev.map((e) => (e.id === selected.id ? { ...draft, lifecycle } : e)));
    } else {
      /* The first save lands the entry in the corpus — stale-first review
         puts a never-reviewed entry at the top on its own. */
      setEntries((prev) => [{ ...draft, lifecycle }, ...prev]);
      setSelectedId(draft.id);
    }
    setDraft((d) => (d ? { ...d, lifecycle } : d));
    setFlash(
      lifecycle === "published"
        ? { tone: "success", text: "Published — the entry begins answering under the gate in force." }
        : { tone: "success", text: "Saved as draft — nothing a learner reads changed." }
    );
  }

  function unpublish() {
    if (!selected) return;
    setEntries((prev) => prev.map((e) => (e.id === selected.id ? { ...e, lifecycle: "draft" as const } : e)));
    setDraft((d) => (d ? { ...d, lifecycle: "draft" } : d));
    setFlash({
      tone: "success",
      text: "Unpublished — takes effect at once. No published answer stays reachable while the studio shows the entry unpublished."
    });
    setConfirming(null);
  }

  function markReviewed() {
    if (!selected && !draft) return;
    if (selected) {
      setEntries((prev) => prev.map((e) => (e.id === selected.id ? { ...e, lastReviewed: TODAY } : e)));
    }
    /* An entry still being authored carries the stamp onto its first save. */
    setDraft((d) => (d ? { ...d, lastReviewed: TODAY } : d));
    setFlash({ tone: "success", text: `Reviewed — the stamp records only that a person looked, ${TODAY}.` });
  }

  /* Hard delete reaches a draft alone — a published entry is unpublished back
     into a draft before the corpus row offers it. Chosen, not stated: the spec
     lists no delete for the knowledge base. */
  function deleteEntry(entry: KbEntry) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    if (selectedId === entry.id) setSelectedId(null);
    if (draft?.id === entry.id) setDraft(null);
    setDeleting(null);
    setEcho("");
    setFlash({
      tone: "success",
      text: `Deleted — “${entry.question}” is gone from the corpus, draft and synonyms together. Recorded under ${ACTION.deleteKnowledge}.`
    });
  }

  return (
    <AdminPage
      kicker="Content"
      title="Knowledge Base"
      lead="The companion's knowledge-base studio — authoring, publishing, unpublishing and synonym upkeep on the shared lifecycle, reviewed stale-first. The answering gate is shown, never edited here."
      actions={
        preview === "loaded" || preview === "conflict" ? (
          <Button icon="plus" onClick={openNew}>
            New entry
          </Button>
        ) : undefined
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editKnowledge} /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview === "loaded" || preview === "conflict" ? (
        <>
          {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}
          <LoadedLine loaded={sorted.length} total={sorted.length} />

          <div className="ct-gaps">
            <Card>
              <CardHeader
                title="The corpus"
                icon="inbox"
                eyebrow={`stale-first · ${dueCount} due for review · falls due at ${FIG.COMPANION_KB_REVIEW_DUE_DAYS} days`}
              />
              {sorted.length === 0 ? (
                <StateBlock
                  state="empty"
                  message="An empty corpus is a valid state — no placeholder entry implies content that does not exist."
                  compact
                />
              ) : (
                <List className="ct-kb-corpus">
                  {sorted.map((e) => (
                    <ListRow
                      key={e.id}
                      as="article"
                      selected={e.id === selectedId}
                      align="center"
                      className={e.readable === false ? "ct-kb-row ct-kb-row--unreadable" : "ct-kb-row"}
                    >
                      <div className="ct-kb-row__body">
                        <strong className="ct-kb-row__question">{e.question}</strong>
                        <p className="ct-kb-row__meta">
                          {e.readable === false
                            ? "could not be read — a third fact beside unpublished and not authored"
                            : `${e.lifecycle} · ${e.lastReviewed ? `last reviewed ${e.lastReviewed}` : "never reviewed"}`}
                        </p>
                      </div>
                      {e.readable !== false && isDue(e) ? (
                        <span className="ct-stale-flag">review due</span>
                      ) : null}
                      <span className="ct-row__acts">
                        <Button variant="secondary" size="sm" label={`Open ${e.question}`} onClick={() => openEntry(e)}>
                          Open
                        </Button>
                        {e.lifecycle === "draft" ? (
                          <Button
                            variant="quiet"
                            size="sm"
                            label={`Delete ${e.question} permanently…`}
                            onClick={() => { setDeleting(e); setEcho(""); }}
                          >
                            Delete…
                          </Button>
                        ) : null}
                      </span>
                    </ListRow>
                  ))}
                </List>
              )}
            </Card>

            <Card>
              <CardHeader title="The answering gate" icon="lock" eyebrow="shown, not edited" />
              <div className="ct-gate">
                <div className="ct-gate__cell">
                  <p className="micro meta">COMPANION_KB_MINIMUM_SCORE</p>
                  <p className="ct-gate__value">{KB_GATE.score.toFixed(2)}</p>
                </div>
                <div className="ct-gate__cell">
                  <p className="micro meta">COMPANION_KB_MINIMUM_MARGIN</p>
                  <p className="ct-gate__value">{KB_GATE.margin.toFixed(2)}</p>
                </div>
                <div className="ct-gate__cell">
                  <p className="micro meta">version</p>
                  <p className="ct-gate__value">{KB_GATE.version}</p>
                </div>
              </div>
              <div className="ct-gate__foot">
                <p className="meta">
                  The effect a change would have: {KB_GATE.effect}
                </p>
                <p className="meta">
                  Edited nowhere here — the two gate settings live in one place, Assistant ›
                  Knowledge-base administration, where a change takes effect whole or not at all, with
                  a version record and an audit entry.
                </p>
              </div>
            </Card>
          </div>

          {draft ? (
            <Card>
              <CardHeader
                title={draft.question || "A new entry"}
                icon="sticky-note"
                eyebrow={`${draft.lifecycle} · authored by ${draft.author}${draft.changedAt ? ` · changed ${fmtInstant(draft.changedAt)}` : ""}`}
                action={
                  selected && isDue(selected) ? (
                    <span className="ct-stale-flag">review due</span>
                  ) : undefined
                }
              />
              <div className="admin-form-grid">
                <Field label="The question" required hint="In the words a learner would use." className="admin-form-grid__wide">
                  <input value={draft.question} onChange={(e) => patch({ question: e.target.value })} />
                </Field>
                <Field label="The answer" required hint="Authored public content." className="admin-form-grid__wide">
                  <textarea value={draft.answer} onChange={(e) => patch({ answer: e.target.value })} />
                </Field>
                <Field
                  label="The rule it explains"
                  required
                  hint="Required — an entry citing no rule is one nobody can check against actual behavior."
                  error={draft.rule.trim() ? undefined : "No rule cited — publish will be refused naming this."}
                >
                  <input value={draft.rule} onChange={(e) => patch({ rule: e.target.value })} placeholder="domain.rule.name" />
                </Field>
                <Field label="Tags" hint="Classified against the one shared vocabulary.">
                  <input
                    value={draft.tags.join(", ")}
                    onChange={(e) => patch({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  />
                </Field>
              </div>

              <Field
                label="Synonyms — the words learners use"
                hint="The only tuning lexical matching offers: no relevance dial, no boost, no per-entry weight."
              >
                <input
                  value={synonym}
                  onChange={(e) => setSynonym(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSynonym(); } }}
                  placeholder="add a synonym and press Enter"
                />
              </Field>
              <div className="ct-synrow">
                {draft.synonyms.map((s) => (
                  <Chip key={s} size="sm" onClick={() => patch({ synonyms: draft.synonyms.filter((x) => x !== s) })} label={`Remove synonym ${s}`}>
                    {s} ×
                  </Chip>
                ))}
                {draft.synonyms.length === 0 ? <span className="meta">No synonyms.</span> : null}
              </div>

              <div className="admin-tools ct-kb-acts">
                <Button variant="secondary" icon="save" onClick={() => save("draft")}>Save draft</Button>
                {draft.lifecycle === "published" ? (
                  <Button variant="quiet" onClick={() => setConfirming("unpublish")}>Unpublish</Button>
                ) : (
                  <Button icon="check" onClick={() => setConfirming("publish")}>Publish</Button>
                )}
                <Button variant="quiet" onClick={markReviewed}>Stamp the review</Button>
              </div>
              <p className="meta ct-kb-note">
                Unpublishing takes effect at once and returns the entry to the operator's hands.
                The stamp records only that a person looked.
              </p>
            </Card>
          ) : selected && selected.readable === false ? (
            <Card>
              <StateBlock
                state="unavailable"
                message="This entry could not be read — the studio never renders an unreadable entry as unpublished."
              />
            </Card>
          ) : (
            <Card>
              <StateBlock state="empty" message="Choose an entry — the corpus sorts stale-first." compact />
            </Card>
          )}

          {confirming === "publish" && draft ? (
            <Dialog
              title={`Publish — ${draft.question || "the new entry"}`}
              icon="check"
              onClose={() => setConfirming(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setConfirming(null)}>Cancel</Button>
                  <Button
                    disabled={!draft.rule.trim()}
                    label={!draft.rule.trim() ? "Publish — refused while no rule is cited" : undefined}
                    onClick={() => { save("published"); setConfirming(null); }}
                  >
                    Publish under the gate in force
                  </Button>
                </>
              }
            >
              <p>
                The entry begins answering under the gate in force — minimum score{" "}
                {KB_GATE.score.toFixed(2)}, minimum margin {KB_GATE.margin.toFixed(2)}.
              </p>
              {!draft.rule.trim() ? (
                <Notice tone="warning" title="Publish refused — no rule cited">
                  <p>
                    A publish citing no rule is refused, naming what is missing: the rule the entry
                    explains. Without it the entry is one nobody can check against actual behavior.
                  </p>
                </Notice>
              ) : null}
            </Dialog>
          ) : null}

          {confirming === "unpublish" && selected ? (
            <Dialog
              title={`Unpublish — ${selected.question}`}
              icon="alert"
              onClose={() => setConfirming(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setConfirming(null)}>Cancel</Button>
                  <Button variant="secondary" onClick={unpublish}>Unpublish — at once</Button>
                </>
              }
            >
              <p>
                Unpublishing removes the entry from what the companion answers with and returns it to
                your hands — at once, and never leaving a published answer reachable while the studio
                shows it unpublished.
              </p>
            </Dialog>
          ) : null}

          {/* Tier two — the typed confirmation. Hard delete reaches a draft
              alone: a published entry is unpublished back into a draft before
              the corpus offers this, and an unreadable draft is removed by its
              listed title. */}
          {deleting ? (
            <Dialog
              title={`Delete — ${deleting.question}`}
              icon="trash"
              tone="destructive"
              onClose={() => { setDeleting(null); setEcho(""); }}
              actions={
                <Button variant="quiet" onClick={() => { setDeleting(null); setEcho(""); }}>Cancel</Button>
              }
            >
              <p>
                A hard delete removes the draft and its synonyms outright — nothing a learner reads
                ever carried it, and it cannot be undone. It reaches a draft alone: a published entry
                is unpublished back into a draft first.
              </p>
              {deleting.readable === false ? (
                <Notice tone="warning" compact>
                  <p>
                    The entry's contents cannot be read — this confirmation names it by its listed
                    title alone.
                  </p>
                </Notice>
              ) : null}
              <ConfirmByTyping phrase={deleting.question} value={echo} onChange={setEcho}>
                {(matched) => (
                  <Button variant="destructive" disabled={!matched} onClick={() => deleteEntry(deleting)}>
                    Delete permanently
                  </Button>
                )}
              </ConfirmByTyping>
              <p className="meta">Recorded under {ACTION.deleteKnowledge}.</p>
            </Dialog>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
