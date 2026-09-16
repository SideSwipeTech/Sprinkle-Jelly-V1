/**
 * hierarchy.tsx — what the studio tree's three browse levels share.
 *
 * The card/row anatomy is always the same pairing: a real link carries the
 * primary open, and a separately focusable three-dot menu — "Actions for
 * {title}" — holds the secondary acts. Reorder chevrons exist only inside a
 * deliberate reorder mode. A draft node deletes in place behind one
 * confirmation dialog; a pristine draft deletes behind a typed echo. Every
 * write commits through the session overlay so the next page reads the same
 * tree back.
 */

import { useState } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { Menu, type MenuItem } from "../../extraction/components/Menu/Menu";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import type { NodeKind, NodeSeed } from "./NodeForm";
import {
  GROUP_LABEL,
  ITEM_LABEL,
  LESSON_TYPE_LABEL,
  addressFromTitle,
  nextNodeId,
  type Family,
  type LessonType,
  type StudioGroup,
  type StudioItem,
  type StudioLesson
} from "./fixtures";

/** The leaf's glyph — a lesson reads its type at a glance. */
export const LESSON_TYPE_ICON: Record<LessonType, IconName> = {
  text: "type",
  video: "play",
  quiz: "clipboard",
  "course-project": "projects",
  "integration-reference": "external-link"
};

/* ── The actions menu ────────────────────────────────────────────────────── */

/** The visible, labelled three-dot trigger — a sibling of the card/row's
 *  primary link, never nested inside it. */
export function ActionsMenu({
  title,
  items,
  onSelect,
  align = "end"
}: {
  title: string;
  items: MenuItem[];
  onSelect: (id: string) => void;
  align?: "start" | "end";
}) {
  return (
    <span className="cs-cardmenu">
      <Menu
        trigger={<Icon name="more" size={15} />}
        triggerLabel={`Actions for ${title}`}
        items={items}
        onSelect={onSelect}
        align={align}
      />
    </span>
  );
}

/* ── Reorder — chevrons inside a deliberate reorder mode only ────────────── */

export function OrderControls({
  index,
  count,
  onMove,
  label
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  label: string;
}) {
  return (
    <span className="cs-order" role="group" aria-label={`Order ${label}`}>
      <button
        type="button"
        aria-label={`Move ${label} up`}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <Icon name="chevron-up" size={13} />
      </button>
      <button
        type="button"
        aria-label={`Move ${label} down`}
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        <Icon name="chevron-down" size={13} />
      </button>
    </span>
  );
}

/* ── Badges ──────────────────────────────────────────────────────────────── */

export function lessonBadges(item: StudioItem, lesson: StudioLesson) {
  return (
    <>
      <span className="cs-badge">{LESSON_TYPE_LABEL[lesson.type]}</span>
      {item.family === "video" ? (
        <span className="cs-badge" data-tone={lesson.required ? "required" : undefined}>
          {lesson.required ? "required" : "optional"}
        </span>
      ) : null}
      {lesson.lifecycle !== "published" ? (
        <span className="cs-badge" data-state={lesson.lifecycle}>{lesson.lifecycle}</span>
      ) : null}
      {lesson.incomplete ? <span className="cs-badge" data-tone="warn">incomplete</span> : null}
      {!lesson.saved ? <span className="cs-badge" data-tone="err">no saved content</span> : null}
      {lesson.restricted ? (
        <span className="cs-badge" data-tone="err">
          <Icon name="lock" size={11} /> restricted
        </span>
      ) : null}
    </>
  );
}

/* ── The node form's tree write ──────────────────────────────────────────── */

/** Which node the form dialog is open on, and where it lands. */
export interface FormTarget {
  mode: "create" | "edit";
  kind: NodeKind;
  family: Family;
  itemId: string;
  groupId?: string;
  lessonId?: string;
  seed: NodeSeed;
}

/** Applies a NodeForm submission to the tree. Returns the next tree and —
 *  on a create — the new node's id, so the caller can open it straight away
 *  (a created lesson navigates into the editor). */
