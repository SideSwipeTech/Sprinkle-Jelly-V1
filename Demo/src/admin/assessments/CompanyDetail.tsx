/**
 * CompanyDetail — a company's own page (assessments.F40–F43), the middle of
 * the Companies → company → papers hierarchy.
 *
 * The page holds everything about the one company and nothing wider: its
 * descriptive details, its listed or deactivated state, its roles — a new
 * role is added inside the company and a duplicate role name is refused by
 * name — its optional marking defaults (pre-fill only, never moving an
 * existing question, a one-action reset only where custom values exist), and
 * its papers list. A Company paper is created inside this company and stays
 * owned by it; each row opens the paper's workspace. The state acts —
 * deactivate, restore, and delete for a pristine company alone — confirm
 * exactly what they do; where the content guard refuses, the act is absent.
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { Button } from "../../extraction/components/Button/Button";
import { List } from "../../extraction/components/ListRow/ListRow";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  createPaper,
  getCompany,
  isPristine,
  papersForCompany,
  patchCompany,
  type CompanyFixture,
  type StudioPaper
} from "./fixtures";
import { ArchivePaperDialog, PaperListRow } from "./Indexes";
import { DeactivateCompanyDialog, DeleteCompanyDialog } from "./CompaniesRoles";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  LoadedLine,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

let extraSeq = 0;

export function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const company = getCompany(companyId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [newRole, setNewRole] = useState("");
  const [roleError, setRoleError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(company?.name ?? "");
  const [editDetails, setEditDetails] = useState(company?.details ?? "");
  const [renamingRole, setRenamingRole] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archivingPaper, setArchivingPaper] = useState<StudioPaper | null>(null);
  const [note, setNote] = useState("");

  if (!company) {
    return (
      <AdminPage kicker="Assessments · Companies" title="Company" lead="A company and its papers.">
        <StateBlock
          state="unavailable"
          message="No company at this address."
          action={<Link className="btn btn--secondary" to="/admin/mocks/companies">Companies and roles</Link>}
        />
      </AdminPage>
    );
  }

  const papers = papersForCompany(company.id);
  const pristine = isPristine(company) && company.roles.length === 0;

  function patch(p: Partial<CompanyFixture>) {
    if (patchCompany(company!.id, p)) refresh();
  }

  function addRole() {
    const name = newRole.trim();
    if (!name || !company) return;
    if (company.roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      /* A duplicate role name is refused by name. */
      setRoleError(`Role "${name}" already exists on ${company.name} — a duplicate role name is refused by name.`);
      return;
    }
    setRoleError("");
    patch({ roles: [...company.roles, { id: `role-${company.id}-new-${++extraSeq}`, name }] });
    setNewRole("");
  }

  function saveRename(roleId: string) {
    const name = roleName.trim();
    if (!company) return;
    if (!name) { setRenamingRole(null); return; }
    if (company.roles.some((r) => r.id !== roleId && r.name.toLowerCase() === name.toLowerCase())) {
      setRoleError(`Role "${name}" already exists on ${company.name} — a duplicate role name is refused by name.`);
      return;
    }
    setRoleError("");
    patch({ roles: company.roles.map((r) => (r.id === roleId ? { ...r, name } : r)) });
    setRenamingRole(null);
  }

  function newPaper() {
    /* Created inside this company — the paper stays owned by it, and the
       blank never leaves the registry an orphan. */
    const paper = createPaper("company", { companyId: company!.id });
    if (paper) navigate(`/admin/mocks/${paper.id}`);
  }

  return (
    <AdminPage
      kicker="Assessments · Companies"
      title={company.name}
      lead="The company's details, roles, marking defaults and papers — everything about this company and nothing wider."
      actions={
        <div className="row">
          <span className="chip chip--quiet">{company.state}</span>
          <Link className="btn btn--quiet" to="/admin/mocks/companies">Companies and roles</Link>
        </div>
      }
    >
      <div className="a-crumbs">
        <Breadcrumbs
          label="Company trail"
          items={[
            { label: "Assessment studio", to: "/admin/mocks" },
            { label: "Companies", to: "/admin/mocks/companies" },
            { label: company.name }
          ]}
        />
      </div>

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.manageCompanies} /> : null}
      {preview === "unverifiable" ? (
        <NotVerifiableNote subject={`The dependency check on ${company.name}`} />
      ) : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={company.name} /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview !== "loading" && preview !== "refused" && preview !== "conflict" ? (
        <>
          {note ? <Notice tone="success" live="polite">{note}</Notice> : null}

          <Card>
            <CardHeader
              title="Details"
              icon="companies"
              eyebrow={company.details}
              action={
                editing ? undefined : (
                  <Button variant="quiet" size="sm" icon="edit"
                    onClick={() => { setEditName(company.name); setEditDetails(company.details); setEditing(true); }}>
                    Edit
                  </Button>
                )
              }
            />
            {editing ? (
              <div className="sink__grid">
                <label className="field"><span className="meta">Name</span>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
                <label className="field"><span className="meta">Descriptive details</span>
                  <input value={editDetails} onChange={(e) => setEditDetails(e.target.value)} /></label>
                <div className="row">
                  <Button size="sm" disabled={!editName.trim()}
                    onClick={() => { patch({ name: editName.trim(), details: editDetails.trim() }); setEditing(false); }}>
                    Save details
                  </Button>
                  <Button variant="quiet" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title="Papers"
              icon="clipboard"
              eyebrow="a Company paper is opened only from its company's list"
              action={
                company.state === "listed" ? (
                  <Button variant="secondary" size="sm" icon="plus" onClick={newPaper}>
                    New Company paper
                  </Button>
                ) : undefined
              }
            />
            <LoadedLine loaded={papers.length} total={papers.length} />
            {papers.length === 0 ? (
              <StateBlock
                state="empty"
                compact
                message="No papers yet — a Company paper is created inside this company and stays owned by it."
                action={
                  company.state === "listed" ? (
                    <Button size="sm" icon="plus" onClick={newPaper}>Create the first paper</Button>
                  ) : undefined
                }
              />
            ) : (
              <List>
                {papers.map((p) => (
                  <PaperListRow key={p.id} paper={p} onArchive={setArchivingPaper} />
                ))}
              </List>
            )}
            {company.state === "deactivated" ? (
              <p className="meta">
                Deactivated — off the catalogue and every availability count. Restore the listing to
                author a new paper under it; the papers on record stay readable.
              </p>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Roles" icon="users" eyebrow={`each unique inside ${company.name}`} />
            {company.roles.length === 0 ? (
              <p className="meta">No roles listed.</p>
            ) : (
              <ul className="meta" style={{ margin: 0, paddingLeft: "var(--space-5)", listStyle: "none" }}>
                {company.roles.map((r) => (
                  <li key={r.id} style={{ paddingBottom: "var(--space-1)" }}>
                    {renamingRole === r.id ? (
                      <span className="row">
                        <input value={roleName} onChange={(e) => { setRoleName(e.target.value); setRoleError(""); }}
                          aria-label={`Rename ${r.name}`} />
                        <Button size="sm" onClick={() => saveRename(r.id)}>Save</Button>
                        <Button variant="quiet" size="sm" onClick={() => { setRenamingRole(null); setRoleError(""); }}>Cancel</Button>
                      </span>
                    ) : (
                      <span className="row">
                        <span>{r.name}</span>
                        <Button variant="quiet" size="sm" icon="edit"
                          onClick={() => { setRenamingRole(r.id); setRoleName(r.name); setRoleError(""); }}>
                          Rename
                        </Button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="row">
              <label className="field" style={{ flex: 1 }}>
                <span className="meta">New role — a name unique inside {company.name}</span>
                <input value={newRole} onChange={(e) => { setNewRole(e.target.value); setRoleError(""); }} />
              </label>
              <button className="btn btn--secondary" type="button" onClick={addRole}>Add role</button>
            </div>
            {roleError ? <p className="meta" role="alert" style={{ color: "var(--c-error)" }}>{roleError}</p> : null}
            <p className="meta">Renaming never breaks a link a learner already holds.</p>
          </Card>

          <Card>
            <CardHeader title="Marking defaults" icon="edit" />
            {company.markingDefaults ? (
              <>
                <p className="meta">
                  Custom values: {company.markingDefaults.marks} marks, −{company.markingDefaults.negativeMarks} negative. They pre-fill
                  values left blank at question creation only and never move an existing question, on any path.
                </p>
                <button className="btn btn--quiet" type="button" onClick={() => patch({ markingDefaults: null })}>
                  Reset to the platform's own
                </button>
              </>
            ) : (
              <p className="meta">The platform's own defaults — no custom values, so no reset is offered.</p>
            )}
          </Card>

          <Card>
            <CardHeader title="State" icon="alert" />
            <div className="row">
              {company.state === "listed" ? (
                <button className="btn btn--secondary" type="button" onClick={() => setDeactivating(true)}>
                  Deactivate…
                </button>
              ) : (
                <button className="btn btn--secondary" type="button"
                  onClick={() => { patch({ state: "listed" }); setNote(`${company.name} restored — back on the catalogue and every availability count.`); }}>
                  Restore
                </button>
              )}
              {pristine ? (
                <button className="btn btn--quiet" type="button" onClick={() => setDeleting(true)}>
                  Delete…
                </button>
              ) : (
                <p className="meta">
                  Deletion refused by the content guard — {company.publishedPapers} published paper
                  {company.publishedPapers === 1 ? "" : "s"}, {company.dependentTests} dependent test
                  {company.dependentTests === 1 ? "" : "s"}
                  {company.roles.length > 0 ? `, ${company.roles.length} role${company.roles.length === 1 ? "" : "s"}` : ""}.
                  The destructive control is replaced by deactivate rather than left failing.
                </p>
              )}
            </div>
            {company.state === "deactivated" ? (
              <p className="meta">Deactivated — removed from the catalogue and every availability count; every record preserved. Restoring returns both.</p>
            ) : null}
          </Card>
        </>
      ) : null}

      <DeactivateCompanyDialog
        company={deactivating ? company : null}
        onClose={() => setDeactivating(false)}
        onDone={(c) => {
          setDeactivating(false);
          refresh();
          setNote(`${c.name} deactivated — off the catalogue and every availability count; every record preserved.`);
        }}
      />
      <DeleteCompanyDialog
        company={deleting ? company : null}
        onClose={() => setDeleting(false)}
        onDone={(c) => {
          setDeleting(false);
          navigate("/admin/mocks/companies");
          void c;
        }}
      />
      <ArchivePaperDialog
        paper={archivingPaper}
        onClose={() => setArchivingPaper(null)}
        onArchived={(p) => {
          setArchivingPaper(null);
          refresh();
          setNote(`${p.title || "Untitled draft"} archived — every start path stopped at once; the step is terminal.`);
        }}
      />
    </AdminPage>
  );
}
