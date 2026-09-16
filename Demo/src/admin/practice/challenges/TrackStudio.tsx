/**
 * TrackStudio — `tracks` and `tracks/:trackId`.
 *
 * The index creates a track with a name, a description and exactly one
 * language — only languages both enabled and authoring-capable are offered —
 * and lists every track with its language, entry count and lifecycle. A
 * row's name and Open reach the track's contents page; every secondary act —
 * publish, return to draft, archive, the empty-draft delete — lives in a
 * labelled three-dot menu behind its confirm tier. A created track opens
 * straight into its contents page.
 *
 * The detail carries the ordered contents — track-owned challenges authored
 * into the track beside references to underlying challenges, never a copy —
 * with staged reordering committed in bulk, per-entry lifecycle on the
 * authored entries (a reference has none and follows the underlying
 * challenge), and the audit trail: every authoring, publish, archive, reorder
 * and reference change commits with its audit-trail row or not at all.
 *
 * A track carrying challenges cannot be hard-deleted; the only deletable
 * track is an empty draft, behind a typed confirmation.
 *
 * Fixture state only.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { useStore } from "@state/useStore";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { Select } from "../../../extraction/components/Select/Select";
import { Field } from "../../../extraction/components/Field/Field";
import { Dialog } from "../../../extraction/components/Dialog/Dialog";
import { ConfirmByTyping } from "../../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { IconButton } from "../../../extraction/components/IconButton/IconButton";
import { List, ListRow } from "../../../extraction/components/ListRow/ListRow";
import { Menu, type MenuItem } from "../../../extraction/components/Menu/Menu";
import { Notice } from "../../../extraction/components/Notice/Notice";
import { Icon } from "@icons/Icon";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../../assessments/shared";
import {
  ACTION,
  challengeRows,
  fmtInstant,
  LANGUAGE_REGISTRY,
  languageLabel,
  newAuditRow,
  newEntryId,
  readTrack,
  readTracks,
  writeTracks,
  type TrackEntry,
  type TrackFixture,
  type TrackLifecycle
} from "./fixtures";
import "./challenges-admin.css";

/* ── The index ────────────────────────────────────────────────────────────── */

