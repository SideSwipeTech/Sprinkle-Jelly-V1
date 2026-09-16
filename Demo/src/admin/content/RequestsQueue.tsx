/**
 * RequestsQueue — `requests`. The topic-request review list (admin.F16,
 * requests/01 "The review list", requests/03 "The statuses, the graph, and the
 * notice"): learner asks newest first, searchable literally over title and
 * description, paged at PLATFORM_LIST_PAGE_ITEMS, rendering this domain's own
 * status graph and no second workflow.
 *
 * Card order is the spec's: the title; the target type with the context label;
 * the status; the description; the one team note. The current status control
 * is inert — a no-op change is impossible. The three reversing or reopening
 * moves require a staff reason; implemented is reachable only with evidence a
 * learner could actually open. Archived is the learner's own act and renders
 * as a filter value, never a staff setting.
 *
 * Fixture state only.
 */

import { useMemo, useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { SearchField } from "../../extraction/components/SearchField/SearchField";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  ALL_REQUESTS,
  FIG,
  PUBLISHED_TARGETS,
  REQUEST_GRAPH,
  REQUEST_STATUSES,
  fmtInstant,
  type RequestStatus,
  type TopicRequest
} from "./fixtures";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

interface PendingMove {
  request: TopicRequest;
  to: RequestStatus;
  reasonNeeded: boolean;
  evidenceNeeded: boolean;
}

