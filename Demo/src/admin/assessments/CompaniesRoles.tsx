/**
 * CompaniesRoles — the companies index (assessments.F40–F43), the catalogue's
 * employer registry and the top of the Companies → company → papers
 * hierarchy.
 *
 * Every company is one compact row — name and descriptive details, listed or
 * deactivated state, its role count, published papers and dependent tests —
 * with Open reaching the company's own page and every secondary act in a
 * labelled three-dot menu: New Company paper inside the company while it is
 * listed (the paper is created inside it and stays owned by it), deactivate
 * or restore — the archive-equivalent, preserving every record — and delete
 * only for a pristine company, confirmed naming exactly what it removes.
 * Where the shared content guard refuses a deletion the act is absent, never
 * shown disabled; a dependency check that cannot complete refuses.
 *
 * Fixture state only — the registry lives in the session register so the
 * index, a company's page and the papers list agree; nothing persists.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, Stat, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Menu, type MenuItem } from "../../extraction/components/Menu/Menu";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  companies,
  createCompany,
  createPaper,
  isPristine,
  patchCompany,
  removeCompany,
  type CompanyFixture
} from "./fixtures";
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

/* ── The company acts' confirms — shared by the index row and the company's
   own page so the same act reads the same way in both places. ────────────── */

/** Deactivation — the archive-equivalent: the company leaves the catalogue and
 *  every availability count while every record is preserved. */
export function DeactivateCompanyDialog({
  company,
  onClose,
  onDone
}: {
  company: CompanyFixture | null;
  onClose: () => void;
  onDone: (company: CompanyFixture) => void;
}) {
  return (
    <Dialog
      open={company !== null}
      title={company ? `Deactivate ${company.name}?` : "Deactivate?"}
      icon="inbox"
      tone="destructive"
      onClose={onClose}
      actions={
        <>
          <Button
            variant="destructive"
            onClick={() => {
              if (company && patchCompany(company.id, { state: "deactivated" })) onDone(company);
            }}
          >
            Deactivate
          </Button>
          <Button variant="secondary" onClick={onClose}>Keep it listed</Button>
        </>
      }
    >
      {company ? (
        <p>
          Deactivate <strong>{company.name}</strong> — it leaves the catalogue and every
          availability count while preserving every record: {company.roles.length} role
          {company.roles.length === 1 ? "" : "s"}, {company.publishedPapers} published paper
          {company.publishedPapers === 1 ? "" : "s"}, {company.dependentTests} dependent test
          {company.dependentTests === 1 ? "" : "s"}. Restoring returns both. One audited change.
        </p>
      ) : null}
    </Dialog>
  );
}

/** Deletion reaches a pristine company alone — the confirmation names exactly
 *  what it removes. */
export function DeleteCompanyDialog({
  company,
  onClose,
  onDone
}: {
  company: CompanyFixture | null;
  onClose: () => void;
  onDone: (company: CompanyFixture) => void;
}) {
  return (
    <Dialog
      open={company !== null}
      title={company ? `Delete ${company.name}?` : "Delete?"}
      icon="trash"
      tone="destructive"
      onClose={onClose}
      actions={
        <>
          <Button
            variant="destructive"
            onClick={() => {
              if (company && removeCompany(company.id)) onDone(company);
            }}
          >
            {company ? `Delete ${company.name}` : "Delete"}
          </Button>
          <Button variant="secondary" onClick={onClose}>Keep it</Button>
        </>
      }
    >
      {company ? (
        <p>
          Delete <strong>{company.name}</strong> — this removes exactly the company record. It is
          pristine: no published papers, no dependent history, no roles. The deletion is one audited
          change.
        </p>
      ) : null}
    </Dialog>
  );
}

/* ── The index ────────────────────────────────────────────────────────────── */

