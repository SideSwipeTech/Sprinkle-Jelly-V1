/**
 * EconomyConfig — the shell around XP and credit values (economy/01-pages.md
 * §"Economy configuration in full"; admin/06 §"The economy configuration
 * shell"; admin.F32).
 *
 * The console owns the shell: the stakes gate before a save, the record
 * inside every change, the traffic limits. What is configured — the sixteen
 * seeded, bounded numeric settings, each presented with the rule that owns
 * its meaning identifiable — is Economy's.
 *
 * The edit is all-or-nothing behind a read-only preview stating six things:
 * current and proposed side by side; the allowed range; the effective scope;
 * the effective time; whether the change touches future cycles, future
 * reservations or future reward events, each stated; and, for an allowance
 * or action-price edit only, the approximate count of default-priced actions
 * the value represents. A value outside its bound rejects the whole edit and
 * names the offending setting. A setting stored but not yet enforced
 * anywhere says so on the control. Unreadable configuration offers no save
 * at all and never presents the defaults as though they were current.
 *
 * Fixture state only — no store writes, no network.
 */

import { useMemo, useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { DataTable } from "../../extraction/components/DataTable/DataTable";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Field } from "../../extraction/components/Field/Field";
import { Notice } from "../../extraction/components/Notice/Notice";
import { ConfirmByTyping } from "../../extraction/components/ConfirmByTyping/ConfirmByTyping";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import {
  CapabilityRefusal,
  StudioLoading
} from "../assessments/shared";
import {
  ECONOMY_SETTINGS,
  SETTINGS_EDITS,
  defaultPricedAction,
  type EconomySetting,
  type SettingsEdit
} from "./fixtures";

/* This page's preview states extend the shared set with the unreadable-
 * configuration edge, which the shared PreviewKey union does not name. */
type View = "loaded" | "loading" | "refused" | "unreadable";

const VIEW_LABEL: Record<View, string> = {
  loaded: "Loaded",
  loading: "Loading",
  refused: "Refused — named action",
  unreadable: "Configuration unreadable"
};

const VIEWS = Object.keys(VIEW_LABEL) as View[];

interface StagedChange {
  setting: EconomySetting;
  proposed: number;
}

