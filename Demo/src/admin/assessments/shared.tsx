/**
 * shared — the studio's own states, rendered once and read by every page in
 * this folder (assessments, "The studio's own states"):
 *
 *   loading          the page's own skeleton
 *   refused          authorization is the named capability, never page access
 *   conflict         a conflicting edit is refused with a choice — keep my
 *                    edits or take the saved version — never a silent discard
 *   out-of-date      a save made against an out-of-date view, refused by name
 *   content-write    a content write after publication, refused naming the
 *                    correction path and the whole editable set
 *   unverifiable     a validation that cannot run refuses as not yet verifiable
 *
 * `PreviewBar` is the fixture affordance: every page offers the states its
 * workflow owns so each renders on-screen without a backend.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { Skeleton } from "../../extraction/components/Skeleton/Skeleton";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
/* Real kit imports — they pull Button.css/Chip.css so the x-btn/x-chip markup
   the shared blocks and the QuestionEditor carry is styled on these pages too. */
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { editableSetFor, type PaperType } from "./fixtures";
import "./assessments.css";

export type PreviewKey =
  | "loaded"
  | "loading"
  | "refused"
  | "conflict"
  | "out-of-date"
  | "content-write"
  | "unverifiable"
  | "content-guard";

export const PREVIEW_LABEL: Record<PreviewKey, string> = {
  loaded: "Loaded",
  loading: "Loading",
  refused: "Refused — named action",
  conflict: "Conflicting edit",
  "out-of-date": "Out-of-date save",
  "content-write": "Content write after publish",
  unverifiable: "Not yet verifiable",
  "content-guard": "Deletion refused — control replaced"
};

export const ALL_PREVIEWS: PreviewKey[] = [
  "loaded",
  "loading",
  "refused",
  "conflict",
  "out-of-date",
  "content-write",
  "unverifiable",
  "content-guard"
];

export function usePreview(allowed: PreviewKey[]) {
  const [preview, setPreview] = useState<PreviewKey>("loaded");
  const active = allowed.includes(preview) ? preview : "loaded";
  return { preview: active, setPreview, allowed };
}

/**
 * The state chips alone — for a page composing a larger Demo tools drawer of
 * its own (a fixture window or a product-date line sits beside them inside the
 * one disclosure, never as a second drawer). `PreviewBar` below is the
 * standalone form: the drawer with the chips inside.
 */
export function PreviewChips({
  active,
  onChange,
  allowed
}: {
  active: PreviewKey;
  onChange: (key: PreviewKey) => void;
  allowed: PreviewKey[];
}) {
  return (
    <div className="a-preview" role="group" aria-label="Preview a page state">
      <span className="a-preview__label">Preview a state</span>
      {allowed.map((key) => (
        <Chip key={key} size="sm" selected={active === key} onClick={() => onChange(key)}>
          {PREVIEW_LABEL[key]}
        </Chip>
      ))}
    </div>
  );
}

export function PreviewBar({
  active,
  onChange,
  allowed
}: {
  active: PreviewKey;
  onChange: (key: PreviewKey) => void;
  allowed: PreviewKey[];
}) {
  /* The state-preview affordance is a fixture tool, not the workflow — it sits
     collapsed behind the Demo tools disclosure rather than occupying the
     normal primary flow. A non-default preview names itself on the closed
     summary, so a refused/loading preview never reads as the real page. */
  return (
    <details className="a-demotools">
      <summary>
        Demo tools
        {active !== "loaded" ? (
          <span className="a-demotools__note"> · Preview: {PREVIEW_LABEL[active]}</span>
        ) : null}
      </summary>
      <PreviewChips active={active} onChange={onChange} allowed={allowed} />
    </details>
  );
}

/* ── The states themselves ────────────────────────────────────────────────── */

export function StudioLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton variant="card" />
      <Skeleton variant="row" />
      <Skeleton variant="row" />
      <Skeleton variant="row" />
    </div>
  );
}

/** Authorization is the administrator's named capability. A refused destination
 *  answers exactly as a nonexistent one — the refusal names the action. */
