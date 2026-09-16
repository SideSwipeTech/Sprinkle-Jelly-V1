/**
 * TemplateStudio — the workspace domain's own admin page: staff author, list
 * and edit starter templates against exactly the limits a learner's project
 * obeys (workspace/01-pages.md §"The template studio", 03-rules F26/F27,
 * 04-rules §the studio).
 *
 * The editor is the workspace variant of the one code editor — the
 * TemplateFileSet surface (file rail + tab strip + path row + editor + output
 * dock), rendered once for authoring and once as the preview a learner meets.
 * The publish checklist is evidence before the decision: it never disables
 * Save. Saving submits only what changed; a concurrent save raises a
 * keep-mine / take-theirs choice; leaving a dirty form is guarded.
 *
 * Fixture state only — no store writes, no network.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { canPublishDirect } from "../roles";
import { useStore } from "@state/useStore";
import { FileExplorer } from "../../extraction/components/FileExplorer/FileExplorer";
import { EditorTabs } from "../../extraction/components/EditorTabs/EditorTabs";
import { CodeEditorChrome } from "../../extraction/components/CodeEditorChrome/CodeEditorChrome";
import { Terminal } from "../../extraction/components/Terminal/Terminal";
import { TemplateFileSet } from "../../extraction/components/TemplateFileSet/TemplateFileSet";
import { Button } from "../../extraction/components/Button/Button";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { FormGrid, FormGridWide } from "../../extraction/components/FormGrid/FormGrid";
import { Notice } from "../../extraction/components/Notice/Notice";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Chip } from "../../extraction/components/Chip/Chip";
import { ToolCluster } from "../../extraction/components/ToolCluster/ToolCluster";
import { ActionPanel } from "../../extraction/components/ActionPanel/ActionPanel";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { detectLanguage } from "@components/CodeEditor/language";
import type { EditorFile } from "@components/CodeEditor";
import { LoadedLine } from "../assessments/shared";
import {
  FILE_CEILING,
  INSTRUCTION_CHARACTERS,
  PATH_CHARACTERS,
  PLATFORM_LIST_PAGE_ITEMS,
  PROJECT_BYTES,
  STUDIO_SKILLS,
  STUDIO_TEMPLATES,
  STUDIO_TOPICS,
  TASK_LIMIT,
  TEMPLATE_RUNTIMES,
  TEXT_FILE_BYTES,
  blankDraft,
  formatBytes,
  type StudioTemplate,
  type TemplateLevel,
  type TemplateLifecycle
} from "./fixtures";
import "./template-studio.css";

const LIFECYCLE_LABEL: Record<StudioTemplate["lifecycle"], string> = {
  draft: "draft",
  published: "published",
  archived: "archived"
};

interface Flash {
  tone: "success" | "error" | "info";
  text: string;
}

/* The publish gate, re-evaluated off the row's own record — the same debts
   the studio's Publish names, checked on the stored revision. A browser
   lane's render-as-written is an author's attestation the studio checklist
   holds, so from the index it is always an open debt, never a borrowed pass. */
function publishDebts(t: StudioTemplate): string[] {
  const runtime = TEMPLATE_RUNTIMES.find((r) => r.id === t.runtime);
  const lane = runtime?.lane ?? "terminal";
  const bytes = t.files.reduce((n, f) => n + f.content.length, 0);
  const longest = t.files.reduce((n, f) => Math.max(n, f.path.length), 0);
  const failed: string[] = [];
  if (
    t.files.length > FILE_CEILING ||
    bytes > PROJECT_BYTES ||
    longest > PATH_CHARACTERS ||
    t.files.some((f) => f.content.length > TEXT_FILE_BYTES)
  )
    failed.push("re-validation against the learner bounds");
  if (!t.files.some((f) => f.path === t.entryPath))
    failed.push("the entry file resolving inside the file set");
  if (
    t.checklist.length < 1 ||
    t.checklist.length > TASK_LIMIT ||
    t.checklist.some((x) => x.trim().length === 0 || x.length > INSTRUCTION_CHARACTERS)
  )
    failed.push("a learner checklist within its bounds");
  if (lane === "browser" || t.checkRun?.ok !== true)
    failed.push(
      lane === "browser"
        ? "rendering as written — an author's attestation the studio's checklist holds"
        : "the starter running as written"
    );
  if (!t.skill.trim() || !t.topic.trim()) failed.push("a primary skill and topic");
  return failed;
}

/* ── The list — the studio's own index (author, list, edit) ───────────────── */

