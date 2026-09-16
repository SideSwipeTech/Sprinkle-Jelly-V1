import { Card, CardHeader } from "@components/Card";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { List, ListRow } from "../extraction/components/ListRow/ListRow";
import { Link } from "react-router-dom";
import { AdminPage } from "./AdminShell";
import { useStore } from "@state/useStore";

interface AttentionCondition {
  /** The named condition, verbatim — never re-spelled per page. */
  name: string;
  /** The page that owns the work. */
  to: string;
  /** False when the reading behind the row cannot be had — the row renders unavailable, never takes the hub down. */
  available: boolean;
  /** Count or registered reading; null when absent — never a manufactured zero. */
  figure: string | null;
  note: string;
}

/** "attention" when the condition is present, "clear" when the reading says none. */
function conditionTone(c: AttentionCondition): "attention" | "clear" | "unavailable" {
  if (!c.available) return "unavailable";
  return c.figure !== null && c.figure !== "0" ? "attention" : "clear";
}

const CONDITION_STATUS: Record<ReturnType<typeof conditionTone>, string> = {
  attention: "Attention",
  clear: "Clear",
  unavailable: "Unavailable"
};

const HEALTH_ICON: Record<"healthy" | "degraded" | "unknown", IconName> = {
  healthy: "check",
  degraded: "alert",
  unknown: "help"
};