export function CapabilityRefusal({ action }: { action: string }) {
  return (
    <StateBlock
      state="refused"
      message={`This session does not hold ${action}. The destination answers exactly as a nonexistent one — nothing here is readable.`}
      action={<Link className="btn btn--secondary" to="/admin">Operations hub</Link>}
    />
  );
}

/** A conflicting edit is refused with a choice — keep my edits or take the
 *  saved version — and never a silent discard of typed work. */
export function ConflictDialog({ open, onResolve }: { open: boolean; onResolve: () => void }) {
  return (
    <Dialog
      open={open}
      title="Conflicting edit"
      icon="alert"
      tone="destructive"
      onClose={onResolve}
      actions={
        <>
          <Button onClick={onResolve}>Keep my edits</Button>
          <Button variant="secondary" onClick={onResolve}>Take the saved version</Button>
        </>
      }
    >
      <p>
        This record changed while you were editing. Your typed work is held — nothing is discarded
        silently. Keep my edits keeps your changes over the saved version; take the saved version
        discards this edit and loads what was saved.
      </p>
    </Dialog>
  );
}

/** A save made against an out-of-date view is refused by name. */
export function OutOfDateNote() {
  return (
    <StateBlock
      state="refused"
      compact
      message="Save refused — this view is out of date. The save named the view it was made against and the platform refused it by name; reload and re-apply."
    />
  );
}

/** A content write arriving after publication is refused, naming the correction
 *  path and the whole editable set — so nobody archives a paper to change its
 *  clock. */
export function ContentWriteRefusal({ type }: { type?: PaperType }) {
  return (
    <StateBlock
      state="refused"
      message="Content is frozen permanently at publish — a write to it is refused. The only correction path is archive, duplicate as draft, fix the copy, publish it as a new paper."
      action={type ? (
        <p className="meta">
          Editable after publish on this type: {editableSetFor(type).join(" · ")}.
        </p>
      ) : undefined}
    />
  );
}

/** A validation that cannot run refuses as not yet verifiable — it is never
 *  allowed through. */
export function NotVerifiableNote({ subject }: { subject: string }) {
  return (
    <StateBlock
      state="refused"
      compact
      message={`${subject} cannot run — not yet verifiable. The check is refused rather than allowed through on an unknown.`}
    />
  );
}

/** Where the shared content guard refuses a deletion, the destructive control
 *  is replaced by archive rather than left failing — the page must not carry a
 *  control that can only error. */
export function ContentGuardNote({ subject }: { subject: string }) {
  return (
    <StateBlock
      state="refused"
      compact
      message={`Deletion of ${subject} is refused by the shared content guard — dependent records exist. The destructive control is replaced by archive.`}
    />
  );
}

/* ── Honest lists ─────────────────────────────────────────────────────────── */

/** "Loaded N of T" only where the total was counted; otherwise
 *  "N loaded, total unavailable" — a figure that could not be read is never
 *  guessed. */
export function LoadedLine({ loaded, total }: { loaded: number; total: number | null }) {
  return (
    <p className="meta">
      {total === null ? `${loaded} loaded, total unavailable` : `Loaded ${loaded} of ${total}`}
    </p>
  );
}

/** The honest page bar: the loaded line counted under the same filters and
 *  snapshot, with Previous/Next rendered only where more than one page
 *  exists — a lone page carries no dead controls. */
export function ListPager({
  loadedThrough,
  total,
  page,
  pages,
  onPage
}: {
  /** Items shown so far across the pages before and on this one. */
  loadedThrough: number;
  total: number | null;
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="a-pagebar">
      <LoadedLine loaded={loadedThrough} total={total} />
      {pages > 1 ? (
        <span className="row">
          <Button variant="quiet" size="sm" icon="chevron-left" disabled={page === 0} onClick={() => onPage(page - 1)}>
            Previous
          </Button>
          <span className="meta">page {page + 1} of {pages}</span>
          <Button variant="quiet" size="sm" iconEnd="chevron-right" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>
            Next
          </Button>
        </span>
      ) : null}
    </div>
  );
}

export function formatPercent(v: number | null): string | null {
  return v === null ? null : `${Math.round(v * 100)}%`;
}
