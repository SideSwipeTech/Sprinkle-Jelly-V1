/**
 * DateDialog — the scheduling calendar's per-date surface, read as two clear
 * acts rather than a multi-mode dialog:
 *
 *   assign    the picker — the SchedulingCard is the product-date field, so
 *             pointing it at a held date flips it to blocked and names the
 *             occupying challenge and its date, and at a begun date the
 *             refusal is named; either way the write stays unreachable — a
 *             clash writes nothing. Reached on an empty date still ahead,
 *             from a catalog row's Assign…, or from an occupant's Move… —
 *             a move is the same act with the pick already made
 *   manage    the occupant's facts and its acts, drawn as two labelled
 *             groups so the split is unmistakable — "the challenge" holds
 *             Edit content (it opens the studio and changes what learners
 *             solve, never when), while "the product date" holds the
 *             scheduling acts Move…, Unschedule and Archive — narrowed by
 *             name where the product date has begun or learner activity
 *             exists; a clash lists both occupants, each with its repair
 *             verbs
 *
 * An empty date already begun is neither act — a neutral date, stated
 * plainly, nothing to fill.
 *
 * Confirms are steps of the manage act, not stacked modals: unschedule frees
 * the date immediately and says exactly that; archive states its blast
 * radius first and stays unreachable where the count could not be produced.
 */

import { useState } from "react";
import { Icon } from "@icons/Icon";
import { Button } from "../../../extraction/components/Button/Button";
import { Dialog } from "../../../extraction/components/Dialog/Dialog";
import { Notice } from "../../../extraction/components/Notice/Notice";
import { SearchField } from "../../../extraction/components/SearchField/SearchField";
import { SchedulingCard } from "../../../extraction/components/SchedulingCard/SchedulingCard";
import { StatusText } from "../../../extraction/components/StatusText/StatusText";
import {
  cardStatusOf,
  formatProductDate,
  inHealthWindow,
  isBegun,
  stateOf,
  type DailyCatalogEntry,
  type DailyOccupant
} from "./fixtures";

/** Where the dialog may land: an act, or a confirm step inside manage. */
export type DateDialogMode =
  | { kind: "manage" }
  | { kind: "assign"; entryId?: string; freshTarget?: boolean }
  | { kind: "unschedule"; occupant: DailyOccupant }
  | { kind: "archive"; occupant: DailyOccupant };

export interface DateDialogProps {
  /** The product date the dialog opened on — the assign picker's start. */
  date: string;
  occupantsOf: (date: string) => DailyOccupant[];
  catalog: DailyCatalogEntry[];
  /** Rows can land straight on a confirm or a picked assign; the calendar
   *  cell opens whichever act the date's state calls for. */
  initialMode?: DateDialogMode;
  onClose: () => void;
  onAssign: (date: string, entry: DailyCatalogEntry) => void;
  onUnschedule: (date: string, occupant: DailyOccupant) => void;
  onArchive: (date: string, occupant: DailyOccupant) => void;
}

function occupantMeta(o: DailyOccupant): string {
  const award = `${o.xp} XP${o.bonus ? ` · +${o.bonus} bonus` : ""}`;
  return `${o.difficulty} · ${award}`;
}

