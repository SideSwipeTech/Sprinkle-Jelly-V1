/**
 * DebugIndex — `debug`. The studio case list, built from counts alone:
 * identifiers, counts, categories and dates — never learner text
 * (debug/01 "Content review"). The default list is for authoring: one row
 * per case carrying its title, state and primary skill, the counts held
 * compact in the row meta. The lifecycle read that used to top this page
 * moved to the content review, where studio figures belong.
 *
 * Per row: the title and Open both reach the case studio; every secondary
 * act lives in the row's labelled three-dot menu — publish, return to
 * draft, archive — an ordinary confirm on each transition, each taking
 * effect as the platform's own lifecycle move. Permanent removal is offered
 * nowhere here: that lives only on the maintenance path (debug.F22), and
 * archive is terminal — no control restores an archived case (debug.F21).
 *
 * "New case" lands on `/admin/debug/new`, the editor's create flow.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { useStore } from "@state/useStore";
import { setDebugLifecycle } from "@state/store";
import { Icon } from "@icons/Icon";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { Dialog } from "../../../extraction/components/Dialog/Dialog";
import { List, ListRow } from "../../../extraction/components/ListRow/ListRow";
import { Menu, type MenuItem } from "../../../extraction/components/Menu/Menu";
import { Select } from "../../../extraction/components/Select/Select";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  formatPercent,
  usePreview,
  type PreviewKey
} from "../../assessments/shared";
import { DebugTabs } from "./DebugTabs";
import {
  BUG_TYPE_SEED,
  DEBUG_CASE_STATS,
  DEBUG_FIXTURE_ROWS,
  fixRate,
  recordAudit,
  type DebugCaseRow
} from "./fixtures";
import "./debug-admin.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

type Lifecycle = DebugCaseRow["lifecycle"];

function asLifecycle(v: string): Lifecycle {
  return v === "published" || v === "archived" ? v : "draft";
}

interface IndexRow {
  id: string;
  title: string;
  lifecycle: Lifecycle;
  /** The count read — absent where no figures exist for the row. */
  stats: DebugCaseRow | null;
}

type Pending = { id: string; title: string; to: Lifecycle } | null;

