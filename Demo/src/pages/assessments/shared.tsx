/**
 * shared — the pieces every assessment page reuses:
 *
 *  - `AssessViewsNav` — the local Mock / Companies / History views, rendered as
 *    route links inside the assessment pages (never the global nav).
 *  - `PreflightPanel` — the advisory systems check + acknowledgement + explicit
 *    Start. Checks that genuinely read this device are labelled "checked"; what
 *    a demo cannot verify is labelled simulated/advisory, never a fake pass.
 *    Acknowledgement only unlocks Start — it never begins the sitting itself.
 *  - `SittingScreen` — the sealed in-sitting frame (ExamChrome + countdown +
 *    autosave + the grading hand-off), shared by the mock and company sittings.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AcknowledgeGate } from "../../extraction/components/AcknowledgeGate/AcknowledgeGate";
import { BriefingRulesList, type BriefingRule } from "../../extraction/components/BriefingRulesList/BriefingRulesList";
import { Button } from "../../extraction/components/Button/Button";
import {
  ExamChrome,
  IntegrityBanner,
  QuestionPalette,
  QuestionCard,
  SittingNav
} from "../../extraction/components/ExamChrome/ExamChrome";
import { useCountdown, useSitting, type SittingItem } from "../../extraction/components/ExamChrome/hooks";
import {
  useSittingAutosave,
  useSittingSession,
  type SittingDraft,
  type SittingResult
} from "./sittings";

/* ── Local views ─────────────────────────────────────────────────────────── */

export type AssessView = "overview" | "mock" | "company" | "history";

const VIEWS: { key: AssessView; label: string; to: string }[] = [
  { key: "overview", label: "Overview", to: "/assessments" },
  { key: "mock", label: "Mock papers", to: "/assessments/browse?view=mock" },
  { key: "company", label: "Companies", to: "/assessments/browse?view=company" },
  { key: "history", label: "History", to: "/assessments/history" }
];

/** The assessment domain's local views — real links, keyboard-operable, with
 *  aria-current marking the page you are on. */