export function applyNodeForm(
  items: StudioItem[],
  f: FormTarget,
  values: NodeSeed
): { next: StudioItem[]; createdId: string | null } {
  const title = values.title.trim();
  const address = values.address.trim() || addressFromTitle(title);
  if (f.mode === "create") {
    if (f.kind === "item") {
      const item: StudioItem = {
        id: nextNodeId(ITEM_LABEL[f.family]),
        family: f.family,
        title,
        address,
        lifecycle: "draft",
        /* A created item has met no learner — it is a pristine draft. */
        pristine: true,
        enrolled: 0,
        groups: [],
        ...(f.family === "video" ? { navigation: values.navigation } : {})
      };
      return { next: [...items, item], createdId: item.id };
    }
    if (f.kind === "group") {
      const group: StudioGroup = {
        id: nextNodeId(GROUP_LABEL[f.family]),
        title,
        lessons: []
      };
      return {
        next: items.map((it) =>
          it.id === f.itemId ? { ...it, groups: [...it.groups, group] } : it
        ),
        createdId: group.id
      };
    }
    /* A created lesson copies its classification from the last sibling so
       the editor's classification line reads real values (chosen, not
       stated — no document names a default). */
    const siblings =
      items.find((it) => it.id === f.itemId)?.groups.find((g) => g.id === f.groupId)?.lessons ?? [];
    const last = siblings[siblings.length - 1];
    const lesson: StudioLesson = {
      id: nextNodeId("lesson"),
      title,
      address,
      type: values.lessonType,
      required: values.required,
      lifecycle: "draft",
      saved: false,
      incomplete: true,
      outcomes: [],
      skill: last?.skill ?? "",
      topic: last?.topic ?? ""
    };
    return {
      next: items.map((it) =>
        it.id === f.itemId
          ? {
              ...it,
              groups: it.groups.map((g) =>
                g.id === f.groupId ? { ...g, lessons: [...g.lessons, lesson] } : g
              )
            }
          : it
      ),
      createdId: lesson.id
    };
  }
  return {
    next: items.map((it) => {
      if (f.kind === "item") {
        return it.id === f.itemId
          ? {
              ...it,
              title,
              address,
              ...(it.family === "video" ? { navigation: values.navigation } : {})
            }
          : it;
      }
      if (it.id !== f.itemId) return it;
      return {
        ...it,
        groups: it.groups.map((g) => {
          if (f.kind === "group") {
            return g.id === f.groupId ? { ...g, title } : g;
          }
          if (g.id !== f.groupId) return g;
          return {
            ...g,
            lessons: g.lessons.map((l) =>
              l.id === f.lessonId
                ? { ...l, title, address, type: values.lessonType, required: values.required }
                : l
            )
          };
        })
      };
    }),
    createdId: null
  };
}

/* ── In-place draft deletes ──────────────────────────────────────────────── */

/** Which draft node the delete confirm is open on. */
export interface DeleteTarget {
  kind: NodeKind;
  itemId: string;
  groupId?: string;
  lessonId?: string;
  word: string;
  title: string;
  /** What the delete sweeps with the node, in words. */
  sweeps: string;
  /** A pristine-draft item deletes behind a typed confirmation — the hard
   *  tier's own gate, the same one the retirement page carries. */
  pristine?: boolean;
}

export function deleteNode(items: StudioItem[], d: DeleteTarget): StudioItem[] {
  if (d.kind === "item") return items.filter((it) => it.id !== d.itemId);
  return items.map((it) => {
    if (it.id !== d.itemId) return it;
    if (d.kind === "group") {
      return { ...it, groups: it.groups.filter((g) => g.id !== d.groupId) };
    }
    return {
      ...it,
      groups: it.groups.map((g) =>
        g.id === d.groupId ? { ...g, lessons: g.lessons.filter((l) => l.id !== d.lessonId) } : g
      )
    };
  });
}

/** The one delete confirmation — a plain destructive confirm for a draft
 *  node, a typed echo for a pristine draft. */
export function DeleteConfirm({
  target,
  onCancel,
  onConfirm
}: {
  target: DeleteTarget;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [echo, setEcho] = useState("");
  return (
    <Dialog
      title={`Delete ${target.word} — ${target.title}`}
      icon="trash"
      tone="destructive"
      onClose={onCancel}
      actions={
        target.pristine ? undefined : (
          <>
            <Button variant="quiet" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete {target.word}
            </Button>
          </>
        )
      }
    >
      <p>
        “{target.title}” is a draft {target.word} — {target.sweeps}. This is the hard
        tier: permanent removal of an all-draft subtree, not the soft take-down the retirement
        page runs. Only a draft deletes in place — a published node is retired, never deleted
        here. This cannot be undone.
      </p>
      {target.pristine ? (
        <ConfirmByTyping
          phrase={target.title}
          value={echo}
          onChange={setEcho}
          label={
            <>
              “{target.title}” is a pristine draft — no learner ever met it, so it deletes
              permanently. Type <code>{target.title}</code> to confirm
            </>
          }
        >
          {(matched) => (
            <>
              <Button variant="quiet" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={!matched} onClick={onConfirm}>
                Delete {target.word}
              </Button>
            </>
          )}
        </ConfirmByTyping>
      ) : null}
    </Dialog>
  );
}

/* ── Retirement routing ──────────────────────────────────────────────────── */

/** The retirement address for an exact scope — a chapter/module or a lesson
 *  carries its own `group`/`lesson` params so the act never silently lands
 *  on the parent item. */
export function retireTo(itemId: string, groupId?: string, lessonId?: string): string {
  const params = new URLSearchParams();
  if (groupId) params.set("group", groupId);
  if (lessonId) params.set("lesson", lessonId);
  const q = params.toString();
  return `/admin/curriculum/${itemId}/retire${q ? `?${q}` : ""}`;
}

/** Where a level's breadcrumb returns. */
export function itemTo(itemId: string): string {
  return `/admin/curriculum/items/${itemId}`;
}
export function groupTo(itemId: string, groupId: string): string {
  return `/admin/curriculum/items/${itemId}/groups/${groupId}`;
}
export function lessonTo(lessonId: string): string {
  return `/admin/curriculum/lessons/${lessonId}`;
}

/* Re-exported for the pages' menus — the spec's item-scoped destinations. */
export function itemTools(itemId: string): { preview: string; publish: string; settings: string; retire: string; review: string } {
  return {
    preview: `/admin/curriculum/${itemId}/preview`,
    publish: `/admin/curriculum/${itemId}/publish`,
    settings: `/admin/curriculum/${itemId}/settings`,
    retire: `/admin/curriculum/${itemId}/retire`,
    review: `/admin/curriculum/${itemId}/review`
  };
}
