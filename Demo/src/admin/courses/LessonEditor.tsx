/**
 * LessonEditor — `curriculum/lessons/:id`. The block editor for text lessons
 * and the type-specific authoring surface for the other four lesson types,
 * with the spec's honest save line: saving · saved · not saved, tap to retry ·
 * saved locally (which never renders as "saved"). Leaving with unsaved work
 * is guarded; a save against content another save has replaced is refused as
 * a named conflict with a comparison, never overwritten.
 *
 * The editor keeps its place in the studio tree: a collapsible outline rail
 * carries the item's chapters/modules and lessons with the current lesson
 * marked — switching lesson never leaves the editor — and details/metadata
 * sit in the side panel. The context line is honest about draft vs live: a
 * published lesson's live version is unchanged until a draft is published;
 * an empty new draft says so.
 *
 * Fixture transitions are deterministic: `saveBehaviour` on the fixture
 * scripts the outcome — "conflict" refuses with the comparison, "fails-once"
 * fails the first save then retries clean, "offline" lands saved-locally.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { LessonBlockEditor } from "../../extraction/components/LessonBlockEditor/LessonBlockEditor";
import type {
  LessonBlock,
  SaveConflict
} from "../../extraction/components/LessonBlockEditor/LessonBlockEditor";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { groupTo, itemTo, itemTools, lessonTo } from "./hierarchy";
import {
  GROUP_LABEL,
  LESSON_TYPE_LABEL,
  findLesson,
  readStudioTree,
  writeStudioTree,
  type StudioItem,
  type StudioLesson
} from "./fixtures";
import "./courses.css";

type SaveState = "saved" | "saving" | "retry" | "saved-locally" | "conflict";

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "Saved",
  saving: "Saving…",
  retry: "Not saved — tap to retry",
  "saved-locally": "Saved locally — not yet on the server",
  conflict: "Save refused — a newer revision exists"
};

/** The save line's own tone — the same colours the block editor's save
 *  line carries: ok saved, info in flight, warn held back, err refused. */
function saveTone(state: SaveState, dirty: boolean): "ok" | "info" | "warn" | "err" {
  if (dirty && state === "saved") return "warn"; /* unsaved work is held, not saved */
  if (state === "saved") return "ok";
  if (state === "saving") return "info";
  if (state === "saved-locally") return "warn";
  return "err"; /* retry and conflict are refusals */
}

/** The unsaved-work guard: window-level beforeunload plus in-app link capture. */
function useLeaveGuard(dirty: boolean) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/")) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  return {
    open: pendingHref !== null,
    onStay: () => setPendingHref(null),
    onLeave: () => {
      const href = pendingHref;
      setPendingHref(null);
      if (href) navigate(href);
    }
  };
}

const CONFLICT_FIXTURE: SaveConflict = {
  savedBy: "Meera",
  savedAt: "14:32 today",
  theirBlocks: [
    { id: "s1", type: "heading", text: "The import machinery, rewritten", level: 2 },
    { id: "s2", type: "rich-text", text: "`sys.path` is consulted in order; `sys.modules` caches." },
    { id: "s3", type: "callout", kind: "note", text: "Relative imports need a package boundary." }
  ]
};

/** The draft-vs-live context line — the honest sentence for the lifecycle
 *  the lesson is in. A published lesson's live version is never quietly
 *  rewritten by editing the draft. */
function contextLine(lesson: StudioLesson): { tone: "ok" | "warn" | "err" | undefined; text: string } {
  if (lesson.lifecycle === "published") {
    return {
      tone: undefined,
      text: "Published — what you edit here is the draft; the live version is unchanged until a publish carries it."
    };
  }
  if (lesson.lifecycle === "archived") {
    return {
      tone: "warn",
      text: "Archived — out of catalogues and every new start, still readable to the records that point at it. Edits change the kept draft only."
    };
  }
  if (!lesson.saved) {
    return {
      tone: "warn",
      text: "Empty draft — no saved content yet. An incomplete draft always saves; it is never live until published."
    };
  }
  return {
    tone: "warn",
    text: "Draft — saved, and never live until published."
  };
}

/** The collapsible sibling outline — the current item's chapters/modules
 *  and their lessons, the open lesson marked. Clicking a sibling switches
 *  the editor to it without retracing the hierarchy. */