export function CompaniesRoles() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);
  const navigate = useNavigate();
  /* The registry is the session's — every act re-reads it; the tick carries
     the notification a fixture mutation cannot raise itself. */
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [deactivating, setDeactivating] = useState<CompanyFixture | null>(null);
  const [deleting, setDeleting] = useState<CompanyFixture | null>(null);
  const [note, setNote] = useState("");

  const items = companies();
  const listed = items.filter((c) => c.state === "listed").length;

  function menuItems(c: CompanyFixture): MenuItem[] {
    const items: MenuItem[] = [];
    if (c.state === "listed") {
      items.push({ id: "new-paper", label: "New Company paper", icon: "plus" });
      items.push({ id: "deactivate", label: "Deactivate…", icon: "inbox", destructive: true });
    } else {
      items.push({ id: "restore", label: "Restore", icon: "reset" });
    }
    if (isPristine(c) && c.roles.length === 0) {
      items.push({ id: "delete", label: "Delete…", icon: "trash", destructive: true });
    }
    return items;
  }

  function onMenuSelect(c: CompanyFixture, id: string) {
    if (id === "new-paper") {
      /* Created inside the selected company — the paper stays owned by it. */
      const paper = createPaper("company", { companyId: c.id });
      if (paper) navigate(`/admin/mocks/${paper.id}`);
    } else if (id === "deactivate") {
      setDeactivating(c);
    } else if (id === "restore") {
      if (patchCompany(c.id, { state: "listed" })) {
        refresh();
        setNote(`${c.name} restored — back on the catalogue and every availability count.`);
      }
    } else if (id === "delete") {
      setDeleting(c);
    }
  }

  function create() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const company = createCompany(trimmed);
    setName("");
    setCreating(false);
    refresh();
    setNote(`Created ${company.name} — listed, pristine, deletable until its first publication or dependent history.`);
  }

  return (
    <AdminPage
      kicker="Assessments · Companies"
      title="Companies and roles"
      lead="Every company — its listed or deactivated state, its roles and its optional marking defaults — then the company's own page and its papers."
      actions={<Link className="btn btn--quiet" to="/admin/mocks">Assessment studio</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.manageCompanies} /> : null}
      {preview === "unverifiable" ? (
        <NotVerifiableNote subject="The dependency check on Initech" />
      ) : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject="Acme" /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview !== "loading" && preview !== "refused" && preview !== "conflict" ? (
        <>
          <div className="admin-health">
            <div className="admin-health__cell"><Stat label="Companies on record" value={items.length} /></div>
            <div className="admin-health__cell"><Stat label="Listed" value={listed} /></div>
            <div className="admin-health__cell"><Stat label="Deactivated" value={items.length - listed} /></div>
          </div>

          {note ? <Notice tone="success" live="polite">{note}</Notice> : null}

          <Card>
            <CardHeader title="New company" icon="plus" />
            {creating ? (
              <div className="row">
                <label className="field" style={{ flex: 1 }}>
                  <span className="meta">Company name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <button className="btn btn--primary" type="button" disabled={!name.trim()}
                  onClick={create}>
                  Create
                </button>
                <button className="btn btn--quiet" type="button" onClick={() => setCreating(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn--secondary" type="button" onClick={() => setCreating(true)}>
                Create a company
              </button>
            )}
          </Card>

          <LoadedLine loaded={items.length} total={items.length} />
          {items.length === 0 ? (
            <StateBlock
              state="empty"
              message="No company is registered yet — an empty registry is a reading in its own right."
            />
          ) : (
            <div className="a-sheet">
              <List>
                {items.map((c) => (
                  <ListRow key={c.id} as="article" align="center">
                    <div className="a-idx a-idx--wide">
                      <div className="a-cell">
                        <Link className="a-titlelink" to={`/admin/mocks/companies/${c.id}`}>
                          <strong>{c.name}</strong>
                        </Link>
                        <p className="a-cell__meta">{c.details}</p>
                      </div>
                      <span className="a-idx__fact" data-h="State">
                        <Chip size="sm" variant={c.state === "listed" ? "accent" : "quiet"}
                          className={c.state === "deactivated" ? "a-chip--muted" : ""}>
                          {c.state}
                        </Chip>
                      </span>
                      <span className="a-idx__fact" data-h="Roles">
                        <span className="a-idx__when">
                          {c.roles.length === 0 ? "none" : `${c.roles.length}`}
                        </span>
                      </span>
                      <span className="a-idx__fact" data-h="Published papers">
                        <span className="a-idx__when">
                          {c.publishedPapers === 0 ? "none" : `${c.publishedPapers}`}
                        </span>
                      </span>
                      <span className="a-idx__fact" data-h="Dependent tests">
                        <span className="a-idx__when">
                          {c.dependentTests === 0 ? "none" : `${c.dependentTests}`}
                        </span>
                      </span>
                      <span className="a-idx__acts">
                        <Button variant="secondary" size="sm" to={`/admin/mocks/companies/${c.id}`}>
                          Open
                        </Button>
                        <Menu
                          trigger={<Icon name="more" size={16} />}
                          triggerLabel={`Actions for ${c.name}`}
                          items={menuItems(c)}
                          align="end"
                          onSelect={(id) => onMenuSelect(c, id)}
                        />
                      </span>
                    </div>
                  </ListRow>
                ))}
              </List>
            </div>
          )}
          <p className="a-note">
            Deactivation is the archive-equivalent — it removes a company from the catalogue and
            every availability count while preserving every record; restoring returns both. Deletion
            reaches a pristine company alone; publication alone disqualifies a company from it, and
            where the shared content guard would refuse, the act is absent rather than left failing.
          </p>
        </>
      ) : null}

      <DeactivateCompanyDialog
        company={deactivating}
        onClose={() => setDeactivating(null)}
        onDone={(c) => {
          setDeactivating(null);
          refresh();
          setNote(`${c.name} deactivated — off the catalogue and every availability count; every record preserved.`);
        }}
      />
      <DeleteCompanyDialog
        company={deleting}
        onClose={() => setDeleting(null)}
        onDone={(c) => {
          setDeleting(null);
          refresh();
          setNote(`${c.name} deleted — it was pristine: no published papers, no dependent history, no roles.`);
        }}
      />
    </AdminPage>
  );
}
