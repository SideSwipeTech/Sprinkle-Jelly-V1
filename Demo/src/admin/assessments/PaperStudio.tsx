/**
 * PaperStudio — the selected-paper workspace, one page for a paper's whole
 * life (assessments.F14). A breadcrumb trails back to the index — through the
 * owning company for a Company paper, which is opened only from its company's
 * papers list — and four local views hold the work: Overview (the paper's
 * facts and field set), Questions (the section/question outline), Settings
 * (the enumerated set that stays mutable after the freeze) and Review (the
 * publish gate). The `?tab=` param keeps the view in the address so the
 * checklist's fix links and the standalone routes' back links land on the
 * right view.
 *
 * The type was selected first at creation and is fixed permanently; the
 * shared path owns everything common and only the selected type's fields and
 * validations are exposed. Everything is editable while the paper is a draft;
 * content is read-only once published — a write to it is refused naming the
 * correction path and the whole editable set.
 */

import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs, type Crumb } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { ChipTabBar } from "../../extraction/components/ChipTabBar/ChipTabBar";
import {
  ACTION,
  editableSetFor,
  getCompany,
  getPaper,
  STUDIO_TODAY,
  type StudioPaper
} from "./fixtures";
import { PaperOverview, PaperQuestions } from "./PaperViews";
import { PaperReview } from "./PaperReview";
import { PublishedSettingsEditor } from "./PublishedSettings";
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

const VIEW_KEYS = ["overview", "questions", "settings", "review"] as const;
type ViewKey = (typeof VIEW_KEYS)[number];

