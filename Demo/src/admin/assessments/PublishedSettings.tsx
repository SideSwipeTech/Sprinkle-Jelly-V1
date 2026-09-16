/**
 * PublishedSettings — settings after publication (assessments.F19/F20).
 *
 * The closed, enumerated editable set for the paper's type, validated exactly
 * as on a draft. The confirmation names each value moving from what to what,
 * how many people a notice reaches, and that it cannot be recalled. Telling
 * learners is the editing administrator's explicit choice, off by default and
 * recorded with their name. Granting a fresh test forces the notice on and
 * locks it there — the notice says plainly that taking the fresh test archives
 * the old result and the new test becomes the record. A write outside the
 * enumeration is refused as a content write.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { ACTION, editableSetFor, getPaper, type Strictness, type StudioPaper } from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

interface SettingsValues {
  title: string;
  description: string;
  durationMinutes: string;
  graceSeconds: string;
  strictness: Strictness;
  countedEventCeiling: string;
  fullscreenRequired: boolean;
  clipboardCounted: boolean;
  restrictedNavigationCounted: boolean;
  availabilityStart: string;
  availabilityEnd: string;
  featured: boolean;
  passingPercent: string;
  revealReview: boolean;
  revealAnswers: boolean;
  revealExplanations: boolean;
  category: string;
  difficulty: string;
  briefingInstructions: string;
  targetTimes: Record<string, string>;
}

function valuesOf(paper: StudioPaper): SettingsValues {
  return {
    title: paper.title,
    description: paper.description,
    durationMinutes: String(paper.durationMinutes),
    graceSeconds: String(paper.graceSeconds),
    strictness: paper.strictness,
    countedEventCeiling: String(paper.countedEventCeiling),
    fullscreenRequired: paper.fullscreenRequired,
    clipboardCounted: paper.clipboardCounted,
    restrictedNavigationCounted: paper.restrictedNavigationCounted,
    availabilityStart: paper.availabilityStart,
    availabilityEnd: paper.availabilityEnd,
    featured: paper.featured,
    passingPercent: paper.passingPercent === null ? "" : String(paper.passingPercent),
    revealReview: paper.revealReview,
    revealAnswers: paper.revealAnswers,
    revealExplanations: paper.revealExplanations,
    category: paper.category,
    difficulty: paper.difficulty,
    briefingInstructions: paper.briefingInstructions,
    targetTimes: Object.fromEntries(paper.questions.map((q) => [q.id, q.targetSeconds]))
  };
}

interface Diff { member: string; from: string; to: string }

function diffsAgainst(paper: StudioPaper, v: SettingsValues): Diff[] {
  const d: Diff[] = [];
  const cmp = (member: string, from: string, to: string) => { if (from !== to) d.push({ member, from, to }); };
  const yn = (b: boolean) => (b ? "on" : "off");
  cmp("title", paper.title, v.title);
  cmp("description", paper.description, v.description);
  cmp("time limit", `${paper.durationMinutes} min`, `${v.durationMinutes} min`);
  cmp("grace", `${paper.graceSeconds} s`, `${v.graceSeconds} s`);
  cmp("strictness", paper.strictness, v.strictness);
  cmp("counted-event ceiling", String(paper.countedEventCeiling), v.countedEventCeiling);
  cmp("fullscreen required", yn(paper.fullscreenRequired), yn(v.fullscreenRequired));
  cmp("clipboard actions counted", yn(paper.clipboardCounted), yn(v.clipboardCounted));
  cmp("restricted navigation counted", yn(paper.restrictedNavigationCounted), yn(v.restrictedNavigationCounted));
  cmp("availability window", `${paper.availabilityStart || "open"} → ${paper.availabilityEnd || "open"}`, `${v.availabilityStart || "open"} → ${v.availabilityEnd || "open"}`);
  cmp("featured marking", yn(paper.featured), yn(v.featured));
  if (paper.type === "mock") {
    cmp("passing percentage", paper.passingPercent === null ? "—" : `${paper.passingPercent}%`, v.passingPercent === "" ? "—" : `${v.passingPercent}%`);
    cmp("reveal flags", [paper.revealReview, paper.revealAnswers, paper.revealExplanations].map(yn).join("/"), [v.revealReview, v.revealAnswers, v.revealExplanations].map(yn).join("/"));
    cmp("category", paper.category, v.category);
    cmp("difficulty", paper.difficulty, v.difficulty);
  } else {
    cmp("the separate briefing instructions", paper.briefingInstructions, v.briefingInstructions);
  }
  for (const q of paper.questions) {
    const next = v.targetTimes[q.id] ?? "";
    if (next !== q.targetSeconds)
      d.push({ member: `target time — ${q.prompt.slice(0, 40) || q.id}`, from: q.targetSeconds || "unset", to: next || "unset" });
  }
  return d;
}

/** The committed values back onto the paper's own shape — the workspace
 *  applies the patch to its draft and the session record so the surfaces
 *  agree. */