function OutlineRail({
  item,
  currentId
}: {
  item: StudioItem;
  currentId: string;
}) {
  const [open, setOpen] = useState(true);
  const groupWord = GROUP_LABEL[item.family];
  return (
    <Card className="cs-outline">
      <CardHeader
        title="Outline"
        icon="list"
        action={
          <button
            type="button"
            className="btn btn--quiet"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "panel-left-close" : "panel-left"} size={13} />
            {open ? "Collapse" : "Outline"}
          </button>
        }
      />
      <p className="meta">
        <Link to={itemTo(item.id)}>{item.title}</Link> — {item.groups.length} {groupWord}
        {item.groups.length === 1 ? "" : "s"}
      </p>
      {open ? (
        <div className="cs-outline__tree">
          {item.groups.map((group) => (
            <section className="cs-outline__group" key={group.id}>
              <h4 className="cs-outline__grouptitle">
                <Link to={groupTo(item.id, group.id)}>{group.title}</Link>
              </h4>
              <ul className="cs-outline__lessons">
                {group.lessons.length === 0 ? (
                  <li className="meta">No lessons</li>
                ) : (
                  group.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        className="cs-outline__lesson"
                        to={lessonTo(l.id)}
                        aria-current={l.id === currentId ? "page" : undefined}
                        data-current={l.id === currentId || undefined}
                      >
                        {l.title}
                        {l.lifecycle !== "published" ? (
                          <span className="meta"> · {l.lifecycle}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

/** The type-specific authoring surface for the four non-text lesson types —
 *  always the editor's first numbered section. */
function TypeFields({
  lesson,
  onPatch,
  markDirty
}: {
  lesson: StudioLesson;
  onPatch: (patch: Partial<StudioLesson>) => void;
  markDirty: () => void;
}) {
  if (lesson.type === "video") {
    const media = lesson.video;
    return (
      <Card>
        <CardHeader title="Video lesson" icon="play" eyebrow="1" />
        <div className="admin-form-grid">
          <label className="field">
            <span className="meta">Bunny video identity</span>
            <input
              value={media?.videoId ?? ""}
              onChange={(e) => {
                markDirty();
                onPatch({ video: { ...(media ?? { encoding: "ready", captionsReady: false, transcriptReady: false }), videoId: e.target.value } });
              }}
            />
          </label>
          <label className="field">
            <span className="meta">Encoding state</span>
            <input
              value={media?.encoding === "processing" ? "processing — until the provider settles it" : (media?.encoding ?? "")}
              readOnly
              aria-readonly="true"
            />
          </label>
          <label className="field">
            <span className="meta">Captions</span>
            <select
              value={media?.captionsReady ? "ready" : "missing"}
              onChange={(e) => {
                markDirty();
                onPatch({ video: { ...(media ?? { videoId: "", encoding: "ready", transcriptReady: false }), captionsReady: e.target.value === "ready" } });
              }}
            >
              <option value="ready">ready</option>
              <option value="missing">missing</option>
            </select>
          </label>
          <label className="field">
            <span className="meta">Transcript</span>
            <select
              value={media?.transcriptReady ? "ready" : "missing"}
              onChange={(e) => {
                markDirty();
                onPatch({ video: { ...(media ?? { videoId: "", encoding: "ready", captionsReady: false }), transcriptReady: e.target.value === "ready" } });
              }}
            >
              <option value="ready">ready</option>
              <option value="missing">missing</option>
            </select>
          </label>
        </div>
        <p className="meta">
          A required video lesson missing captions or a transcript cannot publish. Media still
          processing reads processing, never ready and never failed.
        </p>
      </Card>
    );
  }

  if (lesson.type === "quiz") {
    const questions = lesson.quiz ?? [];
    return (
      <Card>
        <CardHeader title="Quiz lesson" icon="clipboard" eyebrow="1" />
        <p className="meta">Four question types — single choice, multiple choice, numerical, true or false. Closed at four.</p>
        <div className="cs-lines">
          {questions.map((q, i) => (
            <div className="cs-preview-row" key={q.id}>
              {/* The authored set is the cap — a question's label is N/cap,
                  not a bare ordinal. */}
              <span className="cs-preview-row__idx">{i + 1}/{questions.length}</span>
              <span className="cs-preview-row__title">
                <strong>{q.prompt}</strong>
                <p className="meta">{q.kind}</p>
              </span>
              <span className="cs-preview-row__end">
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => {
                    markDirty();
                    onPatch({ quiz: questions.filter((x) => x.id !== q.id) });
                  }}
                >
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
        <div className="admin-tools">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              markDirty();
              onPatch({
                quiz: [...questions, { id: `q-${Date.now()}`, kind: "single", prompt: "New question" }]
              });
            }}
          >
            Add question
          </button>
        </div>
      </Card>
    );
  }

  if (lesson.type === "course-project") {
    return (
      <Card>
        <CardHeader title="Course-assigned project" icon="projects" eyebrow="1" />
        <label className="field">
          <span className="meta">Assigned project template</span>
          <input
            value={lesson.projectTemplate ?? ""}
            onChange={(e) => {
              markDirty();
              onPatch({ projectTemplate: e.target.value });
            }}
          />
        </label>
        <p className="meta">
          Opens a course-owned Course Workspace. A lesson pointing at a deleted or archived
          assigned project template cannot publish.
        </p>
      </Card>
    );
  }

  if (lesson.type === "integration-reference") {
    return (
      <Card>
        <CardHeader title="Integration reference" icon="external-link" eyebrow="1" />
        <label className="field">
          <span className="meta">Platform item this lesson points at</span>
          <input
            value={lesson.referenceTarget ?? ""}
            onChange={(e) => {
              markDirty();
              onPatch({ referenceTarget: e.target.value });
            }}
          />
        </label>
        <p className="meta">
          An authored pointer and only that — it completes by the target's own completion
          standing.
        </p>
      </Card>
    );
  }

  return null;
}

export function LessonEditor() {
  const { id = "" } = useParams();
  const [items, setItems] = useState(readStudioTree);
  const found = useMemo(() => findLesson(items, id), [items, id]);
  const lesson = found?.lesson ?? null;

  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [conflict, setConflict] = useState<SaveConflict | null>(null);
  const [attempted, setAttempted] = useState(false);
  const guard = useLeaveGuard(dirty);

  /* A param change swaps the lesson without remounting — the save line and
    the conflict reset with it. */
  useEffect(() => {
    setDirty(false);
    setSaveState("saved");
    setConflict(null);
    setAttempted(false);
  }, [id]);

  if (!found || !lesson) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Lesson editor">
        <StateBlock
          state="unavailable"
          message="That lesson is not in the studio tree."
          action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
        />
      </AdminPage>
    );
  }

  const { item, group } = found;
  const tools = itemTools(item.id);

  /* An unauthorized open is refused at the named action — a deep link does
     not slip past it. */
  if (lesson.restricted) {
    return (
      <AdminPage kicker={`Content / Curriculum / ${item.title}`} title={lesson.title}>
        <Breadcrumbs
          label="Studio tree"
          items={[
            { label: "Courses", to: "/admin/curriculum" },
            { label: item.title, to: itemTo(item.id) },
            { label: group.title, to: groupTo(item.id, group.id) },
            { label: lesson.title }
          ]}
        />
        <StateBlock
          state="refused"
          message={`Opening “${lesson.title}” in the lesson editor is refused to your role.`}
          action={
            <Link className="btn btn--secondary" to={groupTo(item.id, group.id)}>
              Back to {group.title}
            </Link>
          }
        />
      </AdminPage>
    );
  }

  const context = contextLine(lesson);

  const patchLesson = (patch: Partial<StudioLesson>) => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        groups: it.groups.map((g) => ({
          ...g,
          lessons: g.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l))
        }))
      }))
    );
  };

  const save = () => {
    if (saveState === "saving") return;
    const behaviour = lesson.saveBehaviour ?? "ok";
    if (behaviour === "conflict") {
      setConflict(CONFLICT_FIXTURE);
      setSaveState("conflict");
      return;
    }
    if (behaviour === "fails-once" && !attempted) {
      setAttempted(true);
      setSaveState("saving");
      window.setTimeout(() => setSaveState("retry"), 500);
      return;
    }
    if (behaviour === "offline") {
      setSaveState("saving");
      window.setTimeout(() => setSaveState("saved-locally"), 500);
      return;
    }
    setSaveState("saving");
    window.setTimeout(() => {
      /* A landed save commits to the session overlay — the tree and every
         other studio page read the same lesson back after navigation. */
      const next = items.map((it) => ({
        ...it,
        groups: it.groups.map((g) => ({
          ...g,
          lessons: g.lessons.map((l) => (l.id === id ? { ...l, saved: true } : l))
        }))
      }));
      setItems(next);
      writeStudioTree(next);
      setSaveState("saved");
      setDirty(false);
    }, 500);
  };

  const resolveConflict = (choice: "reload" | "keep") => {
    if (choice === "reload") {
      patchLesson({ blocks: CONFLICT_FIXTURE.theirBlocks.map((b) => ({ ...b })) });
      setConflict(null);
      setSaveState("saved");
      setDirty(false);
    }
    /* "keep" leaves the conflict standing — the save stays refused. */
  };

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title={lesson.title}
      lead={`${LESSON_TYPE_LABEL[lesson.type]} lesson · ${GROUP_LABEL[item.family]} “${group.title}” · /${lesson.address} · ${lesson.lifecycle}${lesson.incomplete ? " · an incomplete draft always saves" : ""}`}
      actions={
        <div className="row">
          <Link className="btn btn--secondary" to={`${lessonTo(lesson.id)}/revisions`}>
            Revisions
          </Link>
          <Link className="btn btn--secondary" to={tools.publish}>
            Review & publish
          </Link>
        </div>
      }
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: group.title, to: groupTo(item.id, group.id) },
          { label: lesson.title }
        ]}
      />

      <div className="cs-editor">
        <div className="cs-editor__main">
          <p className="cs-note" data-tone={context.tone} role="status">
            <Icon name={lesson.lifecycle === "published" ? "check" : "info"} size={14} />{" "}
            {context.text}
          </p>

          {lesson.type === "text" ? (
            <Card>
              <CardHeader title="Blocks" icon="lessons" eyebrow="1" />
              <LessonBlockEditor
                blocks={lesson.blocks ?? []}
                dirty={dirty}
                saveState={saveState}
                onChange={(blocks: LessonBlock[]) => {
                  setDirty(true);
                  patchLesson({ blocks, saved: true });
                }}
                onSave={save}
                conflict={conflict}
                onConflictResolve={resolveConflict}
                leaveGuard={guard}
              />
            </Card>
          ) : (
            <>
              <TypeFields lesson={lesson} onPatch={patchLesson} markDirty={() => setDirty(true)} />
              <Card>
                <CardHeader title="Save" icon="save" eyebrow="2" />
                <div className="row">
                  <span className="meta cs-save" data-tone={saveTone(saveState, dirty)} role="status">
                    {dirty && saveState === "saved" ? "Unsaved work" : SAVE_LABEL[saveState]}
                  </span>
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={saveState === "saving" || saveState === "conflict"}
                    onClick={save}
                  >
                    {saveState === "saving" ? "Saving…" : saveState === "retry" ? "Retry save" : "Save"}
                  </button>
                </div>
                {conflict ? (
                  <p className="cs-note" data-tone="err" role="alert">
                    Save refused — {conflict.savedBy} saved a newer revision at {conflict.savedAt}. Your
                    draft was not overwritten.
                  </p>
                ) : null}
              </Card>
            </>
          )}
        </div>

        <div className="cs-editor__side">
          <OutlineRail item={item} currentId={lesson.id} />

          <Card>
            <CardHeader title="Details" icon="info" />
            <div className="admin-form-grid">
              <label className="field">
                <span className="meta">Learning outcomes</span>
                <input
                  value={lesson.outcomes.join("; ")}
                  onChange={(e) => {
                    setDirty(true);
                    patchLesson({ outcomes: e.target.value.split(";").map((s) => s.trim()).filter(Boolean) });
                  }}
                />
              </label>
              <label className="field">
                <span className="meta">Required or optional</span>
                <select
                  value={lesson.required ? "required" : "optional"}
                  onChange={(e) => {
                    setDirty(true);
                    patchLesson({ required: e.target.value === "required" });
                  }}
                >
                  <option value="required">required</option>
                  <option value="optional">optional</option>
                </select>
              </label>
              <label className="field">
                <span className="meta">Estimated minutes</span>
                <input
                  value={lesson.minutes === undefined ? "" : String(lesson.minutes)}
                  inputMode="numeric"
                  onChange={(e) => {
                    setDirty(true);
                    const n = Number(e.target.value);
                    patchLesson({ minutes: e.target.value.trim() === "" || Number.isNaN(n) ? undefined : n });
                  }}
                />
              </label>
            </div>
            <p className="meta">
              Skill → {lesson.skill} · Topic → {lesson.topic} — classification stays correctable on
              the {item.family === "interactive" ? "subject" : "course"}'s{" "}
              <Link to={tools.settings}>settings page</Link>; every classification change is audited.
            </p>
          </Card>
        </div>
      </div>

      {lesson.type !== "text" && guard.open ? (
        <Dialog
          title="Unsaved work"
          icon="alert"
          onClose={guard.onStay}
          actions={
            <>
              <Button variant="quiet" onClick={guard.onStay}>
                Stay and keep editing
              </Button>
              <Button variant="destructive" onClick={guard.onLeave}>
                Leave without saving
              </Button>
            </>
          }
        >
          Leaving now loses the unsaved work on this lesson. Saved work is never lost — only
          what you have changed since the last save.
        </Dialog>
      ) : null}
    </AdminPage>
  );
}