export function TemplateIndex() {
  const store = useStore();
  const [lifecycle, setLifecycle] = useState<"all" | TemplateLifecycle>("all");
  const [page, setPage] = useState(0);
  /* The row verbs write nowhere — a lifecycle move is held as a per-row
     override and a deletion removes the id, fixture state under this render
     alone. */
  const [moves, setMoves] = useState<Partial<Record<string, TemplateLifecycle>>>({});
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [archiveFor, setArchiveFor] = useState<StudioTemplate | null>(null);
  const [deleteFor, setDeleteFor] = useState<StudioTemplate | null>(null);
  const [echo, setEcho] = useState("");
  const [flash, setFlash] = useState<Flash | null>(null);

  const direct = canPublishDirect(store.session.role);
  const live = STUDIO_TEMPLATES.filter((t) => !deletedIds.includes(t.id));
  const lifecycleOf = (t: StudioTemplate) => moves[t.id] ?? t.lifecycle;

  const filtered = live.filter(
    (t) => lifecycle === "all" || lifecycleOf(t) === lifecycle
  );
  /* Paged for real at PLATFORM_LIST_PAGE_ITEMS; the count is read live under
     the same filter and snapshot, so it may be stated. */
  const pageCount = Math.max(1, Math.ceil(filtered.length / PLATFORM_LIST_PAGE_ITEMS));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PLATFORM_LIST_PAGE_ITEMS,
    safePage * PLATFORM_LIST_PAGE_ITEMS + PLATFORM_LIST_PAGE_ITEMS
  );

  function publishRow(t: StudioTemplate) {
    const failed = publishDebts(t);
    if (failed.length > 0) {
      setFlash({
        tone: "error",
        text: `Publish refused — ${t.name}: ${failed.join("; ")}. A refused publish leaves the template exactly as it was.`
      });
      return;
    }
    setMoves((m) => ({ ...m, [t.id]: "published" }));
    setFlash({
      tone: "success",
      text: `Published — ${t.name} reaches only projects created afterwards, never one already made from it.`
    });
  }

  function submitRow(t: StudioTemplate) {
    setFlash({
      tone: "info",
      text: `${t.name} submitted for approval — Publish Approvals carries the studio, the submitter and both halves of the change record.`
    });
  }

  function confirmArchive() {
    if (!archiveFor) return;
    setMoves((m) => ({ ...m, [archiveFor.id]: "archived" }));
    setFlash({
      tone: "info",
      text: `${archiveFor.name} archived — it leaves the learner picker at once and no restore exists. Duplicating it into a new draft is the only way forward.`
    });
    setArchiveFor(null);
  }

  function confirmDelete() {
    if (!deleteFor) return;
    setDeletedIds((ids) => [...ids, deleteFor.id]);
    setFlash({
      tone: "info",
      text: `${deleteFor.name} deleted — a pristine draft; its file set and retained versions went with it.`
    });
    setDeleteFor(null);
    setEcho("");
  }

  /* The typed-echo dialog's body — three readings of the same record: the
     count that could not be produced, the refusal that names its reason and
     offers archive, or the pristine draft the echo arms. */
  let deleteContent: ReactNode = null;
  if (deleteFor) {
    const deps = deleteFor.dependents;
    const eff = lifecycleOf(deleteFor);
    if (deps === null) {
      deleteContent = (
        <p>
          The number of projects depending on this template could not be produced under the same
          authorization, filters and snapshot as the rows on show — the destructive confirmation
          stays closed, and an unavailable count is never rendered as a zero blast radius.
        </p>
      );
    } else if (eff !== "draft" || deps > 0) {
      deleteContent = (
        <>
          <p>
            Destruction is refused —{" "}
            {deps > 0
              ? `${deps} projects were created from ${deleteFor.name}`
              : `it is reserved for a pristine draft and ${deleteFor.name} stands ${LIFECYCLE_LABEL[eff]}`}
            . Archive is offered in its place.
          </p>
          <div className="row">
            <Button
              variant="secondary"
              onClick={() => {
                setArchiveFor(deleteFor);
                setDeleteFor(null);
                setEcho("");
              }}
            >
              Archive instead…
            </Button>
          </div>
        </>
      );
    } else {
      deleteContent = (
        <>
          <p>
            Hard delete reaches a pristine draft alone — this cannot be undone, and every retained
            version goes with it.
          </p>
          <ConfirmByTyping phrase={deleteFor.name} value={echo} onChange={setEcho}>
            {(matched) => (
              <Button variant="destructive" disabled={!matched} onClick={confirmDelete}>
                Delete permanently
              </Button>
            )}
          </ConfirmByTyping>
        </>
      );
    }
  }

  return (
    <AdminPage
      kicker="Content / Workspace"
      title="Project templates"
      lead="Starter templates, authored against exactly the limits a learner's project obeys. Completion of one is the learner's checklist, never a grade."
      actions={
        <Button to="/admin/templates/new" icon="plus">
          New template
        </Button>
      }
    >
      {live.length === 0 ? (
        <StateBlock
          state="empty"
          message="Nothing has been authored yet — an intentionally empty library is not a failed publication, and this is not an outage."
        />
      ) : (
        <>
          <div className="filters" role="group" aria-label="Lifecycle filter">
            {(["all", "draft", "published", "archived"] as const).map((l) => {
              /* Each chip states its count — counted live under the same
                 authorization and snapshot the list below is. */
              const count =
                l === "all"
                  ? live.length
                  : live.filter((t) => lifecycleOf(t) === l).length;
              return (
                <Chip
                  key={l}
                  size="sm"
                  selected={lifecycle === l}
                  onClick={() => {
                    setLifecycle(l);
                    setPage(0);
                  }}
                >
                  {l === "all" ? "all" : LIFECYCLE_LABEL[l]}{" "}
                  <span className="tstudio-filter-count">{count}</span>
                </Chip>
              );
            })}
          </div>

          {flash ? (
            <Notice tone={flash.tone} live="polite">
              {flash.text}
            </Notice>
          ) : null}

          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message="No templates carry this lifecycle — a filtered nothing is not an empty library."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLifecycle("all");
                    setPage(0);
                  }}
                >
                  Clear the filter
                </Button>
              }
            />
          ) : (
            <>
              <div className="tstudio-pagebar">
                <LoadedLine
                  loaded={safePage * PLATFORM_LIST_PAGE_ITEMS + pageRows.length}
                  total={filtered.length}
                />
                <span className="row">
                  <Button
                    variant="quiet"
                    size="sm"
                    icon="chevron-left"
                    disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="meta">
                    page {safePage + 1} of {pageCount}
                  </span>
                  <Button
                    variant="quiet"
                    size="sm"
                    iconEnd="chevron-right"
                    disabled={safePage + 1 >= pageCount}
                    onClick={() => setPage(safePage + 1)}
                  >
                    Next
                  </Button>
                </span>
              </div>
              <List>
                {pageRows.map((t) => {
                  const runtime = TEMPLATE_RUNTIMES.find((r) => r.id === t.runtime);
                  const bytes = t.files.reduce((n, f) => n + f.content.length, 0);
                  const eff = lifecycleOf(t);
                  return (
                    /* A static record row — the name keeps its own link and the
                       acts are visible verbs, never a clickable row pretending
                       at one act. */
                    <ListRow key={t.id} as="article">
                      <div className="tstudio-row-main">
                        <Link className="tstudio-name" to={`/admin/templates/${t.id}`}>
                          <strong>{t.name}</strong>
                        </Link>
                        <p className="meta tstudio-facts">
                          revision {t.revision} · {runtime?.label ?? t.runtime} ·{" "}
                          {t.files.length} files · {formatBytes(bytes)} ·{" "}
                          {t.checklist.length} tasks ·{" "}
                          {t.dependents === null ? (
                            <em className="tstudio-dim">projects created — count unavailable</em>
                          ) : (
                            `${t.dependents} projects created from it`
                          )}
                        </p>
                      </div>
                      <span className="tstudio-row-side">
                        <Chip
                          size="sm"
                          variant={eff === "published" ? "accent" : "quiet"}
                        >
                          {LIFECYCLE_LABEL[eff]}
                        </Chip>
                        <span className="tstudio-row-actions">
                          <Button variant="secondary" size="sm" to={`/admin/templates/${t.id}`}>
                            Open
                          </Button>
                          {eff === "draft" ? (
                            direct ? (
                              <Button size="sm" onClick={() => publishRow(t)}>
                                Publish
                              </Button>
                            ) : (
                              <Button variant="secondary" size="sm" onClick={() => submitRow(t)}>
                                Submit for approval
                              </Button>
                            )
                          ) : null}
                          {eff === "published" ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setMoves((m) => ({ ...m, [t.id]: "draft" }));
                                setFlash({
                                  tone: "info",
                                  text: `${t.name} returned to draft — the workspace-template kind registers the flag true. Projects already made from it are untouched.`
                                });
                              }}
                            >
                              Return to draft
                            </Button>
                          ) : null}
                          <Button
                            variant="quiet"
                            size="sm"
                            icon="copy"
                            onClick={() =>
                              setFlash({
                                tone: "info",
                                text: `${t.name} duplicated into a new draft identity — no learner-facing trace.`
                              })
                            }
                          >
                            Duplicate
                          </Button>
                          {eff !== "archived" ? (
                            /* The destructive pair sits behind a hairline —
                               archive the soft delete, Delete… the typed one. */
                            <span className="tstudio-row-actions__tail">
                              <Button
                                variant="quiet"
                                size="sm"
                                icon="inbox"
                                onClick={() => setArchiveFor(t)}
                              >
                                Archive
                              </Button>
                              <Button
                                variant="quiet"
                                size="sm"
                                icon="trash"
                                className="tstudio-danger"
                                onClick={() => {
                                  setDeleteFor(t);
                                  setEcho("");
                                }}
                              >
                                Delete…
                              </Button>
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </ListRow>
                  );
                })}
              </List>
              <p className="meta">
                Counted under this authorization, this lifecycle filter and this snapshot — totals
                are stated only where they were actually counted, and an unavailable project count
                is never rendered as a zero blast radius. Every verb here is the same act the
                studio's lifecycle rail offers; publish re-validates against the learner bounds
                before it commits.
              </p>
            </>
          )}
        </>
      )}

      {/* Tier one — the ordinary confirm: archiving is the soft delete. */}
      <Dialog
        open={archiveFor !== null}
        title={archiveFor ? `Archive ${archiveFor.name}?` : "Archive?"}
        icon="inbox"
        tone="destructive"
        onClose={() => setArchiveFor(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setArchiveFor(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmArchive}>
              Archive
            </Button>
          </>
        }
      >
        {archiveFor ? (
          <p>
            Archiving is terminal — {archiveFor.name} leaves the learner picker at once and no
            restore exists. Projects and stamped starters already made from it are untouched;
            duplicating it into a new draft is the only way forward.
          </p>
        ) : null}
      </Dialog>

      {/* Tier two — the typed echo: a hard delete reaches a pristine draft
          alone, and where dependents or the lifecycle refuse it the refusal
          is named and archive offered. */}
      <Dialog
        open={deleteFor !== null}
        title={deleteFor ? `Delete ${deleteFor.name} permanently?` : "Delete?"}
        icon="trash"
        tone="destructive"
        onClose={() => {
          setDeleteFor(null);
          setEcho("");
        }}
      >
        {deleteContent}
      </Dialog>
    </AdminPage>
  );
}

