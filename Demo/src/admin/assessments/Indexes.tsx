/**
 * Indexes — the studio's two landing lists, mounted at /admin/mocks and
 * /admin/sittings: every paper into the one workspace, every test into its
 * Recorded-Event review and invalidation.
 *
 * AssessmentsIndex is the paper index: lifecycle stat tiles, the create pair —
 * the type is selected first and never changes, and a Company paper is created
 * inside a selected company (the create asks for the company before the blank
 * exists) — a filter row, then compact rows carrying title, type, status and
 * the updated stamp. Open is the row's primary act; every secondary act sits
 * in a labelled three-dot menu gated by lifecycle: the publish checklist on a
 * draft, the enumerated settings on a published paper, duplicate from every
 * state, invalidate-a-test only while one of the paper's tests stays
 * invalidatable (absent otherwise, never disabled), and archive — the one
 * retirement step — while the paper is not already archived. A frozen paper
 * shows no mutation acts on the surface: the controls are absent.
 *
 * Rows render as a list rather than a scrollable table so the menu panel is
 * never clipped by a table's own scroll box.
 *
 * SittingsIndex is the test index: every test on record into its
 * Recorded-Event review, with Invalidate… in the row's menu only while the
 * test is not already invalidated.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stat, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { FilterBar } from "../../extraction/components/FilterBar/FilterBar";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Menu, type MenuItem } from "../../extraction/components/Menu/Menu";
import { Notice } from "../../extraction/components/Notice/Notice";
import { Select } from "../../extraction/components/Select/Select";
import {
  ACTION,
  allPapers,
  archivePaper,
  companies,
  createPaper,
  duplicatePaper,
  invalidatableSittingFor,
  PLATFORM_LIST_PAGE_ITEMS,
  SITTINGS,
  type Lifecycle,
  type StudioPaper,
  type TestState
} from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  ListPager,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

const LIFECYCLE_TONE: Record<Lifecycle, "accent" | "quiet"> = {
  draft: "quiet",
  published: "accent",
  archived: "quiet"
};

/** The one retirement step's ordinary confirm — names the object and how many
 *  tests exist against it; shared by the paper index and a company's papers
 *  list. */
export function ArchivePaperDialog({
  paper,
  onClose,
  onArchived
}: {
  paper: StudioPaper | null;
  onClose: () => void;
  onArchived: (paper: StudioPaper) => void;
}) {
  return (
    <Dialog
      open={paper !== null}
      title={paper ? `Archive ${paper.title || "Untitled draft"}?` : "Archive?"}
      icon="alert"
      tone="destructive"
      onClose={onClose}
      actions={
        <>
          <Button variant="destructive" onClick={() => { if (paper && archivePaper(paper.id)) onArchived(paper); }}>
            Archive permanently
          </Button>
          <Button variant="secondary" onClick={onClose}>Keep it</Button>
        </>
      }
    >
      {paper ? (
        <p>
          Archive <strong>{paper.title || "Untitled draft"}</strong> —{" "}
          {paper.testCount} test{paper.testCount === 1 ? "" : "s"} exist against it and
          stay readable. Every start path stops at once and the step is terminal: nothing destroys
          content and there is no path back.
        </p>
      ) : null}
    </Dialog>
  );
}

function companyName(paper: StudioPaper): string | null {
  if (paper.type !== "company" || !paper.companyId) return null;
  return companies().find((c) => c.id === paper.companyId)?.name ?? null;
}

/**
 * One compact paper row — the title and Open both reach the workspace; the
 * row itself is inert, so a menu act never navigates it. The menu's whole act
 * set is gated by lifecycle: an archived paper is terminal and carries the
 * duplicate alone.
 */