export function settingsToPatch(paper: StudioPaper, v: SettingsValues): Partial<StudioPaper> {
  return {
    ...(paper.type === "mock"
      ? {
          title: v.title,
          passingPercent: v.passingPercent === "" ? null : Number(v.passingPercent),
          revealReview: v.revealReview,
          revealAnswers: v.revealAnswers,
          revealExplanations: v.revealExplanations,
          category: v.category,
          difficulty: v.difficulty as StudioPaper["difficulty"]
        }
      : { briefingInstructions: v.briefingInstructions }),
    description: v.description,
    durationMinutes: Number(v.durationMinutes),
    graceSeconds: Number(v.graceSeconds),
    strictness: v.strictness,
    countedEventCeiling: Number(v.countedEventCeiling),
    fullscreenRequired: v.fullscreenRequired,
    clipboardCounted: v.clipboardCounted,
    restrictedNavigationCounted: v.restrictedNavigationCounted,
    availabilityStart: v.availabilityStart,
    availabilityEnd: v.availabilityEnd,
    featured: v.featured,
    questions: paper.questions.map((q) => ({ ...q, targetSeconds: v.targetTimes[q.id] ?? q.targetSeconds }))
  };
}

/** The enumerated settings editor — the whole surface below the page head,
 *  shared by the standalone route and the workspace's Settings tab. */