export function AdminHub() {
  const store = useStore();
  // The strip shows exactly the four named conditions — a condition of the
  // platform, never a classification of a learner — each linking into the page
  // that owns the work. Three read jobs health and the published signals; the
  // fourth reads whether its condition has a registered reading at all.
  const attention: AttentionCondition[] = [
    {
      name: "failed_rewards",
      to: "/admin/rewards",
      available: Array.isArray(store.failedRewards),
      figure: Array.isArray(store.failedRewards) ? String(store.failedRewards.filter((r) => !r.retried).length) : null,
      note: "owed, delivery failed"
    },
    {
      name: "main_site_boundary_events",
      to: "/admin/identity",
      available: Array.isArray(store.identityEvents),
      figure: Array.isArray(store.identityEvents) ? String(store.identityEvents.filter((e) => e.state !== "applied").length) : null,
      note: "reported, not yet applied"
    },
    {
      name: "wedged_deletion_or_erasure",
      to: "/admin/lifecycle",
      available: typeof store.lifecycleHold === "boolean",
      figure: typeof store.lifecycleHold === "boolean" ? (store.lifecycleHold ? "1" : "0") : null,
      note: store.lifecycleHold ? "hold check waiting" : "queue clear"
    },
    {
      name: "daily_challenge_schedule_gap",
      to: "/admin/daily",
      available: typeof store.adminDailyGap === "string",
      figure: store.adminDailyGap ? store.adminDailyGap : null,
      note: store.adminDailyGap ? "nearest day with no published pick" : "no gap registered"
    }
  ];
  return (
    <AdminPage
      kicker="Administration"
      title="Operations hub"
      lead="Dependency health, jobs health, and one human-attention strip of four actionable conditions, plus quick links into the studios. A real destination — never a content overview."
    >
      <p className="stale">Yesterday's figures would be labeled a yesterday page. These readings are the fixture for this visit.</p>
      <Card>
        <CardHeader title="Human attention" icon="alert" />
        <p className="meta">Exactly four actionable conditions and no others. Each links into the page that owns the work.</p>
        <List className="admin-conditions">
          {attention.map((c) => {
            const tone = conditionTone(c);
            return (
              <ListRow
                key={c.name}
                to={c.available ? c.to : undefined}
                as={c.available ? undefined : "article"}
                align="center"
                className="admin-condition"
                data-condition={tone}
              >
                <span className="admin-condition__id">
                  <code className="admin-condition__name">{c.name}</code>
                  <span className="admin-condition__note">
                    {c.available ? c.note : "Unavailable — the rest of the hub still serves."}
                  </span>
                </span>
                <span className="admin-condition__read">
                  {c.available && c.figure !== null ? (
                    <strong className="numeral admin-condition__figure">{c.figure}</strong>
                  ) : null}
                  <span className="admin-condition__status">{CONDITION_STATUS[tone]}</span>
                  {c.available ? (
                    <Icon name="arrow-right" size={15} className="admin-condition__go" />
                  ) : null}
                </span>
              </ListRow>
            );
          })}
        </List>
      </Card>
      <Card>
        <CardHeader title="Dependency health" icon="alert" />
        <p className="meta">Published readings only — the hub probes nothing. Interactive unavailable while batch is healthy reads degraded, never down. An unread signal is unknown, never healthy.</p>
        <div className="admin-health">
          <div className="admin-health__cell" data-verdict="healthy">
            <span className="admin-health__top">
              <strong className="admin-health__name">Identity</strong>
              <Icon name={HEALTH_ICON.healthy} size={14} className="admin-health__mark" />
            </span>
            <span className="admin-health__verdict">healthy</span>
          </div>
          <div className="admin-health__cell" data-verdict="degraded">
            <span className="admin-health__top">
              <strong className="admin-health__name">Interactive execution</strong>
              <Icon name={HEALTH_ICON.degraded} size={14} className="admin-health__mark" />
            </span>
            <span className="admin-health__verdict">degraded</span>
            <span className="admin-health__detail">batch healthy</span>
          </div>
          <div className="admin-health__cell" data-verdict="healthy">
            <span className="admin-health__top">
              <strong className="admin-health__name">Batch execution</strong>
              <Icon name={HEALTH_ICON.healthy} size={14} className="admin-health__mark" />
            </span>
            <span className="admin-health__verdict">healthy</span>
          </div>
          <div className="admin-health__cell" data-verdict="unknown">
            <span className="admin-health__top">
              <strong className="admin-health__name">Object store</strong>
              <Icon name={HEALTH_ICON.unknown} size={14} className="admin-health__mark" />
            </span>
            <span className="admin-health__verdict">unknown</span>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Jobs health" icon="grid" />
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Producing area</th><th>Waiting</th><th>Running</th><th>Succeeded</th><th>Failed</th><th>Failure classes</th></tr></thead>
            <tbody>
              <tr><td>Rewards</td><td>6</td><td>1</td><td>183</td><td>2</td><td>validation · dependency · exhausted · unclassified</td></tr>
              <tr><td>Identity delivery</td><td>3</td><td>2</td><td>91</td><td>0</td><td>validation · dependency · exhausted · unclassified</td></tr>
              <tr><td>Data lifecycle</td><td>1</td><td>1</td><td>28</td><td>1</td><td>validation · dependency · exhausted · unclassified</td></tr>
              <tr><td>Broadcast delivery</td><td>4</td><td>1</td><td>12</td><td>1</td><td>validation · dependency · exhausted · unclassified</td></tr>
            </tbody>
          </table>
        </div>
        <p className="meta">An unmatched failure is unclassified, never “other”.</p>
      </Card>
      <Card>
        <CardHeader title="Quick links" icon="arrow-right" />
        <div className="row">
          <Link className="btn btn--secondary" to="/admin/curriculum"><Icon name="courses" size={15} />Courses studio</Link>
          <Link className="btn btn--secondary" to="/admin/challenges"><Icon name="challenges" size={15} />Challenge studio</Link>
          <Link className="btn btn--secondary" to="/admin/review"><Icon name="inbox" size={15} />Review queue</Link>
          <Link className="btn btn--secondary" to="/admin/analytics"><Icon name="grid" size={15} />Reporting</Link>
          <Link className="btn btn--secondary" to="/admin/broadcasts"><Icon name="notifications" size={15} />Broadcasts</Link>
        </div>
      </Card>
    </AdminPage>
  );
}