export function PaperListRow({
  paper,
  onArchive
}: {
  paper: StudioPaper;
  onArchive: (paper: StudioPaper) => void;
}) {
  const navigate = useNavigate();
  const invalidatable = invalidatableSittingFor(paper.id);
  const owner = companyName(paper);
  const title = paper.title || "Untitled draft";

  const items: MenuItem[] = [];
  if (paper.lifecycle === "draft") {
    items.push({ id: "review", label: "Publish checklist", icon: "check-mark" });
  }
  if (paper.lifecycle === "published") {
    items.push({ id: "settings", label: "Settings", icon: "settings" });
  }
  items.push({ id: "duplicate", label: "Duplicate as draft", icon: "copy" });
  /* Administrative invalidation stays available only while one of the paper's
     tests stays invalidatable — absent otherwise, never disabled. An archived
     paper qualifies no longer: invalidation restores the test, and a retired
     paper has no start path to restore it onto. */
  if (invalidatable && paper.lifecycle !== "archived") {
    items.push({ id: "invalidate", label: "Invalidate a test…", icon: "alert" });
  }
  if (paper.lifecycle !== "archived") {
    items.push({ id: "archive", label: "Archive…", icon: "inbox", destructive: true });
  }

  function onSelect(id: string) {
    if (id === "review") {
      navigate(`/admin/mocks/${paper.id}?tab=review`);
    } else if (id === "settings") {
      navigate(`/admin/mocks/${paper.id}?tab=settings`);
    } else if (id === "duplicate") {
      /* An independent draft with its own identity, the same permanent type
         and no tests — it opens straight into the workspace. */
      const copy = duplicatePaper(paper.id);
      if (copy) navigate(`/admin/mocks/${copy.id}`);
    } else if (id === "invalidate" && invalidatable) {
      navigate(`/admin/sittings/${invalidatable.id}/invalidate`);
    } else if (id === "archive") {
      onArchive(paper);
    }
  }

  return (
    <ListRow as="article" align="center">
      <div className="a-idx">
        <div className="a-cell">
          <Link className="a-titlelink" to={`/admin/mocks/${paper.id}`}>
            <strong>{title}</strong>
          </Link>
          <p className="a-cell__meta">
            {paper.durationMinutes} min · {paper.questions.length} question
            {paper.questions.length === 1 ? "" : "s"} · {paper.testCount === 0 ? "no tests" : `${paper.testCount} test${paper.testCount === 1 ? "" : "s"}`}
            {paper.category ? ` · ${paper.category}` : ""}
            {paper.difficulty ? ` · ${paper.difficulty}` : ""}
            {owner ? ` · ${owner}` : ""}
            {paper.featured ? " · featured" : ""}
          </p>
        </div>
        <span className="a-idx__fact" data-h="Type">
          <Chip size="sm" variant="quiet">{paper.type === "mock" ? "Mock" : "Company"}</Chip>
        </span>
        <span className="a-idx__fact" data-h="Status">
          <Chip size="sm" variant={LIFECYCLE_TONE[paper.lifecycle]}
            className={paper.lifecycle === "archived" ? "a-chip--muted" : ""}>
            {paper.lifecycle}
          </Chip>
        </span>
        <span className="a-idx__fact" data-h="Updated">
          <span className="a-idx__when">{paper.updatedAt}</span>
        </span>
        <span className="a-idx__acts">
          <Button variant="secondary" size="sm" to={`/admin/mocks/${paper.id}`}>Open</Button>
          <Menu
            trigger={<Icon name="more" size={16} />}
            triggerLabel={`Actions for ${title}`}
            items={items}
            align="end"
            onSelect={onSelect}
          />
        </span>
      </div>
    </ListRow>
  );
}