export function TracksIndex() {
  const navigate = useNavigate();
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  /* The fixture set is shared with the detail page — writes land in the
     module store and mirror into state, so a track created here resolves at
     its own address. */
  const [tracks, setTracks] = useState<TrackFixture[]>(readTracks());
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const authorable = LANGUAGE_REGISTRY.filter((l) => l.enabled && l.authoring);
  const [language, setLanguage] = useState(authorable[0]?.key ?? "");
  const [archiveFor, setArchiveFor] = useState<TrackFixture | null>(null);
  const [deleteFor, setDeleteFor] = useState<TrackFixture | null>(null);
  const [echo, setEcho] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  function applyTracks(next: TrackFixture[]) {
    writeTracks(next);
    setTracks(next);
  }

  function createTrack() {
    const trimmed = name.trim();
    if (!trimmed || !language) return;
    const id = `trk-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new"}-${Date.now() % 100000}`;
    /* The create and its audit row are one commit — or nothing at all. */
    applyTracks([
      ...tracks,
      {
        id,
        name: trimmed,
        description: description.trim(),
        language,
        lifecycle: "draft",
        entries: [],
        audit: [newAuditRow(`Created the track — ${languageLabel(language)}`)]
      }
    ]);
    setCreating(false);
    setName("");
    setDescription("");
    /* Creation leads straight into the track's contents page — the created
       draft's audit row is already there to confirm the commit. */
    navigate(`/admin/tracks/${id}`);
  }

  function setLifecycle(track: TrackFixture, lifecycle: TrackLifecycle, action: string) {
    applyTracks(
      tracks.map((t) =>
        t.id === track.id
          ? { ...t, lifecycle, audit: [newAuditRow(action), ...t.audit] }
          : t
      )
    );
    setFlash(`${track.name}: ${action} — committed with its audit-trail row.`);
    setArchiveFor(null);
  }

  function confirmDelete() {
    if (!deleteFor) return;
    applyTracks(tracks.filter((t) => t.id !== deleteFor.id));
    setFlash(`${deleteFor.name} deleted — an empty draft carrying no challenges. Committed with its audit-trail row.`);
    setDeleteFor(null);
    setEcho("");
  }

  /* The row's whole act set, gated by lifecycle — archive and the
     empty-draft delete keep their confirm tiers inside the menu. An archived
     track is terminal: its set is empty and the row carries no menu at all. */
  function menuItems(track: TrackFixture): MenuItem[] {
    const items: MenuItem[] = [];
    if (track.lifecycle === "draft") {
      items.push({ id: "publish", label: "Publish", icon: "check-mark" });
    }
    if (track.lifecycle === "published") {
      items.push({ id: "return-draft", label: "Return to draft", icon: "reset" });
    }
    if (track.lifecycle !== "archived") {
      items.push({ id: "archive", label: "Archive…", icon: "inbox", destructive: true });
    }
    if (track.lifecycle === "draft" && track.entries.length === 0) {
      items.push({ id: "delete", label: "Delete permanently…", icon: "trash", destructive: true });
    }
    return items;
  }

  function onMenuSelect(track: TrackFixture, id: string) {
    if (id === "publish") {
      setLifecycle(track, "published", "Published the track");
    } else if (id === "return-draft") {
      setLifecycle(track, "draft", "Returned the track to draft");
    } else if (id === "archive") {
      setArchiveFor(track);
    } else if (id === "delete") {
      setDeleteFor(track);
      setEcho("");
    }
  }

  return (
    <AdminPage
      kicker="Content"
      title="Track studio"
      lead="Authored paths through the catalogue. A track is created with a name, a description and exactly one language — frozen the moment the track owns a challenge."
      actions={
        <>
          <Button variant="quiet" to="/admin/challenges" icon="challenges">Challenge studio</Button>
          <Button icon="plus" onClick={() => setCreating(true)}>New track</Button>
        </>
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editTrack} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="Tracks unavailable — the list could not be read. Never rendered as an empty studio."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          {flash ? <Notice tone="success" live="polite">{flash}</Notice> : null}
          <div className="ch-line">
            <LoadedLine loaded={tracks.length} total={tracks.length} />
          </div>
          {tracks.length === 0 ? (
            <StateBlock
              state="empty"
              message="No tracks yet — an empty list is a reading, not a missing one."
              action={<Button icon="plus" onClick={() => setCreating(true)}>Create the first track</Button>}
            />
          ) : (
            <List>
              {tracks.map((track) => {
                const items = menuItems(track);
                return (
                  <ListRow key={track.id} as="article" align="center">
                    <div className="ch-grow">
                      <span className="ch-itemhead">
                        {/* The name is the row's link — the row itself stays
                            inert, so a menu act never navigates it. */}
                        <Link className="ch-titlelink" to={`/admin/tracks/${track.id}`}>
                          <strong>{track.name}</strong>
                        </Link>
                        <Chip
                          size="sm"
                          variant={track.lifecycle === "published" ? "accent" : "quiet"}
                          className={track.lifecycle === "archived" ? "ch-chip--muted" : ""}
                        >
                          {track.lifecycle}
                        </Chip>
                      </span>
                      <p className="ch-cell__meta">
                        {languageLabel(track.language)} · {track.entries.length}{" "}
                        {track.entries.length === 1 ? "entry" : "entries"}
                        {track.description ? ` — ${track.description}` : ""}
                      </p>
                    </div>
                    <div className="ch-idx__acts">
                      <Button variant="secondary" size="sm" to={`/admin/tracks/${track.id}`}>Open</Button>
                      {items.length === 0 ? (
                        /* Archived is terminal — no acts remain, so the row
                           carries no menu at all. */
                        <span className="meta">terminal</span>
                      ) : (
                        <Menu
                          trigger={<Icon name="more" size={16} />}
                          triggerLabel={`Actions for ${track.name}`}
                          items={items}
                          align="end"
                          onSelect={(id) => onMenuSelect(track, id)}
                        />
                      )}
                    </div>
                  </ListRow>
                );
              })}
            </List>
          )}
          <p className="ch-note">
            A track carrying challenges cannot be hard-deleted — delete reaches an empty draft alone.
            Every change here commits with its audit-trail row or not at all.
          </p>
        </>
      ) : null}

      {/* Create — name, description and exactly one language. */}
      <Dialog
        open={creating}
        title="New track"
        icon="tracks"
        onClose={() => setCreating(false)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={createTrack} disabled={!name.trim() || !language}>Create track</Button>
          </>
        }
      >
        <Field label="Name" required>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Python Patterns" />
        </Field>
        <Field label="Description" hint="Shown on the track card and page.">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field
          label="Language"
          required
          hint="Exactly one — frozen once the track owns a challenge. Only enabled, authoring-capable languages are offered."
        >
          <Select
            value={language}
            onChange={setLanguage}
            aria-label="The track's one language"
            options={authorable.map((l) => ({ value: l.key, label: l.label }))}
          />
        </Field>
      </Dialog>

      {/* Tier one — the ordinary confirm: archiving. */}
      <Dialog
        open={archiveFor !== null}
        title={archiveFor ? `Archive ${archiveFor.name}?` : "Archive?"}
        icon="inbox"
        tone="destructive"
        onClose={() => setArchiveFor(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setArchiveFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => archiveFor && setLifecycle(archiveFor, "archived", "Archived the track")}>
              Archive
            </Button>
          </>
        }
      >
        <p>Archiving hides the track from learners. Track-owned challenges go with it; the underlying challenges behind its references do not.</p>
      </Dialog>

      {/* Tier two — the typed confirmation: deleting an empty draft track. */}
      <Dialog
        open={deleteFor !== null}
        title={deleteFor ? `Delete ${deleteFor.name} permanently?` : "Delete?"}
        icon="trash"
        tone="destructive"
        onClose={() => { setDeleteFor(null); setEcho(""); }}
      >
        {deleteFor ? (
          <>
            <p>
              Hard delete reaches a track carrying no challenges alone — this one holds none. The act
              cannot be undone.
            </p>
            <ConfirmByTyping phrase={deleteFor.name} value={echo} onChange={setEcho}>
              {(matched) => (
                <Button variant="destructive" disabled={!matched} onClick={confirmDelete}>
                  Delete permanently
                </Button>
              )}
            </ConfirmByTyping>
          </>
        ) : null}
      </Dialog>
    </AdminPage>
  );
}