export function DebugIndex() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [status, setStatus] = useState("");
  const [bugType, setBugType] = useState("");
  const [skill, setSkill] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  /* Fixture-only rows carry no store row; their transitions stay local. */
  const [overrides, setOverrides] = useState<Record<string, Lifecycle>>({});

  const rows: IndexRow[] = [
    ...store.adminDebugCases.map((c) => ({
      id: c.id,
      title: c.title,
      lifecycle: overrides[c.id] ?? asLifecycle(c.lifecycle),
      stats: DEBUG_CASE_STATS[c.id] ?? null
    })),
    ...DEBUG_FIXTURE_ROWS.map((d) => ({
      id: d.id,
      title: d.title,
      lifecycle: overrides[d.id] ?? d.lifecycle,
      stats: d
    }))
  ];

  const skills = [...new Set(rows.map((r) => r.stats?.primarySkill).filter(Boolean) as string[])].sort();
  const filtering = Boolean(status || bugType || skill);
  const loading = preview === "loading";
  const visible = rows.filter((r) => {
    if (status && r.lifecycle !== status) return false;
    if (bugType && !(r.stats?.bugTypes ?? []).includes(bugType)) return false;
    if (skill && r.stats?.primarySkill !== skill) return false;
    return true;
  });

  function commit() {
    if (!pending) return;
    setDebugLifecycle(pending.id, pending.to);
    setOverrides((o) => ({ ...o, [pending.id]: pending.to }));
    recordAudit(`Debug case ${pending.id} → ${pending.to} — from the studio case list`);
    setPending(null);
  }

  const confirmCopy: Record<Lifecycle, { title: string; body: string; cta: string }> = {
    published: {
      title: "Publish this case?",
      body: "The publish gate runs — per offered language the buggy program is observed failing at least one authored case and the reference fix observed passing every one. An unverifiable language blocks publication as not yet verifiable.",
      cta: "Publish"
    },
    draft: {
      title: "Return this case to draft?",
      body: "The debug kind registers return-to-draft — the case leaves the board and accepts no new start of either mode while it is a draft.",
      cta: "Return to draft"
    },
    archived: {
      title: "Archive this case?",
      body: "Archive is terminal: the case keeps its history and review for everyone who used it, accepts no new start, and no control restores it. A replacement is a new draft identity made by duplicating it.",
      cta: "Archive — terminal"
    }
  };

  return (
    <AdminPage
      kicker="Content · Debug studio"
      title="Debug cases"
      lead="Every case in the studio — built from counts alone: identifiers, counts, categories and dates, never learner text. Permanent removal is offered only on the maintenance path."
      actions={<Button size="sm" icon="plus" to="/admin/debug/new">New case</Button>}
    >
      {/* The studio's local sections — Cases is the default; review, bug
          types and the maintenance path stay secondary. */}
      <DebugTabs current="cases" />

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {loading ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action="the debug studio read" /> : null}

      {preview === "loaded" ? (
        <Card>
          <CardHeader title="The case list" icon="debug" eyebrow="counts alone — no learner text" />
          <div className="dbg-filters" role="group" aria-label="Case filters">
            <Select
              size="sm"
              aria-label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "", label: "All statuses" },
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" }
              ]}
            />
            <Select
              size="sm"
              aria-label="Bug type"
              value={bugType}
              onChange={setBugType}
              options={[
                { value: "", label: "All bug types" },
                ...BUG_TYPE_SEED.map((t) => ({ value: t.name, label: t.name }))
              ]}
            />
            <Select
              size="sm"
              aria-label="Primary skill"
              value={skill}
              onChange={setSkill}
              options={[
                { value: "", label: "All skills" },
                ...skills.map((s) => ({ value: s, label: s }))
              ]}
            />
            {filtering ? (
              <Button variant="quiet" size="sm" icon="x" onClick={() => { setStatus(""); setBugType(""); setSkill(""); }}>
                Clear filters
              </Button>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <StateBlock
              state="empty"
              compact
              message={
                filtering
                  ? "Nothing matched — clearing the filters brings the list back."
                  : "No case has been planted yet — an empty library is a reading in its own right."
              }
              action={
                filtering ? (
                  <Button variant="secondary" size="sm" onClick={() => { setStatus(""); setBugType(""); setSkill(""); }}>
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" icon="plus" to="/admin/debug/new">New case</Button>
                )
              }
            />
          ) : (
            <>
              {/* A list of rows, not a table — a table's own scroll box would
                  clip the menu panel. Title, state and primary skill are the
                  columns; the funnel counts stay compact in the meta. */}
              <List className="dbg-cases">
                {visible.map((r) => {
                  const rate = r.stats ? fixRate(r.stats) : null;
                  const date = r.stats ? (r.stats.publishedAt ?? r.stats.createdAt) : null;
                  /* One primary act per row; every lifecycle transition lives
                     in the three-dot menu, each behind its own confirm. An
                     archived case is terminal — no control restores it, so no
                     menu renders there. */
                  const acts: MenuItem[] = [
                    ...(r.lifecycle === "draft"
                      ? ([{ id: "publish", label: "Publish", icon: "check" }] satisfies MenuItem[])
                      : []),
                    ...(r.lifecycle === "published"
                      ? ([{ id: "draft", label: "Return to draft", icon: "reset" }] satisfies MenuItem[])
                      : []),
                    ...(r.lifecycle !== "archived"
                      ? ([{ id: "archive", label: "Archive…", icon: "inbox", destructive: true }] satisfies MenuItem[])
                      : [])
                  ];
                  return (
                    <ListRow
                      key={r.id}
                      as="article"
                      align="center"
                      className="dbg-row"
                      data-lifecycle={r.lifecycle}
                    >
                      <div className="dbg-idx">
                        {/* The name cell — the title is the row's link into the
                            studio; the row itself stays inert, so a menu act
                            never navigates it. */}
                        <div className="dbg-grow">
                          <Link className="dbg-titlelink" to={`/admin/debug/${r.id}`}>
                            <strong>{r.title}</strong>
                          </Link>
                          <span className="meta">
                            {r.id}
                            {r.stats
                              ? ` · ${r.stats.bugTypes.join(", ") || "no bug type"} · ${r.stats.difficulty || "—"}`
                              : ""}
                            {r.stats
                              ? ` · ${r.stats.bugCount ?? "—"} ${r.stats.bugCount === 1 ? "bug" : "bugs"}`
                              : ""}
                          </span>
                          <span className="meta">
                            {r.stats ? (
                              <>
                                {`${r.stats.opened} opened · ${r.stats.submitted} submitted · ${r.stats.fixed} fixed`}
                                {/* No denominator is a dash — never a manufactured zero. */}
                                {` · ${formatPercent(rate) ?? "—"} fix rate`}
                                {date ? ` · ${r.stats.publishedAt ? "published" : "authored"} ${date}` : ""}
                              </>
                            ) : (
                              "counts not read — identifiers and dates only"
                            )}
                          </span>
                        </div>
                        <span className="dbg-idx__fact" data-h="State">
                          {/* Published is the live state — the one accent the list paints. */}
                          <Chip size="sm" variant={r.lifecycle === "published" ? "accent" : "quiet"}>{r.lifecycle}</Chip>
                        </span>
                        <span className="dbg-idx__fact" data-h="Primary skill">
                          {r.stats?.primarySkill
                            ? <span className="dbg-idx__value">{r.stats.primarySkill}</span>
                            : <span className="dbg-none">—</span>}
                        </span>
                        <span className="dbg-idx__acts">
                          <Button variant="secondary" size="sm" icon="edit" to={`/admin/debug/${r.id}`}>Open</Button>
                          {acts.length > 0 ? (
                            <Menu
                              align="end"
                              trigger={<Icon name="more" size={16} />}
                              triggerLabel={`Actions for ${r.title}`}
                              items={acts}
                              onSelect={(id) => setPending({ id: r.id, title: r.title, to: id === "publish" ? "published" : id === "draft" ? "draft" : "archived" })}
                            />
                          ) : (
                            <span className="meta">terminal</span>
                          )}
                        </span>
                      </div>
                    </ListRow>
                  );
                })}
              </List>
              <LoadedLine loaded={visible.length} total={rows.length} />
            </>
          )}
        </Card>
      ) : null}

      <Dialog
        open={pending !== null}
        title={pending ? confirmCopy[pending.to].title : ""}
        icon={pending?.to === "archived" ? "alert" : "check"}
        tone={pending?.to === "archived" ? "destructive" : "default"}
        onClose={() => setPending(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setPending(null)}>Cancel</Button>
            <Button variant={pending?.to === "archived" ? "destructive" : "primary"} onClick={commit}>
              {pending ? confirmCopy[pending.to].cta : "Confirm"}
            </Button>
          </>
        }
      >
        <p>
          {pending ? `“${pending.title}” — ${confirmCopy[pending.to].body}` : ""}
        </p>
        <p className="meta">
          The transition lands in the audit trail with its change. Permanent removal is never offered
          here — it lives on the <Link to="/admin/debug/maintenance">maintenance path</Link> alone, and
          only for a pristine draft.
        </p>
      </Dialog>
    </AdminPage>
  );
}