export function AssessmentsIndex() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [lifecycle, setLifecycle] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(0);
  const [archiveFor, setArchiveFor] = useState<StudioPaper | null>(null);
  const [pickingCompany, setPickingCompany] = useState(false);
  const [pickedCompany, setPickedCompany] = useState("");
  const [flash, setFlash] = useState("");

  const papers = allPapers();
  const drafts = papers.filter((p) => p.lifecycle === "draft").length;
  const published = papers.filter((p) => p.lifecycle === "published").length;
  const archived = papers.filter((p) => p.lifecycle === "archived").length;
  const testsOnRecord = papers.reduce((sum, p) => sum + p.testCount, 0);
  const listedCompanies = companies().filter((c) => c.state === "listed");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((p) => {
      if (lifecycle !== "all" && p.lifecycle !== lifecycle) return false;
      if (type !== "all" && p.type !== type) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
    /* papers is a fresh array each render; the memo keys on its contents. */
  }, [papers, query, lifecycle, type]);

  const pages = Math.max(1, Math.ceil(filtered.length / PLATFORM_LIST_PAGE_ITEMS));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(
    safePage * PLATFORM_LIST_PAGE_ITEMS,
    (safePage + 1) * PLATFORM_LIST_PAGE_ITEMS
  );

  /* The create act — the type is selected first and is fixed permanently. A
     Company paper is created inside a selected company: the picker names the
     owner before the blank exists, so no orphan is ever registered. */
  function newMock() {
    const paper = createPaper("mock");
    if (paper) navigate(`/admin/mocks/${paper.id}`);
  }

  function newCompanyPaper() {
    const paper = createPaper("company", { companyId: pickedCompany });
    setPickingCompany(false);
    setPickedCompany("");
    if (paper) navigate(`/admin/mocks/${paper.id}`);
  }

  return (
    <AdminPage
      kicker="Assessments"
      title="Assessment studio"
      lead="One authoring pipeline. Mock or Company is an immutable type selected first on the paper — never two studios."
      actions={<Link className="btn btn--secondary" to="/admin/mocks/companies">Companies and roles</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editPaper} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The paper count" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject="a published paper" /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
      {preview === "loaded" || preview === "conflict" ? (
        <>
          <div className="admin-health">
            <div className="admin-health__cell"><Stat label="Drafts" value={drafts} /></div>
            <div className="admin-health__cell"><Stat label="Published — content frozen" value={published} /></div>
            <div className="admin-health__cell"><Stat label="Archived" value={archived} /></div>
            <div className="admin-health__cell"><Stat label="Tests on record" value={testsOnRecord} /></div>
          </div>

          {flash ? <Notice tone="success" live="polite">{flash}</Notice> : null}

          <FilterBar
            label="Paper filters"
            search={{ value: query, onChange: (v) => { setQuery(v); setPage(0); }, placeholder: "Search papers…", label: "Search papers" }}
            count={`${filtered.length} paper${filtered.length === 1 ? "" : "s"}`}
          >
            <Select
              size="sm"
              value={lifecycle}
              onChange={(v) => { setLifecycle(v); setPage(0); }}
              aria-label="Filter by lifecycle"
              options={[
                { value: "all", label: "all states" },
                { value: "draft", label: "draft" },
                { value: "published", label: "published" },
                { value: "archived", label: "archived" }
              ]}
            />
            <Select
              size="sm"
              value={type}
              onChange={(v) => { setType(v); setPage(0); }}
              aria-label="Filter by type"
              options={[
                { value: "all", label: "both types" },
                { value: "mock", label: "Mock" },
                { value: "company", label: "Company" }
              ]}
            />
          </FilterBar>

          <div className="row">
            <Button icon="plus" onClick={newMock}>New Mock paper</Button>
            <Button variant="secondary" icon="plus" onClick={() => setPickingCompany(true)}>
              New Company paper
            </Button>
            <span className="meta">
              The type is chosen at creation and never changes — a Company paper is created inside
              its owning company and stays owned by it.
            </span>
          </div>

          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message={
                papers.length === 0
                  ? "No paper has been authored yet — an empty registry is a reading in its own right."
                  : "No papers match this filter or search."
              }
              action={
                papers.length > 0 ? (
                  <Button variant="secondary" size="sm"
                    onClick={() => { setQuery(""); setLifecycle("all"); setType("all"); setPage(0); }}>
                    Clear the filters and search
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ListPager
                loadedThrough={safePage * PLATFORM_LIST_PAGE_ITEMS + pageRows.length}
                total={filtered.length}
                page={safePage}
                pages={pages}
                onPage={setPage}
              />
              <div className="a-sheet">
                <List>
                  {pageRows.map((p) => (
                    <PaperListRow key={p.id} paper={p} onArchive={setArchiveFor} />
                  ))}
                </List>
              </div>
              <p className="a-note">
                A published paper's content is frozen permanently — its row carries reads and the
                enumerated settings alone; the only correction is a duplicate. Administrative
                invalidation voids one test, so the act appears only while one of the paper's tests
                stays invalidatable.
              </p>
            </>
          )}
        </>
      ) : null}

      {/* The owning company is selected before the blank exists — a Company
          paper can never be an orphan. Deactivated companies author nothing
          while they are off the catalogue. */}
      <Dialog
        open={pickingCompany}
        title="New Company paper"
        icon="companies"
        onClose={() => { setPickingCompany(false); setPickedCompany(""); }}
        actions={
          <>
            <Button disabled={!pickedCompany} onClick={newCompanyPaper}>
              Create the draft
            </Button>
            <Button variant="secondary" onClick={() => { setPickingCompany(false); setPickedCompany(""); }}>
              Cancel
            </Button>
          </>
        }
      >
        <p>
          A Company paper is created inside a selected company and stays owned by it — ownership is
          chosen now and never changes. Its role is picked on the draft, from that company's own
          roles.
        </p>
        {listedCompanies.length === 0 ? (
          <p className="meta">
            No listed company can own a paper —{" "}
            <Link to="/admin/mocks/companies" onClick={() => setPickingCompany(false)}>
              register one on Companies and roles
            </Link>
            .
          </p>
        ) : (
          <label className="field">
            <span className="meta">Owning company — listed companies only</span>
            <Select
              value={pickedCompany}
              onChange={setPickedCompany}
              aria-label="Owning company"
              options={[
                { value: "", label: "Choose the company…" },
                ...listedCompanies.map((c) => ({
                  value: c.id,
                  label: c.roles.length === 0 ? `${c.name} — no roles listed yet` : c.name
                }))
              ]}
            />
          </label>
        )}
      </Dialog>

      {/* The one retirement step — the confirmation names the object and how
          many tests exist against it. */}
      <ArchivePaperDialog
        paper={archiveFor}
        onClose={() => setArchiveFor(null)}
        onArchived={(p) => {
          setArchiveFor(null);
          setFlash(
            `${p.title || "Untitled draft"} archived — every start path stopped at once, every result stays readable. The step is terminal; committed with its trail row.`
          );
        }}
      />
    </AdminPage>
  );
}

