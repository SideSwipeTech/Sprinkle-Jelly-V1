/**
 * Revisions — `curriculum/lessons/:id/revisions`. The per-lesson revision
 * list, and the four author tools in spec order: move a lesson between
 * chapters, restore a revision, duplicate a lesson, share a read-only draft
 * preview link.
 *
 * Spec truths: a restore writes into the draft rather than going live; a
 * moved lesson keeps every completion and its revision log; a duplicated
 * lesson starts with none; a preview link is unguessable, lives
 * PUBLISHING_PREVIEW_LINK_LIFETIME_HOURS, refuses every write, and once
 * revoked says the preview is not active — never a broken page and never the
 * live version.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { groupTo, itemTo } from "./hierarchy";
import {
  GROUP_LABEL,
  REVISIONS,
  findLesson,
  loadedNote,
  readStudioTree,
  writeStudioTree,
  type RevisionRow
} from "./fixtures";
import "./courses.css";

export function Revisions() {
  const { id = "" } = useParams();
  const [items, setItems] = useState(readStudioTree);
  const found = useMemo(() => findLesson(items, id), [items, id]);

  const [revisions, setRevisions] = useState<RevisionRow[]>(
    () =>
      REVISIONS[id] ?? [
        { id: "r1", at: "16 Aug 2026, 10:00", author: "Yash", summary: "Current draft", live: true }
      ]
  );
  const [moveTarget, setMoveTarget] = useState("");
  const [note, setNote] = useState<{ tone: "ok" | "warn" | "err"; text: string } | null>(null);
  const [link, setLink] = useState<{ url: string; revoked: boolean } | null>(null);
  const [duplicated, setDuplicated] = useState<string | null>(null);

  /* A param change swaps the lesson without remounting — the tool state
     resets with it. */
  useEffect(() => {
    setRevisions(REVISIONS[id] ?? [
      { id: "r1", at: "16 Aug 2026, 10:00", author: "Yash", summary: "Current draft", live: true }
    ]);
    setMoveTarget("");
    setNote(null);
    setLink(null);
    setDuplicated(null);
  }, [id]);

  if (!found) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Revisions and author tools">
        <StateBlock
          state="unavailable"
          message="That lesson is not in the studio tree."
          action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
        />
      </AdminPage>
    );
  }

  const { item, group, lesson } = found;
  const groupWord = GROUP_LABEL[item.family];
  const otherGroups = item.groups.filter((g) => g.id !== group.id);

  function moveLesson() {
    const target = item.groups.find((g) => g.id === moveTarget);
    if (!target) return;
    const next = items.map((it) => {
      if (it.id !== item.id) return it;
      return {
        ...it,
        groups: it.groups.map((g) => {
          if (g.id === group.id) return { ...g, lessons: g.lessons.filter((l) => l.id !== id) };
          if (g.id === target.id) return { ...g, lessons: [...g.lessons, lesson] };
          return g;
        })
      };
    });
    setItems(next);
    writeStudioTree(next);
    setNote({
      tone: "ok",
      text: `Moved to ${groupWord} “${target.title}” — the lesson keeps every completion and its revision log.`
    });
  }

  function restoreRevision(rev: RevisionRow) {
    setRevisions((prev) => [
      { id: `r-${Date.now()}`, at: "just now", author: "Yash", summary: `Restored ${rev.id} into the draft` },
      ...prev
    ]);
    setNote({
      tone: "ok",
      text: `Revision ${rev.id} was written into the draft — going live still takes a publish.`
    });
  }

  function duplicateLesson() {
    const copyId = `${lesson.id}-copy`;
    const next = items.map((it) => {
      if (it.id !== item.id) return it;
      return {
        ...it,
        groups: it.groups.map((g) =>
          g.id === group.id
            ? {
                ...g,
                lessons: [
                  ...g.lessons,
                  { ...lesson, id: copyId, title: `${lesson.title} (copy)`, lifecycle: "draft" as const }
                ]
              }
            : g
        )
      };
    });
    setItems(next);
    writeStudioTree(next);
    setDuplicated(copyId);
    setNote({
      tone: "ok",
      text: `“${lesson.title} (copy)” sits beside it in “${group.title}” — no completions, no revisions.`
    });
  }

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title={`Revisions — ${lesson.title}`}
      lead="The per-lesson revision list — author undo only; no learner is on one or hears of one. The newest kept revisions live a bounded time; an older or excess one goes silently."
      actions={
        <Link className="btn btn--secondary" to={`/admin/curriculum/lessons/${lesson.id}`}>
          Open in editor
        </Link>
      }
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: group.title, to: groupTo(item.id, group.id) },
          { label: lesson.title, to: `/admin/curriculum/lessons/${lesson.id}` },
          { label: "Revisions" }
        ]}
      />

      {note ? (
        <p className="cs-note" data-tone={note.tone} role="status">
          <Icon name={note.tone === "err" ? "alert" : "check"} size={14} /> {note.text}
        </p>
      ) : null}

      <Card>
        <CardHeader title="Revisions" icon="history" />
        <p className="meta">{loadedNote(revisions.length, revisions.length)}</p>
        <div className="cs-lines">
          {revisions.map((rev) => (
            <div className="cs-preview-row" key={rev.id}>
              <span className="cs-preview-row__title">
                <strong>{rev.summary}</strong>
                <p className="meta">
                  {rev.id} · {rev.author} · {rev.at}
                  {rev.live ? " · the live version carries this revision" : ""}
                </p>
              </span>
              <span className="cs-preview-row__end">
                <button type="button" className="btn btn--secondary" onClick={() => restoreRevision(rev)}>
                  Restore into draft
                </button>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Move a lesson between chapters" icon="arrow-right" />
        <p className="meta">The moved lesson keeps every completion and its revision log.</p>
        {otherGroups.length === 0 ? (
          <p className="meta">No other {groupWord} exists on “{item.title}” to move into.</p>
        ) : (
          <div className="cs-toolrow">
            <label className="field">
              <span className="meta">Target {groupWord}</span>
              <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}>
                <option value="">Choose a {groupWord}…</option>
                {otherGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!moveTarget}
              onClick={moveLesson}
            >
              Move
            </button>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Duplicate the lesson" icon="copy" />
        <p className="meta">The duplicate starts with no completions and no revisions.</p>
        <button type="button" className="btn btn--secondary" onClick={duplicateLesson} disabled={Boolean(duplicated)}>
          {duplicated ? "Duplicated" : "Duplicate into this " + groupWord}
        </button>
      </Card>

      <Card>
        <CardHeader title="Share a read-only draft preview link" icon="external-link" />
        <p className="meta">
          Unguessable, lives PUBLISHING_PREVIEW_LINK_LIFETIME_HOURS, revocable immediately. Any
          signed-in session holding the link may read the draft — it refuses every write, enrols and
          records nothing, and runs nothing.
        </p>
        {link === null ? (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setLink({ url: `/draft-preview/${lesson.id}-9f4c2e7a1b`, revoked: false })}
          >
            Create preview link
          </button>
        ) : (
          <>
            <div className="cs-preview-row">
              <code className="meta">{link.url}</code>
              <span className="cs-preview-row__end">
                <button
                  type="button"
                  className="btn btn--quiet"
                  disabled={link.revoked}
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}${link.url}`)}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="btn btn--quiet"
                  disabled={link.revoked}
                  onClick={() => setLink({ ...link, revoked: true })}
                >
                  Revoke
                </button>
              </span>
            </div>
            {link.revoked ? (
              <>
                <StateBlock
                  state="refused"
                  message="The preview is not active."
                  compact
                />
                <p className="meta">A revoked link never opens the live version and never a broken page.</p>
              </>
            ) : (
              <p className="meta">Read-only to anyone signed in holding the link — no roster, no allow-list.</p>
            )}
          </>
        )}
      </Card>
    </AdminPage>
  );
}
