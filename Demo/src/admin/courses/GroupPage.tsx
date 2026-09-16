/**
 * GroupPage — `curriculum/items/:itemId/groups/:groupId`. Level 2 of the
 * studio tree: one chapter/module in context. Its lessons render as a ruled
 * list — the title opens the editor, secondary acts sit in the row's
 * "Actions for …" menu. New lesson takes a title and a type and lands
 * straight in the editor as a draft. Reorder is a deliberate mode: the
 * chevrons exist only while it is on.
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { EMPTY_SEED, NodeForm } from "./NodeForm";
import {
  ActionsMenu,
  DeleteConfirm,
  LESSON_TYPE_ICON,
  OrderControls,
  applyNodeForm,
  deleteNode,
  itemTo,
  lessonTo,
  lessonBadges,
  retireTo,
  type DeleteTarget,
  type FormTarget
} from "./hierarchy";
import {
  GROUP_LABEL,
  LESSON_TYPE_LABEL,
  findGroup,
  loadedNote,
  readStudioTree,
  writeStudioTree,
  type StudioItem,
  type StudioLesson
} from "./fixtures";

import "./courses.css";

export function GroupPage() {
  const { itemId = "", groupId = "" } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState(readStudioTree);
  const found = findGroup(items, itemId, groupId);

  const [reordering, setReordering] = useState(false);
  const [refusal, setRefusal] = useState("");
  const [form, setForm] = useState<FormTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  function commit(next: StudioItem[]) {
    setItems(next);
    writeStudioTree(next);
  }

  if (!found) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Courses">
        <StateBlock
          state="unavailable"
          message="That chapter or module is not in the studio tree."
          action={
            <Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>
          }
        />
      </AdminPage>
    );
  }

  const { item, group } = found;
  const groupWord = GROUP_LABEL[item.family];

  /* ── Reorder — lessons within the group ─────────────────────────────── */

  function moveLesson(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= group.lessons.length) return;
    commit(
      items.map((it) => {
        if (it.id !== item.id) return it;
        return {
          ...it,
          groups: it.groups.map((g) => {
            if (g.id !== group.id) return g;
            const lessons = [...g.lessons];
            const [l] = lessons.splice(index, 1);
            lessons.splice(j, 0, l!);
            return { ...g, lessons };
          })
        };
      })
    );
  }

  /* ── Create / edit / delete ─────────────────────────────────────────── */

  function openCreateLesson() {
    setForm({
      mode: "create",
      kind: "lesson",
      family: item.family,
      itemId: item.id,
      groupId: group.id,
      seed: EMPTY_SEED
    });
  }

  function openEditLesson(lesson: StudioLesson) {
    /* An unauthorized open is refused at the named action — rename is one. */
    if (lesson.restricted) {
      setRefusal(`Editing “${lesson.title}” is refused to your role.`);
      return;
    }
    setForm({
      mode: "edit",
      kind: "lesson",
      family: item.family,
      itemId: item.id,
      groupId: group.id,
      lessonId: lesson.id,
      seed: {
        ...EMPTY_SEED,
        title: lesson.title,
        address: lesson.address,
        lessonType: lesson.type,
        required: lesson.required
      }
    });
  }

  function saveForm(values: Parameters<typeof applyNodeForm>[2]) {
    const f = form;
    if (!f) return;
    const { next, createdId } = applyNodeForm(items, f, values);
    commit(next);
    setForm(null);
    /* A created lesson opens the editor immediately — authoring continues
       there, not back at the list. */
    if (f.mode === "create" && f.kind === "lesson" && createdId) {
      navigate(lessonTo(createdId));
    }
  }

  function requestDeleteLesson(lesson: StudioLesson) {
    if (lesson.restricted) {
      setRefusal(`Deleting “${lesson.title}” is refused to your role.`);
      return;
    }
    setDeleting({
      kind: "lesson",
      itemId: item.id,
      groupId: group.id,
      lessonId: lesson.id,
      word: "lesson",
      title: lesson.title,
      sweeps: lesson.saved ? "its saved draft goes with it" : "it carries no saved content"
    });
  }

  function confirmDelete() {
    const d = deleting;
    if (!d) return;
    commit(deleteNode(items, d));
    setDeleting(null);
  }

  function onLessonMenu(lesson: StudioLesson, id: string) {
    if (id === "edit") openEditLesson(lesson);
    else if (id === "revisions") {
      if (lesson.restricted) {
        setRefusal(`Opening “${lesson.title}” is refused to your role.`);
        return;
      }
      navigate(`${lessonTo(lesson.id)}/revisions`);
    } else if (id === "delete") requestDeleteLesson(lesson);
    else if (id === "retire") navigate(retireTo(item.id, group.id, lesson.id));
  }

  function renderLesson(lesson: StudioLesson, index: number) {
    return (
      <div className="cs-preview-row" key={lesson.id}>
        <span className="cs-row__glyph" aria-hidden="true">
          <Icon name={LESSON_TYPE_ICON[lesson.type]} size={15} />
        </span>
        <span className="cs-preview-row__title">
          {lesson.restricted ? (
            <button
              type="button"
              className="cs-row__link"
              onClick={() =>
                setRefusal(`Opening “${lesson.title}” in the lesson editor is refused to your role.`)
              }
            >
              {lesson.title} <Icon name="lock" size={12} />
            </button>
          ) : (
            <Link className="cs-row__link" to={lessonTo(lesson.id)}>
              {lesson.title}
            </Link>
          )}
          <span className="meta">
            {LESSON_TYPE_LABEL[lesson.type]} · /{lesson.address}
            {lesson.minutes !== undefined ? ` · ${lesson.minutes} min` : ""}
          </span>
          <span className="cs-row__badges">{lessonBadges(item, lesson)}</span>
        </span>
        <span className="cs-preview-row__end">
          {reordering ? (
            <OrderControls
              index={index}
              count={group.lessons.length}
              onMove={(dir) => moveLesson(index, dir)}
              label={`lesson ${lesson.title}`}
            />
          ) : null}
          <ActionsMenu
            title={lesson.title}
            items={[
              { id: "edit", label: "Edit lesson details…", icon: "edit" },
              { id: "revisions", label: "Revisions and author tools", icon: "history" },
              lesson.lifecycle === "draft"
                ? { id: "delete", label: "Delete permanently…", icon: "trash", destructive: true }
                : { id: "retire", label: "Retire…", icon: "inbox", destructive: true }
            ]}
            onSelect={(id) => onLessonMenu(lesson, id)}
          />
        </span>
      </div>
    );
  }

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title={group.title}
      lead={`${groupWord} of ${item.title} — ${group.lessons.length} ${group.lessons.length === 1 ? "lesson" : "lessons"}. A lesson title opens its editor.`}
      actions={
        <div className="row">
          <button
            type="button"
            className="btn btn--secondary"
            aria-pressed={reordering}
            onClick={() => setReordering((v) => !v)}
          >
            <Icon name="layers" size={13} /> {reordering ? "Done reordering" : "Reorder"}
          </button>
          <button type="button" className="btn btn--primary" onClick={openCreateLesson}>
            <Icon name="plus" size={13} /> New lesson
          </button>
        </div>
      }
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: group.title }
        ]}
      />

      {refusal ? (
        <p className="cs-note" data-tone="err" role="alert">
          <Icon name="lock" size={14} /> {refusal}
          <button type="button" className="btn btn--quiet" onClick={() => setRefusal("")}>
            Dismiss
          </button>
        </p>
      ) : null}

      {reordering ? (
        <p className="cs-note" role="status">
          <Icon name="layers" size={14} /> Reorder mode — the chevrons move a lesson; nothing else
          changes while it is on.
        </p>
      ) : null}

      <p className="meta">{loadedNote(group.lessons.length, group.lessons.length)}</p>
      {group.lessons.length === 0 ? (
        <StateBlock
          state="empty"
          message={`No lessons yet — an empty ${groupWord} may be left incomplete in draft.`}
          action={
            <button type="button" className="btn btn--primary" onClick={openCreateLesson}>
              <Icon name="plus" size={13} /> New lesson
            </button>
          }
        />
      ) : (
        <div className="cs-lines cs-lessonlist">{group.lessons.map(renderLesson)}</div>
      )}

      {form ? (
        <NodeForm
          mode={form.mode}
          kind={form.kind}
          family={form.family}
          seed={form.seed}
          onSubmit={saveForm}
          onClose={() => setForm(null)}
        />
      ) : null}

      {deleting ? (
        <DeleteConfirm target={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
      ) : null}
    </AdminPage>
  );
}
