/**
 * catalogue — the assessment discovery pages.
 *
 * Mock papers and Company employers are never mixed: the catalogue is two
 * local views behind one search, and History keeps the two registers
 * type-aware (mock scorecards vs company completion records). Every paper
 * card carries exactly one legitimate next action — start path, resume,
 * result, or a blocked reason — plus a labelled three-dot menu for the
 * secondary places (briefing, history) that are not the next action.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import {
  COMPANIES,
  COMPANY_QUESTIONS,
  MOCKS,
  MOCK_QUESTIONS,
  companyPaperById,
  type Company,
  type MockPaper
} from "@data/catalog";
import { useStore } from "@state/useStore";
import type { Store } from "@state/store";
import { Menu } from "../../extraction/components/Menu/Menu";
import { ProvenanceChip } from "../../extraction/components/ProvenanceChip/ProvenanceChip";
import {
  allDrafts,
  draftKey,
  mockPaperNext,
  type NextVerdict
} from "./sittings";
import { AssessViewsNav, draftSummary, formatWhen } from "./shared";

/* ── Cards ─────────────────────────────────────────────────────────────────── */

function MockPaperCard({ paper, results, index }: { paper: MockPaper; results: Store["mockResults"]; index: number }) {
  const navigate = useNavigate();
  const next = mockPaperNext(paper.id, results);
  const briefing = `/mock/${paper.id}`;

  const menuItems = [
    ...(next.kind !== "start" ? [{ id: "briefing", label: "Read the briefing" }] : []),
    ...(next.practice ? [{ id: "practice", label: "Open practice — unsealed" }] : []),
    { id: "history", label: "Mock history" }
  ];
  const onMenu = (id: string) => {
    if (id === "briefing") navigate(briefing);
    if (id === "practice") navigate(`/mock/${paper.id}/practice`);
    if (id === "history") navigate("/assessments/history");
  };

  return (
    <Card index={index}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <span className="micro" style={{ color: "var(--c-accent-primary)" }}>{paper.category}</span>
        <Menu
          trigger={<Icon name="more" size={16} />}
          triggerLabel={`Actions for ${paper.title}`}
          items={menuItems}
          onSelect={onMenu}
          align="end"
        />
      </div>
      <h3 style={{ fontSize: "var(--text-base)", margin: "var(--space-2) 0" }}>
        <Link to={briefing}>{paper.title}</Link>
      </h3>
      <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>{paper.summary}</p>
      <div className="row" style={{ gap: "6px", margin: "var(--space-3) 0" }}>
        <span className="chip chip--accent">{paper.difficulty}</span>
        <span className="chip chip--quiet">{paper.minutes}m sitting</span>
        <span className="chip chip--quiet">{paper.questions} questions</span>
        {typeof paper.passingScore === "number" ? (
          <span className="chip chip--quiet">Benchmark {paper.passingScore} of {paper.questions}</span>
        ) : null}
      </div>
      <NextAction next={next} total={MOCK_QUESTIONS.length} resultTo={`${briefing}/result`} sittingTo={`${briefing}/sitting`} startTo={briefing} startLabel="Open briefing" />
    </Card>
  );
}

/** The card's one next action. The blocked reason renders as the state note
 *  in place of a start — a finished paper still offers its scorecard. */
