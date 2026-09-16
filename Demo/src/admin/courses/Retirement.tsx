/**
 * Retirement — `curriculum/:id/retire`, scoped by `?group=` and `?lesson=`.
 * The act targets exactly what it was taken on: a chapter/module or a lesson
 * carried in from its menu retires itself, never silently the parent item.
 *
 * The tiers stay: archive (the soft take-down, terminal — there is no
 * unpublish and no invented restore), the item's cascade (archive with the
 * children, rejecting rather than half-sweeping if the state changed
 * underneath), and hard delete — permanent, reserved for a pristine draft,
 * behind a typed confirmation through the one confirmation dialog. Each act
 * is preceded by a preview of exactly what it sweeps.
 */

import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { groupTo, itemTo } from "./hierarchy";
import {
  GROUP_LABEL,
  findItem,
  groupDeletable,
  readStudioTree,
  writeStudioTree,
  type StudioItem
} from "./fixtures";
import "./courses.css";

type Note = { tone: "ok" | "err"; text: string };

export function Retirement() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const groupId = params.get("group");
  const lessonId = params.get("lesson");

  const [items, setItems] = useState(readStudioTree);
  const item = findItem(items, id);
  const group = groupId ? item?.groups.find((g) => g.id === groupId) ?? null : null;
  const lesson = lessonId ? group?.lessons.find((l) => l.id === lessonId) ?? null : null;

  const [note, setNote] = useState<Note | null>(null);
  const [confirming, setConfirming] = useState<null | { word: string; title: string; run: () => void }>(null);
  const [echo, setEcho] = useState("");
  /* A hard delete removes the scope from the tree — the page keeps a
     snapshot so the pruned confirmation renders instead of a "not found". */
  const [gone, setGone] = useState<{ title: string; backTo: string; backLabel: string } | null>(null);

  if (!item || (groupId && !group) || (lessonId && !lesson)) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Retirement">
        {gone ? (
          <>
            {note ? (
              <p className="cs-note" data-tone={note.tone} role="status">
                <Icon name="check" size={14} /> {note.text}
              </p>
            ) : null}
            <StateBlock
              state="pruned"
              message={`“${gone.title}” was permanently deleted.`}
              action={<Link className="btn btn--secondary" to={gone.backTo}>{gone.backLabel}</Link>}
            />
          </>
        ) : (
          <StateBlock
            state="unavailable"
            message="That scope is not in the studio tree."
            action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
          />
        )}
      </AdminPage>
    );
  }

  const groupWord = GROUP_LABEL[item.family];
  /* The scope the page acts on — lesson beats group beats item. */
  const scope: "lesson" | "group" | "item" = lesson ? "lesson" : group ? "group" : "item";
  const backTo =
    scope === "lesson" || scope === "group"
      ? groupTo(item.id, group!.id)
      : itemTo(item.id);
  const backLabel =
    scope === "item" ? `Back to ${item.title}` : `Back to ${group!.title}`;

  function commit(next: StudioItem[]) {
    setItems(next);
    writeStudioTree(next);
  }

  /* ── Item scope: archive / cascade / hard delete ─────────────────────── */

  const lessonTotal = item.groups.reduce((n, g) => n + g.lessons.length, 0);
  const liveChildren = item.groups.reduce(
    (n, g) => n + g.lessons.filter((l) => l.lifecycle === "published").length,
    0
  );
  const itemArchived = item.lifecycle === "archived";

  function archiveItem() {
    commit(items.map((i) => (i.id === item!.id ? { ...i, lifecycle: "archived" as const } : i)));
    setNote({
      tone: "ok",
      text: `“${item!.title}” is archived — out of catalogues, search and every new start; still readable to every record that points at it. Archiving is terminal; there is no unpublish.`
    });
  }

  function cascade() {
    if (item!.sweepStale) {
      setNote({
        tone: "err",
        text: "The cascade was rejected — the state changed underneath the preview. Nothing was swept; run the preview again."
      });
      return;
    }
    commit(
      items.map((i) =>
        i.id === item!.id
          ? {
              ...i,
              lifecycle: "archived" as const,
              groups: i.groups.map((g) => ({
                ...g,
                lessons: g.lessons.map((l) =>
                  l.lifecycle === "published" ? { ...l, lifecycle: "archived" as const } : l
                )
              }))
            }
          : i
      )
    );
    setNote({
      tone: "ok",
      text: `The cascade archived “${item!.title}” and its ${liveChildren} live ${liveChildren === 1 ? "lesson" : "lessons"} — the whole sweep landed or none of it would have.`
    });
  }

  function hardDeleteItem() {
    commit(items.filter((i) => i.id !== item!.id));
    setGone({ title: item!.title, backTo: "/admin/curriculum", backLabel: "Back to Courses" });
    setNote({ tone: "ok", text: `“${item!.title}” was permanently deleted — it was a pristine draft.` });
  }

  /* ── Group scope: archive its live lessons, or delete the all-draft group */

  const liveInGroup = group ? group.lessons.filter((l) => l.lifecycle === "published").length : 0;

  function archiveGroup() {
    if (!group) return;
    /* A chapter/module carries no lifecycle of its own — archiving it is the
       soft take-down of its live lessons; drafts stay in the draft outline. */
    commit(
      items.map((i) =>
        i.id !== item!.id
          ? i
          : {
              ...i,
              groups: i.groups.map((g) =>
                g.id !== group.id
                  ? g
                  : {
                      ...g,
                      lessons: g.lessons.map((l) =>
                        l.lifecycle === "published" ? { ...l, lifecycle: "archived" as const } : l
                      )
                    }
              )
            }
      )
    );
    setNote({
      tone: "ok",
      text: `${groupWord} “${group.title}” is archived — its ${liveInGroup} live ${liveInGroup === 1 ? "lesson" : "lessons"} left catalogues and every new start. Drafts stay in the draft outline. Archiving is terminal; there is no unpublish.`
    });
  }

  function hardDeleteGroup() {
    if (!group) return;
    commit(
      items.map((i) =>
        i.id === item!.id ? { ...i, groups: i.groups.filter((g) => g.id !== group.id) } : i
      )
    );
    setGone({ title: group.title, backTo: itemTo(item!.id), backLabel: `Back to ${item!.title}` });
    setNote({
      tone: "ok",
      text: `${groupWord} “${group.title}” was permanently deleted — everything it held was a draft.`
    });
  }

  /* ── Lesson scope: archive the live lesson, or delete the draft ──────── */

  function archiveLesson() {
    if (!lesson || !group) return;
    commit(
      items.map((i) =>
        i.id !== item!.id
          ? i
          : {
              ...i,
              groups: i.groups.map((g) =>
                g.id !== group.id
                  ? g
                  : {
                      ...g,
                      lessons: g.lessons.map((l) =>
                        l.id === lesson.id ? { ...l, lifecycle: "archived" as const } : l
                      )
                    }
              )
            }
      )
    );
    setNote({
      tone: "ok",
      text: `“${lesson.title}” is archived — out of the live outline and every new start; still readable to the records that point at it. Archiving is terminal; there is no unpublish.`
    });
  }

  function hardDeleteLesson() {
    if (!lesson || !group) return;
    commit(
      items.map((i) =>
        i.id !== item!.id
          ? i
          : {
              ...i,
              groups: i.groups.map((g) =>
                g.id !== group.id
                  ? { ...g, lessons: g.lessons.filter((l) => l.id !== lesson.id) }
                  : g
              )
            }
      )
    );
    setGone({
      title: lesson.title,
      backTo: groupTo(item!.id, group.id),
      backLabel: `Back to ${group.title}`
    });
    setNote({ tone: "ok", text: `“${lesson.title}” was permanently deleted — it was a draft.` });
  }

  function askHardDelete(word: string, title: string, run: () => void) {
    setConfirming({ word, title, run });
    setEcho("");
  }

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title={
        scope === "lesson"
          ? `Retire lesson — ${lesson!.title}`
          : scope === "group"
            ? `Retire ${groupWord} — ${group!.title}`
            : `Retire — ${item.title}`
      }
      lead="The soft take-down and the hard delete, each preceded by a preview of exactly what it sweeps — aimed at this scope only. A course is never returned to draft."
      actions={<Link className="btn btn--secondary" to={backTo}>{backLabel}</Link>}
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          ...(group ? [{ label: group.title, to: groupTo(item.id, group.id) }] : []),
          ...(lesson ? [{ label: lesson.title, to: `/admin/curriculum/lessons/${lesson.id}` }] : []),
          { label: "Retire" }
        ]}
      />

      {note ? (
        <p className="cs-note" data-tone={note.tone} role={note.tone === "err" ? "alert" : "status"}>
          <Icon name={note.tone === "err" ? "alert" : "check"} size={14} /> {note.text}
        </p>
      ) : null}

      {scope === "lesson" && lesson && group ? (
        <>
          <Card>
            <CardHeader title="Archive" icon="inbox" eyebrow="the soft tier — a take-down, never a removal" />
            <div className="cs-sweep">
              <strong>What the sweep touches — preview</strong>
              <ul>
                <li>“{lesson.title}” leaves the live outline and every new start</li>
                <li>Stays readable to every record that points at it</li>
                <li>Terminal — never returned to draft</li>
              </ul>
            </div>
            <div className="admin-tools">
              {lesson.lifecycle === "published" ? (
                <button type="button" className="btn btn--secondary" onClick={archiveLesson}>
                  Archive this lesson
                </button>
              ) : (
                <StateBlock
                  state={lesson.lifecycle === "archived" ? "pruned" : "refused"}
                  message={
                    lesson.lifecycle === "archived"
                      ? "This lesson is already archived."
                      : "Nothing live to take down — a draft lesson deletes below, it does not archive."
                  }
                  compact
                />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Hard delete" icon="trash" eyebrow="the hard tier — permanent, a draft, typed" />
            {lesson.lifecycle === "draft" ? (
              <>
                <div className="cs-sweep">
                  <strong>What the sweep touches — preview</strong>
                  <ul>
                    <li>“{lesson.title}” — permanently deleted from {groupWord} “{group.title}”</li>
                    <li>{lesson.saved ? "Its saved draft goes with it" : "It carries no saved content"}</li>
                    <li>No learner ever met it — a draft is pristine</li>
                  </ul>
                </div>
                <div className="admin-tools">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => askHardDelete("lesson", lesson.title, hardDeleteLesson)}
                  >
                    Delete permanently…
                  </button>
                </div>
              </>
            ) : (
              <StateBlock
                state="refused"
                message={`Hard delete is reserved for a draft — “${lesson.title}” is ${lesson.lifecycle}. Archive is the retirement path.`}
                compact
              />
            )}
          </Card>
        </>
      ) : scope === "group" && group ? (
        <>
          <Card>
            <CardHeader title="Archive" icon="inbox" eyebrow="the soft tier — a take-down, never a removal" />
            <div className="cs-sweep">
              <strong>What the sweep touches — preview</strong>
              <ul>
                <li>
                  {groupWord} “{group.title}” leaves the live outline — its {liveInGroup} live{" "}
                  {liveInGroup === 1 ? "lesson" : "lessons"} go with it
                </li>
                {group.lessons
                  .filter((l) => l.lifecycle === "published")
                  .map((l) => (
                    <li key={l.id}>lesson “{l.title}” — archived</li>
                  ))}
                <li>
                  {group.lessons.length - liveInGroup}{" "}
                  {group.lessons.length - liveInGroup === 1 ? "draft stays" : "drafts stay"} in the
                  draft outline — an archive never publishes anything
                </li>
                <li>Terminal — never returned to draft</li>
              </ul>
            </div>
            <div className="admin-tools">
              {liveInGroup > 0 ? (
                <button type="button" className="btn btn--secondary" onClick={archiveGroup}>
                  Archive this {groupWord}
                </button>
              ) : (
                <StateBlock
                  state="refused"
                  message="Nothing live to take down — an all-draft chapter or module deletes below, it does not archive."
                  compact
                />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Hard delete" icon="trash" eyebrow="the hard tier — permanent, an all-draft subtree, typed" />
            {groupDeletable(group) ? (
              <>
                <div className="cs-sweep">
                  <strong>What the sweep touches — preview</strong>
                  <ul>
                    <li>“{group.title}” — permanently deleted from “{item.title}”</li>
                    <li>
                      {group.lessons.length}{" "}
                      {group.lessons.length === 1 ? "lesson" : "lessons"}, every one a draft — all of
                      it goes
                    </li>
                    <li>No learner ever met it — an all-draft subtree is pristine</li>
                  </ul>
                </div>
                <div className="admin-tools">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => askHardDelete(groupWord, group.title, hardDeleteGroup)}
                  >
                    Delete permanently…
                  </button>
                </div>
              </>
            ) : (
              <StateBlock
                state="refused"
                message={`Hard delete is reserved for an all-draft ${groupWord} — “${group.title}” holds ${liveInGroup} live ${liveInGroup === 1 ? "lesson" : "lessons"}. Archive is the retirement path.`}
                compact
              />
            )}
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader title="Archive" icon="inbox" eyebrow="the soft tier — a take-down, never a removal" />
            <div className="cs-sweep">
              <strong>What the sweep touches — preview</strong>
              <ul>
                <li>“{item.title}” leaves catalogues, search and every new start</li>
                <li>Stays fully readable to the {item.enrolled} enrolled {item.enrolled === 1 ? "learner" : "learners"} and every record that points at it</li>
                <li>Terminal — never returned to draft</li>
              </ul>
            </div>
            <div className="admin-tools">
              <button
                type="button"
                className="btn btn--secondary"
                disabled={itemArchived}
                onClick={archiveItem}
              >
                {itemArchived ? "Archived" : "Archive"}
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Cascade" icon="layers" eyebrow="the soft tier — archive with the children, previewed" />
            <div className="cs-sweep">
              <strong>What the sweep touches — preview</strong>
              <ul>
                <li>“{item.title}” — archived</li>
                {item.groups.map((g) => (
                  <li key={g.id}>
                    {groupWord} “{g.title}” — {g.lessons.length} {g.lessons.length === 1 ? "lesson" : "lessons"} swept with it
                  </li>
                ))}
                <li>{liveChildren} live {liveChildren === 1 ? "lesson" : "lessons"} underneath — archiving anything with live children requires this explicit cascade</li>
              </ul>
            </div>
            <p className="meta">
              A cascade rejects rather than half-sweeping if the state changed underneath the
              preview.
            </p>
            <div className="admin-tools">
              <button
                type="button"
                className="btn btn--secondary"
                disabled={itemArchived || liveChildren === 0}
                onClick={cascade}
              >
                {itemArchived ? "Archived" : liveChildren === 0 ? "No live children — archive alone" : "Run the cascade"}
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Hard delete" icon="trash" eyebrow="the hard tier — permanent, a pristine draft, typed" />
            {item.pristine ? (
              <>
                <div className="cs-sweep">
                  <strong>What the sweep touches — preview</strong>
                  <ul>
                    <li>“{item.title}” — permanently deleted</li>
                    <li>{item.groups.length} {groupWord}{item.groups.length === 1 ? "" : "s"}, {lessonTotal} {lessonTotal === 1 ? "lesson" : "lessons"}, its draft — all of it</li>
                    <li>No learner ever saw it — it is a pristine draft</li>
                  </ul>
                </div>
                <p className="meta">
                  Reserved for a pristine draft, and it needs a typed confirmation through the one
                  confirmation dialog.
                </p>
                <div className="admin-tools">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => askHardDelete(ITEM_WORD[item.family], item.title, hardDeleteItem)}
                  >
                    Delete permanently…
                  </button>
                </div>
              </>
            ) : (
              <StateBlock
                state="refused"
                message={`Hard delete is reserved for a pristine draft — “${item.title}” is ${item.lifecycle} with ${item.enrolled} enrolled. Archive is the retirement path.`}
                compact
              />
            )}
          </Card>
        </>
      )}

      {confirming ? (
        <Dialog
          title={`Delete “${confirming.title}” permanently`}
          icon="alert"
          tone="destructive"
          onClose={() => setConfirming(null)}
        >
          <p>
            This is the one confirmation dialog — the action stays unreachable until the echo
            matches. A bad echo leaves it unreachable.
          </p>
          <ConfirmByTyping phrase={confirming.title} value={echo} onChange={setEcho}>
            {(matched) => (
              <>
                <Button variant="quiet" onClick={() => setConfirming(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!matched}
                  onClick={() => {
                    confirming.run();
                    setConfirming(null);
                    setEcho("");
                  }}
                >
                  Delete permanently
                </Button>
              </>
            )}
          </ConfirmByTyping>
        </Dialog>
      ) : null}
    </AdminPage>
  );
}

const ITEM_WORD = { interactive: "subject", video: "course" } as const;