/* ── The studio ───────────────────────────────────────────────────────────── */

export function TemplateStudio({ id }: { id: string }) {
  const store = useStore();
  const fixture = useMemo<StudioTemplate | undefined>(
    () => (id === "new" ? blankDraft() : STUDIO_TEMPLATES.find((t) => t.id === id)),
    [id]
  );

  const [draft, setDraft] = useState(() => ({
    name: fixture?.name ?? "",
    description: fixture?.description ?? "",
    level: (fixture?.level ?? "Beginner") as TemplateLevel,
    skill: fixture?.skill ?? "",
    topic: fixture?.topic ?? "",
    runtime: fixture?.runtime ?? "python-3.12",
    entryPath: fixture?.entryPath ?? ""
  }));
  const [files, setFiles] = useState<EditorFile[]>(() =>
    (fixture?.files ?? []).map((f) => ({ ...f }))
  );
  const [tasks, setTasks] = useState<string[]>(() => [...(fixture?.checklist ?? [])]);
  const [openPaths, setOpenPaths] = useState<string[]>(() =>
    (fixture?.files ?? []).map((f) => f.path)
  );
  const [activePath, setActivePath] = useState(fixture?.entryPath ?? fixture?.files[0]?.path ?? "");
  const [lifecycle, setLifecycle] = useState<StudioTemplate["lifecycle"]>(
    fixture?.lifecycle ?? "draft"
  );
  const [revision, setRevision] = useState(fixture?.revision ?? 0);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [conflict, setConflict] = useState(fixture?.concurrentEdit ?? null);
  const [conflictHeld, setConflictHeld] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(fixture?.checkRun?.output ?? null);
  const [runOk, setRunOk] = useState<boolean | undefined>(fixture?.checkRun?.ok);
  const [staged, setStaged] = useState<"archive" | "delete" | null>(null);
  const [deleteEcho, setDeleteEcho] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [pendingFileDelete, setPendingFileDelete] = useState<string | null>(null);

  const runtime = TEMPLATE_RUNTIMES.find((r) => r.id === draft.runtime);
  const lane = runtime?.lane ?? "terminal";

  /* Live counts — the studio never computes a figure the learner's project
     wouldn't carry. */
  const byteCount = files.reduce((n, f) => n + f.content.length, 0);
  const longestPath = files.reduce((n, f) => Math.max(n, f.path.length), 0);
  const boundsOk =
    files.length <= FILE_CEILING &&
    byteCount <= PROJECT_BYTES &&
    longestPath <= PATH_CHARACTERS &&
    files.every((f) => f.content.length <= TEXT_FILE_BYTES);
  const tasksOk =
    tasks.length >= 1 &&
    tasks.length <= TASK_LIMIT &&
    tasks.every((t) => t.trim().length > 0 && t.length <= INSTRUCTION_CHARACTERS);
  const entryOk = files.some((f) => f.path === draft.entryPath);
  const classificationOk = draft.skill.trim() !== "" && draft.topic.trim() !== "";
  const runsOk = lane === "browser" ? Boolean(ticks["runs"]) : runOk === true;

  const changed: string[] = [];
  if (fixture) {
    if (draft.name !== fixture.name) changed.push("name");
    if (draft.description !== fixture.description) changed.push("description");
    if (draft.level !== fixture.level) changed.push("level");
    if (draft.skill !== fixture.skill) changed.push("skill");
    if (draft.topic !== fixture.topic) changed.push("topic");
    if (draft.runtime !== fixture.runtime) changed.push("runtime");
    if (draft.entryPath !== fixture.entryPath) changed.push("entry file");
    if (
      files.length !== fixture.files.length ||
      files.some(
        (f) => f.isDirty || !fixture.files.some((o) => o.path === f.path && o.content === f.content)
      )
    )
      changed.push("files");
    if (JSON.stringify(tasks) !== JSON.stringify(fixture.checklist)) changed.push("checklist");
  }
  const dirty = changed.length > 0;

  /* Leaving a dirty form is guarded. */
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  if (!fixture) {
    return (
      <AdminPage kicker="Content / Workspace" title="Template unavailable">
        <StateBlock
          state="unavailable"
          message="This template does not resolve — a deleted or never-authored id is not filled with a sample."
          action={<Button variant="secondary" to="/admin/templates">Project templates</Button>}
        />
      </AdminPage>
    );
  }

  if (deleted) {
    return (
      <AdminPage kicker="Content / Workspace" title={fixture.name}>
        <StateBlock
          state="pruned"
          message="This pristine draft was destroyed. Its file set and retained versions are gone."
          action={<Button variant="secondary" to="/admin/templates">Project templates</Button>}
        />
      </AdminPage>
    );
  }

  /* The guards above have narrowed fixture — bind it once so closures inside
     the helpers below (their own function bodies) see the resolved record. */
  const base = fixture;
  const active = files.find((f) => f.path === activePath) ?? files[0];
  const openFiles = files.filter((f) => openPaths.includes(f.path));
  const archived = lifecycle === "archived";
  const pristine = lifecycle === "draft" && fixture.dependents === 0;

  function editActive(content: string) {
    setFiles((prev) =>
      prev.map((f) => (f.path === active?.path ? { ...f, content, isDirty: true } : f))
    );
  }

  function addFile(path: string) {
    const clean = path.trim();
    if (!clean) return;
    if (clean.length > PATH_CHARACTERS) {
      setFlash({
        tone: "error",
        text: `Refused — the path exceeds WORKSPACE_PATH_CHARACTERS (${PATH_CHARACTERS}). Nothing was written.`
      });
      return;
    }
    if (files.some((f) => f.path.toLowerCase() === clean.toLowerCase())) {
      setFlash({ tone: "error", text: `Refused — ${clean} collides with an existing path.` });
      return;
    }
    if (files.length >= FILE_CEILING) {
      setFlash({
        tone: "error",
        text: `Refused — the template is full at WORKSPACE_PROJECT_FILE_CEILING (${FILE_CEILING}); a file may be deleted first. No extension exists.`
      });
      return;
    }
    setFiles((prev) => [...prev, { path: clean, content: "", isDirty: true }]);
    setOpenPaths((prev) => [...prev, clean]);
    setActivePath(clean);
  }

  function deleteFile(path: string) {
    const remaining = files.filter((f) => f.path !== path);
    setFiles(remaining);
    setOpenPaths((prev) => prev.filter((p) => p !== path));
    if (activePath === path) setActivePath(remaining[0]?.path ?? "");
    if (draft.entryPath === path) setDraft((d) => ({ ...d, entryPath: "" }));
  }

  function renameFile(oldPath: string, newPath: string) {
    const clean = newPath.trim();
    if (!clean || clean === oldPath) return;
    if (clean.length > PATH_CHARACTERS) {
      setFlash({
        tone: "error",
        text: `Refused — the path exceeds WORKSPACE_PATH_CHARACTERS (${PATH_CHARACTERS}). The name kept what was typed; nothing was rewritten.`
      });
      return;
    }
    setFiles((prev) => prev.map((f) => (f.path === oldPath ? { ...f, path: clean } : f)));
    setOpenPaths((prev) => prev.map((p) => (p === oldPath ? clean : p)));
    if (activePath === oldPath) setActivePath(clean);
    if (draft.entryPath === oldPath) setDraft((d) => ({ ...d, entryPath: clean }));
  }

  function save() {
    setFiles((prev) => prev.map((f) => ({ ...f, isDirty: false })));
    setRevision((r) => r + 1);
    setFlash({
      tone: "success",
      text: `Saved revision ${revision + 1} — only what changed was submitted (${changed.join(", ")}).`
    });
  }

  function simulateRun() {
    const checkRun = base.checkRun;
    setRunning(true);
    window.setTimeout(() => {
      setRunOutput(checkRun?.output ?? "exit 0 · starter runs as written");
      setRunOk(checkRun?.ok ?? true);
      setRunning(false);
    }, 700);
  }

  function publish() {
    const failed: string[] = [];
    if (!boundsOk) failed.push("re-validation against the learner bounds");
    if (!entryOk) failed.push("the entry file resolving inside the file set");
    if (!tasksOk) failed.push("a learner checklist within its bounds");
    if (!runsOk)
      failed.push(
        lane === "browser"
          ? "rendering as written — an author checklist item this runtime has no run for"
          : "the starter running as written"
      );
    if (!classificationOk) failed.push("a primary skill and topic");
    if (failed.length > 0) {
      setFlash({
        tone: "error",
        text: `Publish refused — ${failed.join("; ")}. A refused publish leaves the template exactly as it was.`
      });
      return;
    }
    setLifecycle("published");
    setFlash({
      tone: "success",
      text: `Published revision ${revision}. The edit reaches only projects created afterwards — never one already made from it.`
    });
  }

  const pathRow = (authoring: boolean) => (
    <>
      <Icon name="file" size={12} />
      <span className="x-template-files__path-name">{active?.path ?? "—"}</span>
      <span className="x-template-files__path-actions">
        {active ? (
          <span className="tstudio-path-size">{formatBytes(active.content.length)}</span>
        ) : null}
        {active && draft.entryPath === active.path ? (
          <span className="tstudio-entry">
            <Icon name="star" size={12} /> entry file
          </span>
        ) : null}
        {authoring && active && !archived && draft.entryPath !== active.path ? (
          <button
            type="button"
            className="tstudio-path-btn"
            onClick={() => setDraft((d) => ({ ...d, entryPath: active.path }))}
          >
            <Icon name="star" size={12} /> Pin as entry file
          </button>
        ) : null}
        {authoring && active && !archived && files.length > 1 ? (
          /* The rail's hover-revealed trash is not the only delete — the verb
             stands on the open file's own row, worded, and confirms first. */
          <button
            type="button"
            className="tstudio-path-btn"
            data-tone="danger"
            onClick={() => setPendingFileDelete(active.path)}
          >
            <Icon name="trash" size={12} /> Delete file
          </button>
        ) : null}
      </span>
    </>
  );

  const checklistAside =
    tasks.length > 0 ? (
      <>
        <p className="x-template-files__side-title">Checklist — what a learner gets</p>
        <ul className="x-template-files__tasks">
          {tasks.map((t) => (
            <li className="x-template-files__task" key={t}>
              <span className="x-template-files__task-box" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </>
    ) : (
      <>
        <p className="x-template-files__side-title">Checklist — what a learner gets</p>
        <StateBlock state="empty" compact message="No tasks authored yet." />
      </>
    );

  return (
    <AdminPage
      kicker="Content / Workspace"
      title={draft.name || "Untitled starter"}
      lead="The workspace domain's one admin page — a starter template authored in the same surface a learner meets it in: its files, checklist and preview read here together rather than inferred. No learner's workspace opens here, and no field is drawn from learner data."
      actions={
        <span className="row">
          <Chip size="sm" variant={lifecycle === "published" ? "accent" : "quiet"}>
            {LIFECYCLE_LABEL[lifecycle]}
          </Chip>
          <Button variant="secondary" to="/admin/templates" icon="arrow-left">
            All templates
          </Button>
        </span>
      }
    >
      {conflict ? (
        <Notice tone="warning" title="Concurrent change" live="assertive">
          <p>
            {conflict.author} saved revision {conflict.revision} at {conflict.at} while this draft
            was open — your base is revision {revision}. A save applies only while what is stored
            is still what you started from; resolve it deliberately.
          </p>
          <div className="row">
            <Button
              size="sm"
              onClick={() => {
                setConflict(null);
                setConflictHeld(true);
                setFlash({
                  tone: "info",
                  text: "Kept your edits — the stored revision is replaced deliberately on the next save, never by default."
                });
              }}
            >
              Keep mine
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft({
                  name: fixture.name,
                  description: fixture.description,
                  level: fixture.level,
                  skill: fixture.skill,
                  topic: fixture.topic,
                  runtime: fixture.runtime,
                  entryPath: fixture.entryPath
                });
                setFiles(fixture.files.map((f) => ({ ...f })));
                setTasks([...fixture.checklist]);
                setRevision(conflict.revision);
                setConflict(null);
                setFlash({ tone: "info", text: "Took theirs — the stored content loaded into every tab." });
              }}
            >
              Take theirs
            </Button>
          </div>
        </Notice>
      ) : null}

      {archived ? (
        <Notice tone="neutral" title="Archived">
          <p>
            Archiving is terminal — this template left the learner picker and no restore exists.
            Duplicating it into a new draft identity is the only way forward.
          </p>
        </Notice>
      ) : null}

      {flash ? (
        <Notice tone={flash.tone} live="polite">
          {flash.text}
        </Notice>
      ) : null}

      <Card>
        <CardHeader title="Template" icon="projects" eyebrow="1 · Identity" />
        <FormGrid>
          <Field label="Name" required>
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} disabled={archived} />
          </Field>
          <Field label="Level">
            <Select
              value={draft.level}
              onChange={(v) => setDraft((d) => ({ ...d, level: v as TemplateLevel }))}
              options={["Beginner", "Intermediate", "Advanced"].map((l) => ({ value: l, label: l }))}
              disabled={archived}
              aria-label="Level"
            />
          </Field>
          <FormGridWide>
            <Field label="Description" hint="Shown before a slot is spent — runtime, files, checklist and footprint go with it.">
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                disabled={archived}
              />
            </Field>
          </FormGridWide>
          <Field label="Primary skill" hint="Required at publish — no free-text fallback.">
            <Select
              value={draft.skill}
              onChange={(v) => setDraft((d) => ({ ...d, skill: v }))}
              options={[{ value: "", label: "—" }, ...STUDIO_SKILLS.map((s) => ({ value: s, label: s }))]}
              disabled={archived}
              aria-label="Primary skill"
            />
          </Field>
          <Field label="Primary topic" hint="Required at publish.">
            <Select
              value={draft.topic}
              onChange={(v) => setDraft((d) => ({ ...d, topic: v }))}
              options={[{ value: "", label: "—" }, ...STUDIO_TOPICS.map((s) => ({ value: s, label: s }))]}
              disabled={archived}
              aria-label="Primary topic"
            />
          </Field>
          <Field
            label="Runtime"
            hint="Chosen once for the template; a project made from it keeps it for life."
          >
            <Select
              value={draft.runtime}
              onChange={(v) => setDraft((d) => ({ ...d, runtime: v }))}
              options={TEMPLATE_RUNTIMES.map((r) => ({
                value: r.id,
                label: r.unavailableReason ? `${r.label} — coming soon` : r.label,
                disabled: Boolean(r.unavailableReason)
              }))}
              disabled={archived}
              aria-label="Runtime"
            />
          </Field>
          <Field label="Entry file" hint="The file a run starts from — a template fact, not a per-run choice.">
            <Select
              value={draft.entryPath}
              onChange={(v) => setDraft((d) => ({ ...d, entryPath: v }))}
              options={files.map((f) => ({ value: f.path, label: f.path }))}
              disabled={archived}
              aria-label="Entry file"
            />
          </Field>
        </FormGrid>
      </Card>

      <Card>
        <CardHeader title="The bounds a learner's project obeys" icon="shield" eyebrow="2 · Live counts" />
        <div className="admin-health">
          <div className="admin-health__cell" data-verdict={files.length > FILE_CEILING ? "degraded" : "healthy"}>
            <strong>
              {files.length} of {FILE_CEILING}
            </strong>
            <p className="meta">files — WORKSPACE_PROJECT_FILE_CEILING</p>
          </div>
          <div className="admin-health__cell" data-verdict={byteCount > PROJECT_BYTES ? "degraded" : "healthy"}>
            <strong>{formatBytes(byteCount)}</strong>
            <p className="meta">of 20 MB — WORKSPACE_PROJECT_BYTES</p>
          </div>
          <div className="admin-health__cell" data-verdict={tasks.length > TASK_LIMIT ? "degraded" : "healthy"}>
            <strong>
              {tasks.length} of {TASK_LIMIT}
            </strong>
            <p className="meta">checklist tasks — WORKSPACE_TASK_LIMIT</p>
          </div>
          <div className="admin-health__cell" data-verdict={longestPath > PATH_CHARACTERS ? "degraded" : "healthy"}>
            <strong>{longestPath}</strong>
            <p className="meta">longest path — of {PATH_CHARACTERS} characters, WORKSPACE_PATH_CHARACTERS</p>
          </div>
        </div>
        <p className="meta">
          A template can never be authored into a shape a learner's project could not hold. Every
          text file also answers to WORKSPACE_TEXT_FILE_BYTES (2 MiB).
        </p>
      </Card>

      <Card>
        <CardHeader
          title="The workspace surface"
          icon="code"
          eyebrow={`3 · ${runtime?.label ?? draft.runtime} · ${lane === "browser" ? "preview lane" : "interactive lane"}`}
        />
        <TemplateFileSet
          label={`${draft.name || "Untitled starter"} — authoring surface`}
          mode="author"
          explorer={
            <FileExplorer
              files={files}
              activeFile={active?.path ?? ""}
              onSelectFile={(p) => {
                setActivePath(p);
                setOpenPaths((prev) => (prev.includes(p) ? prev : [...prev, p]));
              }}
              onAddFile={archived ? undefined : addFile}
              onDeleteFile={archived ? undefined : deleteFile}
              onRenameFile={archived ? undefined : renameFile}
              label={`Files (${files.length}/${FILE_CEILING})`}
            />
          }
          tabs={
            <EditorTabs
              files={openFiles}
              activeFile={active?.path ?? ""}
              onSelectFile={setActivePath}
              onCloseFile={(p) => {
                const rest = openPaths.filter((x) => x !== p);
                setOpenPaths(rest);
                if (p === activePath) setActivePath(rest[rest.length - 1] ?? files[0]?.path ?? "");
              }}
              label="Open files"
            />
          }
          pathRow={pathRow(true)}
          editor={
            active ? (
              <CodeEditorChrome
                value={active.content}
                onChange={archived ? undefined : editActive}
                readOnly={archived}
                language={detectLanguage(active.path) ?? "markdown"}
                filename={active.path}
                hideHeader
                hideFooter
                showMinimap={false}
              />
            ) : undefined
          }
          output={
            lane === "terminal" ? (
              <Terminal
                output={runOutput}
                isExecuting={running}
                onRun={simulateRun}
                onClear={() => {
                  setRunOutput(null);
                  setRunOk(undefined);
                }}
                statusLine={
                  runOk === undefined
                    ? undefined
                    : runOk
                      ? { tone: "pass", text: "exit 0 · the starter runs as written" }
                      : { tone: "fail", text: "exit 1 · the starter does not run as written" }
                }
                label="Starter check"
              />
            ) : undefined
          }
        />
        <p className="meta">
          {lane === "browser"
            ? "A browser-preview runtime has no run — the output dock is absent and rendering as written is an author checklist item."
            : "Run is the publish gate's reference run of the starter — one run, no cases, passing when it completes without a runtime error."}
        </p>
      </Card>

      <Card>
        <CardHeader title="Publish checklist" icon="check" eyebrow="4 · Evidence before the decision" />
        <p className="meta">
          Each item reads its own evidence. The checklist never disables Save — it informs Publish.
        </p>
        <ul className="tstudio-checklist">
          <li className="tstudio-check" data-state={boundsOk ? "met" : "open"}>
            <span className="tstudio-check__mark">
              <Icon name={boundsOk ? "check" : "alert"} size={12} />
            </span>
            <span className="tstudio-check__body">
              <span className="tstudio-check__label">Files re-validate against the project bounds</span>
              <span className="tstudio-check__evidence">
                {files.length} files · {formatBytes(byteCount)} · longest path {longestPath} of{" "}
                {PATH_CHARACTERS} — checked as they stand now
              </span>
            </span>
          </li>
          <li className="tstudio-check" data-state={entryOk ? "met" : "open"}>
            <span className="tstudio-check__mark">
              <Icon name={entryOk ? "check" : "alert"} size={12} />
            </span>
            <span className="tstudio-check__body">
              <span className="tstudio-check__label">The entry file resolves inside the file set</span>
              <span className="tstudio-check__evidence">
                {draft.entryPath || "none named"}
              </span>
            </span>
          </li>
          <li className="tstudio-check" data-state={runsOk ? "met" : "open"}>
            {lane === "browser" ? (
              <input
                type="checkbox"
                checked={Boolean(ticks["runs"])}
                onChange={(e) => setTicks((t) => ({ ...t, runs: e.target.checked }))}
                aria-label="I rendered the preview and it renders as written"
              />
            ) : (
              <span className="tstudio-check__mark">
                <Icon name={runsOk ? "check" : "alert"} size={12} />
              </span>
            )}
            <span className="tstudio-check__body">
              <span className="tstudio-check__label">The starter runs or renders as written</span>
              <span className="tstudio-check__evidence">
                {lane === "browser"
                  ? "No run exists for this runtime — your tick is the record, made against the preview below"
                  : runOk === undefined
                    ? "not yet run this session"
                    : runOk
                      ? "the reference run passed"
                      : "the reference run failed — the output dock says why"}
              </span>
            </span>
          </li>
          <li className="tstudio-check" data-state={classificationOk ? "met" : "open"}>
            <span className="tstudio-check__mark">
              <Icon name={classificationOk ? "check" : "alert"} size={12} />
            </span>
            <span className="tstudio-check__body">
              <span className="tstudio-check__label">A primary skill and topic are named</span>
              <span className="tstudio-check__evidence">
                {classificationOk ? `${draft.skill} · ${draft.topic}` : "publication refuses without them"}
              </span>
            </span>
          </li>
          <li className="tstudio-check" data-state={tasksOk ? "met" : "open"}>
            <span className="tstudio-check__mark">
              <Icon name={tasksOk ? "check" : "alert"} size={12} />
            </span>
            <span className="tstudio-check__body">
              <span className="tstudio-check__label">The learner checklist is authored and within bounds</span>
              <span className="tstudio-check__evidence">
                {tasks.length} of {TASK_LIMIT} tasks · each within {INSTRUCTION_CHARACTERS} characters
              </span>
            </span>
          </li>
          <li className="tstudio-check" data-state={ticks["previewed"] ? "met" : "open"}>
            <input
              type="checkbox"
              checked={Boolean(ticks["previewed"])}
              onChange={(e) => setTicks((t) => ({ ...t, previewed: e.target.checked }))}
              aria-label="I previewed the draft exactly as a learner meets it"
            />
            <span className="tstudio-check__body">
              <span className="tstudio-check__label">I previewed the draft exactly as a learner meets it</span>
              <span className="tstudio-check__evidence">the preview below — files and checklist both readable there</span>
            </span>
          </li>
        </ul>
      </Card>

      <Card>
        <CardHeader title="The checklist a learner gets" icon="list" eyebrow={`5 · Tasks (${tasks.length}/${TASK_LIMIT})`} />
        <ol className="tstudio-tasks">
          {tasks.map((t, i) => (
            <li className="tstudio-task" key={i} data-over={t.length > INSTRUCTION_CHARACTERS || undefined}>
              <input
                value={t}
                aria-label={`Task ${i + 1}`}
                aria-invalid={t.length > INSTRUCTION_CHARACTERS || undefined}
                disabled={archived}
                onChange={(e) =>
                  setTasks((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                }
              />
              <span className="tstudio-task__chars" aria-hidden="true">
                {t.length}
              </span>
              {!archived ? (
                <button
                  type="button"
                  className="tstudio-path-btn"
                  data-tone="danger"
                  onClick={() => setTasks((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`Remove task ${i + 1}`}
                >
                  <Icon name="trash" size={12} /> Remove
                </button>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="admin-tools">
          <Button
            variant="secondary"
            size="sm"
            icon="plus"
            disabled={archived || tasks.length >= TASK_LIMIT}
            onClick={() => setTasks((prev) => [...prev, ""])}
          >
            Add a task
          </Button>
          {tasks.length >= TASK_LIMIT ? (
            <span className="meta">
              At WORKSPACE_TASK_LIMIT ({TASK_LIMIT}) — a task may be deleted first. No extension exists.
            </span>
          ) : null}
        </div>
        <p className="meta">
          Ordered and the author's; nothing is ever checked by the platform. Over {INSTRUCTION_CHARACTERS}{" "}
          characters a task is refused whole — the field and the bound are named, nothing is silently shortened.
        </p>
      </Card>

      <Card>
        <CardHeader title="As a learner meets it" icon="search" eyebrow="6 · Preview" />
        <TemplateFileSet
          label={`${draft.name || "Untitled starter"} — learner preview`}
          mode="preview"
          explorer={
            <FileExplorer
              files={files}
              activeFile={active?.path ?? ""}
              onSelectFile={setActivePath}
              label="Files"
            />
          }
          tabs={
            <EditorTabs
              files={openFiles}
              activeFile={active?.path ?? ""}
              onSelectFile={setActivePath}
              label="Open files"
            />
          }
          pathRow={pathRow(false)}
          editor={
            active ? (
              <CodeEditorChrome
                value={active.content}
                readOnly
                language={detectLanguage(active.path) ?? "markdown"}
                filename={active.path}
                hideHeader
                hideFooter
                showMinimap={false}
              />
            ) : undefined
          }
          output={
            lane === "terminal" ? (
              <Terminal output={null} label="Run output" />
            ) : undefined
          }
          checklist={checklistAside}
        />
        <p className="meta">
          The draft exactly as a learner would meet it — its files and checklist read here rather
          than inferred. A project made from it is an independent copy from that moment; later edits
          never reach back.
        </p>
      </Card>

      <Card>
        <CardHeader title="Lifecycle" icon="shield" eyebrow={`7 · revision ${revision}`} />
        <p className="meta">
          A template carries three facts — its lifecycle, its revision and the projects
          already made from it, counted under this snapshot rather than guessed.
        </p>
        <ToolCluster
          label="Lifecycle"
          readout={
            conflict && !conflictHeld
              ? "Save is closed while the concurrent change is unresolved — keep yours or take theirs above."
              : dirty
                ? `Unsaved changes — leaving warns first. Save submits only what changed: ${changed.join(", ")}.`
                : "Everything is saved."
          }
        >
          <Button icon="save" disabled={Boolean(conflict) && !conflictHeld} onClick={save}>
            Save{dirty ? ` ${changed.length} change${changed.length === 1 ? "" : "s"}` : ""}
          </Button>
          {!archived ? (
            canPublishDirect(store.session.role) ? (
              <Button variant="secondary" onClick={publish}>
                Publish directly
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() =>
                  setFlash({
                    tone: "info",
                    text: "Submitted for approval — Publish Approvals carries the studio, the submitter and both halves of the change record."
                  })
                }
              >
                Submit for approval
              </Button>
            )
          ) : null}
          {lifecycle === "published" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setLifecycle("draft");
                setFlash({
                  tone: "info",
                  text: "Returned to draft — the workspace-template kind registers the flag true. Projects already made from it are untouched."
                });
              }}
            >
              Return to draft
            </Button>
          ) : null}
          <Button
            variant="quiet"
            icon="copy"
            onClick={() =>
              setFlash({
                tone: "info",
                text: "Duplicated into a new draft identity — no learner-facing trace."
              })
            }
          >
            Duplicate into a new draft
          </Button>
          {!archived ? (
            <Button variant="quiet" onClick={() => setStaged(staged === "archive" ? null : "archive")}>
              Archive…
            </Button>
          ) : null}
          {fixture.dependents !== null && !archived ? (
            <Button
              variant="destructive"
              onClick={() => setStaged(staged === "delete" ? null : "delete")}
            >
              Delete…
            </Button>
          ) : null}
        </ToolCluster>

        {staged === "archive" ? (
          <ActionPanel
            eyebrow="Archive this template"
            lead="Terminal — it fails as a creation source and leaves the learner picker at once. Projects and stamped starters already made from it are untouched."
          >
            <div className="row">
              <Button
                variant="destructive"
                onClick={() => {
                  setLifecycle("archived");
                  setStaged(null);
                  setFlash({ tone: "info", text: "Archived. A duplicate into a new draft is the only way forward." });
                }}
              >
                Confirm archive
              </Button>
              <Button variant="quiet" onClick={() => setStaged(null)}>
                Cancel
              </Button>
            </div>
          </ActionPanel>
        ) : null}

        {staged === "delete" && fixture.dependents !== null ? (
          <ActionPanel
            eyebrow="Delete this draft"
            lead={
              pristine
                ? "Reserved for a pristine draft — this cannot be undone, and every retained version goes with it."
                : `Destruction is refused — ${fixture.dependents} projects were created from this template. Archive is offered in its place.`
            }
          >
            {pristine ? (
              <ConfirmByTyping phrase={fixture.name} value={deleteEcho} onChange={setDeleteEcho}>
                {(matched) => (
                  <Button
                    variant="destructive"
                    disabled={!matched}
                    onClick={() => setDeleted(true)}
                  >
                    Delete permanently
                  </Button>
                )}
              </ConfirmByTyping>
            ) : (
              <Button variant="secondary" onClick={() => setStaged("archive")}>
                Archive instead…
              </Button>
            )}
          </ActionPanel>
        ) : null}

        {fixture.dependents === null && !archived ? (
          <Notice tone="error" title="Delete blocked">
            <p>
              The number of projects depending on this template could not be produced under the same
              authorization, filters and snapshot as the rows on show — the destructive confirmation
              stays closed and an unavailable count is never rendered as a zero blast radius.
            </p>
          </Notice>
        ) : null}
      </Card>

      {/* The visible file delete's ordinary confirm — the same act the
          explorer's hover trash stages. */}
      <Dialog
        open={pendingFileDelete !== null}
        title={pendingFileDelete ? `Delete ${pendingFileDelete}?` : "Delete file?"}
        icon="trash"
        tone="destructive"
        onClose={() => setPendingFileDelete(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setPendingFileDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingFileDelete) deleteFile(pendingFileDelete);
                setPendingFileDelete(null);
              }}
            >
              Delete file
            </Button>
          </>
        }
      >
        {pendingFileDelete ? (
          <p>
            The file leaves the template's file set and its open tab closes with it
            {pendingFileDelete === draft.entryPath
              ? " — as the entry file, that fact clears too"
              : ""}
            . This cannot be undone.
          </p>
        ) : null}
      </Dialog>

      <p className="meta">
        <Link to="/admin/templates">Project templates</Link>
      </p>
    </AdminPage>
  );
}