/* ── The detail ───────────────────────────────────────────────────────────── */

export function TrackDetail() {
  const { trackId = "" } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);

  const [track, setTrack] = useState<TrackFixture | null>(() => readTrack(trackId));
  /* The staged order — committed in bulk, all or nothing. */
  const [ordered, setOrdered] = useState<TrackEntry[] | null>(null);
  const [addingRef, setAddingRef] = useState(false);
  const [authoring, setAuthoring] = useState(false);
  const [authorTitle, setAuthorTitle] = useState("");
  const [archiveEntry, setArchiveEntry] = useState<TrackEntry | null>(null);
  const [removeRef, setRemoveRef] = useState<TrackEntry | null>(null);
  const [archiveTrack, setArchiveTrack] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  /* Same element, new param — re-read the track rather than serving the last one. */
  useEffect(() => {
    setTrack(readTrack(trackId));
    setOrdered(null);
    setFlash(null);
  }, [trackId]);

  const entries = ordered ?? track?.entries ?? [];
  const dirty = useMemo(
    () =>
      ordered !== null &&
      track !== null &&
      (ordered.length !== track.entries.length ||
        ordered.some((e, i) => e.entryId !== track.entries[i]?.entryId)),
    [ordered, track]
  );

  /* The standalone catalogue — what a reference may point at. */
  const catalogue = useMemo(() => challengeRows(store), [store]);

  /* One commit helper — every change lands its audit row in the same write
     or not at all, through the fixture store both pages share. A staged
     reorder pending against the old contents resets with any new commit. */
  function commit(mutate: (t: TrackFixture) => TrackFixture, action: string) {
    if (!track) return;
    const next = mutate(track);
    const committed = { ...next, audit: [newAuditRow(action), ...next.audit] };
    writeTracks(readTracks().map((x) => (x.id === committed.id ? committed : x)));
    setTrack(committed);
    setOrdered(null);
    setFlash(`${action} — committed with its audit-trail row.`);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setOrdered(next);
  }

  function saveOrder() {
    if (!ordered || !dirty) return;
    commit((t) => ({ ...t, entries: ordered }), `Reordered ${ordered.length} entries`);
  }

  function addReference(challengeId: string, title: string) {
    const source = catalogue.find((c) => c.id === challengeId);
    if (!source) return;
    const entry: TrackEntry = {
      entryId: newEntryId(),
      kind: "reference",
      challengeId,
      title,
      difficulty: source.difficulty ?? "medium",
      lifecycle: null,
      visibleCases: source.visibleCases,
      hiddenCases: source.hiddenCases
    };
    commit((t) => ({ ...t, entries: [...t.entries, entry] }), `Added a reference to ${title}`);
    setAddingRef(false);
  }

  function authorInto() {
    const title = authorTitle.trim();
    if (!title || !track) return;
    const entry: TrackEntry = {
      entryId: newEntryId(),
      kind: "authored",
      challengeId: `${track.id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      difficulty: "medium",
      lifecycle: "draft",
      visibleCases: 0,
      hiddenCases: 0
    };
    commit((t) => ({ ...t, entries: [...t.entries, entry] }), `Authored “${title}” into the track`);
    setAuthoring(false);
    setAuthorTitle("");
  }

  /* An entry's act set, gated by kind and lifecycle — a track-owned entry
     carries its own lifecycle acts behind their confirm tiers; a reference
     only ever leaves the track. An archived entry is terminal: its set is
     empty and the row carries no menu at all. */
  function entryItems(entry: TrackEntry): MenuItem[] {
    const items: MenuItem[] = [];
    if (entry.kind === "authored" && entry.lifecycle === "draft") {
      items.push({ id: "publish", label: "Publish", icon: "check-mark" });
    }
    if (entry.kind === "authored" && entry.lifecycle === "published") {
      items.push({ id: "return-draft", label: "Return to draft", icon: "reset" });
    }
    if (entry.kind === "authored" && entry.lifecycle !== "archived") {
      items.push({ id: "archive", label: "Archive…", icon: "inbox", destructive: true });
    }
    if (entry.kind === "reference") {
      items.push({ id: "remove", label: "Remove reference…", icon: "minus", destructive: true });
    }
    return items;
  }

  function onEntrySelect(entry: TrackEntry, id: string) {
    if (id === "publish") {
      commit((t) => ({
        ...t,
        entries: t.entries.map((e) => e.entryId === entry.entryId ? { ...e, lifecycle: "published" } : e)
      }), `Published “${entry.title}”`);
    } else if (id === "return-draft") {
      commit((t) => ({
        ...t,
        entries: t.entries.map((e) => e.entryId === entry.entryId ? { ...e, lifecycle: "draft" } : e)
      }), `Returned “${entry.title}” to draft`);
    } else if (id === "archive") {
      setArchiveEntry(entry);
    } else if (id === "remove") {
      setRemoveRef(entry);
    }
  }

  if (!track) {
    return (
      <AdminPage kicker="Content · Track studio" title="Track unavailable">
        <StateBlock
          state="unavailable"
          message="This track could not be read — nothing was loaded."
          action={<Button variant="secondary" onClick={() => navigate("/admin/tracks")}>Back to the track list</Button>}
        />
      </AdminPage>
    );
  }

  /* Reference candidates: non-archived catalogue challenges, with the two
     named refusals — no template for the track's language, or already
     referenced here. */
  const referenceRows = catalogue
    .filter((c) => c.lifecycle !== "archived")
    .map((c) => {
      const already = track.entries.some((e) => e.kind === "reference" && e.challengeId === c.id);
      const hasTemplate = c.languages.includes(track.language);
      return {
        challenge: c,
        refusal: already
          ? "already referenced in this track"
          : !hasTemplate
            ? `no ${languageLabel(track.language)} template`
            : null
      };
    });

  const languageFrozen = track.entries.length > 0;

  return (
    <AdminPage
      kicker="Content · Track studio"
      title={track.name}
      lead={track.description || "An authored path — contents in the author's order."}
      actions={
        <>
          <Button variant="quiet" icon="arrow-left" onClick={() => navigate("/admin/tracks")}>Track list</Button>
          {track.lifecycle === "draft" ? (
            <Button onClick={() => commit((t) => ({ ...t, lifecycle: "published" }), "Published the track")}>Publish</Button>
          ) : null}
          {track.lifecycle === "published" ? (
            <Button variant="secondary" onClick={() => commit((t) => ({ ...t, lifecycle: "draft" }), "Returned the track to draft")}>Return to draft</Button>
          ) : null}
          {track.lifecycle !== "archived" ? (
            <Button variant="quiet" onClick={() => setArchiveTrack(true)}>Archive</Button>
          ) : null}
        </>
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editTrack} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="Track unavailable — it could not be read. Never a blank studio."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          <div className="ch-factbar">
            <Chip size="sm" variant="accent" icon="tracks">{languageLabel(track.language)}</Chip>
            <Chip
              size="sm"
              variant="quiet"
              className={track.lifecycle === "archived" ? "ch-chip--muted" : ""}
            >
              {track.lifecycle}
            </Chip>
            <Chip size="sm" variant="quiet">
              {track.entries.length} {track.entries.length === 1 ? "entry" : "entries"}
            </Chip>
            <span className="meta">
              {languageFrozen
                ? "The language is frozen — the track owns challenges."
                : "The language freezes the moment the track owns a challenge."}
            </span>
          </div>

          {flash ? <Notice tone="success" live="polite">{flash}</Notice> : null}

          <Card>
            <CardHeader
              title="Contents"
              icon="list"
              eyebrow="in the author's order"
              action={
                <span className="row">
                  <Button variant="secondary" size="sm" icon="plus" onClick={() => setAddingRef(true)}>
                    Add a reference
                  </Button>
                  <Button variant="secondary" size="sm" icon="edit" onClick={() => setAuthoring(true)}>
                    Author into this track
                  </Button>
                </span>
              }
            />
            {dirty ? (
              <div className="ch-reorder" role="status">
                <span>The order has changed — it commits in bulk, all or nothing, with one audit-trail row.</span>
                <span className="ch-reorder__acts">
                  <Button variant="quiet" size="sm" onClick={() => setOrdered(null)}>Reset</Button>
                  <Button size="sm" onClick={saveOrder}>Save order</Button>
                </span>
              </div>
            ) : null}
            {entries.length === 0 ? (
              <StateBlock
                state="empty"
                compact
                message="No challenges yet — author one into the track or add a reference to an underlying challenge."
              />
            ) : (
              <List>
                {entries.map((entry, index) => {
                  const items = entryItems(entry);
                  return (
                    <ListRow key={entry.entryId} as="article" align="center">
                      <span className="ch-order">
                        <span className="ch-order__n">{index + 1}</span>
                        <IconButton icon="chevron-up" label={`Move ${entry.title} up`} iconSize={14} disabled={index === 0} onClick={() => move(index, -1)} />
                        <IconButton icon="chevron-down" label={`Move ${entry.title} down`} iconSize={14} disabled={index === entries.length - 1} onClick={() => move(index, 1)} />
                      </span>
                      <div className="ch-grow">
                        <span className="ch-itemhead">
                          <Link className="ch-titlelink" to={`/admin/challenges/${entry.challengeId}`}>
                            <strong>{entry.title}</strong>
                          </Link>
                          <Chip size="sm" variant="quiet">
                            {entry.kind === "reference" ? "reference" : "track-owned"}
                          </Chip>
                          {entry.kind === "authored" && entry.lifecycle === "published" ? (
                            <Chip size="sm" variant="accent">published</Chip>
                          ) : null}
                          {entry.kind === "authored" && entry.lifecycle === "archived" ? (
                            <Chip size="sm" variant="quiet" className="ch-chip--muted">archived</Chip>
                          ) : null}
                        </span>
                        <p className="ch-cell__meta">
                          {entry.difficulty} · {entry.visibleCases + entry.hiddenCases > 0
                            ? `${entry.visibleCases} visible · ${entry.hiddenCases} hidden`
                            : "no cases yet"}
                          {entry.kind === "reference"
                            ? " — a reference; its state follows the underlying challenge"
                            : ` — track-owned · ${entry.lifecycle}`}
                        </p>
                      </div>
                      <div className="ch-idx__acts">
                        <Button variant="secondary" size="sm" to={`/admin/challenges/${entry.challengeId}`}>
                          Open
                        </Button>
                        {items.length === 0 ? (
                          /* Archived is terminal — no acts remain, so the row
                             carries no menu at all. */
                          <span className="meta">terminal</span>
                        ) : (
                          <Menu
                            trigger={<Icon name="more" size={16} />}
                            triggerLabel={`Actions for ${entry.title}`}
                            items={items}
                            align="end"
                            onSelect={(id) => onEntrySelect(entry, id)}
                          />
                        )}
                      </div>
                    </ListRow>
                  );
                })}
              </List>
            )}
            <p className="ch-note">
              Challenges arrive by exactly one of two paths — authored into the track, or added as a
              reference to the underlying challenge — and reordering is a bulk commit.
            </p>
          </Card>

          <Card>
            <CardHeader title="Audit trail" icon="history" eyebrow="every change, or nothing" />
            {track.audit.length === 0 ? (
              <StateBlock state="empty" compact message="No changes committed yet." />
            ) : (
              <div className="ch-audit">
                {track.audit.map((row) => (
                  <div key={row.id} className="ch-audit__row">
                    <span className="ch-audit__at">{fmtInstant(row.at)}</span>
                    <span className="ch-audit__actor">{row.actor}</span>
                    <span>{row.action}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : null}

      {/* Add a reference — the catalogue with the two named refusals inline. */}
      <Dialog
        open={addingRef}
        title="Add a reference"
        icon="plus"
        onClose={() => setAddingRef(false)}
        actions={<Button variant="quiet" onClick={() => setAddingRef(false)}>Close</Button>}
      >
        <p>
          A reference produces nothing but a pointer to the underlying challenge — no second
          statement, cases, hints or lifecycle of its own.
        </p>
        <List>
          {referenceRows.length === 0 ? (
            <StateBlock state="empty" compact message="The catalogue holds nothing to reference." />
          ) : (
            referenceRows.map(({ challenge, refusal }) => (
              <ListRow
                key={challenge.id}
                onClick={refusal ? undefined : () => addReference(challenge.id, challenge.title)}
                disabled={refusal !== null}
                align="center"
              >
                <div className="ch-grow">
                  <strong>{challenge.title}</strong>
                  <p className="ch-cell__meta">
                    {challenge.lifecycle}
                    {refusal ? ` — ${refusal}` : ""}
                  </p>
                </div>
                {refusal ? <Chip size="sm" variant="quiet">refused</Chip> : <Chip size="sm">add</Chip>}
              </ListRow>
            ))
          )}
        </List>
      </Dialog>

      {/* Author into the track — a track-owned draft inheriting the language. */}
      <Dialog
        open={authoring}
        title="Author a challenge into this track"
        icon="edit"
        onClose={() => setAuthoring(false)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setAuthoring(false)}>Cancel</Button>
            <Button onClick={authorInto} disabled={!authorTitle.trim()}>Create the draft</Button>
          </>
        }
      >
        <p>
          A track-owned challenge, inheriting {languageLabel(track.language)}, with a lifecycle of
          its own. Its body authors in the shared editing space.
        </p>
        <Field label="Title" required>
          <input value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} placeholder="Sliding Window Total" />
        </Field>
      </Dialog>

      {/* Ordinary confirm — archiving a track-owned challenge shortens the track. */}
      <Dialog
        open={archiveEntry !== null}
        title={archiveEntry ? `Archive ${archiveEntry.title}?` : "Archive?"}
        icon="inbox"
        tone="destructive"
        onClose={() => setArchiveEntry(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setArchiveEntry(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!archiveEntry) return;
                commit((t) => ({
                  ...t,
                  entries: t.entries.map((e) => e.entryId === archiveEntry.entryId ? { ...e, lifecycle: "archived" } : e)
                }), `Archived “${archiveEntry.title}” — the track shortens`);
                setArchiveEntry(null);
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <p>Archiving a track-owned challenge shortens the track; a solve already earned still counts everywhere solves count.</p>
      </Dialog>

      {/* Removing a reference shortens the track the same way — audited, and
          the underlying challenge is never part of the blast radius. */}
      <Dialog
        open={removeRef !== null}
        title={removeRef ? `Remove the reference to ${removeRef.title}?` : "Remove reference?"}
        icon="minus"
        tone="destructive"
        onClose={() => setRemoveRef(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setRemoveRef(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!removeRef) return;
                commit((t) => ({
                  ...t,
                  entries: t.entries.filter((e) => e.entryId !== removeRef.entryId)
                }), `Removed the reference to ${removeRef.title}`);
                setRemoveRef(null);
              }}
            >
              Remove reference
            </Button>
          </>
        }
      >
        <p>The reference leaves the track and the track shortens; the underlying challenge is untouched.</p>
      </Dialog>

      <Dialog
        open={archiveTrack}
        title={`Archive ${track.name}?`}
        icon="inbox"
        tone="destructive"
        onClose={() => setArchiveTrack(false)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setArchiveTrack(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                commit((t) => ({ ...t, lifecycle: "archived" }), "Archived the track");
                setArchiveTrack(false);
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <p>Archiving hides the track from learners; the underlying challenges behind its references are untouched.</p>
      </Dialog>
    </AdminPage>
  );
}
