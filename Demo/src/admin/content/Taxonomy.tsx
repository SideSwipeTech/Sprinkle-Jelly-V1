/**
 * Taxonomy — `taxonomy`. The one page that writes the vocabulary; every other
 * page reads it (admin.F13, admin/04 "The vocabulary"). The whole hierarchy in
 * a stable order, its size and shape, and a dialog per action against the
 * engine's three and no fourth: create — a skill, or a topic under its skill;
 * retire; and merge, two names into one. Nothing here renames, restores or
 * deletes a name.
 *
 * The ceiling counts combined and for the vocabulary's lifetime; a merge or
 * retire previews its blast radius broken out by domain before it can be
 * confirmed, and a count that cannot be read keeps the confirm unreachable —
 * while zero is a real answer and proceeds. Beside it the four-value
 * difficulty scale and the language registry render as read-only cards.
 *
 * Fixture state only.
 */

import { useState, type ReactNode } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  ACTION,
  DIFFICULTY_SCALE,
  FIG,
  LANGUAGE_REGISTRY,
  TAXONOMY,
  type TaxNode
} from "./fixtures";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import "./content.css";

type DialogKind =
  | { kind: "create"; nodeKind: "skill" | "topic" }
  | { kind: "retire"; node: TaxNode; openedAt: string }
  | { kind: "merge"; node: TaxNode; openedAt: string };

