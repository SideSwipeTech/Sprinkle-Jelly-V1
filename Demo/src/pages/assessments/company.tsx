/**
 * company — the Company flow: employer card → company page → the company's
 * papers → paper briefing → advisory preflight → the sealed sitting → the
 * completion record. No other entry reaches a company paper.
 *
 * Company papers never produce a grade: items enter the sitting without
 * answer keys, so the session finishes ungraded and the register stores a
 * completion row — never a score, never a pass/fail. Open practice is the
 * unsealed variant, unlocked only by a finalized test, and its transient
 * correctness is kept nowhere.
 */

import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import {
  COMPANIES,
  COMPANY_QUESTIONS,
  companyPapersFor,
  type Company,
  type CompanyPaper
} from "@data/catalog";
import { saveCompanyResult, type Store } from "@state/store";
import { raise } from "@companion/stream";
import { useStore } from "@state/useStore";
import { BriefingRulesList } from "../../extraction/components/BriefingRulesList/BriefingRulesList";
import { CompletionFactPanel } from "../../extraction/components/CompletionFactPanel/CompletionFactPanel";
import { ExamFlagRow } from "../../extraction/components/ExamFlagRow/ExamFlagRow";
import { ProvenanceChip } from "../../extraction/components/ProvenanceChip/ProvenanceChip";
import type { SittingItem } from "../../extraction/components/ExamChrome/hooks";
import { clearDraft, companyPaperNext, loadDraft, startDraft } from "./sittings";
import {
  draftSummary,
  formatWhen,
  PreflightPanel,
  PracticeScreen,
  SittingScreen
} from "./shared";
import { NextAction } from "./catalogue";

/* The sealed sitting gets no keys — a company paper never grades. */
const SITTING_ITEMS: SittingItem[] = COMPANY_QUESTIONS.map((q) => ({
  id: q.id,
  prompt: q.prompt,
  choices: q.choices
}));

/* Open practice keeps the keys — its per-item correctness is transient. */
const PRACTICE_ITEMS: SittingItem[] = COMPANY_QUESTIONS.map((q) => ({
  id: q.id,
  prompt: q.prompt,
  choices: q.choices,
  answer: q.answer
}));

const EXPERIENCE = [
  { name: "Timer", hint: "On-screen countdown for the whole sitting", on: true },
  { name: "Question palette", hint: "Numbered rail with per-item state", on: true },
  { name: "Mark for review", hint: "Star items to revisit", on: true },
  { name: "Skip permitted", hint: "Move past unanswered items", on: true },
  { name: "Revisit permitted", hint: "Return to any viewed item", on: true },
  { name: "No grading", hint: "A completion record only — never a score", on: true }
];

function Unresolved({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <Page kind="assess" title={title}>
      <StateBlock state="unavailable" message={message} action={action} />
    </Page>
  );
}

/* ── Paper resolution ─────────────────────────────────────────────────────── */

/** A legacy completion row predates the per-paper model — it reads as the
 *  company's first paper. */
function rowPaperId(row: Store["companyResults"][number], companyId: string): string | null {
  return row.paperId ?? companyPapersFor(companyId)[0]?.id ?? null;
}

function resultsForPaper(store: Store, companyId: string, paperId: string) {
  return store.companyResults.filter((r) => r.companyId === companyId && rowPaperId(r, companyId) === paperId);
}

/** The `?paper=` param names the paper; absent, the company's first. An id the
 *  company does not own resolves to nothing — it is refused, not defaulted. */
function resolvePaper(company: Company, param: string | null): CompanyPaper | null {
  const papers = companyPapersFor(company.id);
  if (!param) return papers[0] ?? null;
  return papers.find((p) => p.id === param) ?? null;
}

/* ── Employer page — the company's papers live here ───────────────────────── */

