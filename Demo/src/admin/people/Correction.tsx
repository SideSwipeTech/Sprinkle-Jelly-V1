/**
 * Correction — `credits` (the person picker) and `credits/:userId` (the
 * focused repair page). Economy's correction page (economy/01-pages
 * "Correction"; admin/05 §Corrections):
 *
 *   A defect remedy, never an authority — it exists only to repair a verified
 *   ledger defect the platform itself produced, and every correction carries
 *   the incident it repairs. An explicit grant-or-deduct choice (the sign is
 *   never typed), a live preview of the current total, the signed change, the
 *   resulting total and the resulting level marked when it moves. One-click
 *   reason categories beside a free reason; the confirm restates all of it
 *   beside the incident reference. A super-administrator act with a typed
 *   confirmation and an immutable record — a compensating entry that never
 *   rewrites the event it repairs.
 *
 *   An unreadable current total blocks the confirm (no preview, no confirm);
 *   a deduction below zero is rejected outright naming the maximum permitted,
 *   never clamped; a value outside the per-action bounds is refused rather
 *   than trimmed.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { canPublishDirect } from "../roles";
import { SearchField } from "../../extraction/components/SearchField/SearchField";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { Field } from "../../extraction/components/Field/Field";
import { Chip } from "../../extraction/components/Chip/Chip";
import { SegmentedControl } from "../../extraction/components/SegmentedControl/SegmentedControl";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { Notice } from "../../extraction/components/Notice/Notice";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import { FormGrid, FormGridWide } from "../../extraction/components/FormGrid/FormGrid";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { FreshHandoffGate } from "./gates";
import {
  ACTION,
  ECONOMY_CORRECTION_BOUND_CREDITS,
  ECONOMY_CORRECTION_BOUND_XP,
  HANDOFF,
  allPeople,
  findPerson,
  levelForXp,
  standingText,
  writeCorrection
} from "./fixtures";
import "./people.css";

/** The defect classes a correction repairs — one click, beside a free reason. */
const REASON_CATEGORIES = [
  "A duplicated reward",
  "A missing reward",
  "A mispriced reward"
] as const;

type Ledger = "xp" | "credits";

const LEDGER_LABEL: Record<Ledger, string> = { xp: "XP", credits: "Credits" };

