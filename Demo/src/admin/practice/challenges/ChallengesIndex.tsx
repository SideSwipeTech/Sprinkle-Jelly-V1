/**
 * ChallengesIndex — `challenges`. The challenge studio's landing list: every
 * authored challenge reduced to the essential authoring facts — title,
 * difficulty, status, updated — with the cases and offered languages carried
 * compactly in the row meta. The performance read (unique-learner counts, the
 * acceptance table, review reasons and track rollups) lives on Content
 * review, linked from the header.
 *
 * Per row: the title and Open both reach the shared editing space; every
 * secondary act lives in a labelled three-dot menu — publish (or submit for
 * approval where the session cannot publish directly), return to draft on
 * this kind (its return-to-draft flag is true), duplicate, archive behind an
 * ordinary confirm, and delete only where the row is a pristine draft, behind
 * a typed confirmation. An archive is blocked, with the tracks named, while a
 * published track holds a live reference, and blocked too when the reference
 * count cannot be read.
 *
 * Rows render as a list rather than a scrollable table so the menu panel is
 * never clipped by a table's own scroll box. Fixture state only — deletion is
 * a page-local hide (the store owns no challenge delete), and New challenge
 * opens the `new` create flow straight in the editor: the store owns no
 * challenge create either, so a saved new draft does not join this list.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { useStore } from "@state/useStore";
import { canPublishDirect } from "../../roles";
import { duplicateChallenge, setChallengeLifecycle } from "@state/store";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { Select } from "../../../extraction/components/Select/Select";
import { Dialog } from "../../../extraction/components/Dialog/Dialog";
import { ConfirmByTyping } from "../../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { FilterBar } from "../../../extraction/components/FilterBar/FilterBar";
import { List, ListRow } from "../../../extraction/components/ListRow/ListRow";
import { Menu, type MenuItem } from "../../../extraction/components/Menu/Menu";
import { Notice } from "../../../extraction/components/Notice/Notice";
import { Icon } from "@icons/Icon";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../../assessments/shared";
import {
  ACTION,
  archiveBlock,
  challengeRows,
  FIG,
  fmtInstant,
  isPristineDraft,
  languageLabel,
  type ChallengeRow
} from "./fixtures";
import "./challenges-admin.css";

export function ChallengesIndex() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const role = store.session.role;
  const direct = canPublishDirect(role);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  /* Page-local: the store owns no challenge delete — a deleted row hides here
     and its audit is stated, but the demo store still resolves its editor. */
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [archiveFor, setArchiveFor] = useState<ChallengeRow | null>(null);
  const [deleteFor, setDeleteFor] = useState<ChallengeRow | null>(null);
  const [echo, setEcho] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      challengeRows(store)
        .filter((r) => !deletedIds.includes(r.id))
        .sort((a, b) => a.title.localeCompare(b.title)), // a stable ordering
    [store, deletedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.lifecycle !== status) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.id.includes(q) ||
        r.topics.some((t) => t.includes(q))
      );
    });
  }, [rows, query, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / FIG.PLATFORM_LIST_PAGE_ITEMS));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(
    safePage * FIG.PLATFORM_LIST_PAGE_ITEMS,
    (safePage + 1) * FIG.PLATFORM_LIST_PAGE_ITEMS
  );

  function publish(row: ChallengeRow) {
    /* Where the session cannot publish directly the same act files a pending
       approval — the approval queue owns it from there. */
    setChallengeLifecycle(row.id, direct ? "published" : "submitted");
    setFlash(
      direct
        ? `${row.title}: draft → published — committed with its audit-trail row.`
        : `${row.title}: submitted for approval — the publish decision is Publish Approvals'.`
    );
  }

  /* The menu's whole act set, gated by lifecycle — a submitted row publishes
     through the approvals queue, an archived one is terminal; only a pristine
     draft ever reaches delete. */
  function menuItems(row: ChallengeRow): MenuItem[] {
    const items: MenuItem[] = [];
    if (row.lifecycle === "draft") {
      items.push({
        id: "publish",
        label: direct ? "Publish" : "Submit for approval",
        icon: "check-mark"
      });
    }
    if (row.lifecycle === "published") {
      items.push({ id: "return-draft", label: "Return to draft", icon: "reset" });
    }
    items.push({ id: "duplicate", label: "Duplicate", icon: "copy" });
    if (row.lifecycle === "draft" || row.lifecycle === "published") {
      items.push({ id: "archive", label: "Archive…", icon: "inbox", destructive: true });
    }
    if (isPristineDraft(row)) {
      items.push({ id: "delete", label: "Delete permanently…", icon: "trash", destructive: true });
    }
    return items;
  }

  function onMenuSelect(row: ChallengeRow, id: string) {
    if (id === "publish") {
      publish(row);
    } else if (id === "return-draft") {
      setChallengeLifecycle(row.id, "draft");
      setFlash(`${row.title}: published → draft — the return-to-draft flag is set on this kind.`);
    } else if (id === "duplicate") {
      duplicateChallenge(row.id);
      setFlash(`${row.title} duplicated — a draft copy with no learner-facing trace.`);
    } else if (id === "archive") {
      /* A blocked archive still opens the confirm — the tracks that hold it
         are named there and the act stays unreachable. */
      setArchiveFor(row);
    } else if (id === "delete") {
      setDeleteFor(row);
      setEcho("");
    }
  }

  function confirmArchive() {
    if (!archiveFor) return;
    if (archiveBlock(archiveFor).blocked) return; // unreachable — the control stays disabled
    setChallengeLifecycle(archiveFor.id, "archived");
    setFlash(`${archiveFor.title} archived — committed with its audit-trail row.`);
    setArchiveFor(null);
  }

  function confirmDelete() {
    if (!deleteFor) return;
    setDeletedIds((ids) => [...ids, deleteFor.id]);
    setFlash(
      `${deleteFor.title} deleted — a pristine draft; its templates, cases and hints went with it. Committed with its audit-trail row.`
    );
    setDeleteFor(null);
    setEcho("");
  }

  return (
    <AdminPage
      kicker="Content"
      title="Challenge studio"
      lead="Every authored challenge — title, difficulty, state and when it last changed. Open or the title reaches the editor; the performance read lives on Content review."
      actions={
        <>
          {/* The live library count beside the header acts — held back while a
              preview state says the catalogue cannot be read. */}
          {preview === "loaded" ? (
            <Chip variant="quiet" icon="challenges">
              {rows.length} challenge{rows.length === 1 ? "" : "s"}
            </Chip>
          ) : null}
          <Button variant="secondary" to="/admin/challenges/review" icon="target">Content review</Button>
          <Button variant="quiet" to="/admin/tracks" icon="tracks">Track studio</Button>
          <Button to="/admin/challenges/new" icon="plus">New challenge</Button>
        </>
      }
    >
      {/* Demo state selectors stay out of the primary flow — PreviewBar is
          itself the collapsed Demo tools drawer. */}
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.editChallenge} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="Challenges unavailable — the catalogue could not be read. Nothing here is rendered as an empty library."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          {/* Compact filters — search and lifecycle status. The library's
              lifecycle figures moved to Content review with the rest of the
              performance read. */}
          <FilterBar
            className="ch-filterbar"
            label="Challenge filters"
            search={{ value: query, onChange: (v) => { setQuery(v); setPage(0); }, placeholder: "Search titles and topics…", label: "Search titles and topics" }}
            count={`${filtered.length} challenge${filtered.length === 1 ? "" : "s"}`}
          >
            <Select
              size="sm"
              value={status}
              onChange={(v) => { setStatus(v); setPage(0); }}
              aria-label="Filter by status"
              options={[
                { value: "all", label: "all statuses" },
                { value: "draft", label: "draft" },
                { value: "submitted", label: "submitted" },
                { value: "published", label: "published" },
                { value: "archived", label: "archived" }
              ]}
            />
          </FilterBar>

          {flash ? <Notice tone="success" live="polite">{flash}</Notice> : null}

          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message={
                rows.length === 0
                  ? "Nothing has been authored yet — an empty library is a reading in its own right."
                  : "No challenges match this filter or search."
              }
              action={
                rows.length === 0 ? (
                  <Button to="/admin/challenges/new" icon="plus">Author the first challenge</Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setQuery(""); setStatus("all"); setPage(0); }}
                  >
                    Clear the filter and search
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="ch-pagebar">
                {/* Counted under the same filters, search predicate and snapshot. */}
                <LoadedLine
                  loaded={safePage * FIG.PLATFORM_LIST_PAGE_ITEMS + pageRows.length}
                  total={filtered.length}
                />
                {pages > 1 ? (
                  <span className="row">
                    <Button variant="quiet" size="sm" icon="chevron-left" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                      Previous
                    </Button>
                    <span className="meta">page {safePage + 1} of {pages}</span>
                    <Button variant="quiet" size="sm" iconEnd="chevron-right" disabled={safePage + 1 >= pages} onClick={() => setPage(safePage + 1)}>
                      Next
                    </Button>
                  </span>
                ) : null}
              </div>

              <List>
                {pageRows.map((row) => {
                  const items = menuItems(row);
                  return (
                    <ListRow key={row.id} as="article" align="center">
                      <div className="ch-idx">
                        {/* The name cell — title and Open both reach the editor;
                            the row itself is inert, so a menu act never
                            navigates it. */}
                        <div className="ch-grow">
                          <span className="ch-itemhead">
                            <Link className="ch-titlelink" to={`/admin/challenges/${row.id}`}>
                              <strong>{row.title}</strong>
                            </Link>
                            {row.topics.slice(0, 3).map((t) => (
                              <Chip key={t} size="sm" variant="quiet">{t}</Chip>
                            ))}
                            {row.topics.length > 3 ? <Chip size="sm" variant="quiet">+{row.topics.length - 3}</Chip> : null}
                          </span>
                          <p className="ch-cell__meta">
                            /{row.id}
                            {row.category ? ` · ${row.category}` : ""}
                            {" · "}revision {row.revision}
                            {row.languages.length > 0
                              ? ` · ${row.languages.map(languageLabel).join(", ")}`
                              : ""}
                            {" · "}
                            {row.visibleCases + row.hiddenCases > 0
                              ? `${row.visibleCases} visible · ${row.hiddenCases} hidden`
                              : row.lifecycle === "draft"
                                ? "no cases yet"
                                : "cases —"}
                          </p>
                        </div>
                        <span className="ch-idx__fact" data-h="Difficulty">
                          {row.difficulty ? <Chip size="sm" variant="quiet">{row.difficulty}</Chip> : <span className="meta">—</span>}
                        </span>
                        <span className="ch-idx__fact" data-h="Status">
                          <Chip
                            size="sm"
                            variant={row.lifecycle === "published" ? "accent" : "quiet"}
                            className={row.lifecycle === "archived" ? "ch-chip--muted" : ""}
                          >
                            {row.lifecycle}
                          </Chip>
                        </span>
                        <span className="ch-idx__fact" data-h="Updated">
                          <span className="ch-idx__when">{fmtInstant(row.updatedAt)}</span>
                        </span>
                        <span className="ch-idx__acts">
                          <Button variant="secondary" size="sm" icon="edit" to={`/admin/challenges/${row.id}`}>Open</Button>
                          {/* Every row keeps Duplicate, so the set is never
                              empty — an archived row's menu carries it alone. */}
                          <Menu
                            trigger={<Icon name="more" size={16} />}
                            triggerLabel={`Actions for ${row.title}`}
                            items={items}
                            align="end"
                            onSelect={(id) => onMenuSelect(row, id)}
                          />
                        </span>
                      </div>
                    </ListRow>
                  );
                })}
              </List>
              <p className="ch-note">
                The case figures are the draft's own — a figure that cannot be read renders a dash,
                never a zero. Unique-learner counts, the acceptance table, the six review reasons and
                the track rollups live on{" "}
                <Link to="/admin/challenges/review">Content review</Link>. Deletion reaches a pristine
                draft alone.
              </p>
            </>
          )}
        </>
      ) : null}

      {/* Tier one — the ordinary confirm: archiving. Blocked archives state
          what blocks them and keep the act unreachable. */}
      <Dialog
        open={archiveFor !== null}
        title={archiveFor ? `Archive ${archiveFor.title}?` : "Archive?"}
        icon="inbox"
        tone="destructive"
        onClose={() => setArchiveFor(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setArchiveFor(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={archiveFor !== null && archiveBlock(archiveFor).blocked}
              onClick={confirmArchive}
            >
              Archive
            </Button>
          </>
        }
      >
        {archiveFor ? (
          archiveBlock(archiveFor).blocked ? (
            <p>{archiveBlock(archiveFor).note}</p>
          ) : (
            <p>
              Archiving hides {archiveFor.title} from learners and shortens any track that owns it —
              a solve already earned still counts everywhere solves count. The change commits with
              its audit-trail row or not at all.
            </p>
          )
        ) : null}
      </Dialog>

      {/* Tier two — the typed confirmation: deleting permanently, a pristine
          draft only, its blast radius stated. */}
      <Dialog
        open={deleteFor !== null}
        title={deleteFor ? `Delete ${deleteFor.title} permanently?` : "Delete?"}
        icon="trash"
        tone="destructive"
        onClose={() => { setDeleteFor(null); setEcho(""); }}
      >
        {deleteFor ? (
          <>
            <p>
              Hard delete reaches a pristine draft alone — never published, no learner activity. Its
              templates, cases and hints go with it; this cannot be undone.
            </p>
            <ConfirmByTyping phrase={deleteFor.title} value={echo} onChange={setEcho}>
              {(matched) => (
                <Button variant="destructive" disabled={!matched} onClick={confirmDelete}>
                  Delete permanently
                </Button>
              )}
            </ConfirmByTyping>
          </>
        ) : null}
      </Dialog>
    </AdminPage>
  );
}
