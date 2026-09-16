/**
 * DebugSolve — one case file. The mode is chosen before the focused solver
 * opens (debug/01 "Solve workbench", debug §4.5):
 *
 *   - Practice is always open — before, during and after any timed window.
 *   - A timed case offers Start timed window while the learner's allowance
 *     lasts; the press is the explicit start, stamps the authored limit and
 *     spends one window. A second case can never start while a window runs —
 *     the refusal names the running case and offers resume.
 *   - Inside the solver, Run is free practice on the visible samples (or one
 *     custom input, ungraded); Validate Fix grades the full case set and is
 *     the submission of record. The checkpoint line states whether the
 *     editor's contents are the acknowledged ones the deadline would grade.
 *   - Finish now confirms, then submits the acknowledged checkpoint as one
 *     graded run; the clock running out freezes and grades the same. A window
 *     the platform cannot complete is invalidated — the allowance is restored
 *     and no verdict is invented.
 *
 * A program that does not compile fails in the compiler's words and runs no
 * case. Changes compares the editor against the authored broken program.
 *
 * The demo's judge is the same honest proxy as the challenge workbench: the
 * untouched broken program still reproduces the planted fault (a real wrong
 * answer naming the first visible case); a changed program is the attempted
 * fix. A first acceptance stamps the fix, pays the difficulty award once and
 * unlocks the debrief; only a timed acceptance is evidence.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { DEBUG_CASES } from "@data/catalog";
import {
  clearChallengeDraft,
  endDebugWindow,
  fileContentReport,
  invalidateDebugWindow,
  recordDebugSubmission,
  saveChallengeDraft,
  startDebugWindow
} from "@state/store";
import { raise } from "@companion/stream";
import { useStore } from "@state/useStore";
import {
  CodeDiff,
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
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Menu } from "../../extraction/components/Menu/Menu";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { ConfirmDialog } from "../../extraction/components/Dialog/Dialog.variants";
import { debugMetaFor, debugXp } from "./cases";

type Phase = "idle" | "running" | "validating";
type TimedEnding = "all-pass" | "finish-now" | "clock" | "invalidated";
type Verdict =
  | { kind: "accepted"; first: boolean; timed: boolean; ending?: TimedEnding }
  | { kind: "wrong"; failingCase: string; timed: boolean; ending?: TimedEnding }
  | { kind: "invalidated"; note: string }
  | null;

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function DebugSolve() {
  const { caseId } = useParams();
  const item = DEBUG_CASES.find((c) => c.id === caseId);
  const meta = item ? debugMetaFor(item.id) : null;
  const store = useStore();

  const [inSolver, setInSolver] = useState(false);
  const [code, setCode] = useState("");
  /* The last contents the platform acknowledged — Run, Validate, Finish now
     and a short idle each acknowledge; it is what a deadline grades. */
  const [checkpoint, setCheckpoint] = useState("");
  const checkpointRef = useRef("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [out, setOut] = useState<string | null>(null);
  const [results, setResults] = useState<TerminalTestCase[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [err, setErr] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<TerminalStatusLine | null>(null);
  const [showChanges, setShowChanges] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [resetArm, setResetArm] = useState(false);
  const [restoreArm, setRestoreArm] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("incorrect");
  const [reportNote, setReportNote] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [bugCallout, setBugCallout] = useState(false);
  const [restored, setRestored] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [startRefused, setStartRefused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const idleRef = useRef<number | null>(null);
  /* Which window's deadline already finalized — a fresh window gets a fresh
     endsAt, so a second window's clock-out still grades. */
  const finalizedForRef = useRef<string | null>(null);

  const draftKey = item ? `debug:${item.id}` : "";
  const fileName = meta ? `case.${extensionFor(meta.language)}` : "case.txt";
  const activeWindow = store.debugWindow;
  const windowHere = Boolean(item && activeWindow?.caseId === item.id);
  const windowElsewhere = Boolean(activeWindow && !windowHere);
  const otherWindowCase = windowElsewhere && activeWindow ? DEBUG_CASES.find((c) => c.id === activeWindow.caseId) ?? null : null;
  const endsAt = windowHere && activeWindow ? Date.parse(activeWindow.endsAt) : 0;
  const remainingMs = windowHere ? endsAt - now : 0;
  const windowLive = windowHere && remainingMs > 0;
  const timed = windowLive;

  const solved = item ? store.debugResolved.includes(item.id) : false;
  const used = item ? store.debugWindowsUsed[item.id] ?? 0 : 0;
  const allowanceTotal = meta?.timedAllowance ?? 0;
  const allowanceLeft = Math.max(0, allowanceTotal - used);
  const lastSubmitted = item
    ? store.debugSubmissions.find((s) => s.caseId === item.id && s.code) ?? null
    : null;

  function clearConsole() {
    setOut(null);
    setErr(null);
    setStatusLine(null);
    setVerdict(null);
    setResults([]);
  }

  function acknowledge(contents: string) {
    checkpointRef.current = contents;
    setCheckpoint(contents);
  }

  /* Seed the editor: the device draft for this case, else the authored broken
     program — which is itself the first acknowledged checkpoint. */
  useEffect(() => {
    if (!item || !meta) return;
    const draft = store.challengeDrafts[`debug:${item.id}`];
    const start = draft ?? meta.broken;
    setCode(start);
    acknowledge(start);
    setRestored(draft !== undefined && draft !== meta.broken ? "Your device draft was restored — it is the acknowledged checkpoint." : null);
    clearConsole();
    setShowChanges(false);
    setResetArm(false);
    setRestoreArm(false);
    setBugCallout(false);
    setStartRefused(false);
    finalizedForRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  /* The clock ticks while any window is live — it never pauses, and the
     other-case countdown on the choice screen stays honest. */
  useEffect(() => {
    if (!activeWindow) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [activeWindow?.endsAt]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (idleRef.current !== null) window.clearTimeout(idleRef.current);
    },
    []
  );

  /* The window's clock ran out: freeze the acknowledged checkpoint and grade
     it once — that outcome is the window's result. If the case's material can
     no longer be read the platform invalidates instead and restores the
     allowance; no verdict is invented. */
  useEffect(() => {
    if (!windowHere || !activeWindow || remainingMs > 0 || !item) return;
    if (finalizedForRef.current === activeWindow.endsAt) return;
    finalizedForRef.current = activeWindow.endsAt;
    if (!meta) {
      invalidateDebugWindow(item.id);
      setVerdict({ kind: "invalidated", note: "The case's material could not be read when the window ended." });
      return;
    }
    grade(checkpointRef.current, "clock");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowHere, remainingMs <= 0, activeWindow?.endsAt]);

  function persistCode(next: string) {
    setCode(next);
    if (draftKey) saveChallengeDraft(draftKey, next);
    /* Editing leaves the checkpoint behind; a short idle acknowledges the
       latest contents, the same as an explicit Run does. */
    if (idleRef.current !== null) window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => acknowledge(next), 1500);
  }

  /* Run — free practice on the visible samples. Records nothing; inside a
     timed window it acknowledges the editor as the checkpoint. */
  function doRun() {
    if (!item || !meta || phase !== "idle") return;
    const source = code;
    acknowledge(source);
    setPhase("running");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      const assessment = assessSource(source, meta.broken, meta.language, fileName);
      const stats = measureRun(source, meta.language, meta.visible.length);
      if (assessment.kind === "syntax") {
        setErr(assessment.report);
        setResults(
          meta.visible.map((s, i) => ({
            name: `Visible case ${i + 1}`,
            passed: false,
            input: s.input,
            expected: s.expected,
            actual: `${assessment.label} — the program did not run`
          }))
        );
        setStatusLine({ tone: "fail", text: `${assessment.label} on line ${assessment.issue.line} · nothing ran · nothing recorded` });
        return;
      }
      const stillBroken = assessment.kind === "untouched";
      const rows: TerminalTestCase[] = meta.visible.map((s, i) => ({
        name: `Visible case ${i + 1}`,
        passed: !stillBroken,
        durationMs: stats.durationMs / Math.max(1, meta.visible.length) + i * 0.05,
        input: s.input,
        expected: s.expected,
        actual: stillBroken ? "(the planted fault still reproduces)" : s.expected
      }));
      setResults(rows);
      if (stillBroken && !bugCallout) setBugCallout(true);
      setOut(
        stillBroken
          ? `Ran the ${rows.length} visible case${rows.length === 1 ? "" : "s"} — the planted fault still reproduces.\nA run is not a validation: nothing was recorded.`
          : `Ran the ${rows.length} visible case${rows.length === 1 ? "" : "s"} — all passed.\nA run is not a validation: nothing was recorded. Validate Fix grades the full set of ${meta.visible.length + meta.hiddenCount} cases.`
      );
      setStatusLine(
        stillBroken
          ? { tone: "fail", text: `The planted fault reproduces · ${stats.durationMs} ms · nothing recorded` }
          : { tone: "pass", text: `${rows.length}/${rows.length} visible cases passed · ${stats.durationMs} ms · ${stats.memoryMb.toFixed(1)} MB` }
      );
    }, 500);
  }

  /* Validate Fix — grades the full case set; the submission of record. */
  function doValidate() {
    if (!item || !meta || phase !== "idle") return;
    const source = code;
    acknowledge(source);
    setPhase("validating");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      grade(source);
    }, 800);
  }

  /* The one grading path — used by Validate, Finish now and the clock. A
     learner-result ending closes the window; a wrong answer inside a live
     window does not (the learner keeps working until an ending). */
  function grade(source: string, ending?: "finish-now" | "clock" | "all-pass") {
    if (!item || !meta) return;
    clearConsole();
    const total = meta.visible.length + meta.hiddenCount;
    const assessment = assessSource(source, meta.broken, meta.language, fileName);
    const stats = measureRun(source, meta.language, total);
    const inWindow = timed || ending === "finish-now" || ending === "clock";
    if (assessment.kind !== "changed") {
      const syntax = assessment.kind === "syntax" ? assessment : null;
      recordDebugSubmission({
        caseId: item.id,
        language: meta.language,
        verdict: syntax ? "runtime_error" : "wrong_answer",
        casesPassed: 0,
        casesTotal: total,
        code: source
      });
      const failing = meta.visible[0];
      setVerdict({
        kind: "wrong",
        timed: inWindow,
        ending,
        failingCase: syntax
          ? `${syntax.label} on line ${syntax.issue.line} — the program did not run`
          : `Visible case 1 — expected ${failing?.expected ?? "the authored output"}`
      });
      if (syntax) {
        setErr(syntax.report);
      } else {
        setOut(
          `Verdict: NOT FIXED\nFailing: visible case 1 — the planted fault still reproduces.\nRecorded as a validation of record${inWindow ? "; the window continues until an ending" : ""}.`
        );
      }
      setResults(
        meta.visible.map((s, i) => ({
          name: `Visible case ${i + 1}`,
          passed: false,
          ...(syntax ? {} : { durationMs: 0.1 + i * 0.04 }),
          input: s.input,
          expected: s.expected,
          actual: syntax ? `${syntax.label} — the program did not run` : "(the planted fault still reproduces)"
        }))
      );
      setStatusLine({ tone: "fail", text: `Validation recorded · 0/${total} cases` });
      raise("not accepted", { title: item.title });
      if (ending) endDebugWindow();
      return;
    }
    const first = !store.debugResolved.includes(item.id);
    recordDebugSubmission({
      caseId: item.id,
      language: meta.language,
      verdict: "accepted",
      casesPassed: total,
      casesTotal: total,
      xpAward: debugXp(item.difficulty),
      code: source
    });
    if (inWindow || windowHere) {
      endDebugWindow();
      ending = ending ?? "all-pass";
    }
    setVerdict({ kind: "accepted", first, timed: inWindow, ending });
    setOut(
      `Verdict: FIXED — ${total}/${total} cases pass.\n` +
        (first
          ? `First acceptance: the fix, +${debugXp(item.difficulty)} XP and the debrief unlock are one outcome.${inWindow ? " Recorded as timed evidence at practice weight." : " Practice acceptances create no evidence."}`
          : "Already fixed — this validation is free practice; nothing further was paid.")
    );
    setResults(
      meta.visible.map((s, i) => ({
        name: `Visible case ${i + 1}`,
        passed: true,
        durationMs: stats.durationMs / total + i * 0.04,
        input: s.input,
        expected: s.expected
      }))
    );
    setStatusLine({ tone: "pass", text: `Fixed · ${total}/${total} cases · ${stats.durationMs} ms · ${stats.memoryMb.toFixed(1)} MB` });
    raise("accepted", { title: item.title });
  }

  /* Finish now — the learner confirms, then the acknowledged checkpoint is
     submitted as one graded run and the window ends. */
  function doFinishNow() {
    if (!item || !meta || !windowHere) return;
    setFinishOpen(false);
    grade(checkpointRef.current, "finish-now");
  }

  function doReset() {
    if (!item || !meta) return;
    if (!resetArm) { setResetArm(true); setRestoreArm(false); return; }
    clearChallengeDraft(draftKey);
    setCode(meta.broken);
    acknowledge(meta.broken);
    setRestored(null);
    setResetArm(false);
    clearConsole();
  }

  function doRestore() {
    if (!lastSubmitted?.code) return;
    if (!restoreArm) { setRestoreArm(true); setResetArm(false); return; }
    persistCode(lastSubmitted.code);
    acknowledge(lastSubmitted.code);
    setRestoreArm(false);
  }

  function doStartTimed() {
    if (!item || !meta || meta.mode !== "timed" || meta.timedMinutes === null) return;
    /* One timed window across the domain — startDebugWindow refuses while
       another runs; a refused start spends nothing and says so. */
    if (!startDebugWindow(item.id, meta.timedMinutes)) {
      setStartRefused(true);
      return;
    }
    setStartRefused(false);
    acknowledge(code);
    setInSolver(true);
  }

  /* ── Unresolvable and cannot-verify states, before anything else ──────── */

  if (!item) {
    return (
      <Page kind="sink" title="Case unavailable">
        <StateBlock state="unavailable" message="This case cannot be opened." action={<Back to="/debug">Cases</Back>} />
      </Page>
    );
  }
  if (!meta) {
    return (
      <Page kind="sink" title={item.title}>
        <StateBlock
          state="unavailable"
          message="This case's authored material cannot be read — the platform cannot verify a fix here. Nothing was recorded."
          action={<Back to="/debug">Cases</Back>}
        />
      </Page>
    );
  }

  /* ── The mode choice — before the focused solver (debug.F12) ──────────── */

  if (!inSolver && !windowHere) {
    return (
      <Page
        kind="sink"
        kicker={`Debug · ${item.difficulty}`}
        title={item.title}
        lead={item.brief}
        actions={<Back to="/debug">Cases</Back>}
      >
        {solved ? (
          <Card live>
            <p style={{ margin: 0, fontWeight: 600 }}>
              ✓ Fixed on this device. Going back in is free practice — it pays nothing further, and the debrief below stays unlocked.
            </p>
          </Card>
        ) : null}
        {windowElsewhere && activeWindow ? (
          <Card>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <p className="micro" style={{ margin: 0, color: "var(--c-text-faint)" }}>ONE TIMED WINDOW AT A TIME</p>
                <p style={{ margin: "4px 0 0" }}>
                  A timed window is running on <strong>{otherWindowCase?.title ?? "another case"}</strong>
                  {Date.parse(activeWindow.endsAt) - Date.now() > 0
                    ? ` — ${formatClock(Date.parse(activeWindow.endsAt) - Date.now())} left.`
                    : " — its clock has run out and it finalises on that case's page."}
                </p>
              </div>
              {otherWindowCase ? (
                <Link className="btn btn--secondary" to={`/debug/${otherWindowCase.id}`}>Resume that window</Link>
              ) : null}
            </div>
          </Card>
        ) : null}

        <div className="grid-2">
          <Card>
            <CardHeader title="Case file" icon="debug" />
            <p className="page__lead">{item.brief}</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
              {meta.bugTypes.map((t) => <span key={t} className="chip chip--quiet" style={{ fontSize: "11px" }}>{t}</span>)}
              <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{meta.bugCount} planted bug{meta.bugCount === 1 ? "" : "s"}</span>
              <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{meta.languageLabel}</span>
              <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{debugXp(item.difficulty)} XP on a first fix</span>
            </div>
            <p className="meta" style={{ marginTop: "var(--space-3)" }}>
              {meta.visible.length} visible case{meta.visible.length === 1 ? "" : "s"} · {meta.hiddenCount} hidden on Validate Fix · output compared as printed.
            </p>
          </Card>

          <Card>
            <CardHeader title="Choose how to enter" icon="clock" />
            {meta.mode === "timed" ? (
              <>
                <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
                  Timed-then-practice — a timed window is <strong>{meta.timedMinutes} minutes</strong>, never pauses, and an
                  acceptance inside it is the evidence this case produces. You have{" "}
                  <strong>{allowanceLeft} of {allowanceTotal}</strong> windows left on this case.
                </p>
                <div className="row" style={{ marginTop: "var(--space-4)", flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
                  {windowElsewhere ? (
                    <p className="meta" style={{ margin: 0 }}>Start is refused while the other window runs — a refused start spends nothing.</p>
                  ) : allowanceLeft === 0 ? (
                    <p className="meta" style={{ margin: 0 }}>The timed allowance on this case is spent — unlimited practice stays open, no dead end.</p>
                  ) : (
                    <button className="btn btn--primary" type="button" onClick={doStartTimed}>
                      <Icon name="clock" size={14} /> Start timed window — {meta.timedMinutes} min
                    </button>
                  )}
                  <button className="btn btn--secondary" type="button" onClick={() => setInSolver(true)}>
                    Open in practice — free, no clock
                  </button>
                </div>
                {startRefused ? (
                  <p className="meta" style={{ marginTop: "var(--space-2)" }}>
                    The start was refused — a timed window is already running elsewhere. Nothing was spent.
                  </p>
                ) : null}
                <p className="meta" style={{ marginTop: "var(--space-3)" }}>
                  Starting spends one window the moment the clock stamps. Practice costs nothing and is always open.
                </p>
              </>
            ) : (
              <>
                <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
                  Practice only — this case was authored without a timed window. Runs are free, hints cost nothing, and a
                  first fix still pays the award and unlocks the debrief.
                </p>
                <div className="row" style={{ marginTop: "var(--space-4)" }}>
                  <button className="btn btn--primary" type="button" onClick={() => setInSolver(true)}>
                    Open in practice
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      </Page>
    );
  }

  /* ── The focused solver ─────────────────────────────────────────────── */

  const acknowledged = code === checkpoint;
  const busy = phase !== "idle";

  const endingNote = (v: { ending?: TimedEnding }, accepted: boolean): string =>
    v.ending === "all-pass"
      ? "The window closed on the all-pass — counted as timed evidence."
      : v.ending === "finish-now"
        ? accepted
          ? "Finished now — your acknowledged checkpoint was graded; the window is closed and this counts as timed evidence."
          : "Finished now — the acknowledged checkpoint was graded; the window is closed and practice stays open."
        : v.ending === "clock"
          ? accepted
            ? "The clock ran out — your last acknowledged checkpoint was graded; this counts as timed evidence."
            : "The clock ran out — the last acknowledged checkpoint was graded; the window is closed and practice stays open."
          : "";

  const verdictBanner = verdict ? (
    verdict.kind === "accepted" ? (
      <div className="wb-verdict" data-tone="pass" role="status">
        <div className="wb-verdict__main">
          <Icon name="check" size={16} />
          <div>
            <p className="wb-verdict__title">
              Fixed{verdict.first ? ` — +${debugXp(item.difficulty)} XP and the debrief are unlocked` : " — already fixed; free practice, nothing further paid"}
            </p>
            <p className="wb-verdict__note">
              {[endingNote(verdict, true), verdict.timed ? "" : "Practice acceptances create no evidence."].filter(Boolean).join(" ")}
            </p>
          </div>
        </div>
      </div>
    ) : verdict.kind === "wrong" ? (
      <div className="wb-verdict" data-tone="fail" role="status">
        <div className="wb-verdict__main">
          <Icon name="error" size={16} />
          <div>
            <p className="wb-verdict__title">Not fixed — {verdict.failingCase}</p>
            <p className="wb-verdict__note">
              {[
                endingNote(verdict, false),
                verdict.timed && !verdict.ending ? "The window keeps running — a failed validation is not an ending." : "",
                verdict.timed ? "" : "Your edits are still in the editor."
              ]
                .filter(Boolean)
                .join(" ")}
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className="wb-verdict" data-tone="warn" role="alert">
        <div className="wb-verdict__main">
          <Icon name="alert" size={16} />
          <div>
            <p className="wb-verdict__title">Window invalidated — the platform's side failed.</p>
            <p className="wb-verdict__note">
              {verdict.note} Nothing was graded and the spent allowance was restored — this is not a failure of yours.
            </p>
          </div>
        </div>
      </div>
    )
  ) : null;

  return (
    <Page
      kind="sink"
      kicker={timed ? `Debug · timed window — ${formatClock(remainingMs)} left` : `Debug · practice`}
      title={item.title}
      lead={`${debugXp(item.difficulty)} XP on a first fix · ${meta.visible.length} visible · ${meta.hiddenCount} hidden · ${meta.languageLabel}`}
      actions={
        <div className="row">
          <Back to="/debug">Cases</Back>
          <Menu
            trigger={<Icon name="more" size={16} />}
            triggerLabel={`Actions for ${item.title}`}
            align="end"
            items={[{ id: "report", label: "Report this case", icon: "alert" }]}
            onSelect={(id) => { if (id === "report") { setReportOpen(true); setReportSent(false); } }}
          />
        </div>
      }
    >
      {solved ? (
        <Card live>
          <p style={{ margin: 0, fontWeight: 600 }}>
            ✓ Fixed on this device — re-running is free practice worth nothing further. The debrief is unlocked below.
          </p>
        </Card>
      ) : null}
      {timed && activeWindow ? (
        <Card live>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <p className="micro" style={{ margin: 0, color: "var(--c-text-faint)" }}>TIMED WINDOW — THE CLOCK KEEPS RUNNING WHILE YOU READ</p>
              <p style={{ margin: "4px 0 0", fontWeight: 600 }}>
                {formatClock(remainingMs)} left of {activeWindow.minutes} min ·{" "}
                {acknowledged ? "the editor's contents are acknowledged as the checkpoint" : "editing — the latest contents are not yet acknowledged"}
              </p>
            </div>
            <button className="btn btn--secondary" type="button" onClick={() => setFinishOpen(true)}>
              Finish now
            </button>
          </div>
        </Card>
      ) : windowHere && activeWindow ? (
        <Card>
          <p className="meta" style={{ margin: 0 }}>The window's clock has run out — the last acknowledged checkpoint is being graded.</p>
        </Card>
      ) : null}

      <div className="solve-layout">
        {/* Case file pane */}
        <div className="solve-layout__brief">
          <Card>
            <CardHeader title="Case file" icon="debug" />
            <p className="page__lead" style={{ whiteSpace: "pre-wrap" }}>{item.brief}</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
              {meta.bugTypes.map((t) => <span key={t} className="chip chip--quiet" style={{ fontSize: "11px" }}>{t}</span>)}
              <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{meta.bugCount} planted bug{meta.bugCount === 1 ? "" : "s"}</span>
            </div>

            {meta.visible.length > 0 ? (
              <div style={{ marginTop: "12px" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "var(--text-xs)", color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Visible cases — Run executes these
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {meta.visible.map((s, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      <div>{s.input}</div>
                      <div style={{ color: "var(--c-text-faint)" }}>→ {s.expected}</div>
                    </div>
                  ))}
                </div>
                <p className="meta" style={{ marginTop: "6px" }}>
                  + {meta.hiddenCount} hidden case{meta.hiddenCount === 1 ? "" : "s"} on Validate Fix — hidden material is never disclosed.
                </p>
              </div>
            ) : null}

            {bugCallout ? (
              <div style={{ marginTop: "12px", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", border: "1px solid var(--c-border-strong)" }}>
                <p style={{ margin: 0, fontSize: "12px" }}>
                  <strong>This is the bug.</strong> The program in the editor is the case's broken program — the fault you just watched reproduce is the one to repair.
                </p>
              </div>
            ) : null}

            <div style={{ marginTop: "16px" }}>
              <HintLadder
                rungs={meta.hints}
                revealed={hintCount}
                onReveal={(n) => { setHintCount(n); raise("hint revealed", { rung: n }); }}
                emptyNote="No hint ladder was authored for this case."
              />
            </div>
            {restored ? <p className="meta" style={{ marginTop: "10px" }}>{restored}</p> : null}
          </Card>

          {solved && meta.debrief ? (
            <Card>
              <CardHeader title="Debrief — unlocked by your first accepted fix" icon="solutions" />
              <dl style={{ margin: 0, fontSize: "var(--text-sm)" }}>
                <dt className="meta" style={{ marginTop: "8px" }}>Root cause</dt>
                <dd style={{ margin: "2px 0 0" }}>{meta.debrief.rootCause}</dd>
                <dt className="meta" style={{ marginTop: "8px" }}>Why it fails</dt>
                <dd style={{ margin: "2px 0 0" }}>{meta.debrief.whyFails}</dd>
                <dt className="meta" style={{ marginTop: "8px" }}>The repair</dt>
                <dd style={{ margin: "2px 0 0" }}>{meta.debrief.repair}</dd>
                <dt className="meta" style={{ marginTop: "8px" }}>Edge case</dt>
                <dd style={{ margin: "2px 0 0" }}>{meta.debrief.edgeCase}</dd>
                <dt className="meta" style={{ marginTop: "8px" }}>Corrected line</dt>
                <dd style={{ margin: "2px 0 0" }}><code>{meta.debrief.corrected}</code></dd>
                {meta.debrief.note ? (
                  <>
                    <dt className="meta" style={{ marginTop: "8px" }}>Note</dt>
                    <dd style={{ margin: "2px 0 0" }}>{meta.debrief.note}</dd>
                  </>
                ) : null}
              </dl>
            </Card>
          ) : null}
        </div>

        {/* Work pane */}
        <div className="solve-layout__work">
          <CodeWorkbench
            label="Debug workbench"
            fileName={fileName}
            onRun={doRun}
            onSubmit={doValidate}
            busy={busy}
            toolbar={
              <>
                <span className="code-wb__chip" title="This case is authored in one language">
                  {meta.languageLabel}
                </span>
                {timed ? (
                  <span
                    className="code-wb__hint"
                    data-tone={acknowledged ? undefined : "warn"}
                    title="The acknowledged checkpoint is what a deadline grades"
                  >
                    <Icon name={acknowledged ? "check" : "clock"} size={12} />
                    <span>{acknowledged ? "Checkpoint acknowledged" : "Latest edits not yet acknowledged"}</span>
                  </span>
                ) : null}
              </>
            }
            actions={
              <>
                <ToolButton
                  icon="layers"
                  on={showChanges}
                  onClick={() => setShowChanges((v) => !v)}
                  title="Compare your version with the case's broken program"
                >
                  Changes
                </ToolButton>
                {lastSubmitted ? (
                  <ToolButton
                    icon="history"
                    armed={restoreArm}
                    onClick={doRestore}
                    disabled={busy}
                    title="Replace the editor with your last submitted source for this case"
                  >
                    {restoreArm ? "Confirm restore — replaces the editor" : "Restore last submitted"}
                  </ToolButton>
                ) : null}
                <ToolButton
                  icon="reset"
                  armed={resetArm}
                  onClick={doReset}
                  disabled={busy}
                  title="Replace the editor and the device draft with the authored broken program"
                >
                  {resetArm ? "Confirm reset — your edits are replaced" : "Reset"}
                </ToolButton>
              </>
            }
            editor={
              showChanges ? (
                <CodeDiff
                  original={meta.broken}
                  modified={code}
                  language={meta.language}
                  modelKey={`debug/${item.id}`}
                  originalLabel="Broken program"
                  modifiedLabel="Your version"
                />
              ) : (
                <CodeEditor
                  value={code}
                  onChange={persistCode}
                  language={meta.language}
                  filename={fileName}
                  path={`debug/${item.id}/${fileName}`}
                />
              )
            }
            console={
              <Terminal
                label="Debug console"
                output={out}
                errorOutput={err}
                statusLine={statusLine}
                isExecuting={busy}
                statusText={
                  phase === "validating"
                    ? "Validating the fix against the full case set — pending, not failed."
                    : "Running the visible cases…"
                }
                onClear={clearConsole}
                testCases={results}
                hiddenCount={meta.hiddenCount}
                banner={verdictBanner}
              />
            }
            footer={
              <>
                <RunButton onClick={doRun} running={phase === "running"} disabled={busy} title="Run the visible cases — free practice, records nothing" />
                <SubmitButton
                  onClick={doValidate}
                  pending={phase === "validating"}
                  disabled={busy}
                  label="Validate fix"
                  pendingLabel="Validating…"
                  title="Grade the full case set — recorded as a validation"
                />
              </>
            }
          />

          {store.debugSubmissions.filter((s) => s.caseId === item.id).length > 0 ? (
            <Card>
              <CardHeader title="Your validations" icon="history" />
              <List>
                {store.debugSubmissions.filter((s) => s.caseId === item.id).map((s) => (
                  <ListRow key={s.id} as="div" align="center">
                    <div style={{ flex: 1 }}>
                      <span className={`chip ${s.verdict === "accepted" ? "" : "chip--quiet"}`} style={{ fontSize: "11px" }}>
                        {s.verdict === "accepted" ? "Fixed" : s.verdict === "wrong_answer" ? "Not fixed" : s.verdict === "runtime_error" ? "Runtime error" : "Time limit"}
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

      {/* Finish now — confirms, then the acknowledged checkpoint is graded and
          the window ends. */}
      <ConfirmDialog
        open={finishOpen}
        title="Finish this window now?"
        confirmLabel="Finish now — submit the checkpoint"
        onConfirm={doFinishNow}
        onClose={() => setFinishOpen(false)}
      >
        <p>
          The acknowledged checkpoint — {acknowledged ? "what is in the editor now" : "the last acknowledged contents, not your latest edits"} —
          is submitted against the full case set as the window's one result. This spends the window.
        </p>
      </ConfirmDialog>

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
                fileContentReport(item.title, reportReason, reportNote, "debug", `/debug/${item.id}`);
                setReportSent(true);
              }}
            >
              File report
            </button>
          </>
        }
      >
        {reportSent ? (
          <p className="page__lead">Filed — it lands in Administration's content-report queue under Debug.</p>
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