export function EconomyConfig() {
  const [view, setView] = useState<View>("loaded");
  const [settings, setSettings] = useState<EconomySetting[]>(ECONOMY_SETTINGS);
  const [staging, setStaging] = useState<Record<string, string>>({});
  const [gateOpen, setGateOpen] = useState(false);
  const [echo, setEcho] = useState("");
  const [edits, setEdits] = useState<SettingsEdit[]>(SETTINGS_EDITS);
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  /* The staged set: every key with a proposed value differing from current. */
  const stagedChanges: StagedChange[] = useMemo(
    () =>
      settings
        .filter((s) => staging[s.key] !== undefined && staging[s.key] !== "")
        .map((s) => ({ setting: s, proposed: Number(staging[s.key]) }))
        .filter((c) => !Number.isNaN(c.proposed) && c.proposed !== c.setting.value),
    [settings, staging]
  );

  /* All-or-nothing validation — the first out-of-bound value names itself. */
  const offending = stagedChanges.find(
    (c) => c.proposed < c.setting.bound[0] || c.proposed > c.setting.bound[1]
  );

  const dirty = Object.values(staging).some((v) => v.trim() !== "");
  const actionPricedEdit = stagedChanges.some((c) => c.setting.actionPriced);
  const floor = defaultPricedAction(settings);
  const touches = {
    cycles: stagedChanges.some((c) => c.setting.touches.cycles),
    reservations: stagedChanges.some((c) => c.setting.touches.reservations),
    rewardEvents: stagedChanges.some((c) => c.setting.touches.rewardEvents)
  };

  function stage(key: string, raw: string) {
    setStaging((prev) => ({ ...prev, [key]: raw }));
    setFlash(null);
  }

  function openGate() {
    if (offending) {
      setFlash({
        tone: "error",
        text: `Edit refused — ${offending.setting.key} is outside its bound (${offending.setting.bound[0]} to ${offending.setting.bound[1]} ${offending.setting.unit}). The whole edit is rejected; nothing was applied and no value was trimmed.`
      });
      return;
    }
    if (stagedChanges.length === 0) {
      setFlash({ tone: "error", text: "Nothing staged — an edit with no changed value is not an edit." });
      return;
    }
    setEcho("");
    setGateOpen(true);
  }

  function commit() {
    const changes = stagedChanges.map((c) => ({
      key: c.setting.key,
      before: c.setting.value,
      after: c.proposed,
      unit: c.setting.unit
    }));
    const ref = `AUD-2026-${String(881 + edits.length)}`;
    setEdits((prev) => [
      {
        id: `edit-${String(prev.length + 11).padStart(4, "0")}`,
        at: "25 Aug 2026, 09:31 IST",
        actor: "this operator",
        auditRef: ref,
        changes
      },
      ...prev
    ]);
    setSettings((prev) =>
      prev.map((s) => {
        const c = stagedChanges.find((x) => x.setting.key === s.key);
        return c ? { ...s, value: c.proposed } : s;
      })
    );
    setStaging({});
    setGateOpen(false);
    setFlash({
      tone: "success",
      text: `Edit applied whole — ${changes.length} setting${changes.length === 1 ? "" : "s"}, recorded as ${ref} with its before-and-after values. It governs later awards only; nothing already frozen was repriced.`
    });
  }

  const body = (() => {
    if (view === "loading") return <StudioLoading />;
    if (view === "refused") return <CapabilityRefusal action="economy.edit_settings" />;
    if (view === "unreadable") {
      return (
        <StateBlock
          state="unavailable"
          message="The current configuration could not be read — no save is offered against an unknown baseline, and the defaults are not presented as though they were current."
          action={<Button variant="secondary" onClick={() => setView("loaded")}>Retry</Button>}
        />
      );
    }
    return (
      <>
        {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}

        <Card>
          <CardHeader
            title="The sixteen settings"
            icon="zap"
            eyebrow="economy_settings · the set's length is sixteen"
          />
          <p className="meta">
            Each entry names the rule that owns its meaning — the set stores and audits, and
            decides no meaning. A value outside its bound refuses rather than trims.
          </p>
          <DataTable
            label="The sixteen seeded, bounded numeric settings"
            columns={["Setting", "Meaning owned by", "Current", "Allowed range", "Enforcement", "Stage"]}
            rows={settings.map((s) => ({
              key: s.key,
              cells: [
                <>
                  <code>{s.key}</code>
                  <p className="meta">{s.what}</p>
                </>,
                s.owner,
                <strong className="x-data-table__value">{s.value.toLocaleString("en-IN")} {s.unit}</strong>,
                `${s.bound[0].toLocaleString("en-IN")} – ${s.bound[1].toLocaleString("en-IN")}`,
                s.enforcedHere ? (
                  <Chip size="sm" variant="quiet">enforced</Chip>
                ) : (
                  <Chip size="sm" variant="quiet">stored — enforced by the Analytics engine, not here</Chip>
                ),
                <Button
                  size="sm"
                  variant="quiet"
                  onClick={() => stage(s.key, String(s.value))}
                  disabled={staging[s.key] !== undefined}
                >
                  Stage
                </Button>
              ]
            }))}
          />
        </Card>

        {dirty ? (
          <Card live>
            <CardHeader title="The staged edit" icon="edit" eyebrow="All or nothing" />
            <p className="meta">
              One edit, applied whole or not at all, behind the preview and a typed confirmation.
            </p>
            {settings
              .filter((s) => staging[s.key] !== undefined)
              .map((s) => {
                const out = staging[s.key] !== undefined && staging[s.key] !== "" &&
                  (Number(staging[s.key]) < s.bound[0] || Number(staging[s.key]) > s.bound[1]);
                return (
                  <Field
                    key={s.key}
                    label={<code>{s.key}</code>}
                    hint={`Current ${s.value.toLocaleString("en-IN")} ${s.unit} · bound ${s.bound[0]} – ${s.bound[1]}`}
                    error={out ? `Outside its bound — the whole edit rejects on this setting` : undefined}
                  >
                    <input
                      type="number"
                      value={staging[s.key] ?? ""}
                      onChange={(e) => stage(s.key, e.target.value)}
                    />
                  </Field>
                );
              })}
            <div className="row">
              <Button onClick={openGate} icon="lock">Review the edit</Button>
              <Button variant="quiet" onClick={() => { setStaging({}); setFlash(null); }}>Discard the staging</Button>
            </div>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="The record inside every change" icon="history" eyebrow="economy_settings_edits" />
          <p className="meta">
            A configuration edit records its before-and-after values, the actor, the instant and the
            audit-trail row it commits with — never merely which setting moved.
          </p>
          <div className="list">
            {edits.map((edit) => (
              <article key={edit.id} className="list-row">
                <div>
                  <strong>{edit.auditRef}</strong>
                  <p className="meta">
                    {edit.at} · {edit.actor} ·{" "}
                    {edit.changes
                      .map((c) => `${c.key} ${c.before.toLocaleString("en-IN")} → ${c.after.toLocaleString("en-IN")} ${c.unit}`)
                      .join(" · ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Traffic limits" icon="settings" eyebrow="the shell's own terms" />
          <KeyValueTable label="Traffic limits">
            <KeyValueRow
              as="definition"
              term="Administrative traffic"
              value="Limited separately from learner traffic — a heavy report never eats a learner's headroom, and learner load never throttles an operator"
            />
            <KeyValueRow
              as="definition"
              term="Lists"
              value="Every list pages for real: a page size, a cap of API_PAGE_LIMIT (100 rows), a stable ordering — none cuts results short and presents the remainder as absent"
            />
            <KeyValueRow
              as="definition"
              term="Staff export"
              value="An object streaming through the api — it takes the object-download class like every other"
            />
            <KeyValueRow
              as="definition"
              term="GENERATED_AI_ASSISTANCE"
              value={
                <>
                  off — the owner-only switch over the generated-assistance capability. This console
                  renders its state and offers no control that moves it; while it is off nothing
                  priced can be invoked, so no price is ever charged
                </>
              }
            />
          </KeyValueTable>
        </Card>

        {/* The stakes gate: the read-only preview states its six things, then
            the typed confirmation arms the write. */}
        <Dialog
          open={gateOpen}
          title="Confirm the configuration edit"
          icon="lock"
          onClose={() => setGateOpen(false)}
        >
          <p className="meta">
            Read-only preview — it writes nothing and is recomputed if the configuration changes
            beneath it, never confirmed stale.
          </p>
          <DataTable
            label="Current and proposed values, side by side"
            columns={["Setting", "Current", "Proposed", "Allowed range"]}
            rows={stagedChanges.map((c) => ({
              key: c.setting.key,
              cells: [
                <code>{c.setting.key}</code>,
                `${c.setting.value.toLocaleString("en-IN")} ${c.setting.unit}`,
                <strong className="x-data-table__value">{c.proposed.toLocaleString("en-IN")} {c.setting.unit}</strong>,
                `${c.setting.bound[0].toLocaleString("en-IN")} – ${c.setting.bound[1].toLocaleString("en-IN")}`
              ]
            }))}
          />
          <KeyValueTable label="Effective scope and time">
            <KeyValueRow as="definition" term="Effective scope" value="Governs later awards only — never reprices what a solve already froze" />
            <KeyValueRow as="definition" term="Effective time" value="On save — reaching events created after it, none before" />
            <KeyValueRow as="definition" term="Future cycles" value={touches.cycles ? "touched — applies from the next cycle snapshot" : "not touched"} />
            <KeyValueRow as="definition" term="Future reservations" value={touches.reservations ? "touched — applies only to reservations created afterwards" : "not touched"} />
            <KeyValueRow as="definition" term="Future reward events" value={touches.rewardEvents ? "touched — prices events recorded after the edit" : "not touched"} />
            {actionPricedEdit ? (
              <KeyValueRow
                as="definition"
                term="In default-priced actions"
                value={`≈ ${Math.max(...stagedChanges.filter((c) => c.setting.actionPriced).map((c) => Math.floor(c.proposed / floor))).toLocaleString("en-IN")} actions at the lowest current action price (${floor} Credits)`}
              />
            ) : null}
          </KeyValueTable>
          <ConfirmByTyping
            phrase="apply economy settings"
            value={echo}
            onChange={setEcho}
          >
            {(matched) => (
              <Button onClick={commit} disabled={!matched} icon="check">
                Apply the edit, all or nothing
              </Button>
            )}
          </ConfirmByTyping>
        </Dialog>
      </>
    );
  })();

  return (
    <AdminPage
      kicker="Governance / Economy"
      title="Economy configuration"
      lead="The shell around XP and credit values — the stakes gate before a save, the record inside every change, the traffic limits. Sixteen seeded, bounded numeric settings, edited all-or-nothing behind a read-only preview."
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