export function NextAction({ next, total, resultTo, sittingTo, startTo, startLabel, resultLabel = "View scorecard" }: {
  next: NextVerdict;
  total: number;
  resultTo: string;
  sittingTo: string;
  startTo: string;
  startLabel: string;
  resultLabel?: string;
}) {
  return (
    <div style={{ marginTop: "var(--space-4)" }}>
      {next.kind === "start" ? (
        <Link className="btn btn--primary" to={startTo}>{startLabel}</Link>
      ) : null}
      {next.kind === "resume" ? (
        <>
          <Link className="btn btn--primary" to={sittingTo}>Resume sitting</Link>
          <p className="meta" style={{ margin: "var(--space-1) 0 0" }}>{draftSummary(next.draft, total)}</p>
        </>
      ) : null}
      {next.kind === "result" ? (
        <Link className="btn btn--primary" to={resultTo}>{resultLabel}</Link>
      ) : null}
      {next.kind === "blocked" ? (
        <>
          {next.result ? <Link className="btn btn--secondary" to={resultTo}>{resultLabel}</Link> : null}
          <p className="meta" style={{ margin: "6px 0 0", color: "var(--c-warning)" }}>
            <Icon name="lock" size={12} /> {next.reason}
          </p>
        </>
      ) : null}
    </div>
  );
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  return (
    <Card index={index}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <ProvenanceChip kind={company.provenance === "Actual" ? "actual" : "curated"}>
          {company.provenance === "Actual" ? `Actual ${company.year ?? ""} OA pattern` : "Curated archetype"}
        </ProvenanceChip>
        <span className="chip">{company.difficulty}</span>
      </div>
      <h3 style={{ fontSize: "var(--text-lg)", margin: "var(--space-2) 0 4px" }}>
        <Link to={`/company/${company.id}`}>{company.name}</Link>
      </h3>
      <p className="meta" style={{ margin: "0 0 var(--space-2)" }}>{company.role ?? "Software Engineer"} · {company.year ?? "2026"}</p>
      <p className="page__lead">{company.summary}</p>
      <div className="row" style={{ gap: "6px", margin: "var(--space-3) 0" }}>
        {company.focusAreas.slice(0, 4).map((f) => (
          <span key={f} className="chip chip--quiet">{f}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-4)" }}>
        <span className="meta">{company.papers} papers · no pass/fail</span>
        <Link className="btn btn--primary" to={`/company/${company.id}`}>Open papers</Link>
      </div>
    </Card>
  );
}

/* ── Overview ──────────────────────────────────────────────────────────────── */

export function AssessmentHome() {
  const store = useStore();
  const drafts = allDrafts();
  const mockDrafts = drafts.filter((d) => d.kind === "mock" && MOCKS.some((m) => m.id === d.refId));
  const companyDrafts = drafts
    .filter((d) => d.kind === "company")
    .map((d) => ({ draft: d, paper: companyPaperById(d.refId) }))
    .filter((entry) => entry.paper && COMPANIES.some((c) => c.id === entry.paper!.companyId));
  /* "Latest" means the newest finalized row — an invalidated sitting stays in
     history flagged, never posing as the record. */
  const latestMock = store.mockResults.find((r) => !r.invalidation);
  const latestCompany = store.companyResults.find((r) => !r.invalidation);

  return (
    <Page
      kind="assess"
      kicker="Assessment"
      title="Assessment Center"
      lead="Mock papers and Company employers are separate views with separate histories. Company papers never produce pass/fail or rewards."
    >
      <AssessViewsNav current="overview" />

      {drafts.length ? (
        <Card live>
          <CardHeader title="Continue a sitting" icon="clock" />
          <div className="list">
            {mockDrafts.map((d) => (
              <Link key={draftKey("mock", d.refId)} className="list-row" to={`/mock/${d.refId}/sitting`}>
                <div>
                  <strong>{MOCKS.find((m) => m.id === d.refId)?.title ?? d.refId}</strong>
                  <p className="meta">Mock · {draftSummary(d, d.answers.length || MOCK_QUESTIONS.length)}</p>
                </div>
                <span className="chip chip--quiet">Resume</span>
              </Link>
            ))}
            {companyDrafts.map(({ draft: d, paper }) => (
              <Link key={draftKey("company", d.refId)} className="list-row" to={`/company/${paper!.companyId}/sitting?paper=${d.refId}`}>
                <div>
                  <strong>{COMPANIES.find((c) => c.id === paper!.companyId)?.name ?? paper!.companyId} — {paper!.title}</strong>
                  <p className="meta">Company · {draftSummary(d, d.answers.length || COMPANY_QUESTIONS.length)}</p>
                </div>
                <span className="chip chip--quiet">Resume</span>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid-2">
        <Card live>
          <CardHeader eyebrow="Mock papers" title="Timed practice papers" icon="clipboard" />
          <p className="page__lead">Sealed on-device sittings with a published benchmark. Scores are yours alone.</p>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to="/assessments/browse?view=mock">Browse mock papers</Link>
          </div>
        </Card>
        <Card>
          <CardHeader eyebrow="Company papers" title="Employer simulations" icon="companies" />
          <p className="page__lead">Private preparation drills. Completion is recorded — no grade, no ranking, nothing leaves this device.</p>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to="/assessments/browse?view=company">Browse companies</Link>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Your latest sittings" icon="history" />
        <div className="list">
          {latestMock ? (
            <Link className="list-row" to={`/mock/${latestMock.paperId}/result`}>
              <div>
                <strong>{MOCKS.find((item) => item.id === latestMock.paperId)?.title ?? latestMock.paperId}</strong>
                <p className="meta">Mock · {latestMock.score} of {MOCK_QUESTIONS.length} correct · {formatWhen(latestMock.at)}</p>
              </div>
              <span className="chip chip--quiet">Scorecard</span>
            </Link>
          ) : null}
          {latestCompany ? (
            <Link className="list-row" to={`/company/${latestCompany.companyId}/result${latestCompany.paperId ? `?paper=${latestCompany.paperId}` : ""}`}>
              <div>
                <strong>{latestCompany.paperTitle ?? COMPANIES.find((item) => item.id === latestCompany.companyId)?.name ?? latestCompany.companyId}</strong>
                <p className="meta">Company · completed · no pass/fail · {formatWhen(latestCompany.at)}</p>
              </div>
              <span className="chip chip--quiet">Sitting record</span>
            </Link>
          ) : null}
          {!latestMock && !latestCompany ? (
            <StateBlock state="empty" message="No completed sittings yet. Mock and Company histories stay separate here." />
          ) : null}
        </div>
      </Card>
    </Page>
  );
}

/* ── Catalogue — the two local views ───────────────────────────────────────── */

export function AssessmentBrowse() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "company" ? "company" : "mock";
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState("All");
  const store = useStore();

  const normalized = query.trim().toLowerCase();
  const mocks = useMemo(
    () =>
      MOCKS.filter(
        (item) =>
          (diff === "All" || item.difficulty === diff) &&
          (!normalized || `${item.title} ${item.summary} ${item.category} ${item.tags.join(" ")}`.toLowerCase().includes(normalized))
      ),
    [normalized, diff]
  );
  const companies = useMemo(
    () =>
      COMPANIES.filter(
        (item) =>
          (diff === "All" || item.difficulty === diff) &&
          (!normalized || `${item.name} ${item.summary} ${item.focusAreas.join(" ")}`.toLowerCase().includes(normalized))
      ),
    [normalized, diff]
  );
  const resultsByPaper = useMemo(() => {
    const map = new Map<string, Store["mockResults"]>();
    for (const r of store.mockResults) {
      const list = map.get(r.paperId) ?? [];
      list.push(r);
      map.set(r.paperId, list);
    }
    return map;
  }, [store.mockResults]);

  const setView = (v: "mock" | "company") => {
    setDiff("All");
    setParams({ view: v });
  };
  const visible = view === "mock" ? mocks.length : companies.length;

  return (
    <Page
      kind="assess"
      kicker="Assessment"
      title="Browse assessments"
      lead="Mock papers open a briefing directly. Companies open their employer page, then the paper."
      actions={<Back to="/assessments">Overview</Back>}
    >
      <AssessViewsNav current={view} />

      <div className="filters" aria-label="Paper type" style={{ marginBottom: "var(--space-3)" }}>
        {(
          [
            { id: "mock", label: `Mock papers (${MOCKS.length})` },
            { id: "company", label: `Companies (${COMPANIES.length})` }
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={view === option.id}
            className="chip"
            data-on={view === option.id || undefined}
            onClick={() => setView(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filters" style={{ marginBottom: "var(--space-4)" }}>
        <label className="filters__search">
          <Icon name="search" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={view === "mock" ? "Search papers or skills…" : "Search companies or focus areas…"}
          />
        </label>
        {["All", "Easy", "Medium", "Hard"].map((d) => (
          <button key={d} type="button" className="chip" data-on={diff === d || undefined} onClick={() => setDiff(d)}>
            {d}
          </button>
        ))}
      </div>

      {visible === 0 ? (
        <StateBlock state="empty" message="Nothing matched that search." action={
          <button className="btn btn--quiet" type="button" onClick={() => { setQuery(""); setDiff("All"); }}>Clear filters</button>
        } />
      ) : (
        <div className="courses__grid" aria-label={view === "mock" ? "Mock papers" : "Companies"}>
          {view === "mock"
            ? mocks.map((item, idx) => (
                <MockPaperCard key={item.id} paper={item} results={resultsByPaper.get(item.id) ?? []} index={idx} />
              ))
            : companies.map((item, idx) => <CompanyCard key={item.id} company={item} index={idx} />)}
        </div>
      )}
    </Page>
  );
}

/* ── History — two type-aware registers ────────────────────────────────────── */

export function AssessmentHistory() {
  const store = useStore();
  const mockDrafts = allDrafts().filter((d) => d.kind === "mock" && MOCKS.some((m) => m.id === d.refId));
  const companyDrafts = allDrafts()
    .filter((d) => d.kind === "company")
    .map((d) => ({ draft: d, paper: companyPaperById(d.refId) }))
    .filter((entry) => entry.paper && COMPANIES.some((c) => c.id === entry.paper!.companyId));

  return (
    <Page
      kind="assess"
      kicker="Assessment"
      title="Assessment history"
      lead="Two independently kept histories. Mock scorecards never mix with Company completion records; invalidated rows stay flagged with their reason."
      actions={<Back to="/assessments">Overview</Back>}
    >
      <AssessViewsNav current="history" />
      <div className="grid-2">
        <Card>
          <CardHeader title="Mock history" icon="clipboard" />
          <div className="list">
            {mockDrafts.map((d) => (
              <Link key={d.startedAt} className="list-row" to={`/mock/${d.refId}/sitting`}>
                <div>
                  <strong>{MOCKS.find((m) => m.id === d.refId)?.title ?? d.refId}</strong>
                  <p className="meta">In progress · {draftSummary(d, MOCK_QUESTIONS.length)}</p>
                </div>
                <span className="chip chip--accent">Resume</span>
              </Link>
            ))}
            {store.mockResults.map((row) => (
              <Link key={row.at} className="list-row" to={`/mock/${row.paperId}/result`}>
                <div>
                  <strong>{MOCKS.find((item) => item.id === row.paperId)?.title ?? row.paperId}</strong>
                  <p className="meta">
                    {row.invalidation
                      ? `Invalidated — ${row.invalidation.reason} · sat ${formatWhen(row.at)}`
                      : `${row.score} of ${MOCK_QUESTIONS.length} correct · ${formatWhen(row.at)}`}
                  </p>
                </div>
                <span className={`chip ${row.invalidation ? "" : "chip--quiet"}`}>
                  {row.invalidation ? "Invalidated" : "Scorecard"}
                </span>
              </Link>
            ))}
            {!mockDrafts.length && !store.mockResults.length ? (
              <StateBlock state="empty" message="No Mock sittings yet." />
            ) : null}
          </div>
        </Card>
        <Card>
          <CardHeader title="Company history" icon="companies" />
          <div className="list">
            {companyDrafts.map(({ draft: d, paper }) => (
              <Link key={d.startedAt} className="list-row" to={`/company/${paper!.companyId}/sitting?paper=${d.refId}`}>
                <div>
                  <strong>{COMPANIES.find((c) => c.id === paper!.companyId)?.name ?? paper!.companyId} — {paper!.title}</strong>
                  <p className="meta">In progress · {draftSummary(d, COMPANY_QUESTIONS.length)}</p>
                </div>
                <span className="chip chip--accent">Resume</span>
              </Link>
            ))}
            {store.companyResults.map((row) => (
              <Link
                key={row.at}
                className="list-row"
                to={`/company/${row.companyId}/result${row.paperId ? `?paper=${row.paperId}` : ""}`}
              >
                <div>
                  <strong>
                    {COMPANIES.find((item) => item.id === row.companyId)?.name ?? row.companyId}
                    {row.paperTitle ? ` — ${row.paperTitle}` : ""}
                  </strong>
                  <p className="meta">
                    {row.invalidation
                      ? `Invalidated — ${row.invalidation.reason} · sat ${formatWhen(row.at)}`
                      : `Completed · no pass/fail · ${formatWhen(row.at)}`}
                  </p>
                </div>
                <span className={`chip ${row.invalidation ? "" : "chip--quiet"}`}>
                  {row.invalidation ? "Invalidated" : "Sitting record"}
                </span>
              </Link>
            ))}
            {!companyDrafts.length && !store.companyResults.length ? (
              <StateBlock state="empty" message="No Company sittings yet." />
            ) : null}
          </div>
        </Card>
      </div>
    </Page>
  );
}
