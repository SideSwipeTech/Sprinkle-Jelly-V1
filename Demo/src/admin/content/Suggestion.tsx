/**
 * Suggestion — `suggestion`. Home's curated suggestion slot (admin.F41,
 * analytics/03 "The curated suggestion slot"): one administrator-curated
 * published course, subject, track, challenge or case, with an optional single
 * line of copy. At most one active suggestion, each change audited with its
 * reason, written through Publishing into `publishing_home_suggestions` and
 * read from there by Analytics under `publishing.set_home_suggestion`.
 *
 * The slot empties by itself when its target retires — a gone item is replaced
 * only by another curated one, never an inferred one — and its two absent
 * states are deliberately indistinguishable: with nothing curated and on a
 * failed read alike, the slot is simply absent.
 *
 * Fixture state only.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  FIG,
  PUBLISHED_TARGETS,
  SUGGESTION,
  SUGGESTION_HISTORY,
  fmtInstant,
  type CuratedSuggestion,
  type SuggestionChange
} from "./fixtures";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

export function Suggestion() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [suggestion, setSuggestion] = useState<CuratedSuggestion | null>(SUGGESTION);
  const [targets, setTargets] = useState(PUBLISHED_TARGETS);
  const [history, setHistory] = useState<SuggestionChange[]>(SUGGESTION_HISTORY);
  const [targetId, setTargetId] = useState("");
  const [line, setLine] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const current = suggestion ? targets.find((t) => t.id === suggestion.targetId) ?? null : null;
  /* Self-emptying: a target that retired empties the slot — the suggestion
     resolves to nothing rather than rendering a dead one. */
  const effective = current && current.lifecycle === "published" ? suggestion : null;
  const published = targets.filter((t) => t.lifecycle === "published");
  const chosen = published.find((t) => t.id === targetId) ?? null;

  function retireCurrentTarget() {
    if (!current) return;
    setTargets((prev) => prev.map((t) => (t.id === current.id ? { ...t, lifecycle: "archived" as const } : t)));
    setHistory((prev) => [
      { at: new Date().toISOString(), by: "—", targetTitle: current.title, reason: "The target retired — the slot emptied itself." },
      ...prev
    ]);
    setFlash("The slot emptied itself — the target retired, and Home renders nothing there.");
  }

  function publish() {
    if (!chosen || !reason.trim()) return;
    setSuggestion({ targetId: chosen.id, line: line.trim() });
    setHistory((prev) => [
      { at: new Date().toISOString(), by: "you", targetTitle: chosen.title, reason: reason.trim() },
      ...prev
    ]);
    setFlash(`Published — Home's slot now curates ${chosen.title}. Recorded under ${ACTION.setHomeSuggestion}.`);
    setConfirming(false);
    setTargetId("");
    setLine("");
    setReason("");
  }

  return (
    <AdminPage
      kicker="Content"
      title="Home suggestion"
      lead="The one active curated suggestion — a published course, subject, track, challenge or case, with an optional single line. Each change is audited with its reason."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.setHomeSuggestion} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The slot's record cannot be read — the two absent states stay indistinguishable and nothing is written against an unreadable record."
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          {flash ? <Notice tone="info" live="polite">{flash}</Notice> : null}
          <div className="ct-gaps">
            <Card>
              <CardHeader title="The active suggestion" icon="star" eyebrow="at most one" />
              {effective && current ? (
                <>
                  <p className="page__lead">
                    <strong>{current.title}</strong> — {current.kind}
                  </p>
                  {effective.line ? <p className="meta">“{effective.line}”</p> : <p className="meta">No authored line — optional, single.</p>}
                  <div className="admin-tools">
                    <Button variant="quiet" size="sm" onClick={retireCurrentTarget}>
                      Retire the target — fixture
                    </Button>
                  </div>
                  <p className="meta">
                    Retiring is a fixture stand-in for the lifecycle act: the slot empties by itself
                    when the target is archived or unpublished, so Home never renders a dead
                    suggestion.
                  </p>
                </>
              ) : (
                <StateBlock
                  state="empty"
                  message="Nothing curated — the slot is simply absent on Home, indistinguishable from a failed read."
                  compact
                />
              )}
            </Card>

            <Card>
              <CardHeader title="Curate" icon="edit" eyebrow="each change audited with its reason" />
              <div className="admin-form-grid">
                <Field label="The published item" required className="admin-form-grid__wide">
                  <Select
                    value={targetId}
                    onChange={setTargetId}
                    options={[
                      { value: "", label: "— choose a published target —" },
                      ...published.map((t) => ({ value: t.id, label: `${t.title} (${t.kind})` }))
                    ]}
                    aria-label="Published target"
                  />
                </Field>
                <Field label="The optional single line" className="admin-form-grid__wide">
                  <input value={line} onChange={(e) => setLine(e.target.value)} maxLength={FIG.PLATFORM_TITLE_CHARS} />
                </Field>
                <Field label="Reason for the change" required className="admin-form-grid__wide">
                  <input value={reason} onChange={(e) => setReason(e.target.value)} />
                </Field>
              </div>
              <div className="admin-tools">
                <Button disabled={!chosen || !reason.trim()} onClick={() => setConfirming(true)}>
                  Publish the suggestion
                </Button>
              </div>
              <p className="meta">
                Replaced only by another curated one — never by an inferred one. Retired targets are
                not offered.
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader title="The audit" icon="history" eyebrow={`${history.length} changes — each with its reason`} />
            {history.length === 0 ? (
              <StateBlock state="empty" message="No changes recorded — the slot's audit is a counted zero." compact />
            ) : null}
            <List>
              {history.map((h, i) => (
                <ListRow key={`${h.at}-${i}`} as="article">
                  <div>
                    <strong>{h.targetTitle}</strong>
                    <p className="meta">{fmtInstant(h.at)} · {h.by} · {h.reason}</p>
                  </div>
                </ListRow>
              ))}
            </List>
          </Card>

          {confirming && chosen ? (
            <Dialog
              title="Publish the suggestion"
              icon="star"
              onClose={() => setConfirming(false)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setConfirming(false)}>Cancel</Button>
                  <Button onClick={publish}>Publish — {chosen.title}</Button>
                </>
              }
            >
              <p>
                Home's slot will curate <strong>{chosen.title}</strong> ({chosen.kind})
                {line.trim() ? ` with the line “${line.trim()}”` : " with no authored line"}.
                The change is audited with your reason: “{reason.trim()}”.
              </p>
            </Dialog>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