export function PaperStudio() {
  const { paperId } = useParams();
  const [params, setParams] = useSearchParams();
  const paper = getPaper(paperId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  /* Deep-copied at mount: field rows edit by replacement, and the structure
     create/remove acts commit through the fixture mutators — this draft never
     aliases the fixture's arrays. */
  const [draft, setDraft] = useState<StudioPaper | null>(
    paper
      ? {
          ...paper,
          sections: paper.sections.map((s) => ({ ...s })),
          questions: paper.questions.map((q) => ({ ...q }))
        }
      : null
  );
  /* Field edits are unsaved until Save commits the draft onto the record —
     the publish gate reads the saved draft, never typed-but-unsaved work.
     Structure acts commit immediately, so they never raise this flag. */
  const [dirty, setDirty] = useState(false);
  const [savedNote, setSavedNote] = useState("");

  const requested = params.get("tab");
  const view: ViewKey = (VIEW_KEYS as readonly string[]).includes(requested ?? "")
    ? (requested as ViewKey)
    : "overview";

  /* The same route serving another paper reseeds the editing buffer — the
     adjust-during-render pattern, so a stale draft never paints. */
  if (paper && draft && draft.id !== paper.id) {
    setDraft({
      ...paper,
      sections: paper.sections.map((s) => ({ ...s })),
      questions: paper.questions.map((q) => ({ ...q }))
    });
    setDirty(false);
    setSavedNote("");
  }

  if (!paper || !draft) {
    return (
      <AdminPage kicker="Assessments · Paper studio" title="Paper studio" lead="One authoring page for a paper's whole life.">
        <StateBlock
          state="unavailable"
          message="No paper at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks">Assessment studio</Link>}
        />
      </AdminPage>
    );
  }

  const editable = draft.lifecycle === "draft";
  const company = getCompany(draft.companyId ?? undefined);
  const set = (patch: Partial<StudioPaper>) => {
    setDraft({ ...draft, ...patch });
    setDirty(true);
    setSavedNote("");
  };

  /* Save commits the draft onto the session record — deep copies, so the
     record never aliases the editing buffer. The publish gate, the index and
     every read-back then agree for the session. */
  function saveDraft() {
    if (!paper || !draft || paper.lifecycle !== "draft") return;
    Object.assign(paper, {
      ...draft,
      sections: draft.sections.map((s) => ({ ...s })),
      questions: draft.questions.map((q) => ({ ...q }))
    });
    paper.updatedAt = STUDIO_TODAY;
    setDirty(false);
    setSavedNote("Saved — the change commits with its trail row.");
  }

  /* The workspace's own trail: the studio index for a Mock paper; the owning
     company's papers list for a Company paper — it is opened only from there. */
  const crumbs: Crumb[] = [
    { label: "Assessment studio", to: "/admin/mocks" },
    ...(draft.type === "company"
      ? [
          { label: "Companies", to: "/admin/mocks/companies" },
          ...(company
            ? [{ label: company.name, to: `/admin/mocks/companies/${company.id}` }]
            : [])
        ]
      : []),
    { label: draft.title || "Untitled draft" }
  ];

  return (
    <AdminPage
      kicker="Assessments · Paper studio"
      title={draft.title || "Untitled draft"}
      lead="One workspace for the paper's whole life — the type was selected first and is fixed permanently; the shared path owns everything common."
      actions={
        <div className="row">
          <span className="chip chip--quiet">{draft.type === "mock" ? "Mock" : "Company"}</span>
          <span className="chip">{draft.lifecycle}</span>
          {dirty && editable ? <span className="chip chip--quiet">unsaved changes</span> : null}
        </div>
      }
    >
      <div className="a-crumbs">
        <Breadcrumbs items={crumbs} label="Paper trail" />
      </div>

      <ChipTabBar
        label="Paper views"
        ruled
        value={view}
        onChange={(id) =>
          setParams((p) => {
            const next = new URLSearchParams(p);
            if (id === "overview") next.delete("tab");
            else next.set("tab", id);
            return next;
          })
        }
        tabs={[
          { id: "overview", label: "Overview", icon: "clipboard" },
          { id: "questions", label: "Questions", icon: "list" },
          { id: "settings", label: "Settings", icon: "settings" },
          { id: "review", label: "Review", icon: "check-mark" }
        ]}
      />

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editPaper} /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal type={draft.type} /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The dependency check" /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={draft.title} /> : null}

      {preview !== "loading" && preview !== "refused" ? (
        <>
          <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

          {view === "overview" ? (
            <PaperOverview draft={draft} onSet={set} onSave={saveDraft} savedNote={savedNote} />
          ) : null}

          {view === "questions" ? (
            <PaperQuestions
              draft={draft}
              onSet={set}
              onStructure={(patch) => setDraft({ ...draft, ...patch })}
            />
          ) : null}

          {view === "settings" ? (
            draft.lifecycle === "published" ? (
              /* The mutable settings while permitted: the closed enumerated
                 set, validated exactly as on a draft. The commit lands on the
                 record and the local draft so every surface agrees. */
              <PublishedSettingsEditor
                paper={paper}
                onCommitted={(patch) => {
                  Object.assign(paper, patch);
                  paper.updatedAt = STUDIO_TODAY;
                  setDraft({ ...draft, ...patch });
                }}
              />
            ) : (
              <Card>
                <CardHeader
                  title={draft.lifecycle === "archived" ? "Settings — closed" : "Settings after publication"}
                  icon="settings"
                />
                {draft.lifecycle === "archived" ? (
                  <p className="meta">
                    Archived — the retirement step is terminal, and the settings surface closed with
                    the freeze that preceded it. Nothing here writes.
                  </p>
                ) : (
                  <>
                    <p className="meta">
                      While the paper is a draft every field is editable — the field set lives on
                      Overview and the outline on Questions. After the paper freezes, this view holds
                      the only members that stay mutable — the closed, enumerated set for the{" "}
                      {draft.type === "mock" ? "Mock" : "Company"} type, validated exactly as on a
                      draft:
                    </p>
                    <p className="meta">{editableSetFor(draft.type).join(" · ")}.</p>
                    <p className="meta">
                      Anything outside that set is a content write and is refused, naming the
                      correction path.
                    </p>
                  </>
                )}
              </Card>
            )
          ) : null}

          {view === "review" ? (
            <>
              {dirty ? (
                <StateBlock
                  state="stale"
                  compact
                  message="Unsaved field changes — the gate reads the last saved draft, never typed-but-unsaved work. Save on Overview, then re-check."
                />
              ) : null}
              <PaperReview
                paper={paper}
                revision={JSON.stringify(paper)}
                onPublished={() => {
                  setDraft({ ...draft, lifecycle: "published" });
                  setSavedNote("");
                }}
              />
            </>
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}
