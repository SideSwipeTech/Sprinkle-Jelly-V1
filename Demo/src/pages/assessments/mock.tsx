/**
 * mock — the Mock paper flow: briefing → advisory preflight (/start) → the
 * sealed sitting → grading → the final scorecard → unsealed open practice.
 *
 * The timer exists only after the explicit Start act creates the in-progress
 * record; acknowledgement is a gate on Start, never a start itself. Resuming
 * reuses that same record — cursor, answers, marks and remaining clock.
 * A finalized result opens review within the paper's reveal flags and unlocks
 * open practice; an invalidated row renders its reason, restores the attempt
 * and re-locks practice.
 */

import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { MOCKS, MOCK_QUESTIONS } from "@data/catalog";
import { saveMockResult } from "@state/store";
import { raise } from "@companion/stream";
import { useStore } from "@state/useStore";
import { BriefingRulesList } from "../../extraction/components/BriefingRulesList/BriefingRulesList";
import { ExamFlagRow } from "../../extraction/components/ExamFlagRow/ExamFlagRow";
import { ScorecardHero } from "../../extraction/components/ScorecardHero/ScorecardHero";
import { ReviewItemCard } from "../../extraction/components/ReviewItemCard/ReviewItemCard";
import type { SittingItem } from "../../extraction/components/ExamChrome/hooks";
import { attemptCapFor, clearDraft, loadDraft, mockPaperNext, startDraft } from "./sittings";
import { draftSummary, formatWhen, PreflightPanel, PracticeScreen, SittingScreen } from "./shared";

const ITEMS: SittingItem[] = MOCK_QUESTIONS.map((q) => ({
  id: q.id,
  prompt: q.prompt,
  choices: q.choices,
  answer: q.answer,
  explanation: q.explanation
}));

/** What this sitting actually provides — read off the chrome, not claimed. */
const EXPERIENCE = [
  { name: "Timer", hint: "On-screen countdown for the whole sitting", on: true },
  { name: "Question palette", hint: "Numbered rail with per-item state", on: true },
  { name: "Mark for review", hint: "Star items to revisit", on: true },
  { name: "Skip permitted", hint: "Move past unanswered items", on: true },
  { name: "Revisit permitted", hint: "Return to any viewed item", on: true },
  { name: "Single sequence", hint: "One section flow, no switching", on: true }
];

function Unresolved({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <Page kind="assess" title={title}>
      <StateBlock state="unavailable" message={message} action={action} />
    </Page>
  );
}

/* ── Briefing ──────────────────────────────────────────────────────────────── */