export function Taxonomy() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [nodes, setNodes] = useState<TaxNode[]>(TAXONOMY);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [label, setLabel] = useState("");
  const [parentId, setParentId] = useState("");
  const [mergeInto, setMergeInto] = useState("");
  const [showItems, setShowItems] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  /* Stable order: skills alphabetical, each skill's topics alphabetical under
     it; archived and merged-source nodes render in place, labelled. */
  const skills = nodes.filter((n) => n.kind === "skill").slice().sort((a, b) => a.label.localeCompare(b.label));
  const topicsOf = (skillId: string) =>
    nodes.filter((n) => n.parentId === skillId).slice().sort((a, b) => a.label.localeCompare(b.label));

  /* Persistent nodes, combined and for the vocabulary's lifetime — active,
     archived and merged-source together. */
  const persistent = nodes.length;
  const room = FIG.PUBLISHING_TAXONOMY_CEILING - persistent;
  const atCeiling = room <= 0;
  const nearCeiling = persistent > FIG.PUBLISHING_TAXONOMY_WARNING_THRESHOLD;

  function openDialog(d: DialogKind) {
    setDialog(d);
    setLabel("");
    setParentId(skills.find((s) => s.state === "active")?.id ?? "");
    setMergeInto("");
    setShowItems(false);
  }

  function create() {
    if (!dialog || dialog.kind !== "create" || !label.trim() || atCeiling) return;
    const node: TaxNode = {
      id: `tx-${label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label: label.trim(),
      kind: dialog.nodeKind,
      parentId: dialog.nodeKind === "topic" ? parentId : null,
      state: "active",
      blast: []
    };
    setNodes((prev) => [...prev, node]);
    setFlash(`Created ${node.kind} “${node.label}” — a persistent node against the lifetime ceiling.`);
    setDialog(null);
  }

  function retire(node: TaxNode) {
    setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, state: "archived" as const } : n)));
    setFlash(`Retired “${node.label}” — the name stays in the vocabulary, labelled, and frees no room against the ceiling.`);
    setDialog(null);
  }

  function merge(node: TaxNode) {
    const dest = nodes.find((n) => n.id === mergeInto);
    if (!dest) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, state: "merged" as const, mergedInto: dest.label } : n))
    );
    setFlash(`Merged “${node.label}” into “${dest.label}” — two names into one, all-or-nothing; a merge frees no room.`);
    setDialog(null);
  }

  return (
    <AdminPage
      kicker="Content"
      title="Taxonomy"
      lead="The one page that writes the vocabulary — every other page reads it. The engine's three acts and no fourth: create, retire, merge."
      actions={
        <span className="row">
          <Button variant="secondary" size="sm" icon="plus" onClick={() => openDialog({ kind: "create", nodeKind: "skill" })}>
            Add a skill
          </Button>
          <Button variant="secondary" size="sm" icon="plus" onClick={() => openDialog({ kind: "create", nodeKind: "topic" })}>
            Add a topic
          </Button>
        </span>
      }
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.curateTaxonomy} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The vocabulary cannot be read — a studio holding a stale vocabulary waits rather than offering a free-text fallback, and curation refuses rather than guessing."
        />
      ) : null}

      {preview === "loaded" ? (
        <>
          {flash ? <Notice tone="success" live="polite">{flash}</Notice> : null}

          <div className="ct-gaps">
            <div>
              <Card>
                <CardHeader
                  title="The hierarchy"
                  icon="skills"
                  eyebrow="a stable order — skills, then each skill's topics"
                />
                <div className="ct-tree">
                  {skills.map((skill) => (
                    <div key={skill.id}>
                      <TaxRow
                        node={skill}
                        onRetire={() => openDialog({ kind: "retire", node: skill, openedAt: new Date().toISOString() })}
                        onMerge={() => openDialog({ kind: "merge", node: skill, openedAt: new Date().toISOString() })}
                      />
                      {topicsOf(skill.id).map((topic) => (
                        <TaxRow
                          key={topic.id}
                          node={topic}
                          topic
                          onRetire={() => openDialog({ kind: "retire", node: topic, openedAt: new Date().toISOString() })}
                          onMerge={() => openDialog({ kind: "merge", node: topic, openedAt: new Date().toISOString() })}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <p className="meta">
                  A merge is two names into one; a merge destination consumes a node; neither a merge
                  nor a retire frees room against the ceiling.
                </p>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader title="Size and shape" icon="grid" />
                <dl className="account-facts">
                  <div><dt>Active names</dt><dd>{nodes.filter((n) => n.state === "active").length}</dd></div>
                  <div><dt>Archived</dt><dd>{nodes.filter((n) => n.state === "archived").length}</dd></div>
                  <div><dt>Merged sources</dt><dd>{nodes.filter((n) => n.state === "merged").length}</dd></div>
                  <div><dt>Persistent nodes, lifetime</dt><dd>{persistent} of {FIG.PUBLISHING_TAXONOMY_CEILING}</dd></div>
                  <div><dt>Room remaining</dt><dd>{room}</dd></div>
                </dl>
                {nearCeiling ? (
                  <Notice tone="warning" title="Findability warning">
                    <p>
                      Above {FIG.PUBLISHING_TAXONOMY_WARNING_THRESHOLD} persistent nodes the vocabulary
                      gets hard to find in — a warning, never a block. Creation is refused only at{" "}
                      {FIG.PUBLISHING_TAXONOMY_CEILING}.
                    </p>
                  </Notice>
                ) : null}
                <p className="meta">
                  Editorial guidance, not a gate: about {FIG.PUBLISHING_ACTIVE_NAME_GUIDELINE} active
                  names keeps the vocabulary findable. Raising the ceiling is not a setting here.
                </p>
              </Card>

              <Card>
                <CardHeader title="The difficulty scale" icon="layers" eyebrow="read-only" />
                <div className="row">
                  {DIFFICULTY_SCALE.map((d) => (
                    <Chip key={d} size="sm" variant="quiet">{d}</Chip>
                  ))}
                </div>
                <p className="meta">
                  Four values, registered and rehearsed by platform operations — never edited in a
                  studio. A label mapping to nothing resolves to nothing.
                </p>
              </Card>

              <Card>
                <CardHeader title="The language registry" icon="code" eyebrow="read-only" />
                {LANGUAGE_REGISTRY.length === 0 ? (
                  <StateBlock state="empty" message="The registry is empty — an explicit empty state, not a failed read." compact />
                ) : (
                  <div className="list">
                    {LANGUAGE_REGISTRY.map((l) => (
                      <div key={l.key} className="list-row" data-disabled={!l.on || undefined}>
                        <div>
                          <strong>{l.label}</strong>
                          <p className="meta">
                            {l.on ? "registered" : (l.offNote ?? "turned off")}
                          </p>
                        </div>
                        <Chip size="sm" variant="quiet">{l.on ? "on" : "off"}</Chip>
                      </div>
                    ))}
                  </div>
                )}
                <p className="meta">
                  A language is never a skill. Both are registered and rehearsed by platform
                  operations, not edited here.
                </p>
              </Card>
            </div>
          </div>

          {/* ── The dialogs — one per act ── */}

          {dialog?.kind === "create" ? (
            <Dialog
              title={dialog.nodeKind === "skill" ? "Create a skill" : "Create a topic"}
              icon="plus"
              onClose={() => setDialog(null)}
              actions={
                <>
                  <Button variant="quiet" onClick={() => setDialog(null)}>Cancel</Button>
                  <Button
                    disabled={!label.trim() || (dialog.nodeKind === "topic" && !parentId)}
                    onClick={create}
                  >
                    Create
                  </Button>
                </>
              }
            >
              {atCeiling ? (
                <Notice tone="error" title="Creation refused — the ceiling">
                  <p>
                    The vocabulary holds {persistent} persistent nodes — active, archived and
                    merged-source together — against a lifetime ceiling of{" "}
                    {FIG.PUBLISHING_TAXONOMY_CEILING}. Creation is refused without changing anything.
                  </p>
                </Notice>
              ) : (
                <>
                  <Field label="Name" required>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} />
                  </Field>
                  {dialog.nodeKind === "topic" ? (
                    <Field label="Under the skill" required hint="A topic is created under its skill — never loose.">
                      <Select
                        value={parentId}
                        onChange={setParentId}
                        options={skills.filter((s) => s.state === "active").map((s) => ({ value: s.id, label: s.label }))}
                        aria-label="Parent skill"
                      />
                    </Field>
                  ) : null}
                  {nearCeiling ? (
                    <p className="meta">
                      Near the ceiling — {room} node{room === 1 ? "" : "s"} of room remain; the
                      findability warning stands above {FIG.PUBLISHING_TAXONOMY_WARNING_THRESHOLD}.
                    </p>
                  ) : null}
                </>
              )}
            </Dialog>
          ) : null}

          {dialog?.kind === "retire" ? (
            <BlastDialog
              title={`Retire — ${dialog.node.label}`}
              confirmLabel="Retire"
              node={dialog.node}
              openedAt={dialog.openedAt}
              nearCeiling={nearCeiling}
              showItems={showItems}
              onToggleItems={() => setShowItems((v) => !v)}
              onCancel={() => setDialog(null)}
              onConfirm={() => retire(dialog.node)}
              body="Retiring keeps the name in the vocabulary, labelled, and moves its content off the active list. It frees no room against the ceiling."
            />
          ) : null}

          {dialog?.kind === "merge" ? (
            <BlastDialog
              title={`Merge — ${dialog.node.label}`}
              confirmLabel="Merge into the destination"
              node={dialog.node}
              openedAt={dialog.openedAt}
              nearCeiling={nearCeiling}
              showItems={showItems}
              onToggleItems={() => setShowItems((v) => !v)}
              onCancel={() => setDialog(null)}
              onConfirm={() => merge(dialog.node)}
              confirmDisabled={!mergeInto}
              body="Two names into one — the source becomes a merged-source node and still counts against the ceiling. A merge that fails part-way changes nothing at all."
              extra={
                <Field label="Merge into" required hint={`Another ${dialog.node.kind}, active.`}>
                  <Select
                    value={mergeInto}
                    onChange={setMergeInto}
                    options={[
                      { value: "", label: "— choose the destination —" },
                      ...nodes
                        .filter((n) => n.kind === dialog.node.kind && n.state === "active" && n.id !== dialog.node.id)
                        .map((n) => ({ value: n.id, label: n.label }))
                    ]}
                    aria-label="Merge destination"
                  />
                </Field>
              }
            />
          ) : null}
        </>
      ) : null}
    </AdminPage>
  );
}

function TaxRow({
  node,
  topic,
  onRetire,
  onMerge
}: {
  node: TaxNode;
  topic?: boolean;
  onRetire: () => void;
  onMerge: () => void;
}) {
  return (
    <div className={`ct-tree__node ${topic ? "ct-tree__node--topic" : ""}`} data-state={node.state}>
      <span className="ct-tree__label">
        {node.label}
        {node.state === "merged" && node.mergedInto ? (
          <span className="meta"> — merged into {node.mergedInto}</span>
        ) : null}
      </span>
      <Chip size="sm" variant="quiet">{node.kind}</Chip>
      {node.state !== "active" ? <Chip size="sm" variant="quiet">{node.state}</Chip> : null}
      {node.state === "active" ? (
        <>
          <Button variant="quiet" size="sm" onClick={onRetire}>Retire…</Button>
          <Button variant="quiet" size="sm" onClick={onMerge}>Merge…</Button>
        </>
      ) : null}
    </div>
  );
}

function BlastDialog({
  title,
  body,
  node,
  openedAt,
  nearCeiling,
  showItems,
  onToggleItems,
  confirmLabel,
  confirmDisabled,
  extra,
  onCancel,
  onConfirm
}: {
  title: string;
  body: string;
  node: TaxNode;
  openedAt: string;
  nearCeiling: boolean;
  showItems: boolean;
  onToggleItems: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
  extra?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const readable = node.blastReadable !== false;
  const total = readable ? node.blast.reduce((s, b) => s + b.count, 0) : null;
  return (
    <Dialog
      title={title}
      icon="alert"
      tone="destructive"
      onClose={onCancel}
      actions={
        <>
          <Button variant="quiet" onClick={onCancel}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!readable || Boolean(confirmDisabled)}
            label={!readable ? `${confirmLabel} — unreachable while the count cannot be read` : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{body}</p>
      <p className="meta">Content the action will move, as of {openedAt.slice(0, 16).replace("T", " ")}Z:</p>
      {readable ? (
        <>
          <table className="ct-diff">
            <tbody>
              {node.blast.map((b) => (
                <tr key={b.domain}>
                  <td><strong>{b.domain}</strong></td>
                  <td>{b.count} item{b.count === 1 ? "" : "s"}</td>
                </tr>
              ))}
              {total === 0 ? (
                <tr><td colSpan={2}>Zero — a real answer; the action proceeds.</td></tr>
              ) : null}
            </tbody>
          </table>
          {(total ?? 0) > 0 ? (
            <>
              <Button variant="quiet" size="sm" onClick={onToggleItems}>
                {showItems ? "Close the item list" : "Open the items behind the count"}
              </Button>
              {showItems ? (
                <ul className="meta">
                  {node.blast.flatMap((b) => b.items).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                  {node.blast.every((b) => b.items.length === 0) ? (
                    <li>The items behind the count are not individually listed.</li>
                  ) : null}
                </ul>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <Notice tone="warning" title="The count cannot be read">
          <p>
            An irreversible action does not proceed on an unknown blast radius — the confirm stays
            unreachable until the count reads.
          </p>
        </Notice>
      )}
      {nearCeiling ? (
        <p className="meta">
          Near the ceiling — this frees no room against it and is not cleanup.
        </p>
      ) : null}
      {extra}
    </Dialog>
  );
}
