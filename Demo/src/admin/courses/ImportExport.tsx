/**
 * ImportExport — `curriculum/import-export`. Course drafts move as whole
 * files: one file of at most COURSES_IMPORT_FILE_MAX_MIB carrying at most
 * JOBS_SWEEP_PAGE_RECORDS lessons, validated and previewed before anything
 * commits, committing whole or not at all, with a refusal naming the field
 * and the bound rather than truncating. An export that cannot be produced
 * says so rather than delivering a partial file.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import {
  IMPORT_BOUNDS,
  SAMPLE_IMPORT_INVALID,
  SAMPLE_IMPORT_OK,
  loadedNote,
  readStudioTree,
  writeStudioTree,
  type ImportDraft,
  type LessonType,
  type StudioItem
} from "./fixtures";
import "./courses.css";

interface Refusal {
  field: string;
  bound: string;
  message: string;
}

/** Whole-file validation — every refusal names its field and its bound. */
function validateDraft(draft: ImportDraft, sizeBytes: number): Refusal[] {
  const refusals: Refusal[] = [];
  const mib = sizeBytes / (1024 * 1024);
  if (mib > IMPORT_BOUNDS.COURSES_IMPORT_FILE_MAX_MIB) {
    refusals.push({
      field: "file",
      bound: `COURSES_IMPORT_FILE_MAX_MIB (${IMPORT_BOUNDS.COURSES_IMPORT_FILE_MAX_MIB} MiB)`,
      message: `the file is ${mib.toFixed(1)} MiB`
    });
  }
  if (!draft || typeof draft !== "object") {
    refusals.push({ field: "file", bound: "a course draft object", message: "the file is not one draft" });
    return refusals;
  }
  if (!draft.title?.trim()) {
    refusals.push({ field: "title", bound: "required, non-empty", message: "the draft has no title" });
  }
  if (draft.address !== undefined && !/^[a-z0-9-]+$/.test(draft.address)) {
    refusals.push({
      field: "address name",
      bound: "lowercase letters, digits and hyphens",
      message: `“${draft.address}” is malformed`
    });
  }
  const lessons = draft.lessons ?? [];
  if (lessons.length > IMPORT_BOUNDS.JOBS_SWEEP_PAGE_RECORDS) {
    refusals.push({
      field: "lessons",
      bound: `JOBS_SWEEP_PAGE_RECORDS (${IMPORT_BOUNDS.JOBS_SWEEP_PAGE_RECORDS})`,
      message: `the file carries ${lessons.length} lessons`
    });
  }
  const TYPES = ["text", "video", "quiz", "course-project", "integration-reference"];
  lessons.forEach((l, i) => {
    if (l.type !== undefined && !TYPES.includes(l.type)) {
      refusals.push({
        field: `lessons[${i}].type`,
        bound: "one of the five lesson types",
        message: `“${l.type}” is not a lesson type`
      });
    }
    if (!l.title?.trim()) {
      refusals.push({
        field: `lessons[${i}].title`,
        bound: "required, non-empty",
        message: "a lesson has no title"
      });
    }
  });
  return refusals;
}