export function MockBriefing() {
  const { paperId } = useParams();
  const paper = MOCKS.find((m) => m.id === paperId);
  const store = useStore();
  const navigate = useNavigate();
  const draft = paper ? loadDraft("mock", paper.id) : null;

  if (!paper) {
    return <Unresolved title="Paper unavailable" message="This paper does not resolve in the catalogue." action={<Back to="/assessments/browse?view=mock">Mock papers</Back>} />;
  }

  const results = store.mockResults.filter((r) => r.paperId === paper.id);
  const next = mockPaperNext(paper.id, results);

  /** Ending an in-progress sitting from the briefing is the sealed-discard:
   *  it submits what is recorded — it never deletes the record silently. */
  function submitDraftNow() {
    if (!draft) return;
    const score = ITEMS.reduce((acc, item, idx) => acc + ((draft.answers[idx] ?? -1) === item.answer ? 1 : 0), 0);
    clearDraft("mock", paper!.id);
    saveMockResult(paper!.id, score, draft.answers);
    navigate(`/mock/${paper!.id}/result`, { state: { ending: "submitted" } });
  }

  return (
    <Page
      kind="assess"
      kicker="Mock paper · briefing"
      title={paper.title}
      lead={paper.summary}
      actions={<Back to="/assessments/browse?view=mock">Mock papers</Back>}
    >
      {draft ? (
        <Card live>
          <CardHeader title="Sitting in progress" icon="clock" />
          <p className="page__lead">{draftSummary(draft, ITEMS.length)}. The countdown and your answers are held on this device.</p>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to={`/mock/${paper.id}/sitting`}>Resume sitting</Link>
            <button className="btn btn--quiet" type="button" onClick={submitDraftNow}>Submit it now</button>
          </div>
        </Card>
      ) : null}

      <div className="grid-2" style={{ marginTop: draft ? "var(--space-4)" : 0 }}>
        <Card live>
          <CardHeader eyebrow="Examination parameters" title="Sitting rules" icon="clipboard" />
          <BriefingRulesList
            rules={[
              { icon: "clock", lead: `${paper.minutes} minutes:`, text: "the countdown begins at the explicit Start — never by browsing or acknowledging." },
              { icon: "target", lead: `${paper.questions} questions:`, text: "single sequence; skip and revisit are permitted." },
              { icon: "shield", lead: "Sealed posture:", text: "answers save on this device; assistant and notifications are suppressed until submission." },
              ...(typeof paper.passingScore === "number"
                ? [{ icon: "check" as const, lead: `Benchmark ${paper.passingScore} of ${paper.questions}:`, text: "a private mark against the published bar — never a ranking." }]
                : [])
            ]}
          />
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            {next.kind === "blocked" ? (
              <StateBlock
                state="refused"
                message={next.reason}
                action={
                  next.result || next.practice ? (
                    <div className="row">
                      {next.result ? (
                        <Link className="btn btn--secondary" to={`/mock/${paper.id}/result`}>View latest scorecard</Link>
                      ) : null}
                      {next.practice ? (
                        <Link className="btn btn--quiet" to={`/mock/${paper.id}/practice`}>Open practice — unsealed</Link>
                      ) : null}
                    </div>
                  ) : undefined
                }
              />
            ) : next.kind === "resume" ? null : (
              <Link className="btn btn--primary" to={`/mock/${paper.id}/start`}>Continue to checks</Link>
            )}
            {next.kind === "result" ? (
              <>
                <Link className="btn btn--secondary" to={`/mock/${paper.id}/result`}>View latest scorecard</Link>
                {next.practice ? (
                  <Link className="btn btn--quiet" to={`/mock/${paper.id}/practice`}>Open practice — unsealed</Link>
                ) : null}
                {(() => {
                  const cap = attemptCapFor(paper.id);
                  const live = results.filter((r) => !r.invalidation).length;
                  const left = cap === null ? null : cap - live;
                  return left === null || left > 0 ? (
                    <Link className="btn btn--quiet" to={`/mock/${paper.id}/start`}>
                      {left === null ? "Sit again" : `Sit again — ${left} left`}
                    </Link>
                  ) : null;
                })()}
              </>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader title="What this sitting provides" icon="target" />
          <div className="list" style={{ marginTop: "var(--space-2)" }}>
            {EXPERIENCE.map((f) => (
              <ExamFlagRow key={f.name} name={f.name} hint={f.hint} on={f.on} />
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

/* ── Sitting ───────────────────────────────────────────────────────────────── */

export function MockSitting() {
  const { paperId } = useParams();
  const paper = MOCKS.find((m) => m.id === paperId);
  const navigate = useNavigate();
  const draft = paper ? loadDraft("mock", paper.id) : null;

  if (!paper) {
    const orphan = paperId ? loadDraft("mock", paperId) : null;
    return (
      <Unresolved
        title="Sitting unavailable"
        message={orphan
          ? "The paper behind this in-progress sitting no longer resolves — the record cannot be finalized."
          : "This sitting cannot continue — the paper does not resolve."}
        action={orphan ? (
          <button className="btn btn--secondary" type="button" onClick={() => { clearDraft("mock", paperId!); navigate("/assessments/browse?view=mock"); }}>
            Discard the sitting record
          </button>
        ) : <Back to="/assessments/browse?view=mock">Mock papers</Back>}
      />
    );
  }

  if (!draft) {
    return (
      <Page kind="assess" kicker="Mock paper" title={paper.title}>
        <StateBlock
          state="refused"
          message="This sitting has not been started — the clock only exists after the explicit Start on the checks page."
          action={<Link className="btn btn--primary" to={`/mock/${paper.id}`}>Open the briefing</Link>}
        />
      </Page>
    );
  }

  return (
    <Page
      kind="assess"
      kicker="Mock paper · sealed sitting"
      title={paper.title}
      lead="Sealed posture · the countdown and every answer stay on this device."
    >
      <SittingScreen
        draft={draft}
        items={ITEMS}
        minutes={paper.minutes}
        bannerLabel="SEALED POSTURE ACTIVE · SAVED ON THIS DEVICE"
        commitLabel="Grading on this device"
        submitLabel="Submit paper"
        onCommit={(result, ending) => {
          clearDraft("mock", paper.id);
          /* The item bank always carries keys — a null score cannot occur here. */
          saveMockResult(paper.id, result.score ?? 0, [...result.answers]);
          navigate(`/mock/${paper.id}/result`, { state: { ending } });
        }}
      />
    </Page>
  );
}

/* ── Result ────────────────────────────────────────────────────────────────── */

export function MockResult() {
  const { paperId } = useParams();
  const store = useStore();
  const location = useLocation();
  const paper = MOCKS.find((m) => m.id === paperId);
  const row = store.mockResults.find((r) => r.paperId === paperId);
  const draft = paper ? loadDraft("mock", paper.id) : null;
  const ending = (location.state as { ending?: string } | null)?.ending;

  // The sitting itself is suppressed; the result page is where the moment belongs.
  useEffect(() => { if (row && paper && !row.invalidation) raise("result ready", { paper: paper.title }); }, [row, paper]);

  if (!paper) {
    return <Unresolved title="Result unavailable" message="The paper behind this record no longer resolves in the catalogue." action={<Back to="/assessments/history">History</Back>} />;
  }

  if (!row) {
    if (draft) {
      return (
        <Page kind="assess" kicker="Mock paper" title={paper.title}>
          <StateBlock
            state="pending"
            message={`A sitting is still in progress — ${draftSummary(draft, ITEMS.length)}. The scorecard appears once it is submitted.`}
            action={<Link className="btn btn--primary" to={`/mock/${paper.id}/sitting`}>Resume sitting</Link>}
          />
        </Page>
      );
    }
    return <Unresolved title="Result unavailable" message="No finalized result is stored for this paper." action={<Link className="btn btn--primary" to={`/mock/${paper.id}`}>Open the briefing</Link>} />;
  }

  /* Invalidated: the result renders its reason, never a scorecard — and the
     measured attempt it consumed is restored, so the paper can be sat again. */
  if (row.invalidation) {
    return (
      <Page
        kind="assess"
        kicker="Mock sitting — invalidated"
        title={paper.title}
        lead="This test's record was voided. The measured attempt it consumed was restored — the paper can be sat again where its window allows."
      >
        <div className="grid-2">
          <Card>
            <CardHeader title="Invalidated" icon="alert" />
            <StateBlock
              state="refused"
              message={`${row.invalidation.reason}. Recorded ${formatWhen(row.invalidation.at)}; the sitting ran ${formatWhen(row.at)}.`}
            />
            <dl className="account-facts" style={{ marginTop: "var(--space-4)" }}>
              <div><dt>Paper type</dt><dd>Mock</dd></div>
              <div><dt>Recorded score</dt><dd>Voided — it never stands as a result</dd></div>
              <div><dt>Open practice</dt><dd>Locked until a sitting finalizes again</dd></div>
            </dl>
            <div className="row" style={{ marginTop: "var(--space-4)" }}>
              <Link className="btn btn--primary" to={`/mock/${paper.id}`}>Open briefing — sit again</Link>
              <Link className="btn btn--quiet" to="/assessments/history">History</Link>
            </div>
          </Card>
        </div>
      </Page>
    );
  }

  const cap = attemptCapFor(paper.id);
  const used = store.mockResults.filter((r) => r.paperId === paper.id && !r.invalidation).length;
  const attemptsLeft = cap === null ? null : Math.max(0, cap - used);
  const pass = typeof paper.passingScore === "number" ? row.score >= paper.passingScore : null;
  const pct = Math.round((row.score / ITEMS.length) * 100);
  const answered = row.answers.filter((a) => a >= 0).length;

  /* Reveal flags in force at view time — absent flags default on. */
  const revealReview = paper.revealReview !== false;
  const revealAnswers = paper.revealAnswers !== false;
  const revealExplanations = paper.revealExplanations !== false;

  return (
    <Page
      kind="assess"
      kicker="Mock scorecard"
      title={paper.title}
      lead="Recorded on this device and never shared. The review below reads the sitting's stored answers within the paper's reveal flags."
    >
      <div className="grid-2">
        <Card live>
          <ScorecardHero
            verdict={pass === null ? "ungraded" : pass ? "met" : "below"}
            pct={pct}
            score={row.score}
            total={ITEMS.length}
            when={formatWhen(row.at)}
            actions={
              <div className="row">
                <Link className="btn btn--primary" to={`/mock/${paper.id}/practice`}>Open practice — unsealed</Link>
                {attemptsLeft === null || attemptsLeft > 0 ? (
                  <Link className="btn btn--secondary" to={`/mock/${paper.id}`}>
                    {attemptsLeft === null ? "Sit again" : `Sit again — ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left`}
                  </Link>
                ) : null}
                <Link className="btn btn--quiet" to="/assessments/history">History</Link>
              </div>
            }
          />
          {ending === "auto" ? (
            <p className="meta" style={{ marginTop: "var(--space-3)" }}>Auto-submitted — the allocation ended.</p>
          ) : null}
          {attemptsLeft === 0 ? (
            <p className="meta" style={{ marginTop: "var(--space-3)", color: "var(--c-warning)" }}>
              Attempt cap reached — this paper cannot be sat again on this device.
            </p>
          ) : null}
          <dl className="account-facts" style={{ marginTop: "var(--space-4)" }}>
            <div><dt>Score</dt><dd>{row.score} of {ITEMS.length} correct</dd></div>
            <div><dt>Benchmark</dt><dd>{typeof paper.passingScore === "number" ? `${paper.passingScore} of ${ITEMS.length}` : "None published"}</dd></div>
            <div><dt>Answered</dt><dd>{answered} of {ITEMS.length}</dd></div>
            <div><dt>Recorded</dt><dd>{formatWhen(row.at)}</dd></div>
          </dl>
        </Card>

        {revealReview ? (
          <Card>
            <CardHeader title="Question-by-question review" icon="list" />
            {revealAnswers ? (
              <div className="list">
                {ITEMS.map((item, idx) => {
                  const userAns = row.answers[idx] ?? -1;
                  return (
                    <ReviewItemCard
                      key={item.id}
                      index={idx}
                      correct={userAns === item.answer}
                      prompt={item.prompt}
                      remediation={revealExplanations ? item.explanation : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <StateBlock state="refused" compact message="This paper seals per-item answers — the scorecard reports the sitting's totals only." />
            )}
            {revealAnswers && !revealExplanations ? (
              <p className="meta" style={{ marginTop: "var(--space-3)" }}>Explanations are sealed by this paper's reveal settings — verdicts only.</p>
            ) : null}
          </Card>
        ) : (
          <Card>
            <CardHeader title="Review sealed" icon="lock" />
            <p className="page__lead">This paper's reveal settings keep the question-level review closed. The scorecard above is the whole record.</p>
          </Card>
        )}
      </div>
    </Page>
  );
}

export function MockStart() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const paper = MOCKS.find((m) => m.id === paperId);
  const store = useStore();

  if (!paper) {
    return <Unresolved title="Start unavailable" message="This paper does not resolve in the catalogue." action={<Back to="/assessments/browse?view=mock">Mock papers</Back>} />;
  }

  const next = mockPaperNext(paper.id, store.mockResults.filter((r) => r.paperId === paper.id));

  /* Resume-first: a live draft goes back to its own sitting, never a fresh one. */
  if (next.kind === "resume") {
    return (
      <Page kind="assess" kicker="Mock paper" title={paper.title}>
        <StateBlock
          state="pending"
          message={`A sitting is already in progress — ${draftSummary(next.draft, ITEMS.length)}. Resume it; Start will not create another.`}
          action={<Link className="btn btn--primary" to={`/mock/${paper.id}/sitting`}>Resume sitting</Link>}
        />
      </Page>
    );
  }
  if (next.kind === "blocked") {
    return (
      <Page kind="assess" kicker="Mock paper" title={paper.title}>
        <StateBlock
          state="refused"
          message={next.reason}
          action={next.result ? <Link className="btn btn--secondary" to={`/mock/${paper.id}/result`}>View latest scorecard</Link> : undefined}
        />
      </Page>
    );
  }

  return (
    <Page
      kind="assess"
      kicker="Mock paper"
      title={paper.title}
      lead="The advisory systems check and the acknowledgement. The clock exists only after the explicit Start."
      actions={<Back to={`/mock/${paper.id}`}>Back to briefing</Back>}
    >
      <PreflightPanel
        minutes={paper.minutes}
        questions={paper.questions}
        rules={
          typeof paper.passingScore === "number"
            ? [{ icon: "check", text: `Benchmark ${paper.passingScore} of ${paper.questions} — a private mark, never a ranking.` }]
            : []
        }
        ackLabel={`I understand — ${paper.minutes} minutes, sealed, on-device saves, one sequence.`}
        startLabel="Start the sealed sitting"
        onStart={() => {
          /* The explicit act: the in-progress record and its timer begin here. */
          startDraft("mock", paper.id, paper.minutes * 60);
          navigate(`/mock/${paper.id}/sitting`);
        }}
      />
    </Page>
  );
}

export function MockPractice() {
  const { paperId } = useParams();
  const paper = MOCKS.find((m) => m.id === paperId);
  const store = useStore();
  const finalized = paper ? store.mockResults.some((r) => r.paperId === paper.id && !r.invalidation) : false;

  if (!paper) {
    return <Unresolved title="Practice unavailable" message="This paper does not resolve in the catalogue." action={<Back to="/assessments/browse?view=mock">Mock papers</Back>} />;
  }

  if (!finalized) {
    return (
      <Page kind="assess" kicker="Mock paper" title={paper.title}>
        <StateBlock
          state="refused"
          message="Open practice unlocks once a sealed sitting is finalized — there is no finished test on this paper yet."
          action={<Link className="btn btn--primary" to={`/mock/${paper.id}`}>Open the briefing</Link>}
        />
      </Page>
    );
  }

  return (
    <Page
      kind="assess"
      kicker="Open practice"
      title={paper.title}
      lead="Unsealed: no clock, no recorded events, nothing stored. The run's figures are transient."
      actions={<Back to={`/mock/${paper.id}/result`}>Scorecard</Back>}
    >
      <PracticeScreen
        items={ITEMS}
        revealAnswers={paper.revealAnswers !== false}
        revealExplanations={paper.revealExplanations !== false}
        resultTo={`/mock/${paper.id}/result`}
        resultLabel="Back to the scorecard"
      />
    </Page>
  );
}
