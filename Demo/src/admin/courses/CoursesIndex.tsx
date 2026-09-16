/**
 * CoursesIndex — `curriculum` (and the `curriculum/tree` alias). Level 0 of
 * the studio tree: the two families kept separate as tabs, each holding
 * subject/course cards — title, status, structural counts — where the card
 * itself is the open and a labelled three-dot menu holds the rest. Search
 * and the status filter stay compact; New is scoped to the family in view.
 *
 * The expanded all-subject tree is gone: a card opens its item's
 * chapters/modules, a chapter/module opens its lessons, a lesson opens the
 * editor. Reads keep their honest states — a family can be loading,
 * unavailable with a retry, or filtered-empty with a clear-filters way back.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Tabs } from "../../extraction/components/Tabs/Tabs";
import { SearchField } from "../../extraction/components/SearchField/SearchField";
import { EMPTY_SEED, NodeForm } from "./NodeForm";
import {
  ActionsMenu,
  DeleteConfirm,
  applyNodeForm,
  deleteNode,
  itemTo,
  itemTools,
  retireTo,
  type DeleteTarget,
  type FormTarget
} from "./hierarchy";
import {
  FAMILY_LABEL,
  GROUP_LABEL,
  ITEM_LABEL,
  itemDeletable,
  itemStats,
  loadedNote,
  readStudioTree,
  writeStudioTree,
  type Family,
  type Lifecycle,
  type StudioItem
} from "./fixtures";
import "./courses.css";

type ReadState = "pending" | "data" | "unavailable";
type StatusFilter = "all" | Lifecycle;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" }
];

export function CoursesIndex() {
  const navigate = useNavigate();
  const [items, setItems] = useState(readStudioTree);
  const [family, setFamily] = useState<Family>("interactive");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [reads, setReads] = useState<Record<Family, ReadState>>({
    interactive: "pending",
    video: "unavailable"
  });
  const [form, setForm] = useState<FormTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  /* The Interactive family reads on mount; the Video family arrives
     unavailable and its retry re-reads — the spec's two not-data states. */
  useEffect(() => {
    const t = window.setTimeout(() => setReads((r) => ({ ...r, interactive: "data" })), 450);
    return () => window.clearTimeout(t);
  }, []);

  function commit(next: StudioItem[]) {
    setItems(next);
    writeStudioTree(next);
  }

  function retry(f: Family) {
    setReads((r) => ({ ...r, [f]: "pending" }));
    window.setTimeout(() => setReads((r) => ({ ...r, [f]: "data" })), 450);
  }

  /* ── Create / edit / delete ─────────────────────────────────────────── */

  function openCreateItem(f: Family) {
    setForm({ mode: "create", kind: "item", family: f, itemId: "", seed: EMPTY_SEED });
  }

  function openEditItem(item: StudioItem) {
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
    /* A created item opens its own page — creation lands in context, not
       back at the list. */
    if (f.mode === "create" && createdId) navigate(itemTo(createdId));
  }

  function requestDeleteItem(item: StudioItem) {
    const groupWord = GROUP_LABEL[item.family];
    const lessons = item.groups.reduce((n, g) => n + g.lessons.length, 0);
    setDeleting({
      kind: "item",
      itemId: item.id,
      word: ITEM_LABEL[item.family],
      title: item.title,
      sweeps:
        item.groups.length === 0
          ? "it holds nothing yet"
          : `its ${item.groups.length} ${groupWord}${item.groups.length === 1 ? "" : "s"} and ${lessons} ${lessons === 1 ? "lesson" : "lessons"} go with it`,
      pristine: item.pristine === true
    });
  }

  function confirmDelete() {
    const d = deleting;
    if (!d) return;
    commit(deleteNode(items, d));
    setDeleting(null);
  }

  function onItemMenu(item: StudioItem, id: string) {
    const tools = itemTools(item.id);
    if (id === "edit") openEditItem(item);
    else if (id === "preview") navigate(tools.preview);
    else if (id === "publish") navigate(tools.publish);
    else if (id === "settings") navigate(tools.settings);
    else if (id === "review") navigate(tools.review);
    else if (id === "retire") navigate(retireTo(item.id));
    else if (id === "delete") requestDeleteItem(item);
  }

  function itemMenuItems(item: StudioItem) {
    return [
      { id: "edit", label: `Edit ${ITEM_LABEL[item.family]} details…`, icon: "edit" as const },
      { id: "preview", label: "Preview learner order", icon: "browse-tests" as const },
      { id: "publish", label: "Review & publish", icon: "check" as const },
      { id: "settings", label: "Settings", icon: "settings" as const },
      { id: "review", label: "Content review", icon: "grid" as const },
      itemDeletable(item)
        ? { id: "delete", label: "Delete permanently…", icon: "trash" as const, destructive: true }
        : { id: "retire", label: "Retire…", icon: "inbox" as const, destructive: true }
    ];
  }

  /* ── The card ───────────────────────────────────────────────────────── */

  function renderItem(item: StudioItem) {
    const stats = itemStats(item);
    const groupWord = GROUP_LABEL[item.family];
    return (
      <article className="cs-card" key={item.id}>
        <div className="cs-card__main">
          <h3 className="cs-card__title">
            <Link className="cs-card__link" to={itemTo(item.id)}>
              {item.title}
            </Link>
          </h3>
          <p className="meta">
            {ITEM_LABEL[item.family]} · {stats.groups} {groupWord}
            {stats.groups === 1 ? "" : "s"} · {stats.lessons}{" "}
            {stats.lessons === 1 ? "lesson" : "lessons"}
            {item.navigation === "sequential" ? " · Sequential" : ""}
          </p>
          <p className="cs-card__badges">
            <span className="cs-badge" data-state={item.lifecycle}>{item.lifecycle}</span>
            {stats.drafts > 0 ? (
              <span className="cs-badge" data-state="draft">
                {stats.drafts} {stats.drafts === 1 ? "lesson" : "lessons"} in draft
              </span>
            ) : null}
            {item.enrolled > 0 ? (
              <span className="cs-badge">{item.enrolled} enrolled</span>
            ) : null}
          </p>
        </div>
        <div className="cs-card__end">
          <ActionsMenu
            title={item.title}
            items={itemMenuItems(item)}
            onSelect={(id) => onItemMenu(item, id)}
          />
        </div>
      </article>
    );
  }

  /* ── The family view ────────────────────────────────────────────────── */

  const state = reads[family];
  const familyItems = items.filter((i) => i.family === family);
  const filtered = familyItems.filter(
    (i) =>
      (status === "all" || i.lifecycle === status) &&
      (query.trim() === "" || i.title.toLowerCase().includes(query.trim().toLowerCase()))
  );
  return (
    <AdminPage
      kicker="Content / Curriculum"
      title="Courses"
      lead="The studio tree, one level at a time — a subject holds chapters hold lessons; a course holds modules hold lessons. Open a card to work inside it."
      actions={
        <div className="row">
          <Link className="btn btn--secondary" to="/admin/curriculum/approvals">Approval queue</Link>
          <Link className="btn btn--secondary" to="/admin/curriculum/import-export">Import & export</Link>
        </div>
      }
    >
      <Tabs
        label="Course families"
        value={family}
        onChange={(k) => setFamily(k as Family)}
        tabs={([
          { key: "interactive", icon: "lessons" as const },
          { key: "video", icon: "play" as const }
        ]).map((t) => ({
          key: t.key,
          icon: t.icon,
          title: FAMILY_LABEL[t.key as Family],
          subtitle:
            t.key === "interactive" ? "subject · chapter · lesson" : "course · module · lesson",
          count: items.filter((i) => i.family === t.key).length
        }))}
      />

      <div className="cs-filterbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={`Search ${FAMILY_LABEL[family].toLowerCase()}…`}
          label={`Search ${FAMILY_LABEL[family]}`}
        />
        <label className="field cs-filterbar__status">
          <span className="meta">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <span className="cs-filterbar__end">
          {state === "data" ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => openCreateItem(family)}
            >
              <Icon name="plus" size={13} /> New {ITEM_LABEL[family]}
            </button>
          ) : null}
        </span>
      </div>

      {state === "pending" ? (
        <StateBlock state="pending" message={`Loading ${FAMILY_LABEL[family]}…`} />
      ) : state === "unavailable" ? (
        <StateBlock
          state="unavailable"
          message={`The ${FAMILY_LABEL[family]} tree could not be read.`}
          action={
            <button type="button" className="btn btn--secondary" onClick={() => retry(family)}>
              Retry
            </button>
          }
        />
      ) : (
        <>
          <p className="meta">{loadedNote(filtered.length, familyItems.length)}</p>
          {familyItems.length === 0 ? (
            <StateBlock
              state="empty"
              message={`No ${ITEM_LABEL[family]} has been authored yet.`}
              action={
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => openCreateItem(family)}
                >
                  <Icon name="plus" size={13} /> New {ITEM_LABEL[family]}
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message="Nothing matches the current filters."
              action={
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="cs-cardgrid">{filtered.map(renderItem)}</div>
          )}
        </>
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
