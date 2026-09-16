/**
 * Vocabulary — `debug/vocabulary`. The bug-type vocabulary: the ONE curated
 * platform-level list (`debug_bug_types`) this domain is the home of — each
 * member carrying its name, its order and whether it is active
 * (debug/04-authoring, decision 141).
 *
 * Curating is an administrative act on the vocabulary itself, not authoring
 * on a case: it runs under the named action `debug-detective.curate_bug_types`
 * and is audited like any staff write. A case's bug types reference this
 * list, and the board's filter and the bug-types-practised figure read it —
 * no second list exists. Retiring never deletes: cases already referencing a
 * member keep resolving, and the member stops being offered to new authoring.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../../AdminShell";
import { Button } from "../../../extraction/components/Button/Button";
import { Chip } from "../../../extraction/components/Chip/Chip";
import { Dialog } from "../../../extraction/components/Dialog/Dialog";
import { Field } from "../../../extraction/components/Field/Field";
import { List, ListRow } from "../../../extraction/components/ListRow/ListRow";
import { Notice } from "../../../extraction/components/Notice/Notice";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../../assessments/shared";
import { ACTION, BUG_TYPE_SEED, recordAudit, type BugTypeEntry } from "./fixtures";
import { DebugTabs } from "./DebugTabs";
import "./debug-admin.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

/** A name normalizes as it is typed: lowercase, runs of anything else to a hyphen. */
function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function Vocabulary() {
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [entries, setEntries] = useState<BugTypeEntry[]>(BUG_TYPE_SEED);
  const [name, setName] = useState("");
  const [retiring, setRetiring] = useState<BugTypeEntry | null>(null);
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const ordered = entries.slice().sort((a, b) => a.order - b.order);
  const activeCount = ordered.filter((e) => e.active).length;
  const candidate = normalizeName(name);
  const duplicate = candidate.length > 0 && entries.some((e) => e.name === candidate);

  function add() {
    if (!candidate || duplicate) return;
    const entry: BugTypeEntry = {
      name: candidate,
      order: Math.max(0, ...entries.map((e) => e.order)) + 1,
      active: true
    };
    setEntries((prev) => [...prev, entry]);
    setName("");
    recordAudit(`Bug-type vocabulary — added "${candidate}" (${ACTION.curateBugTypes})`);
    setFlash({ tone: "success", text: `Added "${candidate}" — order ${entry.order}, active. The board's filter and the bug-types-practised figure read it from here.` });
  }

  function setActive(entry: BugTypeEntry, active: boolean) {
    setEntries((prev) => prev.map((e) => (e.name === entry.name ? { ...e, active } : e)));
    recordAudit(`Bug-type vocabulary — ${active ? "reactivated" : "retired"} "${entry.name}" (${ACTION.curateBugTypes})`);
    setFlash(
      active
        ? { tone: "success", text: `"${entry.name}" is active again — offered to new authoring.` }
        : { tone: "success", text: `"${entry.name}" retired — cases already referencing it keep resolving; it is no longer offered to new authoring.` }
    );
    setRetiring(null);
  }

  return (
    <AdminPage
      kicker="Content · Debug studio"
      title="Bug-type vocabulary"
      lead="The one curated platform-level list — each member's name, its order and whether it is active. Curating it is an administrative act on the vocabulary itself, not authoring on a case."
    >
      <DebugTabs current="vocabulary" />

      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.curateBugTypes} /> : null}

      {preview === "loaded" ? (
        <>
          {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}
          <Card>
            <CardHeader
              title="The list"
              icon="list"
              eyebrow={`${ACTION.curateBugTypes} — audited like any staff write`}
              action={<Chip size="sm" variant="quiet">{activeCount} of {ordered.length} active</Chip>}
            />
            <p className="meta dbg-flush">
              A case's bug types reference this list, each from the vocabulary and never free-typed.
              The board's filter and the bug-types-practised lifetime figure read this same list and
              keep no second.
            </p>
            {ordered.length === 0 ? (
              <StateBlock state="empty" compact message="The vocabulary holds no members — a case cannot carry a bug type until one exists." />
            ) : (
              <>
                <List className="dbg-vocab">
                  {ordered.map((e) => (
                    <ListRow key={e.name} as="article" align="center" data-retired={!e.active || undefined}>
                      <span className="dbg-order" aria-label={`Order ${e.order}`}>{e.order}</span>
                      <div className="dbg-vocab__body">
                        <strong>{e.name}</strong>
                        <p className="meta">{e.active ? "active — offered to new authoring" : "retired — resolves on existing cases, offered nowhere new"}</p>
                      </div>
                      <Chip size="sm" variant={e.active ? "accent" : "quiet"}>{e.active ? "active" : "retired"}</Chip>
                      {e.active ? (
                        <Button variant="quiet" size="sm" onClick={() => setRetiring(e)}>Retire…</Button>
                      ) : (
                        <Button variant="quiet" size="sm" onClick={() => setActive(e, true)}>Reactivate</Button>
                      )}
                    </ListRow>
                  ))}
                </List>
                <LoadedLine loaded={ordered.length} total={ordered.length} />
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Add a member" icon="plus" />
            <div className="admin-form-grid">
              <Field
                label="Bug-type name"
                required
                hint="Normalizes as you type — lowercase, hyphenated. A duplicate name is refused."
                error={duplicate ? `"${candidate}" is already a member of the vocabulary.` : undefined}
                className="admin-form-grid__wide"
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                  placeholder="e.g. null-handling"
                />
              </Field>
            </div>
            <Button
              icon="plus"
              disabled={!candidate || duplicate}
              label={!candidate ? "Add a bug type — a name is required" : duplicate ? `Add a bug type — "${candidate}" already exists` : undefined}
              onClick={add}
            >
              Add to the vocabulary
            </Button>
            <p className="meta dbg-flush">
              Members are added and retired here and nowhere else — a case references the vocabulary,
              it never grows it. Each change lands in the audit trail.
            </p>
          </Card>
        </>
      ) : null}

      <Dialog
        open={retiring !== null}
        title={retiring ? `Retire "${retiring.name}"?` : ""}
        icon="alert"
        onClose={() => setRetiring(null)}
        actions={
          <>
            <Button variant="quiet" onClick={() => setRetiring(null)}>Cancel</Button>
            <Button variant="secondary" onClick={() => retiring && setActive(retiring, false)}>
              Retire
            </Button>
          </>
        }
      >
        <p>
          Retiring never deletes: cases already referencing this bug type keep resolving and their
          category stays readable. The member stops being offered to new authoring and leaves the
          board's filter for new content.
        </p>
        <p className="meta">
          The change is audited under {ACTION.curateBugTypes}. The same list stays readable on the{" "}
          <Link to="/admin/debug">case list</Link>.
        </p>
      </Dialog>
    </AdminPage>
  );
}