const TEST_STATE_LABEL: Record<TestState, string> = {
  "in progress": "in progress",
  submitted: "submitted",
  "auto-submitted": "auto-submitted",
  grading: "grading",
  finalized: "finalized",
  invalidated: "invalidated"
};

export function SittingsIndex() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");
  const [page, setPage] = useState(0);

  const inProgress = SITTINGS.filter((s) => s.state === "in progress").length;
  const invalidated = SITTINGS.filter((s) => s.state === "invalidated").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITTINGS.filter((s) => {
      if (state !== "all" && s.state !== state) return false;
      if (!q) return true;
      return s.id.toLowerCase().includes(q) || s.paperTitle.toLowerCase().includes(q);
    });
  }, [query, state]);

  const pages = Math.max(1, Math.ceil(filtered.length / PLATFORM_LIST_PAGE_ITEMS));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(
    safePage * PLATFORM_LIST_PAGE_ITEMS,
    (safePage + 1) * PLATFORM_LIST_PAGE_ITEMS
  );

  return (
    <AdminPage
      kicker="Assessments"
      title="Recorded events"
      lead="The integrity record of each test — neutral browser events, never an accusation, never a camera."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.reviewRecordedEvent} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The test list" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject="a test" /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />
      {preview === "loaded" || preview === "conflict" ? (
        <>
          <div className="admin-health">
            <div className="admin-health__cell"><Stat label="Tests on record" value={SITTINGS.length} /></div>
            <div className="admin-health__cell"><Stat label="In progress" value={inProgress} /></div>
            <div className="admin-health__cell"><Stat label="Invalidated" value={invalidated} /></div>
          </div>

          <FilterBar
            label="Test filters"
            search={{ value: query, onChange: (v) => { setQuery(v); setPage(0); }, placeholder: "Search tests and papers…", label: "Search tests and papers" }}
            count={`${filtered.length} test${filtered.length === 1 ? "" : "s"}`}
          >
            <Select
              size="sm"
              value={state}
              onChange={(v) => { setState(v); setPage(0); }}
              aria-label="Filter by state"
              options={[
                { value: "all", label: "all states" },
                ...Object.values(TEST_STATE_LABEL).map((s) => ({ value: s, label: s }))
              ]}
            />
          </FilterBar>

          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message={
                SITTINGS.length === 0
                  ? "No test is on record yet."
                  : "No tests match this filter or search."
              }
              action={
                SITTINGS.length > 0 ? (
                  <Button variant="secondary" size="sm" onClick={() => { setQuery(""); setState("all"); setPage(0); }}>
                    Clear the filter and search
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ListPager
                loadedThrough={safePage * PLATFORM_LIST_PAGE_ITEMS + pageRows.length}
                total={filtered.length}
                page={safePage}
                pages={pages}
                onPage={setPage}
              />
              <div className="a-sheet">
                <List>
                  {pageRows.map((s) => {
                    const counted = s.events.filter((e) => e.counted).length;
                    return (
                      <ListRow key={s.id} as="article" align="center">
                        <div className="a-idx">
                          <div className="a-cell">
                            <Link className="a-titlelink" to={`/admin/sittings/${s.id}/events`}>
                              <strong>Test {s.id}</strong>
                            </Link>
                            <p className="a-cell__meta">
                              {s.paperTitle} · started {s.startedAt.slice(0, 10)}
                            </p>
                          </div>
                          <span className="a-idx__fact" data-h="State">
                            <Chip size="sm" variant={s.state === "invalidated" ? "quiet" : "accent"}
                              className={s.state === "invalidated" ? "a-chip--muted" : ""}>
                              {s.state}
                            </Chip>
                          </span>
                          <span className="a-idx__fact" data-h="How it ended">
                            <span className="a-idx__when">
                              {s.endedAt ? s.endingReason : "still in progress"}
                            </span>
                          </span>
                          <span className="a-idx__fact" data-h="Recorded events">
                            <span className="a-idx__when">{counted} of {s.events.length} counted</span>
                          </span>
                          <span className="a-idx__acts">
                            <Button variant="secondary" size="sm" to={`/admin/sittings/${s.id}/events`}>
                              Recorded events
                            </Button>
                            {/* Administrative invalidation — present only while
                                the test is not already invalidated, never
                                shown disabled. */}
                            {s.state !== "invalidated" ? (
                              <Menu
                                trigger={<Icon name="more" size={16} />}
                                triggerLabel={`Actions for test ${s.id}`}
                                items={[
                                  { id: "invalidate", label: "Invalidate this test…", icon: "alert", destructive: true }
                                ]}
                                align="end"
                                onSelect={() => navigate(`/admin/sittings/${s.id}/invalidate`)}
                              />
                            ) : null}
                          </span>
                        </div>
                      </ListRow>
                    );
                  })}
                </List>
              </div>
              <p className="a-note">
                Administrative invalidation voids one test as one audited change — the act is absent
                on a test already invalidated, never shown disabled.
              </p>
            </>
          )}
        </>
      ) : null}
    </AdminPage>
  );
}