export function PublishedSettingsEditor({
  paper,
  onCommitted
}: {
  paper: StudioPaper;
  /** The confirmed save, mapped back to the paper's own shape. */
  onCommitted?: (patch: Partial<StudioPaper>) => void;
}) {
  const [seed, setSeed] = useState<SettingsValues>(() => valuesOf(paper));
  const [v, setV] = useState<SettingsValues>(seed);
  const [confirming, setConfirming] = useState(false);
  const [tell, setTell] = useState(false);
  const [grant, setGrant] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [refusal, setRefusal] = useState("");

  /* Follow the paper where the editor holds nothing unsaved — a draft edited
     in Overview reseeds the form here, while typed work is never clobbered. */
  useEffect(() => {
    const next = valuesOf(paper);
    if (JSON.stringify(v) === JSON.stringify(seed)) setV(next);
    setSeed(next);
    /* Only the paper's own values reseed — v and seed are the comparison. */
  }, [paper]);

  const set = (patch: Partial<SettingsValues>) => { setV({ ...v, ...patch }); setSavedNote(""); setRefusal(""); };
  const mock = paper.type === "mock";
  const diffs = diffsAgainst(paper, v);
  const audience = paper.audienceCount;
  /* A grant saved with the notice cleared is refused rather than committed —
     the notice is forced on and locked there. */
  const noticeRequired = grant;
  const audienceBlocks = (tell || noticeRequired) && audience === null;

  /* Validated exactly as on a draft — the first failure names itself and the
     save is refused rather than committed. */
  const validate = (): string | null => {
    if (!(Number(v.durationMinutes) > 0)) return "time limit must be a positive duration";
    if (!(Number(v.graceSeconds) >= 0)) return "grace must be 0 or more seconds";
    const ceiling = Number(v.countedEventCeiling);
    if (!(ceiling >= 0 && ceiling <= 5)) return "the counted-event ceiling is 0 to 5";
    if (v.availabilityStart && v.availabilityEnd && v.availabilityEnd <= v.availabilityStart)
      return "the availability window's end must follow its start";
    if (mock && v.passingPercent !== "" && !(Number(v.passingPercent) >= 1 && Number(v.passingPercent) <= 100))
      return "the passing percentage is 1 to 100";
    for (const q of paper.questions) {
      const t = v.targetTimes[q.id] ?? "";
      if (t !== "" && !(Number(t) >= 10 && Number(t) <= 3600))
        return `the target time on "${(q.prompt || q.id).slice(0, 32)}" is 10 seconds to 60 minutes`;
    }
    return null;
  };

  return (
    <>
      <p className="meta">Editable set for this type: {editableSetFor(paper.type).join(" · ")}. Anything else is a content write and is refused.</p>

          <Card>
            <CardHeader title="Operational settings" icon="settings" eyebrow="shared members" />
            <div className="sink__grid">
              {mock ? (
                <label className="field"><span className="meta">Title</span>
                  <input value={v.title} onChange={(e) => set({ title: e.target.value })} /></label>
              ) : null}
              <label className="field"><span className="meta">Description</span>
                <textarea value={v.description} onChange={(e) => set({ description: e.target.value })} /></label>
              <label className="field"><span className="meta">Time limit (minutes)</span>
                <input inputMode="numeric" value={v.durationMinutes} onChange={(e) => set({ durationMinutes: e.target.value })} /></label>
              <label className="field"><span className="meta">Grace (seconds)</span>
                <input inputMode="numeric" value={v.graceSeconds} onChange={(e) => set({ graceSeconds: e.target.value })} /></label>
              <label className="field"><span className="meta">Availability opens</span>
                <input type="date" value={v.availabilityStart} onChange={(e) => set({ availabilityStart: e.target.value })} /></label>
              <label className="field"><span className="meta">Availability closes</span>
                <input type="date" value={v.availabilityEnd} onChange={(e) => set({ availabilityEnd: e.target.value })} /></label>
              <label className="row"><input type="checkbox" checked={v.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured marking</label>
            </div>
          </Card>

          <Card>
            <CardHeader title="The integrity settings" icon="shield" eyebrow="shared members" />
            <div className="sink__grid">
              <label className="field"><span className="meta">Strictness</span>
                <select value={v.strictness} onChange={(e) => set({ strictness: e.target.value as Strictness })}>
                  <option value="off">off</option><option value="standard">Standard</option><option value="strict">Strict</option>
                </select></label>
              <label className="field"><span className="meta">Counted-event ceiling</span>
                <input inputMode="numeric" value={v.countedEventCeiling} onChange={(e) => set({ countedEventCeiling: e.target.value })} /></label>
              <label className="row"><input type="checkbox" checked={v.fullscreenRequired} onChange={(e) => set({ fullscreenRequired: e.target.checked })} /> Fullscreen required</label>
              <label className="row"><input type="checkbox" checked={v.clipboardCounted} onChange={(e) => set({ clipboardCounted: e.target.checked })} /> Clipboard and context-menu actions counted</label>
              <label className="row"><input type="checkbox" checked={v.restrictedNavigationCounted} onChange={(e) => set({ restrictedNavigationCounted: e.target.checked })} /> Restricted navigation and shortcuts counted</label>
            </div>
            <p className="meta">An edit reaches no test in progress — a running test keeps its stamped clock, deadline, strictness, ceiling, cursor and locks.</p>
          </Card>

          {mock ? (
            <Card>
              <CardHeader title="Mock members" icon="browse-tests" />
              <div className="sink__grid">
                <label className="field"><span className="meta">Passing percentage</span>
                  <input inputMode="numeric" value={v.passingPercent} onChange={(e) => set({ passingPercent: e.target.value })} /></label>
                <label className="field"><span className="meta">Category</span>
                  <input value={v.category} onChange={(e) => set({ category: e.target.value })} /></label>
                <label className="field"><span className="meta">Difficulty</span>
                  <select value={v.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
                    <option value="">—</option>
                    {["easy", "medium", "hard", "extreme"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select></label>
                <label className="row"><input type="checkbox" checked={v.revealReview} onChange={(e) => set({ revealReview: e.target.checked })} /> Reveal per-question review</label>
                <label className="row"><input type="checkbox" checked={v.revealAnswers} onChange={(e) => set({ revealAnswers: e.target.checked })} /> Reveal correct answers</label>
                <label className="row"><input type="checkbox" checked={v.revealExplanations} onChange={(e) => set({ revealExplanations: e.target.checked })} /> Reveal explanations</label>
              </div>
              <p className="meta">Exam-XP and randomization flags are editable here too — previewed in the studio fields.</p>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Company members" icon="companies" />
              <label className="field"><span className="meta">The separate briefing instructions</span>
                <textarea value={v.briefingInstructions} onChange={(e) => set({ briefingInstructions: e.target.value })} /></label>
              <p className="meta">Owning company, role and year freeze absolutely; provenance freezes with the one audited Actual-to-Pattern exception — none are editable here.</p>
            </Card>
          )}

          <Card>
            <CardHeader title="Per-question authored target time" icon="clock" eyebrow="the pacing denominator" />
            {paper.questions.length === 0 ? <StateBlock state="empty" compact message="No questions on this paper." /> : (
              <div className="sink__grid">
                {paper.questions.map((q) => (
                  <label className="field" key={q.id}>
                    <span className="meta">{(q.prompt || q.id).slice(0, 48)}</span>
                    <input inputMode="numeric" value={v.targetTimes[q.id] ?? ""}
                      onChange={(e) => set({ targetTimes: { ...v.targetTimes, [q.id]: e.target.value } })} />
                  </label>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Save with its confirmation" icon="check" />
            <div className="row">
              <button className="btn btn--primary" type="button" disabled={diffs.length === 0}
                onClick={() => {
                  const bad = validate();
                  if (bad) { setRefusal(bad); return; }
                  setTell(false); setGrant(false); setConfirming(true);
                }}>
                Save settings{diffs.length > 0 ? ` (${diffs.length} changed)` : ""}
              </button>
              {diffs.length === 0 ? <span className="meta">Nothing changed — a notice naming nothing never ships.</span> : null}
            </div>
            {refusal ? (
              <StateBlock state="refused" compact message={`Save refused — ${refusal}. Validated exactly as on a draft.`} />
            ) : null}
            {savedNote ? <p className="page__lead" role="status">{savedNote}</p> : null}
          </Card>

      <Dialog
        open={confirming}
        title="Confirm the settings change"
        icon="alert"
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button disabled={audienceBlocks}
              onClick={() => {
                setConfirming(false);
                onCommitted?.(settingsToPatch(paper, v));
                setSavedNote(`Committed as one audited change${tell || noticeRequired ? ` — the notice reaches ${audience} people and cannot be recalled` : " — no notice sent"}.`);
              }}>
              Commit the change
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>Back</Button>
          </>
        }
      >
        <table className="a-diff">
          <thead><tr><th>Setting</th><th>From</th><th>To</th></tr></thead>
          <tbody>
            {diffs.map((d) => (
              <tr key={d.member}><td>{d.member}</td><td>{d.from}</td><td>{d.to}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="meta" style={{ marginTop: "var(--space-3)" }}>
          {audience === null
            ? "The audience count cannot be computed — a confirmation depending on it is blocked."
            : `A notice reaches ${audience} ${audience === 1 ? "person" : "people"} — everyone who has ever taken the paper.`}{" "}
          It cannot be recalled.
        </p>
        <label className="row">
          <input type="checkbox" checked={tell || noticeRequired} disabled={noticeRequired}
            onChange={(e) => setTell(e.target.checked)} />
          Tell learners — the editing administrator's explicit choice, off by default, recorded with their name{noticeRequired ? " (locked on by the grant)" : ""}
        </label>
        <label className="row">
          <input type="checkbox" checked={grant} onChange={(e) => setGrant(e.target.checked)} />
          Grant a fresh test to learners whose test of this paper was already finalized
        </label>
        {grant ? (
          <p className="meta">
            The notice is forced on and locked: taking the fresh test archives the old result and the
            new test becomes the record. At most one outstanding grant per learner per paper.
          </p>
        ) : null}
      </Dialog>
    </>
  );
}

export function PublishedSettings() {
  const { paperId } = useParams();
  const paper = getPaper(paperId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);

  if (!paper) {
    return (
      <AdminPage kicker="Assessments · Settings" title="Settings after publication" lead="The closed, enumerated editable set.">
        <StateBlock state="unavailable" message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>} />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      kicker={`Assessments · ${paper.title}`}
      title="Settings after publication"
      lead={`The closed, enumerated editable set for a ${paper.type === "mock" ? "Mock" : "Company"} paper — validated exactly as on a draft, audited as part of the change.`}
      actions={<Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}?tab=settings`}>Back to the paper</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editSettings} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={paper.type} /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The audience count" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={paper.title} /> : null}

      {preview !== "loading" && preview !== "refused" && preview !== "content-write" ? (
        <>
          <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
          {/* The commit lands on the session record itself so the index, the
              workspace and every read-back agree for the session. */}
          <PublishedSettingsEditor paper={paper} onCommitted={(patch) => Object.assign(paper, patch)} />
        </>
      ) : null}
    </AdminPage>
  );
}