export function DateDialog({
  date,
  occupantsOf,
  catalog,
  initialMode,
  onClose,
  onAssign,
  onUnschedule,
  onArchive
}: DateDialogProps) {
  /* The opened date decides the default act: an empty product date still
     ahead opens assign; anything held or begun opens manage. Inside the
     assign act the SchedulingCard's date field moves the target under it. */
  const occupants = occupantsOf(date);
  const state = stateOf(occupants);
  const begun = isBegun(date);
  const first = occupants[0];

  const initial = initialMode ?? (state === "empty" && !begun ? { kind: "assign" as const } : { kind: "manage" as const });
  const [mode, setMode] = useState<DateDialogMode>(initial);
  const [target, setTarget] = useState(initial.kind === "assign" && initial.freshTarget ? "" : date);
  const [pickedId, setPickedId] = useState<string | null>(
    initial.kind === "assign" ? initial.entryId ?? null : null
  );
  const [search, setSearch] = useState("");

  /* The two acts. Confirms are steps inside manage; an assign act reached by
     Move… or a catalog Assign… renders on whatever date opened the dialog. */
  const confirming = mode.kind === "unschedule" || mode.kind === "archive";
  const assignAct = mode.kind === "assign" || (!confirming && state === "empty" && !begun);

  const targetOccupants = occupantsOf(target);
  const targetBlocked = targetOccupants.length > 0;
  /* A blank or partial field is no date at all — the begun refusal is named
     only for a target that parses. */
  const validTarget = /^\d{4}-\d{2}-\d{2}$/.test(target);
  const targetBegun = validTarget && isBegun(target);
  const holder = targetOccupants[0] ?? null;

  const picked = catalog.find((c) => c.id === pickedId) ?? null;
  const query = search.trim().toLowerCase();
  const picks = catalog.filter(
    (c) => c.lifecycle !== "archived" && (!query || c.title.toLowerCase().includes(query))
  );

  const gated = picked !== null && picked.lifecycle === "draft" && picked.gateReady !== true;
  const moving = picked !== null && picked.holdsDate !== null && picked.holdsDate !== target;
  /* A pick still holding a product date already begun cannot be moved —
     the refusal is named, and the write stays unreachable. */
  const pickedBegun = picked !== null && picked.holdsDate !== null && isBegun(picked.holdsDate);
  /* `picked.holdsDate !== target` — re-assigning the date already held is a
     no-op, and the control stays unreachable rather than writing one. */
  const canAssign =
    picked !== null && validTarget && !targetBlocked && !targetBegun && !gated && !pickedBegun &&
    picked.holdsDate !== target;

  /* Move… — the same assign act with the pick already made and the product
     date field cleared for its new target. */
  const moveOccupant = (o: DailyOccupant) => {
    setMode({ kind: "assign", entryId: o.id });
    setPickedId(o.id);
    setTarget("");
    setSearch("");
  };

  const title =
    mode.kind === "unschedule"
      ? `Unschedule ${mode.occupant.title}?`
      : mode.kind === "archive"
        ? `Archive ${mode.occupant.title}?`
        : assignAct
          ? picked?.holdsDate
            ? `Move ${picked.title}`
            : picked
              ? `Assign ${picked.title}`
              : `Assign a challenge — ${formatProductDate(date)}`
          : state === "clash"
            ? `${formatProductDate(date)} — blocked`
            : state === "scheduled"
              ? `Assignment for ${formatProductDate(date)}`
              : `${formatProductDate(date)} — a neutral date`;

  return (
    <Dialog open title={title} icon="daily" onClose={onClose} actions={
      mode.kind === "unschedule" ? (
        <>
          <Button variant="secondary" onClick={() => setMode({ kind: "manage" })}>Back</Button>
          <Button variant="primary" onClick={() => { onUnschedule(date, mode.occupant); onClose(); }}>
            Unschedule
          </Button>
        </>
      ) : mode.kind === "archive" ? (
        <>
          <Button variant="secondary" onClick={() => setMode({ kind: "manage" })}>Back</Button>
          <Button
            variant="destructive"
            disabled={mode.occupant.submissions === null || mode.occupant.solvers === null}
            onClick={() => { onArchive(date, mode.occupant); onClose(); }}
          >
            Archive
          </Button>
        </>
      ) : assignAct ? (
        <>
          {/* Reached by Move… on a held date, Back returns to manage. */}
          {occupants.length > 0 ? (
            <Button variant="secondary" onClick={() => setMode({ kind: "manage" })}>Back</Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          )}
          <Button
            variant="primary"
            disabled={!canAssign}
            onClick={() => { if (picked) { onAssign(target, picked); onClose(); } }}
          >
            {moving
              ? `Move to ${formatProductDate(target)}`
              : validTarget
                ? `Assign to ${formatProductDate(target)}`
                : "Assign"}
          </Button>
        </>
      ) : (
        <Button variant="secondary" onClick={onClose}>Close</Button>
      )
    }>
      {mode.kind === "unschedule" ? (
        <p>
          Unscheduling frees {formatProductDate(date)} immediately — “{mode.occupant.title}” returns
          to a draft and stays in the catalog{state === "clash"
            ? `; ${occupants.find((o) => o.id !== mode.occupant.id)?.title ?? "the other challenge"} keeps the date`
            : ""}. The change is audited as part of it.
        </p>
      ) : mode.kind === "archive" ? (
        mode.occupant.submissions === null || mode.occupant.solvers === null ? (
          <Notice tone="error" title="Blast radius unknown">
            The submissions and solver counts could not be produced — the confirmation stays
            unreachable rather than proceeding on a guessed figure.
          </Notice>
        ) : (
          <p>
            Archiving hides the challenge from the learner catalog. Blast radius:{" "}
            {mode.occupant.submissions} submission{mode.occupant.submissions === 1 ? "" : "s"} ·{" "}
            {mode.occupant.solvers} solver{mode.occupant.solvers === 1 ? "" : "s"} — learner
            progress rows are preserved. A zero blast radius is a real answer and proceeds.
          </p>
        )
      ) : assignAct ? (
        <div className="da-stack">
          <p className="meta">
            Assigning publishes one challenge onto a product date — pick an eligible catalog entry
            below, or author a new draft. It never edits the challenge itself.
          </p>
          {/* The card is the product-date field — pointing it at a held date
              flips it to blocked and names the occupant, and a begun date
              names its refusal; the write below stays unreachable either way. */}
          <SchedulingCard
            date={target}
            status={cardStatusOf(targetOccupants)}
            isGap={inHealthWindow(target)}
            occupyingTitle={holder?.title}
            occupyingDate={holder ? target : undefined}
            onDateChange={setTarget}
          />
          {targetBegun && !targetBlocked ? (
            <Notice tone="error" compact title="The product date has begun">
              Publishing onto a date already begun is refused by name — pick a date still ahead.
            </Notice>
          ) : null}
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search the challenge catalog…"
            aria-label="Search the challenge catalog"
          />
          <ul className="da-pick" aria-label="Catalog challenges">
            {picks.length === 0 ? (
              <li className="da-pick__empty meta">No challenges match — author a new one below.</li>
            ) : (
              picks.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="da-pick__row"
                    data-on={pickedId === c.id || undefined}
                    aria-pressed={pickedId === c.id}
                    onClick={() => setPickedId(c.id)}
                  >
                    <span className="da-pick__text">
                      <strong>{c.title}</strong>
                      <span className="meta">
                        {c.difficulty} · {c.xp} XP ·{" "}
                        {c.holdsDate ? `holds ${formatProductDate(c.holdsDate)}` : "draft — assigning publishes it"}
                      </span>
                    </span>
                    {pickedId === c.id ? (
                      <span className="da-pick__check" aria-hidden="true">
                        <Icon name="check" size={13} />
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
          {/* The begun-held refusal below stands alone — "a move" would
              promise an act the begun rule already refuses. */}
          {moving && picked && !pickedBegun ? (
            <Notice tone="warning" compact title="A move, not a copy">
              “{picked.title}” currently holds {formatProductDate(picked.holdsDate ?? "")} —
              assigning moves it to {formatProductDate(target)}. The confirmation names both dates
              before anything is saved.
            </Notice>
          ) : null}
          {gated && picked ? (
            <Notice tone="error" compact title="The publish gate refuses">
              “{picked.title}” is a draft missing {picked.gateMissing} — assigning it is an act of
              publishing and the gate names what is missing rather than passing on an unknown.
            </Notice>
          ) : null}
          {pickedBegun && picked?.holdsDate ? (
            <Notice tone="error" compact title="A begun date cannot be moved">
              “{picked.title}” holds {formatProductDate(picked.holdsDate)} — that product date has
              begun, so moving the assignment off it is refused by name.
            </Notice>
          ) : null}
          <p className="meta">
            Assigning a challenge to a date is an act of publishing, and every scheduling change is
            audited as part of the change.
          </p>
          <div className="row da-create">
            <span className="meta">Nothing eligible above?</span>
            <Button variant="quiet" size="sm" icon="plus" to="/admin/daily/new">
              Create a draft challenge
            </Button>
          </div>
        </div>
      ) : state === "clash" ? (
        <div className="da-stack">
          <Notice tone="error" title="Blocked — one product date, two challenges">
            {occupants.map((o) => `“${o.title}”`).join(" and ")} both hold{" "}
            {formatProductDate(date)}. One date carries at most one published challenge; this
            duplicate-date fault is content integrity. The repair keeps one published and returns
            the other to draft — no learner history is deleted.
          </Notice>
          {begun ? (
            <Notice tone="neutral" title="The product date has begun">
              The fault stands in history — move and unschedule reach only dates still ahead, so
              this date's repair verbs are refused by name.
            </Notice>
          ) : null}
          <ul className="da-occupants">
            {occupants.map((o) => (
              <li key={o.id} className="da-occupant">
                <span>
                  <strong>{o.title}</strong>
                  <span className="meta"> {occupantMeta(o)}</span>
                </span>
                {!begun ? (
                  <span className="row">
                    <Button variant="quiet" size="sm" onClick={() => moveOccupant(o)}>Move…</Button>
                    <Button variant="secondary" size="sm" onClick={() => setMode({ kind: "unschedule", occupant: o })}>
                      Unschedule
                    </Button>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : state === "scheduled" && first ? (
        <div className="da-stack">
          <p>
            <StatusText tone="success" icon="check">scheduled</StatusText>{" "}
            <strong>{first.title}</strong> holds this product date —{" "}
            <span className="meta">{occupantMeta(first)}</span>
          </p>
          {begun || first.learnerActivity ? (
            <Notice tone="neutral" title="The product date has begun">
              Move and unschedule reach only a Daily still ahead of its product date and untouched
              by any learner — on this date both are refused by name.
            </Notice>
          ) : null}
          {/* Two different acts on one assignment, drawn as two labelled
              groups so they can never blur: editing changes the challenge
              itself; scheduling changes which product date it holds. */}
          <div className="da-acts">
            <div className="da-acts__group">
              <span className="da-acts__label">The challenge — what learners solve</span>
              <div className="row">
                <Button variant="secondary" size="sm" icon="edit" to={`/admin/daily/${date}`}>
                  Edit content
                </Button>
              </div>
              <span className="meta da-acts__hint">
                Opens the studio — the assignment on this date is untouched.
              </span>
            </div>
            <div className="da-acts__group">
              <span className="da-acts__label">The product date — when it publishes</span>
              <div className="row">
                {!begun && !first.learnerActivity ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => moveOccupant(first)}>Move…</Button>
                    <Button variant="secondary" size="sm" onClick={() => setMode({ kind: "unschedule", occupant: first })}>
                      Unschedule
                    </Button>
                  </>
                ) : null}
                <Button variant="quiet" size="sm" onClick={() => setMode({ kind: "archive", occupant: first })}>
                  Archive
                </Button>
              </div>
              <span className="meta da-acts__hint">
                {begun || first.learnerActivity
                  ? "Move and unschedule are refused by name above — archive alone remains."
                  : "Move the assignment, free the date, or retire the challenge — each is audited."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p>
          A neutral date — nothing was scheduled for it, and the product date has begun; nothing
          fills it now.
        </p>
      )}
    </Dialog>
  );
}
