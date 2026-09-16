/**
 * IdentityDelivery — Operations › identity (admin pages: "Operations, Identity
 * Delivery").
 *
 * Boundary events the main site reported that the platform has not yet applied —
 * each with kind, arrival, age, retry state and last error, and a per-row retry
 * that runs the verify again. A projection answered inside
 * OPERATIONS_BOUNDARY_CHANGE_READABILITY_DAYS stays listed as applied, pending
 * is never shown as failed, and an empty view is the healthy state and says so.
 * Nothing here edits, fabricates or discards an event.
 *
 * Beside it: the broadcast icon's stored default, which a super administrator
 * sets here and which overrides NOTIFICATIONS_BROADCAST_DEFAULT_ICON from then
 * on.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { retryIdentity } from "@state/store";
import { Icon } from "@icons/Icon";
import { KEYLINE, type IconName } from "@icons/keyline";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Button } from "../../extraction/components/Button/Button";
import { Field } from "../../extraction/components/Field/Field";
import { Select } from "../../extraction/components/Select/Select";
import { Notice } from "../../extraction/components/Notice/Notice";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../assessments/shared";
import {
  BROADCAST_ICON_CHOICES,
  BROADCAST_ICON_DEFAULT,
  BROADCAST_ICON_KEY,
  IDENTITY_DETAIL,
  OPERATIONS_BOUNDARY_CHANGE_READABILITY_DAYS,
  recordAudit
} from "./fixtures";
import "./governance.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

export function IdentityDelivery() {
  const store = useStore();
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const isSuper = store.session.role === "superadmin";

  /* The stored default — set here by a super administrator, overriding the
     figure from then on. Fixture state: this visit's choice. */
  const [storedIcon, setStoredIcon] = useState<string | null>(null);
  const [iconChoice, setIconChoice] = useState<string>("notifications");
  const effectiveIcon = storedIcon ?? BROADCAST_ICON_DEFAULT;

  const pending = store.identityEvents.filter((e) => e.state !== "applied");

  if (preview === "loading") {
    return (
      <AdminPage kicker="Operations" title="Identity delivery">
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        <StudioLoading />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      kicker="Operations"
      title="Identity delivery"
      lead="Boundary events the main site reported that the platform has not yet applied. Rows older than the alert thresholds are already alerting through that channel."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action="the identity-delivery read" /> : null}

      {preview === "loaded" ? (
        <>
          <Card>
            <CardHeader title="Boundary events" icon="user" eyebrow="reported, not yet applied" />
            {pending.length === 0 && store.identityEvents.length === 0 ? (
              <StateBlock state="empty" message="Empty view is the healthy state — no unapplied boundary events." />
            ) : (
              <>
                <div className="list">
                  {store.identityEvents.map((e) => {
                    const detail = IDENTITY_DETAIL[e.id];
                    const lastError = e.error || detail?.lastError || "";
                    return (
                      <article key={e.id} className="list-row">
                        <div>
                          <strong>{e.kind}</strong>
                          <p className="meta">
                            arrived {detail?.arrival ?? "—"} · age {e.age} · verify tries{" "}
                            {detail ? detail.tries : "—"}
                            {e.state === "applied"
                              ? ` · answered inside OPERATIONS_BOUNDARY_CHANGE_READABILITY_DAYS (${OPERATIONS_BOUNDARY_CHANGE_READABILITY_DAYS} days) — stays listed`
                              : ""}
                          </p>
                          {lastError ? <p className="meta">Last error: {lastError}</p> : null}
                        </div>
                        <span className="row">
                          <Chip
                            size="sm"
                            variant={e.state === "applied" ? "quiet" : "default"}
                          >
                            {e.state === "waiting" ? "waiting" : e.state}
                          </Chip>
                          {e.state !== "applied" ? (
                            <Button variant="secondary" size="sm" onClick={() => retryIdentity(e.id)}>
                              Retry verify
                            </Button>
                          ) : null}
                        </span>
                      </article>
                    );
                  })}
                </div>
                <LoadedLine loaded={store.identityEvents.length} total={store.identityEvents.length} />
                {pending.length === 0 ? (
                  <p className="meta">Nothing waiting — every reported event has been applied.</p>
                ) : null}
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Broadcast icon — stored default" icon="notifications" />
            <p className="meta">
              The figure <code>{BROADCAST_ICON_KEY}</code> defaults to <code>{BROADCAST_ICON_DEFAULT}</code>.
              A super administrator's stored default overrides it from then on.
            </p>
            <dl className="account-facts">
              <div>
                <dt>Figure default</dt>
                <dd><code>{BROADCAST_ICON_KEY}</code> → {BROADCAST_ICON_DEFAULT}</dd>
              </div>
              <div>
                <dt>Stored default</dt>
                <dd>{storedIcon ?? "none — the figure default applies"}</dd>
              </div>
              <div>
                <dt>Effective icon</dt>
                <dd>
                  <span className="row">
                    {KEYLINE[effectiveIcon] ? <Icon name={effectiveIcon as IconName} size={16} /> : null}
                    <code>{effectiveIcon}</code>
                  </span>
                </dd>
              </div>
            </dl>
            {isSuper ? (
              <>
                <Field label={`Stored default — overrides ${BROADCAST_ICON_KEY}`}>
                  <Select
                    value={iconChoice}
                    onChange={setIconChoice}
                    options={BROADCAST_ICON_CHOICES.map((n) => ({ value: n, label: n }))}
                  />
                </Field>
                <div className="row">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setStoredIcon(iconChoice);
                      recordAudit(`Broadcast icon stored default set to ${iconChoice} — overrides ${BROADCAST_ICON_KEY}`);
                    }}
                  >
                    Save stored default
                  </Button>
                  {storedIcon ? (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        setStoredIcon(null);
                        recordAudit(`Broadcast icon stored default cleared — ${BROADCAST_ICON_KEY} applies again`);
                      }}
                    >
                      Clear override
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <Notice tone="neutral" compact>
                The stored default is a super-administrator act — the current role reads it, and sets
                nothing.
              </Notice>
            )}
          </Card>
        </>
      ) : null}
    </AdminPage>
  );
}
