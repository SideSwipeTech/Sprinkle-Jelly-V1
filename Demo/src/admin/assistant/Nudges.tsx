/**
 * Nudges — nudge configuration, under Assistant (companion/01-pages.md
 * §"The five admin destinations"; companion/05 §"Companion identity, and
 * nudge configuration"; notifications/01-pages.md §2.10; notifications/
 * 04-engine.md §4.13).
 *
 * Three levers and no fourth: switch the one producer off, lower its daily
 * allowance to zero, lengthen its cooldown. The four bounds no role may
 * loosen render read-only. A lever moved outside its stated direction is
 * refused. A lever applies to the next nudge and never catches up one
 * already withheld. An unreadable policy withholds nudges while the page
 * says the policy could not be read.
 *
 * There is no per-producer priority lever — no control for it renders
 * anywhere, and a second producer is an explicit rule change, never a
 * configuration.
 *
 * Separately permissioned under its own named action. Fixture state only —
 * no store writes, no network.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Field } from "../../extraction/components/Field/Field";
import { Notice } from "../../extraction/components/Notice/Notice";
import { Select } from "../../extraction/components/Select/Select";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import {
  CapabilityRefusal,
  StudioLoading
} from "../assessments/shared";
import {
  NUDGE_BOUNDS,
  NUDGE_COOLDOWN_RANGE,
  NUDGE_POLICY,
  NUDGE_PRODUCER,
  type NudgePolicy
} from "./fixtures";

type View = "loaded" | "loading" | "refused" | "unreadable-policy";

const VIEW_LABEL: Record<View, string> = {
  loaded: "Loaded",
  loading: "Loading",
  refused: "Refused — named action",
  "unreadable-policy": "Policy unreadable"
};

const VIEWS = Object.keys(VIEW_LABEL) as View[];

interface Flash {
  tone: "success" | "error" | "info";
  text: string;
}

export function AssistantNudges() {
  const [view, setView] = useState<View>("loaded");
  const [policy, setPolicy] = useState<NudgePolicy>(NUDGE_POLICY);
  const [cooldownDraft, setCooldownDraft] = useState(String(NUDGE_POLICY.cooldownDays));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState<NudgePolicy>(NUDGE_POLICY);
  const [flash, setFlash] = useState<Flash | null>(null);

  const cooldownParsed = Number(cooldownDraft);
  const cooldownChanged = cooldownDraft.trim() !== "" && cooldownParsed !== policy.cooldownDays;
  /* The lever lengthens only, inside 7–30 — anything else is refused. */
  const cooldownBad =
    cooldownDraft.trim() !== "" &&
    (!Number.isInteger(cooldownParsed) ||
      cooldownParsed < policy.cooldownDays ||
      cooldownParsed > NUDGE_COOLDOWN_RANGE[1]);
  const dirty =
    policy.producerOn !== saved.producerOn ||
    policy.dailyAllowance !== saved.dailyAllowance ||
    cooldownChanged;

  function pickAllowance(v: string) {
    const next = Number(v);
    /* The lever lowers only — a raise is refused before anything stages. */
    if (next > policy.dailyAllowance) {
      setFlash({
        tone: "error",
        text: "Refused — the per-producer daily allowance lowers, it never raises. The bound stays where it was."
      });
      return;
    }
    setPolicy((p) => ({ ...p, dailyAllowance: next }));
    setFlash(null);
  }

  function requestSave() {
    if (cooldownBad) {
      setFlash({
        tone: "error",
        text: `Refused — the cooldown lengthens only, inside ${NUDGE_COOLDOWN_RANGE[0]} to ${NUDGE_COOLDOWN_RANGE[1]} days (COMPANION_NUDGE_COOLDOWN_MAX_DAYS). Nothing was applied.`
      });
      return;
    }
    setConfirmOpen(true);
  }

  function commit() {
    const nextCooldown = cooldownChanged ? cooldownParsed : policy.cooldownDays;
    setSaved({ ...policy, cooldownDays: nextCooldown });
    setPolicy((p) => ({ ...p, cooldownDays: nextCooldown }));
    setConfirmOpen(false);
    setFlash({
      tone: "success",
      text: "Saved — a lever applies on the next nudge and never catches up one already withheld."
    });
  }

  const body = (() => {
    if (view === "loading") return <StudioLoading />;
    if (view === "refused") return <CapabilityRefusal action="companion.configure_nudges" />;
    if (view === "unreadable-policy") {
      return (
        <StateBlock
          state="unavailable"
          message="The nudge policy could not be read — nudges are withheld while that is so."
          action={<Button variant="secondary" onClick={() => setView("loaded")}>Retry</Button>}
        />
      );
    }
    return (
      <>
        {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}

        <div className="grid-2">
          <Card>
            <CardHeader
              title="The three levers"
              icon="sparkles"
              eyebrow={`producer · ${NUDGE_PRODUCER}`}
            />
            <p className="meta">
              The one registered proactive producer, hard-capped and page-aware. Three levers and no
              fourth — no per-producer priority lever renders anywhere, and a second producer is an
              explicit rule change, never a configuration.
            </p>
            <KeyValueTable label="Nudge levers">
              <KeyValueRow
                as="definition"
                term="Producer"
                value={
                  <Chip selected={policy.producerOn} onClick={() => {
                    setPolicy((p) => ({ ...p, producerOn: !p.producerOn }));
                    setFlash(null);
                  }}>
                    {policy.producerOn ? "on" : "off"}
                  </Chip>
                }
              />
              <KeyValueRow
                as="definition"
                term="Daily allowance (per producer)"
                value={
                  <Select
                    size="sm"
                    value={String(policy.dailyAllowance)}
                    onChange={pickAllowance}
                    options={[
                      { value: "1", label: "1 nudge" },
                      { value: "0", label: "0 — withheld entirely" }
                    ]}
                    aria-label="Per-producer daily allowance"
                  />
                }
              />
            </KeyValueTable>
            <Field
              label={`Cooldown in days — lengthens only, ${NUDGE_COOLDOWN_RANGE[0]} to ${NUDGE_COOLDOWN_RANGE[1]}`}
              hint={`In force: ${policy.cooldownDays} days`}
              error={cooldownBad ? "Outside the stated direction or bound" : undefined}
            >
              <input
                type="number"
                value={cooldownDraft}
                min={NUDGE_COOLDOWN_RANGE[0]}
                max={NUDGE_COOLDOWN_RANGE[1]}
                onChange={(e) => { setCooldownDraft(e.target.value); setFlash(null); }}
              />
            </Field>
            <div className="row">
              <Button size="sm" icon="check" disabled={!dirty} onClick={requestSave}>
                Apply levers
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="The four bounds" icon="lock" eyebrow="no role may loosen" />
            <KeyValueTable label="Nudge bounds">
              {NUDGE_BOUNDS.map((b) => (
                <KeyValueRow
                  key={b.key}
                  as="definition"
                  term={<code>{b.key}</code>}
                  value={`${b.value} — ${b.fixed}`}
                />
              ))}
            </KeyValueTable>
            <p className="meta">
              Withholding is absolute: a withheld nudge is discarded, never saved for a later burst.
              Nudges live on the companion's own stream under its own rules and are never durable
              inbox items.
            </p>
          </Card>
        </div>

        <Dialog
          open={confirmOpen}
          title="Apply nudge levers"
          icon="sparkles"
          onClose={() => setConfirmOpen(false)}
          actions={
            <>
              <Button onClick={commit}>Confirm — applies to the next nudge</Button>
              <Button variant="quiet" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            </>
          }
        >
          <p>
            Producer <strong>{policy.producerOn ? "on" : "off"}</strong>, daily allowance{" "}
            <strong>{policy.dailyAllowance}</strong>, cooldown{" "}
            <strong>{cooldownChanged ? cooldownParsed : policy.cooldownDays} days</strong>. A lever
            applies on the next nudge — it never catches up one already withheld.
          </p>
        </Dialog>
      </>
    );
  })();

  return (
    <AdminPage
      kicker="Assistant"
      title="Nudges"
      lead="Nudge configuration for the one registered producer — three levers, and the four bounds no role may loosen. No producer is created here."
    >
      <details className="a-demotools">
        <summary>Demo tools</summary>
        <div className="a-preview" role="group" aria-label="Preview a page state">
          <span className="a-preview__label">Preview a state</span>
          {VIEWS.map((key) => (
            <Chip key={key} size="sm" selected={view === key} onClick={() => setView(key)}>
              {VIEW_LABEL[key]}
            </Chip>
          ))}
        </div>
      </details>
      {body}
    </AdminPage>
  );
}