export function RequestsQueue() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [requests, setRequests] = useState<TopicRequest[]>(ALL_REQUESTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"queue" | RequestStatus>("queue");
  const [page, setPage] = useState(0);
  const [move, setMove] = useState<PendingMove | null>(null);
  const [reason, setReason] = useState("");
  const [refTarget, setRefTarget] = useState("");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [refFor, setRefFor] = useState<TopicRequest | null>(null);
  const [overrideNote, setOverrideNote] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  /* Literal search over title and description — the useful detail lives in
     the description, so search reads it too. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      /* The default queue leaves archived out; the filter's explicit Archived
         value is the only way it shows. */
      if (statusFilter === "queue" ? r.status === "archived" : r.status !== statusFilter) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    });
  }, [requests, query, statusFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / FIG.PLATFORM_LIST_PAGE_ITEMS));
  const pageRows = filtered.slice(page * FIG.PLATFORM_LIST_PAGE_ITEMS, (page + 1) * FIG.PLATFORM_LIST_PAGE_ITEMS);
  const countedTotal = filtered.length; // counted under the same filter, search and snapshot

  function patchRequest(id: string, patch: Partial<TopicRequest>) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function requestMove(r: TopicRequest, to: RequestStatus, reasonNeeded: boolean) {
    setMove({ request: r, to, reasonNeeded, evidenceNeeded: to === "implemented" });
    setReason("");
    setRefTarget(r.reference?.label ?? "");
  }

  function applyMove() {
    if (!move) return;
    const ref = refTarget ? PUBLISHED_TARGETS.find((t) => t.title === refTarget) : null;
    if (move.evidenceNeeded && !ref) return;
    if (move.reasonNeeded && !reason.trim()) return;
    patchRequest(move.request.id, {
      status: move.to,
      reviewStamp: { by: "you", at: new Date().toISOString() },
      reference: ref ? { label: ref.title, to: `/${ref.kind}/${ref.id}` } : move.request.reference
    });
    setFlash(
      `${move.request.title}: ${move.request.status} → ${move.to}. Every permitted move produces one durable System notice to the requester; a failed notice never blocks the change.`
    );
    setMove(null);
  }

  function saveNote(r: TopicRequest) {
    if (!noteDraft.trim()) return;
    patchRequest(r.id, { teamNote: { text: noteDraft.trim(), by: "you", at: new Date().toISOString() } });
    setNoteFor(null);
    setNoteDraft("");
    setFlash("The team note is staff-only — it reaches the learner nowhere.");
  }

  function clearNote(r: TopicRequest) {
    patchRequest(r.id, { teamNote: null });
    setNoteFor(null);
    setNoteDraft("");
  }

  function saveReference() {
    if (!refFor) return;
    const ref = refTarget ? PUBLISHED_TARGETS.find((t) => t.title === refTarget) : null;
    if (!ref) return;
    /* Once implemented, the reference changes only by a super-administrator
       override carrying an audit note. */
    if (refFor.status === "implemented" && !overrideNote.trim()) return;
    patchRequest(refFor.id, { reference: { label: ref.title, to: `/${ref.kind}/${ref.id}` } });
    setFlash(
      refFor.status === "implemented"
        ? "Reference replaced under the override — the audit note travels with it; no announcement follows a replacement."
        : "Implementation reference attached — evidence a requesting learner could actually open."
    );
    setRefFor(null);
    setOverrideNote("");
  }

  return (
    <AdminPage
      kicker="Content"
      title="Topic requests"
      lead="Learner asks, newest first, searchable over title and description, paged for real. The Topic Requests domain's own status graph — no second workflow."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.reviewRequests} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The list could not be read — the platform's own failure, never rendered as an empty queue and never as no-requests."
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          <div className="filters" role="group" aria-label="Request filters">
            <SearchField
              value={query}
              onChange={(v) => { setQuery(v); setPage(0); }}
              placeholder="Search titles and descriptions…"
              label="Search titles and descriptions"
            />
            {(["queue", ...REQUEST_STATUSES] as const).map((s) => (
              <Chip
                key={s}
                size="sm"
                selected={statusFilter === s}
                onClick={() => { setStatusFilter(s); setPage(0); }}
              >
                {s === "queue" ? "the queue" : s}
              </Chip>
            ))}
          </div>

          {flash ? <Notice tone="info" live="polite">{flash}</Notice> : null}

          {/* Three readings: nothing has been asked yet is a counted zero; no
              match offers to clear; unreadable wears neither. */}
          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message={
                requests.length === 0
                  ? "Nothing has been asked for yet — a counted zero."
                  : "No requests match this filter or search."
              }
              action={
                requests.length > 0 ? (
                  <Button variant="secondary" size="sm" onClick={() => { setQuery(""); setStatusFilter("queue"); setPage(0); }}>
                    Clear the filter and search
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="ct-pagebar">
                <LoadedLine loaded={pageRows.length + page * FIG.PLATFORM_LIST_PAGE_ITEMS} total={countedTotal} />
                <span className="row">
                  <Button variant="quiet" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} icon="chevron-left">
                    Newer
                  </Button>
                  <span className="meta">page {page + 1} of {pages}</span>
                  <Button variant="quiet" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} iconEnd="chevron-right">
                    Older
                  </Button>
                </span>
              </div>

              {pageRows.map((r) => (
                <Card key={r.id}>
                  {/* The spec's card order: title; target type + context label;
                      status; description; the one team note. */}
                  <CardHeader title={r.title} icon="inbox" eyebrow={`filed ${fmtInstant(r.filedAt)}`} />
                  <p className="meta">{r.targetType} · {r.contextLabel}</p>
                  <p>
                    <Chip size="sm" variant={r.status === "implemented" ? "accent" : "quiet"}>{r.status}</Chip>
                    {r.reviewStamp ? (
                      <span className="meta"> — last status decision by {r.reviewStamp.by}, {fmtInstant(r.reviewStamp.at)}</span>
                    ) : null}
                  </p>
                  <p className="page__lead">{r.description}</p>
                  {r.teamNote ? (
                    <p className="meta">Team note: “{r.teamNote.text}” — {r.teamNote.by}, {fmtInstant(r.teamNote.at)}</p>
                  ) : (
                    <p className="meta">No team note.</p>
                  )}
                  {r.reference ? (
                    <p className="meta">Implementation reference: {r.reference.label}</p>
                  ) : null}

                  {/* The permitted moves — a move the graph does not offer is
                      not offered, and the status the request holds is inert. */}
                  <div className="admin-tools" role="group" aria-label="Permitted status moves">
                    <Chip size="sm" selected disabled label={`Current status: ${r.status}`}>
                      {r.status} — current
                    </Chip>
                    {REQUEST_GRAPH[r.status].map((m) => (
                      <Button key={m.to} variant="secondary" size="sm" onClick={() => requestMove(r, m.to, m.reason)}>
                        → {m.to}{m.reason ? " (reason required)" : ""}
                      </Button>
                    ))}
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => { setNoteFor(noteFor === r.id ? null : r.id); setNoteDraft(r.teamNote?.text ?? ""); }}
                    >
                      {r.teamNote ? "Edit the note" : "Write the note"}
                    </Button>
                    {r.status !== "archived" ? (
                      <Button
                        variant="quiet"
                        size="sm"
                        onClick={() => { setRefFor(r); setRefTarget(r.reference?.label ?? ""); setOverrideNote(""); }}
                      >
                        {r.reference ? "Replace the reference" : "Attach a reference"}
                      </Button>
                    ) : null}
                  </div>

                  {noteFor === r.id ? (
                    <div className="admin-action-panel">
                      <Field label="The one team note" hint="Staff-only — never on the learner's list, never in a notice, never in the rollup.">
                        <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
                      </Field>
                      <div className="row">
                        <Button size="sm" disabled={!noteDraft.trim()} onClick={() => saveNote(r)}>Save the note</Button>
                        {r.teamNote ? (
                          <Button variant="quiet" size="sm" onClick={() => clearNote(r)}>Clear it</Button>
                        ) : null}
                        <Button variant="quiet" size="sm" onClick={() => setNoteFor(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : null}
                </Card>
              ))}
            </>
          )}

          {move ? (
            <Dialog
              title={`${move.request.title} — ${move.request.status} → ${move.to}`}
              icon="check"
              onClose={() => setMove(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setMove(null)}>Cancel</Button>
                  <Button
                    disabled={
                      (move.reasonNeeded && !reason.trim()) ||
                      (move.evidenceNeeded && !refTarget)
                    }
                    onClick={applyMove}
                  >
                    Move to {move.to}
                  </Button>
                </>
              }
            >
              {move.evidenceNeeded ? (
                <>
                  <p>
                    Implemented is not reachable on trust — it requires a reference to content the
                    requesting learner could actually open. A draft, a deleted item or an
                    administrator-only preview is not evidence.
                  </p>
                  <Field label="Implementation reference" required>
                    <Select
                      value={refTarget}
                      onChange={setRefTarget}
                      options={[
                        { value: "", label: "— choose published content —" },
                        ...PUBLISHED_TARGETS.filter((t) => t.lifecycle === "published").map((t) => ({
                          value: t.title,
                          label: `${t.title} (${t.kind})`
                        }))
                      ]}
                      aria-label="Implementation reference"
                    />
                  </Field>
                </>
              ) : null}
              {move.reasonNeeded ? (
                <Field label="Staff reason" required hint="Required — this move reopens or reverses a decision already taken.">
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                </Field>
              ) : (
                <p>No reason required — this move is forward in the graph.</p>
              )}
            </Dialog>
          ) : null}

          {refFor ? (
            <Dialog
              title={`${refFor.reference ? "Replace" : "Attach"} the implementation reference — ${refFor.title}`}
              icon="edit"
              onClose={() => setRefFor(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setRefFor(null)}>Cancel</Button>
                  <Button
                    disabled={!refTarget || (refFor.status === "implemented" && !overrideNote.trim())}
                    onClick={saveReference}
                  >
                    {refFor.reference ? "Replace it" : "Attach it"}
                  </Button>
                </>
              }
            >
              <Field label="Published content the requester could open" required>
                <Select
                  value={refTarget}
                  onChange={setRefTarget}
                  options={[
                    { value: "", label: "— choose published content —" },
                    ...PUBLISHED_TARGETS.filter((t) => t.lifecycle === "published").map((t) => ({
                      value: t.title,
                      label: `${t.title} (${t.kind})`
                    }))
                  ]}
                  aria-label="Implementation reference"
                />
              </Field>
              {refFor.status === "implemented" ? (
                <Field label="Override note" required hint="Once implemented, the reference changes only by a super administrator's override carrying an audit note.">
                  <input value={overrideNote} onChange={(e) => setOverrideNote(e.target.value)} />
                </Field>
              ) : (
                <p className="meta">Replaced freely while the request is pending or approved.</p>
              )}
            </Dialog>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
