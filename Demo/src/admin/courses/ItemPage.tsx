/**
 * ItemPage — `curriculum/items/:itemId`. Level 1 of the studio tree: one
 * subject/course in context. Its chapters/modules render as cards that open
 * the lesson list; New chapter/module is scoped to this item; the item's own
 * destinations — Preview (learner order), Review & publish, Settings,
 * Retire — appear once, replacing the per-item link rows the tree repeated.
 *
 * Reorder is a deliberate mode: chevrons exist only while it is on.
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
  OrderControls,
  applyNodeForm,
  deleteNode,
  groupTo,
  itemTools,
  lessonTo,
  retireTo,
  type DeleteTarget,
  type FormTarget
} from "./hierarchy";
import {
  FAMILY_LABEL,
  GROUP_LABEL,
  ITEM_LABEL,
  groupDeletable,
  itemDeletable,
  itemStats,
  loadedNote,
  readStudioTree,
  writeStudioTree,
  type StudioGroup,
  type StudioItem
} from "./fixtures";
import "./courses.css";

export function ItemPage() {
  const { itemId = "" } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState(readStudioTree);
  const item = items.find((i) => i.id === itemId) ?? null;

  const [reordering, setReordering] = useState(false);
  const [form, setForm] = useState<FormTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  function commit(next: StudioItem[]) {
    setItems(next);
    writeStudioTree(next);
  }

  if (!item) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Courses">
        <StateBlock
          state="unavailable"
          message="That item is not in the studio tree."
          action={
            <Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>
          }
        />
      </AdminPage>
    );
  }

  const groupWord = GROUP_LABEL[item.family];
  const itemWord = ITEM_LABEL[item.family];
  const stats = itemStats(item);
  const tools = itemTools(item.id);

  /* ── Reorder — groups within the item ───────────────────────────────── */

  function moveGroup(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (!item || j < 0 || j >= item.groups.length) return;
    commit(
      items.map((it) => {
        if (it.id !== item.id) return it;
        const groups = [...it.groups];
        const [g] = groups.splice(index, 1);
        groups.splice(j, 0, g!);
        return { ...it, groups };
      })
    );
  }

  /* ── Create / edit / delete ─────────────────────────────────────────── */

  function openCreateGroup() {
    if (!item) return;
    setForm({ mode: "create", kind: "group", family: item.family, itemId: item.id, seed: EMPTY_SEED });
  }

  function openEditGroup(group: StudioGroup) {
    if (!item) return;
    setForm({
      mode: "edit",
      kind: "group",
      family: item.family,
      itemId: item.id,
      groupId: group.id,
      seed: { ...EMPTY_SEED, title: group.title }
    });
  }

  function openEditItem() {
    if (!item) return;
    setForm({
      mode: "edit",
      kind: "item",
      family: item.family,
      itemId: item.id,
      seed: {
        ...EMPTY_SEED,
        title: item.title,
        address: item.address,
        navigation: item.navigation ?? "open"
      }
    });
  }

  function saveForm(values: Parameters<typeof applyNodeForm>[2]) {
    const f = form;
    if (!f) return;
    const { next, createdId } = applyNodeForm(items, f, values);
    commit(next);
    setForm(null);
    /* A created chapter/module opens its own lesson list; a created lesson
       opens the editor — creation lands in context. */
    if (f.mode === "create" && f.kind === "group" && createdId) {
      navigate(groupTo(f.itemId, createdId));
    }
    if (f.mode === "create" && f.kind === "lesson" && createdId) {
      navigate(lessonTo(createdId));
    }
  }

  function requestDeleteGroup(group: StudioGroup) {
    if (!item) return;
    setDeleting({
      kind: "group",
      itemId: item.id,
      groupId: group.id,
      word: groupWord,
      title: group.title,
      sweeps:
        group.lessons.length === 0
          ? "it holds no lessons"
          : `its ${group.lessons.length} ${group.lessons.length === 1 ? "lesson" : "lessons"} go with it`
    });
  }

  function requestDeleteItem() {
    if (!item) return;
    setDeleting({
      kind: "item",
      itemId: item.id,
      word: itemWord,
      title: item.title,
      sweeps:
        item.groups.length === 0
          ? "it holds nothing yet"
          : `its ${item.groups.length} ${groupWord}${item.groups.length === 1 ? "" : "s"} and ${stats.lessons} ${stats.lessons === 1 ? "lesson" : "lessons"} go with it`,
      pristine: item.pristine === true
    });
  }

  function confirmDelete() {
    const d = deleting;
    if (!d) return;
    commit(deleteNode(items, d));
    setDeleting(null);
    /* Deleting the item itself leaves no page to return to — go up. */
    if (d.kind === "item") navigate("/admin/curriculum");
  }

  function onGroupMenu(group: StudioGroup, id: string) {
    if (!item) return;
    if (id === "edit") openEditGroup(group);
    else if (id === "new-lesson") {
      setForm({
        mode: "create",
        kind: "lesson",
        family: item.family,
        itemId: item.id,
        groupId: group.id,
        seed: EMPTY_SEED
      });
    } else if (id === "delete") requestDeleteGroup(group);
    else if (id === "retire") navigate(retireTo(item.id, group.id));
  }

  function onItemMenu(id: string) {
    if (!item) return;
    if (id === "edit") openEditItem();
    else if (id === "delete") requestDeleteItem();
    else if (id === "retire") navigate(retireTo(item.id));
  }

  function renderGroup(group: StudioGroup, index: number) {
    const it = item;
    if (!it) return null;
    const drafts = group.lessons.filter((l) => l.lifecycle !== "published").length;
    return (
      <article className="cs-card" key={group.id}>
        <div className="cs-card__main">
          <h3 className="cs-card__title">
            <Link className="cs-card__link" to={groupTo(it.id, group.id)}>
              {group.title}
            </Link>
          </h3>
          <p className="meta">
            {groupWord} · {group.lessons.length}{" "}
            {group.lessons.length === 1 ? "lesson" : "lessons"}
            {group.lessons.length === 0 ? " — may be left incomplete in draft" : ""}
          </p>
          {drafts > 0 ? (
            <p className="cs-card__badges">
              <span className="cs-badge" data-state="draft">
                {drafts} in draft
              </span>
            </p>
          ) : null}
        </div>
        <div className="cs-card__end">
          {reordering ? (
            <OrderControls
              index={index}
              count={it.groups.length}
              onMove={(dir) => moveGroup(index, dir)}
              label={`${groupWord} ${group.title}`}
            />
          ) : null}
          <ActionsMenu
            title={group.title}
            items={[
              { id: "edit", label: `Edit ${groupWord} details…`, icon: "edit" },
              { id: "new-lesson", label: "New lesson in this " + groupWord, icon: "plus" },
              groupDeletable(group)
                ? { id: "delete", label: "Delete permanently…", icon: "trash", destructive: true }
                : { id: "retire", label: "Retire…", icon: "inbox", destructive: true }
            ]}
            onSelect={(id) => onGroupMenu(group, id)}
          />
        </div>
      </article>
    );
  }

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${FAMILY_LABEL[item.family]}`}
      title={item.title}
      lead={`${itemWord} · ${item.lifecycle}${item.navigation === "sequential" ? " · Sequential" : ""} · ${stats.groups} ${groupWord}${stats.groups === 1 ? "" : "s"} · ${stats.lessons} ${stats.lessons === 1 ? "lesson" : "lessons"}${item.enrolled > 0 ? ` · ${item.enrolled} enrolled` : ""}`}
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
          <button type="button" className="btn btn--primary" onClick={openCreateGroup}>
            <Icon name="plus" size={13} /> New {groupWord}
          </button>
          <ActionsMenu
            title={item.title}
            items={[
              { id: "edit", label: `Edit ${itemWord} details…`, icon: "edit" },
              itemDeletable(item)
                ? { id: "delete", label: "Delete permanently…", icon: "trash", destructive: true }
                : { id: "retire", label: "Retire…", icon: "inbox", destructive: true }
            ]}
            onSelect={onItemMenu}
          />
        </div>
      }
    >
      <Breadcrumbs
        label="Studio tree"
        items={[{ label: "Courses", to: "/admin/curriculum" }, { label: item.title }]}
      />

      {/* The item-scoped destinations — once, for the item in context. */}
      <div className="cs-itemtools" role="group" aria-label={`${item.title} tools`}>
        <Link className="btn btn--quiet" to={tools.preview}>
          <Icon name="browse-tests" size={13} /> Preview learner order
        </Link>
        <Link className="btn btn--quiet" to={tools.publish}>
          <Icon name="check" size={13} /> Review & publish
        </Link>
        <Link className="btn btn--quiet" to={tools.settings}>
          <Icon name="settings" size={13} /> Settings
        </Link>
        <Link className="btn btn--quiet" to={tools.review}>
          <Icon name="grid" size={13} /> Content review
        </Link>
        <Link className="btn btn--quiet" to={tools.retire}>
          <Icon name="inbox" size={13} /> Retire
        </Link>
      </div>

      {reordering ? (
        <p className="cs-note" role="status">
          <Icon name="layers" size={14} /> Reorder mode — the chevrons move a {groupWord}; nothing
          else changes while it is on.
        </p>
      ) : null}

      <p className="meta">{loadedNote(item.groups.length, item.groups.length)}</p>
      {item.groups.length === 0 ? (
        <StateBlock
          state="empty"
          message={`No ${groupWord}s yet — a draft may be incomplete.`}
          action={
            <button type="button" className="btn btn--secondary" onClick={openCreateGroup}>
              <Icon name="plus" size={13} /> New {groupWord}
            </button>
          }
        />
      ) : (
        <div className="cs-cardgrid">{item.groups.map(renderGroup)}</div>
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