export function CompanyDetail() {
  const { companyId } = useParams();
  const company = COMPANIES.find((c) => c.id === companyId);
  const store = useStore();
  const papers = company ? companyPapersFor(company.id) : [];

  if (!company) {
    return <Unresolved title="Company unavailable" message="This employer does not resolve in the catalogue." action={<Back to="/assessments/browse?view=company">Companies</Back>} />;
  }

  const resumeCount = papers.filter((p) => loadDraft("company", p.id)).length;

  return (
    <Page
      kind="assess"
      kicker="Company paper"
      title={company.name}
      lead="One completion record per finished sitting — never a pass/fail badge, never shared. Papers open only from this page."
      actions={<Back to="/assessments/browse?view=company">Companies</Back>}
    >
      {resumeCount > 0 ? (
        <Card live>
          <CardHeader title="Sitting in progress" icon="history" />
          <p className="page__lead">
            {resumeCount === 1 ? "One paper has an open sitting" : `${resumeCount} papers have open sittings`} — resume continues the same test; nothing is restarted.
          </p>
        </Card>
      ) : null}

      <div className="grid-2" style={{ marginTop: resumeCount ? "var(--space-4)" : 0 }}>
        <Card live>
          <CardHeader title="Papers" icon="clipboard" />
          <div className="list">
            {papers.map((paper) => {
              const results = resultsForPaper(store, company.id, paper.id);
              const next = companyPaperNext(paper.id, results, paper.blockedReason);
              const done = results.filter((r) => !r.invalidation).length;
              return (
                <div key={paper.id} className="list-row" style={{ cursor: "default", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <strong>{paper.title}</strong>
                    <p className="meta">
                      {paper.questions} questions · {paper.minutes} min · {paper.strictness === "strict" ? "Strict" : "Standard"} posture
                      {done ? ` · ${done} completed` : ""}
                    </p>
                    <NextAction
                      next={next}
                      total={COMPANY_QUESTIONS.length}
                      startTo={`/company/${company.id}/briefing?paper=${paper.id}`}
                      sittingTo={`/company/${company.id}/sitting?paper=${paper.id}`}
                      resultTo={`/company/${company.id}/result?paper=${paper.id}`}
                      startLabel="Open briefing"
                      resultLabel="View sitting record"
                    />
                  </div>
                  <ProvenanceChip kind={paper.provenance === "Actual" ? "actual" : "curated"}>
                    {paper.provenance === "Actual" ? "Actual" : "Pattern"}
                  </ProvenanceChip>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="What a company sitting records" icon="shield" />
          <BriefingRulesList
            rules={[
              { icon: "check", lead: "A completion record:", text: "items answered and the timestamp — kept on this device." },
              { icon: "x", lead: "No grade:", text: "the paper type carries no keys into the sitting; nothing is scored." },
              { icon: "lock", lead: "Not shared:", text: "your record is yours — a company paper reports nothing outward." },
              { icon: "history", lead: "One measured test per paper:", text: "a finalized sitting is the record; unsealed practice stays open after it." }
            ]}
          />
        </Card>
      </div>
    </Page>
  );
}

/* ── Briefing → advisory preflight → explicit Start ───────────────────────── */

export function CompanyBriefing() {
  const { companyId } = useParams();
  const [search] = useSearchParams();
  const company = COMPANIES.find((c) => c.id === companyId);
  const paper = company ? resolvePaper(company, search.get("paper")) : null;
  const store = useStore();

  if (!company) {
    return <Unresolved title="Company unavailable" message="This employer does not resolve in the catalogue." action={<Back to="/assessments/browse?view=company">Companies</Back>} />;
  }
  if (!paper) {
    return (
      <Unresolved
        title="Paper unavailable"
        message="This company owns no paper at this address — open its papers list and choose from there."
        action={<Back to={`/company/${company.id}`}>Back to {company.name}</Back>}
      />
    );
  }

  const results = resultsForPaper(store, company.id, paper.id);
  const next = companyPaperNext(paper.id, results, paper.blockedReason);
  const draft = next.kind === "resume" ? next.draft : null;

  return (
    <Page
      kind="assess"
      kicker={`Company briefing · ${company.name}`}
      title={paper.title}
      lead="The paper's entry page — briefing first, then the systems check, then the acknowledgement, then Start. Nothing here starts a clock."
      actions={<Back to={`/company/${company.id}`}>{company.name}</Back>}
    >
      {draft ? (
        <Card live>
          <CardHeader title="A sitting is in progress" icon="clock" />
          <p className="page__lead">{draftSummary(draft, COMPANY_QUESTIONS.length)}.</p>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to={`/company/${company.id}/sitting?paper=${paper.id}`}>Resume sitting</Link>
          </div>
        </Card>
      ) : null}

      <div className="grid-2" style={{ marginTop: draft ? "var(--space-4)" : 0 }}>
        <Card live>
          <CardHeader eyebrow="Examination parameters" title="Sitting briefing" icon="clipboard" />
          <BriefingRulesList
            rules={[
              { icon: "clock", lead: `${paper.minutes} minutes:`, text: "the countdown begins at the explicit Start — never by browsing or acknowledging." },
              { icon: "target", lead: `${paper.questions} questions:`, text: "single sequence; skip and revisit are permitted." },
              { icon: "shield", lead: `${paper.strictness === "strict" ? "Strict" : "Standard"} posture:`, text: "sealed — assistant and notifications are suppressed until submission." },
              { icon: "save", lead: "Completion record:", text: "the register stores what you answered and when — no score exists to leak." },
              { icon: "info", lead: "Simulated checks:", text: "the systems check labels anything it cannot truly verify — nothing is claimed." }
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
                        <Link className="btn btn--secondary" to={`/company/${company.id}/result?paper=${paper.id}`}>View sitting record</Link>
                      ) : null}
                      {next.practice ? (
                        <Link className="btn btn--quiet" to={`/company/${company.id}/practice?paper=${paper.id}`}>Open practice — unsealed</Link>
                      ) : null}
                    </div>
                  ) : undefined
                }
              />
            ) : next.kind === "resume" ? null : (
              <Link className="btn btn--primary" to={`/company/${company.id}/start?paper=${paper.id}`}>Continue to checks</Link>
            )}
            {next.kind === "result" ? (
              <>
                <Link className="btn btn--secondary" to={`/company/${company.id}/result?paper=${paper.id}`}>View sitting record</Link>
                {next.practice ? (
                  <Link className="btn btn--quiet" to={`/company/${company.id}/practice?paper=${paper.id}`}>Open practice — unsealed</Link>
                ) : null}
              </>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader title="What this sitting provides" icon="check" />
          <div className="list">
            {EXPERIENCE.map((flag) => (
              <ExamFlagRow key={flag.name} name={flag.name} hint={flag.hint} on={flag.on} />
            ))}
          </div>
          <ProvenanceChip kind={paper.provenance === "Actual" ? "actual" : "curated"}>
            {paper.provenance === "Actual" ? "Actual employer pattern" : "Curated pattern"}
          </ProvenanceChip>
        </Card>
      </div>
    </Page>
  );
}

export function CompanyStart() {
  const { companyId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const company = COMPANIES.find((c) => c.id === companyId);
  const paper = company ? resolvePaper(company, search.get("paper")) : null;
  const store = useStore();

  if (!company) {
    return <Unresolved title="Company unavailable" message="This employer does not resolve in the catalogue." action={<Back to="/assessments/browse?view=company">Companies</Back>} />;
  }
  if (!paper) {
    return (
      <Unresolved
        title="Paper unavailable"
        message="This company owns no paper at this address."
        action={<Back to={`/company/${company.id}`}>Back to {company.name}</Back>}
      />
    );
  }

  const results = resultsForPaper(store, company.id, paper.id);
  const next = companyPaperNext(paper.id, results, paper.blockedReason);

  /* Resume-first: a live draft goes back to its own sitting, never a fresh one. */
  if (next.kind === "resume") {
    return (
      <Page kind="assess" kicker={`Company · ${company.name}`} title={paper.title}>
        <StateBlock
          state="pending"
          message={`A sitting is already in progress — ${draftSummary(next.draft, COMPANY_QUESTIONS.length)}. Resume it; Start will not create another.`}
          action={<Link className="btn btn--primary" to={`/company/${company.id}/sitting?paper=${paper.id}`}>Resume sitting</Link>}
        />
      </Page>
    );
  }
  if (next.kind === "blocked") {
    return (
      <Page kind="assess" kicker={`Company · ${company.name}`} title={paper.title}>
        <StateBlock state="refused" message={next.reason} action={<Back to={`/company/${company.id}`}>Back to {company.name}</Back>} />
      </Page>
    );
  }
  if (next.kind === "result") {
    return (
      <Page kind="assess" kicker={`Company · ${company.name}`} title={paper.title}>
        <StateBlock
          state="data"
          message="This paper's measured sitting is finalized — one completion record per paper. Its record stays reachable; unsealed practice is open."
          action={
            <div className="row">
              <Link className="btn btn--primary" to={`/company/${company.id}/result?paper=${paper.id}`}>View sitting record</Link>
              <Link className="btn btn--quiet" to={`/company/${company.id}/practice?paper=${paper.id}`}>Open practice</Link>
            </div>
          }
        />
      </Page>
    );
  }

  return (
    <Page
      kind="assess"
      kicker={`Company · ${company.name}`}
      title={paper.title}
      lead="The advisory systems check and the acknowledgement. The clock exists only after the explicit Start."
      actions={<Back to={`/company/${company.id}/briefing?paper=${paper.id}`}>Back to briefing</Back>}
    >
      <PreflightPanel
        minutes={paper.minutes}
        questions={paper.questions}
        rules={[
          { icon: "check", text: `Completing records a sitting on ${company.name}'s register — never a grade.` }
        ]}
        ackLabel={`I understand — ${paper.minutes} minutes, sealed, on-device saves, a completion record only.`}
        startLabel="Start the sealed sitting"
        onStart={() => {
          /* The explicit act: the in-progress record and its timer begin here. */
          startDraft("company", paper.id, paper.minutes * 60);
          navigate(`/company/${company.id}/sitting?paper=${paper.id}`);
        }}
      />
    </Page>
  );
}

/* ── The sealed sitting ───────────────────────────────────────────────────── */

export function CompanySitting() {
  const { companyId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const company = COMPANIES.find((c) => c.id === companyId);
  const paper = company ? resolvePaper(company, search.get("paper")) : null;
  const draft = paper ? loadDraft("company", paper.id) : null;

  if (!company || !paper) {
    return <Unresolved title="Sitting unavailable" message="This company paper does not resolve." action={<Back to="/assessments/browse?view=company">Companies</Back>} />;
  }

  if (!draft) {
    return (
      <Page kind="assess" kicker={`Company · ${company.name}`} title={paper.title}>
        <StateBlock
          state="refused"
          message="No sitting is in progress — the clock only exists after the explicit Start. Open the paper's briefing to begin."
          action={<Link className="btn btn--primary" to={`/company/${company.id}/briefing?paper=${paper.id}`}>Open the briefing</Link>}
        />
      </Page>
    );
  }

  return (
    <Page kind="assess" kicker={`${company.name} · ${paper.title}`} title={`${company.name} sitting`}>
      <SittingScreen
        draft={draft}
        items={SITTING_ITEMS}
        minutes={paper.minutes}
        bannerLabel="SEALED — AUTO-SAVE ON"
        commitLabel="Recording completion on this device"
        submitLabel="Submit for completion"
        onCommit={(result, ending) => {
          /* Company sittings store the completion row — never a score. */
          saveCompanyResult(company.id, { id: paper.id, title: paper.title }, result.answeredCount, SITTING_ITEMS.length);
          clearDraft("company", paper.id);
          navigate(`/company/${company.id}/result?paper=${paper.id}`, { state: { ending } });
        }}
      />
    </Page>
  );
}

/* ── The completion record ────────────────────────────────────────────────── */

export function CompanyResult() {
  const { companyId } = useParams();
  const [search] = useSearchParams();
  const location = useLocation();
  const store = useStore();
  const company = COMPANIES.find((c) => c.id === companyId);
  const paper = company ? resolvePaper(company, search.get("paper")) : null;
  const ending = (location.state as { ending?: string } | null)?.ending;

  const rows = company && paper ? resultsForPaper(store, company.id, paper.id) : [];
  const row = rows[0] ?? null;
  const draft = paper ? loadDraft("company", paper.id) : null;

  useEffect(() => {
    if (row && paper && !row.invalidation) raise("result ready", { paper: paper.title });
  }, [row, paper]);

  if (!company) {
    return <Unresolved title="Result unavailable" message="This employer does not resolve in the catalogue." action={<Back to="/assessments/history">History</Back>} />;
  }
  if (!paper) {
    return (
      <Unresolved
        title="Paper unavailable"
        message="This company owns no paper at this address."
        action={<Back to={`/company/${company.id}`}>Back to {company.name}</Back>}
      />
    );
  }

  if (!row) {
    if (draft) {
      return (
        <Page kind="assess" kicker={`Company · ${company.name}`} title={paper.title}>
          <StateBlock
            state="pending"
            message={`A sitting is still in progress — ${draftSummary(draft, COMPANY_QUESTIONS.length)}. The record appears once it is submitted.`}
            action={<Link className="btn btn--primary" to={`/company/${company.id}/sitting?paper=${paper.id}`}>Resume sitting</Link>}
          />
        </Page>
      );
    }
    return (
      <Unresolved
        title="Result unavailable"
        message="No completion record is stored for this paper."
        action={<Link className="btn btn--primary" to={`/company/${company.id}/briefing?paper=${paper.id}`}>Open the briefing</Link>}
      />
    );
  }

  /* Invalidated: the record keeps its reason; the attempt is restored. */
  if (row.invalidation) {
    return (
      <Page
        kind="assess"
        kicker={`Company sitting — invalidated · ${company.name}`}
        title={paper.title}
        lead="This test's record was voided. The measured attempt it consumed was restored — the paper can be sat again where its window allows."
      >
        <Card>
          <CardHeader title="Invalidated" icon="alert" />
          <StateBlock
            state="refused"
            message={`${row.invalidation.reason}. Recorded ${formatWhen(row.invalidation.at)}; the sitting ran ${formatWhen(row.at)}.`}
          />
          <CompletionFactPanel
            label="Voided record"
            facts={[
              { term: "Paper type", value: "Company" },
              { term: "Recorded state", value: "Voided — it never stands as a record" },
              { term: "Open practice", value: "Locked until a sitting finalizes again" }
            ]}
          />
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to={`/company/${company.id}/briefing?paper=${paper.id}`}>Open briefing — sit again</Link>
            <Link className="btn btn--quiet" to="/assessments/history">History</Link>
          </div>
        </Card>
      </Page>
    );
  }

  const answered = typeof row.answered === "number" ? row.answered : null;
  const total = typeof row.total === "number" ? row.total : COMPANY_QUESTIONS.length;

  return (
    <Page
      kind="assess"
      kicker={`Company record · ${company.name}`}
      title={paper.title}
      lead="A completion record — what was answered and when. Company papers carry no pass/fail and report nothing outward."
      actions={<Back to={`/company/${company.id}`}>{company.name}</Back>}
    >
      <div className="grid-2">
        <Card live>
          <CardHeader title="Sitting record" icon="check" />
          <CompletionFactPanel
            facts={[
              { term: "Company", value: company.name },
              { term: "Paper", value: paper.title },
              { term: "Items answered", value: answered === null ? `${total} recorded` : `${answered} of ${total}` },
              { term: "Completed", value: formatWhen(row.at) },
              { term: "Grade", value: "None — company papers are not graded" }
            ]}
            note="This record lives on this device. Open practice stays unsealed below — it writes nothing."
          />
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to={`/company/${company.id}/practice?paper=${paper.id}`}>Open practice — unsealed</Link>
            <Link className="btn btn--quiet" to="/assessments/history">History</Link>
          </div>
          {ending === "auto" ? (
            <p className="meta" style={{ marginTop: "var(--space-3)" }}>Auto-submitted — the allocation ended.</p>
          ) : null}
        </Card>

        <Card>
          <CardHeader title="About this record" icon="shield" />
          <BriefingRulesList
            rules={[
              { icon: "check", lead: "Recorded:", text: "the items you reached and answered, and the timestamp." },
              { icon: "x", lead: "Not recorded:", text: "no score, no percentile, no share — the paper type carries none." },
              { icon: "history", lead: "One measured test:", text: "this paper's sitting is final; the unsealed run beside it is yours to repeat." }
            ]}
          />
        </Card>
      </div>
    </Page>
  );
}

/* ── Open practice ────────────────────────────────────────────────────────── */

export function CompanyPractice() {
  const { companyId } = useParams();
  const [search] = useSearchParams();
  const store = useStore();
  const company = COMPANIES.find((c) => c.id === companyId);
  const paper = company ? resolvePaper(company, search.get("paper")) : null;

  if (!company) {
    return <Unresolved title="Practice unavailable" message="This employer does not resolve in the catalogue." action={<Back to="/assessments/browse?view=company">Companies</Back>} />;
  }
  if (!paper) {
    return (
      <Unresolved
        title="Paper unavailable"
        message="This company owns no paper at this address."
        action={<Back to={`/company/${company.id}`}>Back to {company.name}</Back>}
      />
    );
  }

  const finalized = resultsForPaper(store, company.id, paper.id).some((r) => !r.invalidation);

  if (!finalized) {
    return (
      <Page kind="assess" kicker={`Company · ${company.name}`} title={paper.title}>
        <StateBlock
          state="refused"
          message="Open practice unlocks once a sealed sitting is finalized — there is no finished test on this paper yet."
          action={<Link className="btn btn--primary" to={`/company/${company.id}/briefing?paper=${paper.id}`}>Open the briefing</Link>}
        />
      </Page>
    );
  }

  return (
    <Page
      kind="assess"
      kicker={`Open practice · ${company.name}`}
      title={paper.title}
      lead="Unsealed: no clock, no recorded events, nothing stored. Correctness here is transient and reports nowhere."
      actions={<Back to={`/company/${company.id}/result?paper=${paper.id}`}>Sitting record</Back>}
    >
      <PracticeScreen
        items={PRACTICE_ITEMS}
        revealAnswers
        revealExplanations
        resultTo={`/company/${company.id}/result?paper=${paper.id}`}
        resultLabel="Back to the sitting record"
      />
    </Page>
  );
}

/* ── The retired redo route — kept resolving, never a dead link ───────────── */

export function CompanyRedo() {
  const { companyId } = useParams();
  const company = COMPANIES.find((c) => c.id === companyId);

  if (!company) {
    return <Unresolved title="Route unavailable" message="This employer does not resolve in the catalogue." action={<Back to="/assessments/browse?view=company">Companies</Back>} />;
  }

  return (
    <Page kind="assess" kicker={`Company · ${company.name}`} title="No redo of a sealed sitting">
      <Card>
        <CardHeader title="This route is retired" icon="history" />
        <p className="page__lead">
          A measured company sitting is one test — it cannot be re-run. What continues after it is open
          practice: the same items, unsealed, unrecorded.
        </p>
        <div className="row" style={{ marginTop: "var(--space-4)" }}>
          <Link className="btn btn--primary" to={`/company/${company.id}`}>Open {company.name}'s papers</Link>
          <Link className="btn btn--quiet" to="/assessments/history">History</Link>
        </div>
      </Card>
    </Page>
  );
}