export function Correction() {
  const { userId } = useParams();
  const store = useStore();
  const person = findPerson(userId);
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);

  const [query, setQuery] = useState("");
  const [ledger, setLedger] = useState<Ledger>("credits");
  const [direction, setDirection] = useState<"grant" | "deduct">("grant");
  const [amountText, setAmountText] = useState("");
  const [incident, setIncident] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [freeReason, setFreeReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [echo, setEcho] = useState("");
  const [recorded, setRecorded] = useState<string | null>(null);

  const mayWrite = canPublishDirect(store.session.role);

  /* ── The picker at `credits` — no userId yet ── */
  if (!userId) {
    const people = allPeople().filter(
      (p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        p.email.toLowerCase().includes(query.trim().toLowerCase())
    );
    return (
      <AdminPage
        kicker="Governance"
        title="XP and credit correction"
        lead="Choose the one person whose ledger the correction repairs. A defect remedy, never an authority — every correction carries the incident it repairs."
      >
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        {preview === "loading" ? <StudioLoading /> : null}
        {preview === "refused" ? <CapabilityRefusal action={ACTION.correctLedger} /> : null}
        {preview === "unverifiable" ? (
          <StateBlock
            state="unavailable"
            message="The person source could not be read — the picker is unavailable with a retry, never an empty list."
            action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
          />
        ) : null}
        {preview === "loaded" ? (
          <>
            <SearchField value={query} onChange={setQuery} placeholder="Search names and email…" label="Find the person" />
            <List>
              {people.map((p) => (
                <ListRow key={p.id} to={`/admin/credits/${p.id}`}>
                  <div>
                    <strong>{p.name}</strong>
                    <p className="meta">
                      {p.email} · {standingText(p.standing)}
                    </p>
                  </div>
                  <span className="meta">
                    {p.xp === null ? "XP —" : `${p.xp} XP`} · {p.credits === null ? "Credits —" : `${p.credits} credits`}
                  </span>
                </ListRow>
              ))}
            </List>
          </>
        ) : null}
      </AdminPage>
    );
  }

  if (!person) {
    return (
      <AdminPage kicker="Governance" title="Person unavailable">
        <StateBlock
          state="unavailable"
          message="This person record does not resolve."
          action={<Link className="btn btn--secondary" to="/admin/credits">XP and credit correction</Link>}
        />
      </AdminPage>
    );
  }

  const amount = Number(amountText);
  const bound = ledger === "xp" ? ECONOMY_CORRECTION_BOUND_XP : ECONOMY_CORRECTION_BOUND_CREDITS;
  const boundName = ledger === "xp" ? "ECONOMY_CORRECTION_BOUND_XP" : "ECONOMY_CORRECTION_BOUND_CREDITS";
  /* The unreadable current total blocks the confirm — the preview key and an
     unread fixture both land here. */
  const current = preview === "unverifiable" ? null : ledger === "xp" ? person.xp : person.credits;
  const signed = direction === "grant" ? amount : -amount;
  const resulting = current === null ? null : current + signed;
  const levelBefore = ledger === "xp" && current !== null ? levelForXp(current) : null;
  const levelAfter = ledger === "xp" && resulting !== null ? levelForXp(resulting) : null;
  const levelMoves = levelBefore !== null && levelAfter !== null && levelBefore !== levelAfter;

  const outOfBound = Number.isFinite(amount) && amount > bound;
  const belowZero = resulting !== null && resulting < 0;
  const amountOk = Number.isInteger(amount) && amount > 0 && !outOfBound;
  const reasonOk = category !== null || freeReason.trim().length > 0;
  const incidentOk = incident.trim().length > 0;
  const blocked = current === null;
  const refused = outOfBound || belowZero;
  const confirmable =
    mayWrite && !blocked && !refused && amountOk && reasonOk && incidentOk && HANDOFF.fresh;

  const reasonText = category ?? freeReason.trim();

  function confirm() {
    writeCorrection(
      person!.id,
      ledger,
      signed,
      `${ACTION.correctLedger} — ${direction === "grant" ? "+" : "−"}${amount} ${LEDGER_LABEL[ledger]} under ${incident.trim()}`
    );
    setRecorded(
      `Compensating entry recorded against ${incident.trim()} — the event it repairs is never rewritten, and a repeated adjustment returns the stored outcome rather than recording twice.`
    );
    setReviewing(false);
    setEcho("");
  }

  return (
    <AdminPage
      kicker="Governance"
      title={`XP and credit correction — ${person.name}`}
      lead="A focused repair page: it can never grant discretionary XP, pay for something the economy deliberately does not reward, move a score, verdict or readiness figure, or stand in for a reward the product never produced."
      actions={<Link className="btn btn--quiet" to="/admin/credits">Choose another person</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.correctLedger} /> : null}
      {preview === "loaded" || preview === "unverifiable" ? (
        <>
          {!mayWrite ? (
            <CapabilityRefusal action={ACTION.correctLedger} />
          ) : (
            <div className="pp-split">
              <div className="pp-main">
                <Card>
                  <CardHeader title="Correction details" icon="credits" eyebrow={`one correction on one person's ${LEDGER_LABEL[ledger]}`} />
                  <p className="meta">
                    {person.name} · {person.email} · {standingText(person.standing)}
                  </p>
                  <FormGrid>
                    <div>
                      <p className="meta">Ledger — one correction on one learner's XP or Credits</p>
                      <SegmentedControl
                        label="Ledger"
                        value={ledger}
                        onChange={(v) => { setLedger(v as Ledger); setRecorded(null); }}
                        options={[
                          { id: "credits", label: "Credits" },
                          { id: "xp", label: "XP" }
                        ]}
                      />
                    </div>
                    <div>
                      <p className="meta">Direction — explicit; the sign is never typed</p>
                      <SegmentedControl
                        label="Direction"
                        value={direction}
                        onChange={(v) => { setDirection(v as "grant" | "deduct"); setRecorded(null); }}
                        options={[
                          { id: "grant", label: "Grant" },
                          { id: "deduct", label: "Deduct" }
                        ]}
                      />
                    </div>
                    <Field label="Amount" required hint={`One correction may move at most ${bound.toLocaleString()} ${LEDGER_LABEL[ledger]} either way (${boundName}).`}>
                      <input
                        type="number"
                        min={1}
                        value={amountText}
                        onChange={(e) => { setAmountText(e.target.value); setRecorded(null); }}
                        placeholder="0"
                      />
                    </Field>
                    <Field label="Incident reference" required hint="Every correction carries the incident it repairs.">
                      <input
                        value={incident}
                        onChange={(e) => { setIncident(e.target.value); setRecorded(null); }}
                        placeholder="INC-2026-…"
                      />
                    </Field>
                    <FormGridWide>
                      <div>
                        <p className="meta">Reason — one click or a free reason; an empty reason leaves the action unreachable</p>
                        <div className="row" role="group" aria-label="Reason categories">
                          {REASON_CATEGORIES.map((c) => (
                            <Chip
                              key={c}
                              size="sm"
                              selected={category === c}
                              onClick={() => setCategory(category === c ? null : c)}
                            >
                              {c}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </FormGridWide>
                    <FormGridWide>
                      <Field label="Free reason" hint={category ? `${category} — the free reason is optional now.` : "Or type the repair's reason."}>
                        <textarea
                          value={freeReason}
                          onChange={(e) => { setFreeReason(e.target.value); setRecorded(null); }}
                          placeholder="Why this compensating entry is required"
                        />
                      </Field>
                    </FormGridWide>
                  </FormGrid>
                </Card>
                {ledger === "credits" ? (
                  <Notice tone="neutral" compact>
                    Nothing granted becomes learner-visible before the Credits gate opens.
                  </Notice>
                ) : null}
                {recorded ? (
                  <p className="pp-note" data-tone="ok" role="status">
                    <Icon name="check" size={14} /> {recorded}
                  </p>
                ) : null}
              </div>

              <div>
                <Card live>
                  <CardHeader title="Live preview" icon="target" eyebrow="recomputed on every edit" />
                  <KeyValueTable label="Correction preview">
                    <KeyValueRow as="definition" term="Current total" value={current === null ? null : `${current} ${LEDGER_LABEL[ledger]}`} />
                    <KeyValueRow
                      as="definition"
                      term="Signed change"
                      value={amountOk || outOfBound ? `${direction === "grant" ? "+" : "−"}${amount}` : null}
                    />
                    <KeyValueRow
                      as="definition"
                      term="Resulting total"
                      value={resulting === null || (!amountOk && !refused) ? null : `${resulting} ${LEDGER_LABEL[ledger]}`}
                      tone={belowZero ? "error" : "default"}
                    />
                    {ledger === "xp" ? (
                      <KeyValueRow
                        as="definition"
                        term="The resulting level"
                        value={
                          levelBefore === null || resulting === null
                            ? null
                            : levelMoves
                              ? `Level ${levelBefore} → Level ${levelAfter} — moves`
                              : `Level ${levelBefore} — does not move`
                        }
                        tone={levelMoves ? "warning" : "default"}
                      />
                    ) : null}
                  </KeyValueTable>

                  {blocked ? (
                    <StateBlock
                      state="unavailable"
                      compact
                      message="The current total cannot be read — no preview and no confirm. The unreadable balance blocks the confirm rather than guessing."
                    />
                  ) : null}
                  {outOfBound ? (
                    <StateBlock
                      state="refused"
                      compact
                      message={`Refused before anything is written — one correction may move at most ${bound.toLocaleString()} ${LEDGER_LABEL[ledger]} either way (${boundName}); the value is refused, never trimmed.`}
                    />
                  ) : null}
                  {belowZero && !outOfBound ? (
                    <StateBlock
                      state="refused"
                      compact
                      message={`Refused before anything is written — a deduction below zero is rejected outright, naming the maximum permitted: ${current} ${LEDGER_LABEL[ledger]}. Never clamped.`}
                    />
                  ) : null}
                  <FreshHandoffGate />

                  <Button disabled={!confirmable} onClick={() => setReviewing(true)}>
                    Review the correction…
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </>
      ) : null}

      <Dialog
        open={reviewing}
        title={`${direction === "grant" ? "Grant" : "Deduct"} ${amount} ${LEDGER_LABEL[ledger]} — ${person.name}`}
        icon="credits"
        onClose={() => setReviewing(false)}
      >
        <KeyValueTable label="The correction, restated">
          <KeyValueRow as="definition" term="Person" value={`${person.name} — ${person.email}`} />
          <KeyValueRow as="definition" term="Ledger" value={LEDGER_LABEL[ledger]} />
          <KeyValueRow as="definition" term="Direction" value={direction === "grant" ? "Grant" : "Deduct"} />
          <KeyValueRow as="definition" term="Signed change" value={`${direction === "grant" ? "+" : "−"}${amount}`} />
          <KeyValueRow as="definition" term="Current total" value={`${current} ${LEDGER_LABEL[ledger]}`} />
          <KeyValueRow as="definition" term="Resulting total" value={`${resulting} ${LEDGER_LABEL[ledger]}`} />
          {ledger === "xp" ? (
            <KeyValueRow
              as="definition"
              term="The resulting level"
              value={levelMoves ? `Level ${levelBefore} → Level ${levelAfter} — moves` : `Level ${levelBefore} — does not move`}
              tone={levelMoves ? "warning" : "default"}
            />
          ) : null}
          <KeyValueRow as="definition" term="Incident" value={incident.trim()} />
          <KeyValueRow as="definition" term="Reason" value={reasonText} />
        </KeyValueTable>
        <p className="meta">
          Written as a compensating entry that never rewrites the event it repairs — an immutable
          record beside the incident reference {incident.trim()}.
        </p>
        <ConfirmByTyping phrase={person.name} value={echo} onChange={setEcho}>
          {(matched) => (
            <div className="row">
              <Button variant="quiet" onClick={() => setReviewing(false)}>Cancel</Button>
              <Button disabled={!matched || !HANDOFF.fresh} onClick={confirm}>
                Confirm the correction
              </Button>
            </div>
          )}
        </ConfirmByTyping>
      </Dialog>
    </AdminPage>
  );
}