export function ImportExport() {
  const [items, setItems] = useState(readStudioTree);
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<{
    draft: ImportDraft;
    size: number;
    refusals: Refusal[];
  } | null>(null);
  const [note, setNote] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [exportId, setExportId] = useState(() => readStudioTree()[0]?.id ?? "");
  const [exportNote, setExportNote] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  function stageDraft(raw: string, size: number) {
    let parsed: ImportDraft;
    try {
      parsed = JSON.parse(raw) as ImportDraft;
    } catch {
      setStage({
        draft: { title: "" },
        size,
        refusals: [{ field: "file", bound: "valid JSON", message: "the file does not parse" }]
      });
      setNote(null);
      return;
    }
    setStage({ draft: parsed, size, refusals: validateDraft(parsed, size) });
    setNote(null);
  }

  function onFile(file: File) {
    file.text().then((text) => stageDraft(text, file.size));
  }

  function commit() {
    if (!stage || stage.refusals.length > 0) return;
    const lessons = stage.draft.lessons ?? [];
    const item: StudioItem = {
      id: stage.draft.address ?? `import-${Date.now()}`,
      family: stage.draft.family === "video" ? "video" : "interactive",
      title: stage.draft.title,
      address: stage.draft.address ?? `import-${Date.now()}`,
      lifecycle: "draft",
      enrolled: 0,
      groups: [
        {
          id: "grp-imported",
          title: stage.draft.family === "video" ? "Module 1" : "Chapter 1",
          lessons: lessons.map((l, i) => ({
            id: `${stage.draft.address ?? "import"}-${i}`,
            title: l.title,
            address: l.address ?? `lesson-${i}`,
            type: (l.type as LessonType | undefined) ?? "text",
            required: true,
            lifecycle: "draft" as const,
            saved: true,
            outcomes: [],
            skill: "",
            topic: ""
          }))
        }
      ]
    };
    const next = [item, ...items];
    setItems(next);
    /* The commit lands in the session overlay — the tree reads it back. */
    writeStudioTree(next);
    setNote({
      tone: "ok",
      text: `“${item.title}” committed whole as a draft — nothing in it is live. ${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"} arrived.`
    });
    setStage(null);
  }

  function exportItem() {
    const target = items.find((i) => i.id === exportId);
    if (!target) return;
    if (target.exportable === false) {
      setExportNote({
        tone: "err",
        text: `The export of “${target.title}” cannot be produced — ${target.exportNote}. No partial file was delivered.`
      });
      return;
    }
    const payload = {
      title: target.title,
      address: target.address,
      family: target.family,
      groups: target.groups.map((g) => ({
        title: g.title,
        lessons: g.lessons.map((l) => ({ title: l.title, address: l.address, type: l.type, required: l.required }))
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${target.address}.draft.json`;
    a.click();
    setExportNote({
      tone: "ok",
      text: `“${target.title}” exported as one whole file — no learner progress, workspace files, analytics events, provider details or unrestricted media in it.`
    });
  }

  return (
    <AdminPage
      kicker="Content / Curriculum"
      title="Import and export"
      lead="Course drafts move as whole files — validated and previewed before anything commits, committing whole or not at all, and never creating live content."
      actions={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
    >
      <Card>
        <CardHeader title="Import a draft" icon="download" />
        <p className="meta">
          One file, at most COURSES_IMPORT_FILE_MAX_MIB ({IMPORT_BOUNDS.COURSES_IMPORT_FILE_MAX_MIB}{" "}
          MiB), carrying at most JOBS_SWEEP_PAGE_RECORDS ({IMPORT_BOUNDS.JOBS_SWEEP_PAGE_RECORDS})
          lessons. A refusal names the field and the bound rather than truncating.
        </p>
        <div className="row">
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            aria-label="Draft file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => stageDraft(JSON.stringify(SAMPLE_IMPORT_OK), JSON.stringify(SAMPLE_IMPORT_OK).length)}
          >
            Load a valid sample file
          </button>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => stageDraft(JSON.stringify(SAMPLE_IMPORT_INVALID), JSON.stringify(SAMPLE_IMPORT_INVALID).length)}
          >
            Load a file that fails validation
          </button>
        </div>

        {stage ? (
          <div className="cs-sweep">
            <strong>Preview — nothing commits until you say so</strong>
            {stage.refusals.length > 0 ? (
              <div className="list">
                {stage.refusals.map((r, i) => (
                  <p className="cs-refusal" key={i}>
                    <Icon name="alert" size={13} />
                    <span><code>{r.field}</code>: {r.message} — bound: {r.bound}</span>
                  </p>
                ))}
                <p className="meta">The import was refused whole — nothing was written, nothing truncated.</p>
              </div>
            ) : (
              <>
                <ul>
                  <li><strong>{stage.draft.title}</strong> — /{stage.draft.address ?? "untitled"} · {stage.draft.family ?? "interactive"}</li>
                  {(stage.draft.lessons ?? []).map((l, i) => (
                    <li key={i}>{l.title} — {l.type ?? "text"}</li>
                  ))}
                </ul>
                <p className="meta">Commits whole or not at all, and never creates live content.</p>
                <div>
                  <button type="button" className="btn btn--primary" onClick={commit}>
                    Commit the draft
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {note ? (
          <p className="cs-note" data-tone={note.tone} role="status">
            <Icon name={note.tone === "err" ? "alert" : "check"} size={14} /> {note.text}
          </p>
        ) : null}
      </Card>

      <Card>
        <CardHeader title="Export a draft" icon="external-link" />
        <p className="meta">
          One whole file per item. An export that cannot be produced says so rather than delivering
          a partial file.
        </p>
        <p className="meta">{loadedNote(items.length, items.length)}</p>
        <div className="cs-toolrow">
          <label className="field">
            <span className="meta">Item</span>
            <select value={exportId} onChange={(e) => setExportId(e.target.value)}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.title}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--secondary" onClick={exportItem}>
            Export whole file
          </button>
        </div>
        {exportNote ? (
          <p className="cs-note" data-tone={exportNote.tone} role={exportNote.tone === "err" ? "alert" : "status"}>
            <Icon name={exportNote.tone === "err" ? "alert" : "check"} size={14} /> {exportNote.text}
          </p>
        ) : null}
      </Card>
    </AdminPage>
  );
}
