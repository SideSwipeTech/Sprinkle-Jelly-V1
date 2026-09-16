/**
 * DailySolve — the Daily's own workbench, addressed by product date.
 *
 * One address per product date: /daily/solve is today, /daily/:dayId accepts
 * a date or a challenge id (legacy archive links still land). A voided date
 * is a recorded neutral day; a future date answers "unavailable" without
 * disclosing tomorrow's item; a neutral date says nothing was scheduled.
 *
 * Inside, the same honesty as the challenge workbench: Run checks the
 * visible samples only, Submit grades the full set, a platform fault is the
 * platform's — never a false learner failure — a program that does not
 * compile says so in the compiler's words, and a first acceptance stamps the
 * day's completion, its award and the underlying solve as one outcome.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import {
  markDailySolved,
  recordSubmission,
  saveChallengeDraft,
  clearChallengeDraft
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
import {
  detailFor,
  starterFor,
  xpFor,
  EDITOR_LANGUAGES,
  type EditorLanguage
} from "../practice/data";
import {
  PRODUCT_TODAY,
  DAILY_BONUS_XP,
  formatProductDay,
  openCatchUp,
  resolveDayParam,
  stateForDate
} from "./schedule";

type Phase = "idle" | "running" | "submitting";
type Verdict =
  | { kind: "accepted"; firstSolve: boolean }
  | { kind: "wrong"; failingCase: string; note?: string }
  | { kind: "fault"; note: string }
  | null;

export function DailySolve() {
  const { dayId } = useParams();
  const store = useStore();
  const date = resolveDayParam(dayId);
  const state = date ? stateForDate(date) : null;

  const [language, setLanguage] = useState<EditorLanguage>("python");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [out, setOut] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<TerminalStatusLine | null>(null);
  const [results, setResults] = useState<TerminalTestCase[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [resetArm, setResetArm] = useState(false);
  const timerRef = useRef<number | null>(null);

  const challenge = state?.kind === "scheduled" ? state.challenge : null;
  const detail = challenge ? detailFor(challenge.id) : null;
  const isCatchUp = Boolean(date && date < PRODUCT_TODAY);
  const dateSolved = Boolean(date && store.dailySolved.includes(date));

  function clearConsole() {
    setOut(null);
    setErr(null);
    setStatusLine(null);
    setVerdict(null);
    setResults([]);
  }

  /* Seed the editor from the device draft for this challenge + language —
     the same draft the catalogue workbench would restore. */
  useEffect(() => {
    if (!challenge) return;
    const lang = "python";
    setLanguage(lang);
    const draft = store.challengeDrafts[`${challenge.id}:${lang}`];
    const start = starterFor(challenge, lang);
    setCode(draft ?? start);
    setRestored(draft !== undefined && draft !== start ? "Your device draft was restored." : null);
    clearConsole();
    setResetArm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id]);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  const draftKey = challenge ? `${challenge.id}:${language}` : "";
  const fileName = date ? `daily-${date}.${extensionFor(language)}` : `daily.${extensionFor(language)}`;

  function changeLanguage(next: EditorLanguage) {
    if (!challenge) return;
    setLanguage(next);
    const draft = store.challengeDrafts[`${challenge.id}:${next}`];
    const start = starterFor(challenge, next);
    setCode(draft ?? start);
    setRestored(draft !== undefined && draft !== start ? "Your device draft was restored." : null);
    clearConsole();
    setResetArm(false);
  }

  function persistCode(next: string) {
    setCode(next);
    if (draftKey) saveChallengeDraft(draftKey, next);
  }

  function doReset() {
    if (!challenge) return;
    if (!resetArm) { setResetArm(true); return; }
    clearChallengeDraft(draftKey);
    setCode(starterFor(challenge, language));
    setResetArm(false);
    setRestored(null);
    clearConsole();
  }

  function doRun() {
    if (!challenge || !detail || phase !== "idle") return;
    if (detail.judgeDown) {
      clearConsole();
      setVerdict({ kind: "fault", note: detail.judgeDown });
      return;
    }
    const source = code;
    setPhase("running");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      const assessment = assessSource(source, starterFor(challenge, language), language, fileName);
      const stats = measureRun(source, language, detail.samples.length);
      if (assessment.kind === "syntax") {
        setErr(assessment.report);
        setResults(detail.samples.map((s, i) => ({
          name: `Visible case ${i + 1}`,
          passed: false,
          input: s.input,
          expected: s.expected,
          actual: `${assessment.label} — the program did not run`
        })));
        setStatusLine({ tone: "fail", text: `${assessment.label} on line ${assessment.issue.line} · nothing ran · nothing recorded` });
        return;
      }
      const clean = assessment.kind === "changed";
      const rows: TerminalTestCase[] = detail.samples.map((s, i) => ({
        name: `Visible case ${i + 1}`,
        passed: clean,
        durationMs: stats.durationMs / detail.samples.length + i * 0.05,
        input: s.input,
        expected: s.expected,
        actual: clean ? s.expected : "(the starter's stub return)"
      }));
      setResults(rows);
      setOut(
        clean
          ? `Ran the ${rows.length} visible samples — all passed.\nA run is not the day's submission: Submit grades the full set of ${detail.samples.length + detail.hiddenCount} cases.`
          : `Ran the ${rows.length} visible samples — case 1 failed.\nThe starter stub cannot pass. A run records nothing.`
      );
      setStatusLine(
        clean
          ? { tone: "pass", text: `${rows.length}/${rows.length} visible cases passed · ${stats.durationMs} ms · ${stats.memoryMb.toFixed(1)} MB` }
          : { tone: "fail", text: `Visible case 1 failed · ${stats.durationMs} ms · nothing recorded` }
      );
    }, 500);
  }

  function doSubmit() {
    if (!challenge || !detail || !date || phase !== "idle") return;
    if (detail.judgeDown) {
      clearConsole();
      setVerdict({ kind: "fault", note: detail.judgeDown });
      return;
    }
    const source = code;
    setPhase("submitting");
    clearConsole();
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      const total = detail.samples.length + detail.hiddenCount;
      const assessment = assessSource(source, starterFor(challenge, language), language, fileName);
      const stats = measureRun(source, language, total);

      if (assessment.kind === "syntax") {
        recordSubmission({ challengeId: challenge.id, language, verdict: "runtime_error", casesPassed: 0, casesTotal: total, code: source });
        setVerdict({
          kind: "wrong",
          failingCase: `${assessment.label} on line ${assessment.issue.line}`,
          note: "The program does not compile, so no case could run."
        });
        setErr(assessment.report);
        setResults(detail.samples.map((s, i) => ({
          name: `Visible case ${i + 1}`,
          passed: false,
          input: s.input,
          expected: s.expected,
          actual: `${assessment.label} — the program did not run`
        })));
        setStatusLine({ tone: "fail", text: `Submission recorded · 0/${total} cases · the day stays open` });
        return;
      }

      if (assessment.kind === "untouched") {
        recordSubmission({ challengeId: challenge.id, language, verdict: "wrong_answer", casesPassed: 0, casesTotal: total, code: source });
        setVerdict({ kind: "wrong", failingCase: `Visible case 1 — expected ${detail.samples[0]?.expected ?? "the authored output"}` });
        setOut(`Verdict: WRONG ANSWER\nFailing: visible case 1\nRecorded as a submission of record — the day stays open.`);
        setResults(detail.samples.map((s, i) => ({
          name: `Visible case ${i + 1}`,
          passed: false,
          durationMs: 0.1 + i * 0.04,
          input: s.input,
          expected: s.expected,
          actual: "(the starter's stub return)"
        })));
        setStatusLine({ tone: "fail", text: `Submission recorded · 0/${total} cases · ${stats.durationMs} ms` });
        return;
      }

      const firstSolve = !store.solved.includes(challenge.id);
      /* The Daily pays its own stamped award (base + authored bonus); the
         challenge's first-solve award is the catalogue flow's to pay — a
         solved challenge pays nothing again. */
      const award = xpFor(challenge.difficulty) + DAILY_BONUS_XP;
      recordSubmission({
        challengeId: challenge.id,
        language,
        verdict: "accepted",
        casesPassed: total,
        casesTotal: total,
        xpAward: 0,
        code: source
      });
      markDailySolved(date, award, date === PRODUCT_TODAY);
      setVerdict({ kind: "accepted", firstSolve });
      setOut(
        `Verdict: ACCEPTED — ${total}/${total} cases.\n` +
          `Daily ${formatProductDay(date)} completed: +${award} XP (base + authored bonus).` +
          (firstSolve ? " The underlying challenge solve is recorded too — one solve, one entry." : "")
      );
      setResults(detail.samples.map((s, i) => ({
        name: `Visible case ${i + 1}`,
        passed: true,
        durationMs: stats.durationMs / total + i * 0.04,
        input: s.input,
        expected: s.expected
      })));
      setStatusLine({ tone: "pass", text: `Accepted · ${total}/${total} cases · ${stats.durationMs} ms · ${stats.memoryMb.toFixed(1)} MB` });
      raise("daily completed", { date });
    }, 800);
  }

  /* ── Date-level states before the workbench ──────────────────────────── */

  if (!date || !state) {
    return (
      <Page kind="sink" title="Daily unavailable">
        <StateBlock state="unavailable" message="This Daily does not resolve to a product date." action={<Back to="/daily">Today</Back>} />
      </Page>
    );
  }
  if (state.kind === "future") {
    return (
      <Page kind="sink" title="Daily unavailable">
        <StateBlock state="unavailable" message="That date is still ahead on the product clock — nothing is disclosed before it lands." action={<Back to="/daily">Today</Back>} />
      </Page>
    );
  }
  if (state.kind === "voided") {
    return (
      <Page kind="sink" title={`Daily · ${formatProductDay(date)}`}>
        <StateBlock
          state="refused"
          message={`${state.reason} There is no code surface on a voided day — the day counts as neutral for every learner.`}
          action={<Back to="/daily/archive">History</Back>}
        />
      </Page>
    );
  }
  if (state.kind === "neutral") {
    const catchUp = openCatchUp(store.dailySolved);
    return (
      <Page kind="sink" title={`Daily · ${formatProductDay(date)}`}>
        <Card>
          <CardHeader title="Nothing scheduled" icon="daily" />
          <p className="page__lead">No Daily was scheduled for this product date — a neutral day, not an error.</p>
          {catchUp ? (
            <Link className="btn btn--primary" to={`/daily/${catchUp.date}`}>Solve {formatProductDay(catchUp.date)}'s open Daily</Link>
          ) : (
            <p className="meta">No eligible past Daily remains open on this device.</p>
          )}
        </Card>
      </Page>
    );
  }
  if (!challenge || !detail) {
    return (
      <Page kind="sink" title={`Daily · ${formatProductDay(date)}`}>
        <StateBlock
          state="unavailable"
          message="This date's Daily is real and its record stands, but the item's content is not part of this demo's learner catalogue — there is no workbench to open."
          action={<Back to="/daily/archive">History</Back>}
        />
      </Page>
    );
  }

  const busy = phase !== "idle";

  const verdictBanner = verdict ? (
    verdict.kind === "accepted" ? (
      <div className="wb-verdict" data-tone="pass" role="status">
        <div className="wb-verdict__main">
          <Icon name="check" size={16} />
          <div>
            <p className="wb-verdict__title">Accepted — {formatProductDay(date)} counts{date === PRODUCT_TODAY ? " and the streak is safe" : ""}</p>
            <p className="wb-verdict__note">
              {verdict.firstSolve ? "The underlying challenge solve is recorded too." : "The challenge was already solved — only the day's award is new."}
            </p>
          </div>
        </div>
        <div className="wb-verdict__actions">
          <Link className="btn btn--secondary" to="/daily">Back to today</Link>
        </div>
      </div>
    ) : verdict.kind === "wrong" ? (
      <div className="wb-verdict" data-tone="fail" role="status">
        <div className="wb-verdict__main">
          <Icon name="error" size={16} />
          <div>
            <p className="wb-verdict__title">Wrong answer — {verdict.failingCase}</p>
            <p className="wb-verdict__note">{verdict.note ? `${verdict.note} ` : ""}The day stays open; your draft is still in the editor.</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="wb-verdict" data-tone="warn" role="alert">
        <div className="wb-verdict__main">
          <Icon name="alert" size={16} />
          <div>
            <p className="wb-verdict__title">Platform fault</p>
            <p className="wb-verdict__note">{verdict.note} Nothing was recorded — the day stays open and your status is unchanged.</p>
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
      kicker={`Daily · ${formatProductDay(date)}${isCatchUp ? " · catch-up" : ""}`}
      title={challenge.title}
      lead={`${xpFor(challenge.difficulty)} + ${DAILY_BONUS_XP} bonus XP on completion · ${detail.samples.length} visible · ${detail.hiddenCount} hidden · ${detail.comparison}`}
      actions={<Back to="/daily">Today</Back>}
    >
      {dateSolved ? (
        <Card live>
          <p style={{ margin: 0, fontWeight: 600 }}>
            ✓ This Daily is solved — the date counts and the award is paid. Re-solving is free practice.
          </p>
        </Card>
      ) : isCatchUp ? (
        <Card>
          <p className="meta" style={{ margin: 0 }}>
            Catch-up — this date was missed, and it pays the full award all the same.
          </p>
        </Card>
      ) : null}

      <div className="solve-layout">
        <div className="solve-layout__brief">
          <Card>
            <CardHeader title="Problem statement" icon="daily" />
            <p className="page__lead" style={{ whiteSpace: "pre-wrap" }}>{challenge.prompt}</p>
            {detail.constraints.length > 0 ? (
              <div style={{ marginTop: "16px", padding: "12px", background: "var(--c-surface-inset)", borderRadius: "var(--radius-sm)" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "var(--text-xs)" }}>Constraints</h4>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--c-text-muted)" }}>
                  {detail.constraints.map((c) => <li key={c}><code>{c}</code></li>)}
                </ul>
              </div>
            ) : null}
            {detail.samples.length > 0 ? (
              <div style={{ marginTop: "12px" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "var(--text-xs)", color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Visible cases — Run executes these
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {detail.samples.map((s, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      <div>{s.input}</div>
                      <div style={{ color: "var(--c-text-faint)" }}>→ {s.expected}</div>
                    </div>
                  ))}
                </div>
                <p className="meta" style={{ marginTop: "6px" }}>+ {detail.hiddenCount} hidden cases on Submit.</p>
              </div>
            ) : null}
            <div style={{ marginTop: "16px" }}>
              <HintLadder rungs={detail.hints} revealed={hintCount} onReveal={setHintCount} emptyNote="No hint ladder was authored for this item." />
            </div>
            {restored ? <p className="meta" style={{ marginTop: "10px" }}>{restored}</p> : null}
          </Card>
        </div>

        <div className="solve-layout__work">
          <CodeWorkbench
            label="Daily workbench"
            fileName={fileName}
            onRun={doRun}
            onSubmit={doSubmit}
            busy={busy}
            toolbar={
              <LanguageSelect
                value={language}
                onChange={(v) => changeLanguage(v as EditorLanguage)}
                options={EDITOR_LANGUAGES.filter((l) => detail.languages.includes(l.value))}
                label="Language"
                disabled={busy}
              />
            }
            actions={
              <ToolButton
                icon="reset"
                armed={resetArm}
                onClick={doReset}
                disabled={busy}
                title="Replace the editor and the device draft with the authored starter"
              >
                {resetArm ? "Confirm reset — replaces your draft" : "Reset"}
              </ToolButton>
            }
            editor={
              <CodeEditor
                value={code}
                onChange={persistCode}
                language={language}
                filename={fileName}
                path={`daily/${date}/${challenge.id}/${language}/${fileName}`}
              />
            }
            console={
              <Terminal
                label="Daily console"
                output={out}
                errorOutput={err}
                statusLine={statusLine}
                isExecuting={busy}
                statusText={phase === "submitting" ? "Grading the full case set — pending, not failed." : "Running the visible cases…"}
                onClear={clearConsole}
                testCases={results}
                hiddenCount={detail.hiddenCount}
                banner={verdictBanner}
              />
            }
            footer={
              <>
                <RunButton onClick={doRun} running={phase === "running"} disabled={busy} title="Run the visible cases — records nothing" />
                <SubmitButton
                  onClick={doSubmit}
                  pending={phase === "submitting"}
                  disabled={busy}
                  label="Submit the day's answer"
                  title="Grade the full case set — recorded as the day's submission"
                />
              </>
            }
          />
        </div>
      </div>
    </Page>
  );
}