export function AssessViewsNav({ current }: { current: AssessView }) {
  return (
    <nav className="filters" aria-label="Assessment views" style={{ marginBottom: "var(--space-4)" }}>
      {VIEWS.map((view) => (
        <Link
          key={view.key}
          className="chip"
          data-on={current === view.key || undefined}
          aria-current={current === view.key ? "page" : undefined}
          to={view.to}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}

/* ── Sealed chrome — distraction suppression while a sitting is mounted ──────

   The companion is already suppressed by the route registry
   (companion/guide.ts suppresses `…/sitting` and `…/start`). While a sealed
   sitting is on screen this attribute also suppresses the navigation models,
   quick search, notifications and Quick Notes — the sitting keeps a brand exit
   and the draft survives leaving, so suppression never traps work. */

export function useSealedChrome() {
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-sealed-sitting", "");
    return () => {
      el.removeAttribute("data-sealed-sitting");
    };
  }, []);
}

/* ── Advisory preflight ────────────────────────────────────────────────────── */

interface PreflightCheck {
  id: string;
  label: string;
  /** What was actually read — real device facts only. */
  value: string;
  /** checked: a real read. advisory: a recommendation the demo does not
   *  enforce. simulated: displayed for flow, not a device verification. */
  state: "checked" | "advisory" | "simulated";
}

const CHECK_BADGE: Record<PreflightCheck["state"], string> = {
  checked: "Checked on this device",
  advisory: "Advisory — not enforced",
  simulated: "Simulated — not verified"
};

/** Reads only what a browser can honestly report. Anything the demo cannot
 *  verify is marked simulated rather than painted green. */
function collectChecks(): PreflightCheck[] {
  const checks: PreflightCheck[] = [];

  let storage: PreflightCheck;
  try {
    const probe = "wp.assess.probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    storage = { id: "storage", label: "Answer save storage", value: "Writable — answers persist on this device", state: "checked" };
  } catch {
    storage = { id: "storage", label: "Answer save storage", value: "Not writable — the sitting runs but cannot resume", state: "checked" };
  }
  checks.push(storage);

  let zone = "this device";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || zone;
  } catch { /* older engine — fall through to the generic label */ }
  checks.push({ id: "clock", label: "Device clock", value: `${new Date().toLocaleTimeString()} · ${zone}`, state: "checked" });

  checks.push({
    id: "display",
    label: "Display",
    value: `${window.screen.width}×${window.screen.height}px · ${window.devicePixelRatio}x density`,
    state: "checked"
  });

  checks.push({
    id: "online",
    label: "Connection",
    value: navigator.onLine ? "Reported online — the sitting still runs fully on-device" : "Reported offline — the sitting runs fully on-device",
    state: "checked"
  });

  checks.push({
    id: "fullscreen",
    label: "Fullscreen",
    value: document.fullscreenEnabled
      ? "Available — recommended for a sealed sitting, never forced"
      : "Not available in this browser — the sitting still runs",
    state: document.fullscreenEnabled ? "checked" : "advisory"
  });

  checks.push({
    id: "proctor",
    label: "Proctoring feed",
    value: "Simulated — this demo records no webcam, no screen capture and no integrity feed",
    state: "simulated"
  });

  return checks;
}

export interface PreflightPanelProps {
  /** The published allocation the Start act stamps, e.g. "45 minutes". */
  minutes: number;
  questions: number;
  /** Extra rules the paper adds to the standard list. */
  rules?: BriefingRule[];
  ackLabel: string;
  startLabel: string;
  /** The explicit Start act — the page creates the draft and navigates. */
  onStart: () => void;
}

export function PreflightPanel({ minutes, questions, rules = [], ackLabel, startLabel, onStart }: PreflightPanelProps) {
  const [agreed, setAgreed] = useState(false);
  const [checks, setChecks] = useState(collectChecks);
  const [ranAt, setRanAt] = useState(() => new Date());

  function rerun() {
    setChecks(collectChecks());
    setRanAt(new Date());
  }

  return (
    <div className="grid-2">
      <Card live>
        <CardHeader
          title="Systems check"
          icon="check"
          action={
            <button className="btn btn--quiet" type="button" style={{ fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-3)" }} onClick={rerun}>
              Re-run checks
            </button>
          }
        />
        <p className="meta" style={{ margin: "0 0 var(--space-3)" }}>
          Advisory only — nothing here starts the sitting or scores anything. Items marked simulated do not verify device properties. Last run {ranAt.toLocaleTimeString()}.
        </p>
        <div className="list">
          {checks.map((check) => (
            <div key={check.id} className="list-row" style={{ cursor: "default" }}>
              <div style={{ flex: 1 }}>
                <strong>{check.label}</strong>
                <p className="meta">{check.value}</p>
              </div>
              <span className="chip chip--quiet">{CHECK_BADGE[check.state]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="The sealed test's terms" icon="clipboard" />
        <BriefingRulesList
          rules={[
            { icon: "clock", lead: `${minutes} minutes:`, text: "the countdown begins at the explicit Start and never pauses — browsing and acknowledging start nothing." },
            { icon: "save", lead: `${questions} questions:`, text: "every answer saves to this device the moment you pick it." },
            { icon: "history", lead: "Resume-first:", text: "leaving keeps the sitting — you re-enter the same test, never a fresh one." },
            { icon: "shield", lead: "Sealed posture:", text: "assistant, notifications and navigation are suppressed until submission." },
            ...rules
          ]}
        />
        <AcknowledgeGate
          checked={agreed}
          onChange={setAgreed}
          label={ackLabel}
          hint="Acknowledging unlocks Start; it does not begin the sitting or the timer."
        >
          {(acknowledged) => (
            <div className="row" style={{ marginTop: "var(--space-4)" }}>
              <Button icon="play" disabled={!acknowledged} onClick={onStart}>
                {startLabel}
              </Button>
            </div>
          )}
        </AcknowledgeGate>
      </Card>
    </div>
  );
}

/* ── The sealed sitting frame ──────────────────────────────────────────────── */

export interface SittingScreenProps {
  draft: SittingDraft;
  items: SittingItem[];
  /** Total published allocation, for the meta line. */
  minutes: number;
  /** The posture claim on the integrity banner. */
  bannerLabel: string;
  /** The grading-phase line — mock grades, company records. */
  commitLabel: string;
  submitLabel: string;
  /** Commit the finalized result and decide where the sitting ends up. */
  onCommit: (result: SittingResult, ending: "submitted" | "auto") => void;
}

export function SittingScreen({ draft, items, minutes, bannerLabel, commitLabel, submitLabel, onCommit }: SittingScreenProps) {
  useSealedChrome();
  const [phase, setPhase] = useState<"sitting" | "grading">("sitting");
  const pending = useRef<{ result: SittingResult; ending: "submitted" | "auto" } | null>(null);

  const session = useSittingSession(draft, items, (result, ending) => {
    pending.current = { result, ending };
    setPhase("grading");
  });
  const finishRef = useRef(session.finish);
  finishRef.current = session.finish;

  const clock = useCountdown(draft.remainingSeconds, () => finishRef.current("auto"));
  const savedAt = useSittingAutosave(draft, session, clock.remain);

  useEffect(() => {
    if (phase !== "grading") return;
    const t = window.setTimeout(() => {
      if (pending.current) onCommit(pending.current.result, pending.current.ending);
    }, 1100);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "grading") {
    return (
      <Card live>
        <div className="row" style={{ gap: "var(--space-3)" }}>
          <Icon name="loader" size={18} motion="flow" />
          <div>
            <strong>{commitLabel}</strong>
            <p className="meta" style={{ margin: 0 }}>
              {pending.current?.ending === "auto"
                ? "The allocation ended — the sitting was submitted automatically."
                : "The sitting is sealed and the record stays on this device."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const savedLabel = savedAt ? `Saved on this device · ${new Date(savedAt).toLocaleTimeString()}` : "Saving on this device";

  return (
    <ExamChrome
      banner={{ label: bannerLabel, answered: session.answeredCount, total: items.length }}
      timer={{
        clock: clock.mmss,
        urgent: clock.urgent,
        meta: `${items.length} items · ${minutes}m allocation · ${savedLabel}`,
        actions: (
          <Button variant="secondary" onClick={() => session.finish("submitted")}>
            {submitLabel}
          </Button>
        )
      }}
      paletteLabel="Question index"
      sitting={{
        i: session.i,
        answers: session.answers,
        marked: session.marked,
        isFirst: session.isFirst,
        isLast: session.isLast
      }}
      items={items}
      onSelect={session.goTo}
      onPick={session.pick}
      onToggleMark={session.toggleMark}
      onPrev={session.prev}
      onNext={session.next}
      onSubmit={() => session.finish("submitted")}
      submitLabel={submitLabel}
    />
  );
}

/* ── Open practice — the same items, unsealed ────────────────────────────────

   Reachable only once a test is finalized (re-locked by invalidation). No
   clock, no persisted record, no record of any kind: the run's score and
   per-item correctness are transient and never leave the page's memory. */

export interface PracticeScreenProps {
  items: SittingItem[];
  /** The paper's reveal flags in force — per-item correctness and
   *  explanations each seal independently. */
  revealAnswers: boolean;
  revealExplanations: boolean;
  /** Where "Done" returns — the paper's result page. */
  resultTo: string;
  resultLabel: string;
}

export function PracticeScreen({ items, revealAnswers, revealExplanations, resultTo, resultLabel }: PracticeScreenProps) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<SittingResult | null>(null);
  const [run, setRun] = useState(0);

  if (!started) {
    return (
      <Card live>
        <CardHeader title="Open practice" icon="clipboard" />
        <p className="page__lead">
          The same items, unsealed: no clock, no recorded events, nothing stored. A finished run shows a
          transient score and per-item correctness — it lands nowhere and changes no record.
        </p>
        <div className="row" style={{ marginTop: "var(--space-4)" }}>
          <Button icon="play" onClick={() => setStarted(true)}>Begin unrecorded run</Button>
          <Link className="btn btn--quiet" to={resultTo}>{resultLabel}</Link>
        </div>
      </Card>
    );
  }

  if (done) {
    return (
      <Card live>
        <CardHeader title="Practice run — transient, not stored" icon="check" />
        <p className="page__lead">
          {done.score === null
            ? `${done.answeredCount} of ${items.length} items answered.`
            : `${done.score} of ${items.length} correct — a practice figure only. It is not a test result and is kept nowhere.`}
        </p>
        {revealAnswers ? (
          <div className="list" style={{ marginTop: "var(--space-3)" }}>
            {items.map((item, idx) => {
              const picked = done.answers[idx] ?? -1;
              const correct = typeof item.answer === "number" && picked === item.answer;
              return (
                <div key={item.id} className="list-row" style={{ cursor: "default" }}>
                  <div style={{ flex: 1 }}>
                    <strong>
                      Item {idx + 1} · {typeof item.answer !== "number" ? "answered" : correct ? "Correct" : "Incorrect"}
                    </strong>
                    <p className="meta">{item.prompt}</p>
                    {revealExplanations && item.explanation ? (
                      <p className="meta">Remediation: {item.explanation}</p>
                    ) : null}
                  </div>
                  <span className="chip chip--quiet">{typeof item.answer === "number" ? (correct ? "correct" : "incorrect") : "recorded"}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="meta" style={{ marginTop: "var(--space-3)" }}>
            This paper seals per-item answers — the run's total is all it reports.
          </p>
        )}
        <div className="row" style={{ marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => { setRun((r) => r + 1); setDone(null); }}>Run again — still unrecorded</Button>
          <Link className="btn btn--quiet" to={resultTo}>{resultLabel}</Link>
        </div>
      </Card>
    );
  }

  /* key={run} remounts the run so "Run again" starts empty rather than
     carrying the last run's answers. */
  return <PracticeRun key={run} items={items} onDone={setDone} />;
}

function PracticeRun({ items, onDone }: { items: SittingItem[]; onDone: (result: SittingResult) => void }) {
  const session = useSitting(items, onDone);
  const q = items[session.i];
  if (!q) return null;

  return (
    <div>
      <IntegrityBanner
        label="OPEN PRACTICE — UNSEALED · NO CLOCK · NOTHING IS RECORDED"
        answered={session.answeredCount}
        total={items.length}
      />
      <QuestionPalette
        label="Practice question index"
        current={session.i}
        onSelect={session.goTo}
        items={items.map((_item, idx) => ({
          n: idx + 1,
          answered: (session.answers[idx] ?? -1) >= 0,
          marked: Boolean(session.marked[idx])
        }))}
      />
      <div className="x-exam-chrome__card">
        <QuestionCard
          index={session.i}
          total={items.length}
          prompt={q.prompt}
          choices={q.choices}
          answer={session.answers[session.i] ?? -1}
          marked={Boolean(session.marked[session.i])}
          onPick={session.pick}
          onToggleMark={session.toggleMark}
        />
        <SittingNav
          isFirst={session.isFirst}
          isLast={session.isLast}
          onPrev={session.prev}
          onNext={session.next}
          onSubmit={() => session.finish()}
          submitLabel="Finish practice run"
        />
      </div>
    </div>
  );
}

/* ── Small shared helpers ────────────────────────────────────────────────── */

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function draftSummary(draft: SittingDraft, total: number): string {
  const answered = draft.answers.filter((a) => a >= 0).length;
  const mm = Math.floor(draft.remainingSeconds / 60);
  const ss = String(draft.remainingSeconds % 60).padStart(2, "0");
  return `In progress — ${answered} of ${total} answered · ${mm}:${ss} left`;
}
