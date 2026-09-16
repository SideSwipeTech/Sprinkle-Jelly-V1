/**
 * solve — the one challenge workbench (challenges/01 "Challenge workbench").
 *
 * Run and Submit are different acts: Run executes the visible samples (or a
 * custom input, ungraded) and records nothing; Submit grades the full case
 * set and becomes a submission of record — whatever its verdict. A platform
 * fault is reported in the platform's own name, writes no row and never
 * lands as a false solve failure. A program that does not compile fails in
 * the compiler's words, and nothing runs.
 *
 * Drafts are device-local per challenge and per language; switching language
 * never contaminates the other language's work. Opened from a track the
 * workbench keeps that context — the authored stepper and the next entry —
 * and a track challenge carries only the track's language.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { CHALLENGES, TRACKS } from "@data/catalog";
import {
  clearChallengeDraft,
  fileContentReport,
  markTrackCompleted,
  recordSubmission,
  saveChallengeDraft
} from "@state/store";
import { raise } from "@companion/stream";
import { useStore } from "@state/useStore";
import {
  CodeEditor,
  CodeWorkbench,
  RunButton,
  SubmitButton,
  Terminal,
  ToolButton,
  assessSource,
  extensionFor,
  measureRun,
  type TerminalStatusLine,
  type TerminalTestCase
} from "@components/CodeEditor";
import { HintLadder } from "../../extraction/components/HintLadder/HintLadder";
import { LanguageSelect } from "../../extraction/components/LanguageSelect/LanguageSelect";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Menu } from "../../extraction/components/Menu/Menu";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import {
  detailFor,
  starterFor,
  trackEditorLanguage,
  TRACK_CONTENTS,
  TRACK_LANGUAGE,
  xpFor,
  EDITOR_LANGUAGES,
  type EditorLanguage
} from "./data";

type Phase = "idle" | "running" | "submitting";
type Verdict =
  | { kind: "accepted"; first: boolean }
  | { kind: "wrong"; note: string; failingCase: string }
  | { kind: "fault"; note: string }
  | null;

export function ChallengeSolve() {
  const { challengeId } = useParams();
  const [params] = useSearchParams();
  const trackId = params.get("track") ?? undefined;
  const item = CHALLENGES.find((c) => c.id === challengeId);
  const store = useStore();

  const [language, setLanguage] = useState<EditorLanguage>("python");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [out, setOut] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<TerminalStatusLine | null>(null);
  const [results, setResults] = useState<TerminalTestCase[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [resetArm, setResetArm] = useState(false);
  const [inputRequest, setInputRequest] = useState(0);
  const [customVal, setCustomVal] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("incorrect");
  const [reportNote, setReportNote] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const timerRef = useRef<number | null>(null);

  const detail = item ? detailFor(item.id) : null;
  const lockedLanguage = trackEditorLanguage(trackId);
  const track = trackId ? TRACKS.find((t) => t.id === trackId) : undefined;
  const trackContents = track ? TRACK_CONTENTS[track.id] ?? [] : [];
  const trackIndex = track && item ? trackContents.indexOf(item.id) : -1;

  function clearConsole() {
    setOut(null);
    setErr(null);
    setStatusLine(null);
    setVerdict(null);
    setResults([]);
  }

  /* Seed the editor: the device draft for this challenge + language, else the
     authored starter — announced once, and only when a draft really was kept. */
  useEffect(() => {
    if (!item) return;
    const lang = lockedLanguage ?? "python";
    setLanguage(lang);
    const draft = store.challengeDrafts[`${item.id}:${lang}`];
    const start = starterFor(item, lang);
    setCode(draft ?? start);
    setRestored(draft !== undefined && draft !== start ? "Your device draft was restored." : null);
    clearConsole();
    setResetArm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  const detailData = detail;
  const draftKey = item ? `${item.id}:${language}` : "";
  const fileName = `solution.${extensionFor(language)}`;

  const nextInTrack =
    track && trackIndex >= 0 && trackIndex + 1 < trackContents.length
      ? CHALLENGES.find((c) => c.id === trackContents[trackIndex + 1]) ?? null
      : null;
  const nextUnsolved = item
    ? CHALLENGES.find((c) => c.id !== item.id && !store.solved.includes(c.id)) ?? null
    : null;

  function persistCode(next: string) {
    setCode(next);
    if (draftKey) saveChallengeDraft(draftKey, next);
  }

  function changeLanguage(next: EditorLanguage) {
    if (!item || !detailData) return;
    setLanguage(next);
    const draft = store.challengeDrafts[`${item.id}:${next}`];
    const start = starterFor(item, next);
    setCode(draft ?? start);
    setRestored(draft !== undefined && draft !== start ? "Your device draft was restored." : null);
    clearConsole();
    setResetArm(false);
  }

  function doRun() {
    if (!item || !detailData || phase !== "idle") return;
    if (detailData.judgeDown) {
      clearConsole();
      setVerdict({ kind: "fault", note: detailData.judgeDown });
      return;
    }
    const source = code;
    setPhase("running");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      const assessment = assessSource(source, starterFor(item, language), language, fileName);
      const stats = measureRun(source, language, detailData.samples.length);
      if (assessment.kind === "syntax") {
        setResults(
          detailData.samples.map((s, i) => ({
            name: `Visible case ${i + 1}`,
            passed: false,
            input: s.input,
            expected: s.expected,
            actual: `${assessment.label} — the program did not run`
          }))
        );
        setErr(assessment.report);
        setStatusLine({ tone: "fail", text: `${assessment.label} on line ${assessment.issue.line} · nothing ran · nothing recorded` });
        return;
      }
      const clean = assessment.kind === "changed";
      const rows: TerminalTestCase[] = detailData.samples.map((s, i) => ({
        name: `Visible case ${i + 1}`,
        passed: clean,
        durationMs: stats.durationMs / detailData.samples.length + i * 0.05,
        input: s.input,
        expected: s.expected,
        actual: clean ? s.expected : "(the starter's stub return)"
      }));
      setResults(rows);
      setOut(
        clean
          ? `Ran the ${rows.length} visible sample${rows.length === 1 ? "" : "s"} — all passed.\nA run is not a submission: nothing was recorded. Submit grades the full set of ${detailData.samples.length + detailData.hiddenCount} cases.`
          : `Ran the ${rows.length} visible sample${rows.length === 1 ? "" : "s"} — case 1 failed.\nThe editor still holds the starter stub. A run is not a submission: nothing was recorded.`
      );
      setStatusLine(
        clean
          ? { tone: "pass", text: `${rows.length}/${rows.length} visible cases passed · ${stats.durationMs} ms · ${stats.memoryMb.toFixed(1)} MB` }
          : { tone: "fail", text: `Visible case 1 failed · ${stats.durationMs} ms · nothing recorded` }
      );
    }, 500);
  }

  function doRunCustom() {
    if (!item || !detailData || phase !== "idle") return;
    if (customVal.trim().length === 0) {
      clearConsole();
      setStatusLine({ tone: "warn", text: "Custom input was empty — the platform refused it before execution. Nothing ran." });
      return;
    }
    if (detailData.judgeDown) {
      clearConsole();
      setVerdict({ kind: "fault", note: detailData.judgeDown });
      return;
    }
    const source = code;
    setPhase("running");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      const assessment = assessSource(source, starterFor(item, language), language, fileName);
      if (assessment.kind === "syntax") {
        setErr(assessment.report);
        setStatusLine({ tone: "fail", text: `${assessment.label} on line ${assessment.issue.line} · nothing ran` });
        return;
      }
      const stats = measureRun(source, language);
      setOut(`stdin ← ${customVal.trim().split("\n").join("\n         ")}`);
      setStatusLine({ tone: "info", text: `Ran with custom input · ungraded, no verdict, no record · ${stats.durationMs} ms` });
      raise("succeeded", { runtime: `${stats.durationMs}ms` });
    }, 400);
  }

  function doSubmit() {
    if (!item || !detailData || phase !== "idle") return;
    if (detailData.judgeDown) {
      /* The platform's own failure — no row, no status change, never a wrong answer. */
      clearConsole();
      setVerdict({ kind: "fault", note: detailData.judgeDown });
      return;
    }
    const source = code;
    setPhase("submitting");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      const total = detailData.samples.length + detailData.hiddenCount;
      const assessment = assessSource(source, starterFor(item, language), language, fileName);
      const stats = measureRun(source, language, total);

      if (assessment.kind === "syntax") {
        recordSubmission({
          challengeId: item.id,
          language,
          verdict: "runtime_error",
          casesPassed: 0,
          casesTotal: total,
          code: source
        });
        setVerdict({
          kind: "wrong",
          note: "The program does not compile, so no case could run — recorded as a submission.",
          failingCase: `${assessment.label} on line ${assessment.issue.line}`
        });
        setErr(assessment.report);
        setResults(
          detailData.samples.map((s, i) => ({
            name: `Visible case ${i + 1}`,
            passed: false,
            input: s.input,
            expected: s.expected,
            actual: `${assessment.label} — the program did not run`
          }))
        );
        setStatusLine({ tone: "fail", text: `Submission recorded · 0/${total} cases` });
        return;
      }

      if (assessment.kind === "untouched") {
        const failing = detailData.samples[0];
        recordSubmission({
          challengeId: item.id,
          language,
          verdict: "wrong_answer",
          casesPassed: 0,
          casesTotal: total,
          code: source
        });
        setVerdict({
          kind: "wrong",
          note: "The starter stub cannot satisfy the cases — the wrong answer is on the submission, not on the platform.",
          failingCase: `Visible case 1 — expected ${failing?.expected ?? "the authored output"}`
        });
        setOut(`Verdict: WRONG ANSWER\nFailing: visible case 1\nRecorded as a submission — the challenge is now Submitted on your catalogue row.`);
        setResults(
          detailData.samples.map((s, i) => ({
            name: `Visible case ${i + 1}`,
            passed: false,
            durationMs: 0.1 + i * 0.04,
            input: s.input,
            expected: s.expected,
            actual: "(the starter's stub return)"
          }))
        );
        setStatusLine({ tone: "fail", text: `Submission recorded · 0/${total} cases · ${stats.durationMs} ms` });
        return;
      }

      const first = !store.solved.includes(item.id);
      recordSubmission({
        challengeId: item.id,
        language,
        verdict: "accepted",
        casesPassed: total,
        casesTotal: total,
        xpAward: xpFor(item.difficulty),
        code: source
      });
      setVerdict({ kind: "accepted", first });
      setOut(
        `Verdict: ACCEPTED — ${total}/${total} cases.\n` +
          (first
            ? `First acceptance: the solve, ${xpFor(item.difficulty)} XP and the editorial unlock are one outcome.`
            : "Already solved — this verdict is free practice; nothing further was paid or overwritten.")
      );
      setResults(
        detailData.samples.map((s, i) => ({
          name: `Visible case ${i + 1}`,
          passed: true,
          durationMs: stats.durationMs / total + i * 0.04,
          input: s.input,
          expected: s.expected
        }))
      );
      setStatusLine({ tone: "pass", text: `Accepted · ${total}/${total} cases · ${stats.durationMs} ms · ${stats.memoryMb.toFixed(1)} MB` });
      raise("accepted", { title: item.title });
      if (track && trackIndex >= 0) {
        const remaining = trackContents.filter((id) => !store.solved.includes(id) && id !== item.id);
        if (remaining.length === 0) markTrackCompleted(track.id, new Date().toISOString());
      }
    }, 800);
  }

  function doReset() {
    if (!item) return;
    if (!resetArm) { setResetArm(true); return; }
    const start = starterFor(item, language);
    clearChallengeDraft(draftKey);
    setCode(start);
    setRestored(null);
    setResetArm(false);
    clearConsole();
  }

  if (!item || !detailData) {
    return (
      <Page kind="sink" title="Challenge unavailable">
        <StateBlock state="unavailable" message="This problem cannot be opened." action={<Back to="/challenges">Catalogue</Back>} />
      </Page>
    );
  }

  const solved = store.solved.includes(item.id);
  const busy = phase !== "idle";
  const trackDone = track ? (TRACK_CONTENTS[track.id] ?? []).every((id) => store.solved.includes(id)) : false;

  const verdictBanner = verdict ? (
    verdict.kind === "accepted" ? (
      <div className="wb-verdict" data-tone="pass" role="status">
        <div className="wb-verdict__main">
          <Icon name="check" size={16} />
          <div>
            <p className="wb-verdict__title">Accepted</p>
            <p className="wb-verdict__note">
              {verdict.first
                ? `+${xpFor(item.difficulty)} XP — the solve and the editorial are recorded.`
                : "Already solved — free practice, nothing further paid."}
            </p>
          </div>
        </div>
        <div className="wb-verdict__actions">
          <Link className="btn btn--secondary" to={`/solutions/${item.id}`}>Open the editorial</Link>
          {nextInTrack ? (
            <Link className="btn btn--primary" to={`/challenges/${nextInTrack.id}?track=${track!.id}`}>
              Next in track: {nextInTrack.title}
            </Link>
          ) : nextUnsolved ? (
            <Link className="btn btn--primary" to={`/challenges/${nextUnsolved.id}${track ? `?track=${track.id}` : ""}`}>
              Next unsolved: {nextUnsolved.title}
            </Link>
          ) : null}
          {track && !nextInTrack ? <Link className="btn btn--quiet" to={`/tracks/${track.id}`}>Back to the track</Link> : null}
        </div>
      </div>
    ) : verdict.kind === "wrong" ? (
      <div className="wb-verdict" data-tone="fail" role="status">
        <div className="wb-verdict__main">
          <Icon name="error" size={16} />
          <div>
            <p className="wb-verdict__title">Wrong answer — {verdict.failingCase}</p>
            <p className="wb-verdict__note">{verdict.note} Your draft is still in the editor.</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="wb-verdict" data-tone="warn" role="alert">
        <div className="wb-verdict__main">
          <Icon name="alert" size={16} />
          <div>
            <p className="wb-verdict__title">Platform fault</p>
            <p className="wb-verdict__note">
              {verdict.note} Nothing was recorded — this is not a solve failure and your status is unchanged. Your code is still in the editor.
            </p>
          </div>
        </div>
        <div className="wb-verdict__actions">
          <button className="btn btn--secondary" type="button" onClick={doSubmit}>Retry grading</button>
        </div>
      </div>
    )
  ) : null;

  return (
    <Page
      kind="sink"
      kicker={track ? `${track.title} · ${trackIndex + 1} of ${trackContents.length}` : `Challenge · ${item.difficulty}`}
      title={item.title}
      lead={`${xpFor(item.difficulty)} XP on a first accept · ${detailData.samples.length} visible · ${detailData.hiddenCount} hidden · ${detailData.comparison}`}
      actions={
        <div className="row">
          <Back to={track ? `/tracks/${track.id}` : "/challenges"}>{track ? "Track" : "Catalogue"}</Back>
          <Menu
            trigger={<Icon name="more" size={16} />}
            triggerLabel={`Actions for ${item.title}`}
            align="end"
            items={[{ id: "report", label: "Report this challenge", icon: "alert" }]}
            onSelect={(id) => { if (id === "report") { setReportOpen(true); setReportSent(false); } }}
          />
        </div>
      }
    >
      {solved ? (
        <Card live>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              ✓ Solved on this device. Solving again is free practice — it changes nothing.
            </p>
            <Link className="btn btn--quiet" to={`/solutions/${item.id}`}>Open the editorial</Link>
          </div>
        </Card>
      ) : null}
      {track && trackDone ? (
        <Card live>
          <p style={{ margin: 0 }}>
            Track complete — every published entry is solved. Completion is recorded on this device and pays nothing further.
          </p>
        </Card>
      ) : null}

      <div className="solve-layout">
        {/* Statement pane */}
        <div className="solve-layout__brief">
          <Card>
            <CardHeader title="Problem statement" icon="challenges" />
            <p className="page__lead" style={{ whiteSpace: "pre-wrap" }}>{item.prompt}</p>

            {detailData.constraints.length > 0 ? (
              <div style={{ marginTop: "16px", padding: "12px", background: "var(--c-surface-inset)", borderRadius: "var(--radius-sm)" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "var(--text-xs)" }}>Constraints</h4>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--c-text-muted)" }}>
                  {detailData.constraints.map((c) => <li key={c}><code>{c}</code></li>)}
                </ul>
              </div>
            ) : null}

            {detailData.samples.length > 0 ? (
              <div style={{ marginTop: "12px" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "var(--text-xs)", color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Visible cases — Run executes these
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {detailData.samples.map((s, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      <div>{s.input}</div>
                      <div style={{ color: "var(--c-text-faint)" }}>→ {s.expected}</div>
                    </div>
                  ))}
                </div>
                <p className="meta" style={{ marginTop: "6px" }}>
                  + {detailData.hiddenCount} hidden cases on Submit — hidden material is never disclosed.
                </p>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
              {item.tags.map((t) => <span key={t} className="chip chip--quiet" style={{ fontSize: "11px" }}>{t}</span>)}
              {track ? <span className="chip" style={{ fontSize: "11px" }}>Track language: {TRACK_LANGUAGE[track.id] ?? "Python"}</span> : null}
            </div>

            <div style={{ marginTop: "16px" }}>
              <HintLadder
                rungs={detailData.hints}
                revealed={hintCount}
                onReveal={(n) => { setHintCount(n); raise("hint revealed", { rung: n }); }}
                emptyNote="No hint ladder was authored for this challenge."
              />
            </div>

            {restored ? <p className="meta" style={{ marginTop: "10px" }}>{restored}</p> : null}
          </Card>
        </div>

        {/* Work pane */}
        <div className="solve-layout__work">
          <CodeWorkbench
            label="Challenge workbench"
            fileName={fileName}
            onRun={doRun}
            onSubmit={doSubmit}
            busy={busy}
            toolbar={
              lockedLanguage ? (
                <span className="code-wb__chip" title="This track fixes one language">
                  {languageLabelOf(lockedLanguage)} · track language
                </span>
              ) : (
                <LanguageSelect
                  value={language}
                  onChange={(v) => changeLanguage(v as EditorLanguage)}
                  options={EDITOR_LANGUAGES.filter((l) => detailData.languages.includes(l.value))}
                  label="Language"
                  disabled={busy}
                />
              )
            }
            actions={
              <>
                <ToolButton icon="edit" onClick={() => setInputRequest((n) => n + 1)} title="Run your solution against an input of your own — ungraded">
                  Custom input
                </ToolButton>
                <ToolButton
                  icon="reset"
                  armed={resetArm}
                  onClick={doReset}
                  disabled={busy}
                  title="Replace the editor and the device draft with the authored starter"
                >
                  {resetArm ? "Confirm reset — replaces your draft" : "Reset"}
                </ToolButton>
              </>
            }
            editor={
              <CodeEditor
                value={code}
                onChange={persistCode}
                language={language}
                filename={fileName}
                path={`challenge/${item.id}/${language}/${fileName}`}
              />
            }
            console={
              <Terminal
                label="Challenge console"
                output={out}
                errorOutput={err}
                statusLine={statusLine}
                isExecuting={busy}
                statusText={
                  phase === "submitting"
                    ? "Submission grading against the full case set — pending, not failed."
                    : "Running the visible cases…"
                }
                onClear={clearConsole}
                testCases={results}
                hiddenCount={detailData.hiddenCount}
                banner={verdictBanner}
                input={{
                  value: customVal,
                  onChange: setCustomVal,
                  label: "Custom input",
                  placeholder: detailData.samples[0]?.input ?? "one input line",
                  note: "Ungraded — a custom run produces no verdict and no record.",
                  action: (
                    <RunButton
                      onClick={doRunCustom}
                      running={phase === "running"}
                      disabled={busy}
                      label="Run with this input"
                      shortcut={false}
                    />
                  )
                }}
                inputRequest={inputRequest}
              />
            }
            footer={
              <>
                <RunButton onClick={doRun} running={phase === "running"} disabled={busy} title="Run the visible cases — records nothing" />
                <SubmitButton onClick={doSubmit} pending={phase === "submitting"} disabled={busy} label="Submit" title="Grade the full case set — recorded as a submission" />
              </>
            }
          />

          {/* The learner's own submissions on this challenge — the shared record. */}
          {store.submissions.filter((s) => s.challengeId === item.id).length > 0 ? (
            <Card>
              <CardHeader title="Your submissions" icon="history" />
              <List>
                {store.submissions.filter((s) => s.challengeId === item.id).map((s) => (
                  <ListRow key={s.id} as="div" align="center">
                    <div style={{ flex: 1 }}>
                      <span className={`chip ${s.verdict === "accepted" ? "" : "chip--quiet"}`} style={{ fontSize: "11px" }}>
                        {s.verdict === "accepted" ? "Accepted" : s.verdict === "wrong_answer" ? "Wrong answer" : s.verdict === "runtime_error" ? "Runtime error" : "Time limit"}
                      </span>
                      <p className="meta" style={{ margin: "2px 0 0" }}>
                        {new Date(s.at).toLocaleString()} · {s.language} · {s.casesPassed}/{s.casesTotal} cases
                      </p>
                    </div>
                  </ListRow>
                ))}
              </List>
            </Card>
          ) : null}
        </div>
      </div>

      {/* The Report menu's content report — one reason, an optional note. */}
      <Dialog
        open={reportOpen}
        title={`Report ${item.title}`}
        icon="alert"
        onClose={() => setReportOpen(false)}
        actions={
          <>
            <button className="btn btn--quiet" type="button" onClick={() => setReportOpen(false)}>Cancel</button>
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => {
                fileContentReport(item.title, reportReason, reportNote);
                setReportSent(true);
              }}
            >
              File report
            </button>
          </>
        }
      >
        {reportSent ? (
          <p className="page__lead">Filed — it lands in Administration's content-report queue under Challenges.</p>
        ) : (
          <>
            <label className="field">
              <span className="meta">Reason</span>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="incorrect">Incorrect content</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="field" style={{ marginTop: "var(--space-3)" }}>
              <span className="meta">Note (optional)</span>
              <textarea value={reportNote} onChange={(e) => setReportNote(e.target.value)} />
            </label>
          </>
        )}
      </Dialog>
    </Page>
  );
}

function languageLabelOf(value: string): string {
  return EDITOR_LANGUAGES.find((l) => l.value === value)?.label ?? value;
}
