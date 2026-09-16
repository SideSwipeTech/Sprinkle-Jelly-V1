/**
 * AdminFrame states — the granted shell, the refusal surface, AdminPage, and the
 * hub's human-attention strip inside the frame. A small stand-in section list is
 * used (the real ADMIN_NAV stays in src/admin/ — extraction must not import it);
 * the groups mirror the spec's closed seven in the destinations table's order.
 */

import type { ReactNode } from "react";
import { AdminFrame, AdminPage, type AdminNavSection, type AdminNavHome } from "./AdminFrame";

const HUB: AdminNavHome = { label: "Operations hub", to: "/admin", icon: "dashboard" };

const SECTIONS: AdminNavSection[] = [
  {
    title: "Assessments",
    items: [
      { label: "Assessment studio", to: "/admin/mocks", icon: "clipboard" },
      { label: "Tracks", to: "/admin/tracks", icon: "tracks" }
    ]
  },
  {
    title: "Content",
    items: [
      { label: "Courses", to: "/admin/curriculum", icon: "courses" },
      { label: "Coding Challenges", to: "/admin/challenges", icon: "challenges" },
      { label: "Review Queue", to: "/admin/review", icon: "inbox" },
      { label: "Content gaps", to: "/admin/gaps", icon: "search" }
    ]
  },
  {
    title: "People",
    items: [
      { label: "Broadcasts", to: "/admin/broadcasts", icon: "notifications" },
      { label: "Users", to: "/admin/users", icon: "users" }
    ]
  },
  {
    title: "Assistant",
    items: [
      { label: "Identity", to: "/admin/assistant", icon: "message" },
      { label: "Responses", to: "/admin/assistant/responses", icon: "edit" },
      { label: "Nudges", to: "/admin/assistant/nudges", icon: "sparkles" }
    ]
  }
];

const crumb = { group: "Administration", title: "Operations hub" };

/* The hub's human-attention strip — exactly the four named conditions, each a
   panel linking to the page that owns the work. Mirrors admin-attention. */
function AttentionStrip() {
  const cells = [
    { name: "failed_rewards", to: "/admin/rewards", figure: "1", note: "owed, delivery failed" },
    { name: "main_site_boundary_events", to: "/admin/identity", figure: "1", note: "reported, not yet applied" },
    { name: "wedged_deletion_or_erasure", to: "/admin/lifecycle", figure: "0", note: "queue clear" },
    { name: "daily_challenge_schedule_gap", to: "/admin/daily", figure: "22 Aug 2026", note: "nearest day with no published pick" }
  ];
  return (
    <div className="x-admin-attention">
      {cells.map((c) => (
        <a key={c.name} className="x-admin-attention__cell" href={c.to}>
          <code className="x-admin-attention__name">{c.name}</code>
          <strong className="x-admin-attention__figure">{c.figure}</strong>
          <span className="x-admin-attention__note">{c.note}</span>
          <span className="x-admin-attention__go">Open owning page <span aria-hidden="true">→</span></span>
        </a>
      ))}
    </div>
  );
}

/* The shell and the refusal surface both claim the viewport (min-height:100dvh);
   each mounts inside x-adminframe-stage, a bounded host that keeps the grid's
   real proportions at a fixed height (see AdminFrame.css). */
export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "granted",
    label: "Granted — hub row, grouped nav, crumb, health chip, user chip",
    render: () => (
<div className="x-adminframe-stage">
  <AdminFrame sections={SECTIONS} home={HUB} crumb={crumb} health={{ verdict: "degraded", note: "interactive unavailable · batch healthy" }} user={{ name: "Ari" }}>
    <AdminPage
      kicker="Administration"
      title="Operations hub"
      lead="Dependency health, jobs health, and one human-attention strip of four actionable conditions."
    >
      <AttentionStrip />
    </AdminPage>
  </AdminFrame>
</div>
    )
  },
  {
    key: "attention-strip",
    label: "Attention strip — the four named conditions, one unavailable",
    render: () => (
<div className="x-adminframe-stage">
  <AdminFrame sections={SECTIONS} home={HUB} crumb={crumb} user={{ name: "Ari" }}>
    <AdminPage
      kicker="Administration"
      title="Operations hub"
      lead="A panel that cannot load renders unavailable — it never takes the hub down."
    >
      <div className="x-admin-attention">
        <a className="x-admin-attention__cell" href="/admin/rewards">
          <code className="x-admin-attention__name">failed_rewards</code>
          <strong className="x-admin-attention__figure">1</strong>
          <span className="x-admin-attention__note">owed, delivery failed</span>
          <span className="x-admin-attention__go">Open owning page <span aria-hidden="true">→</span></span>
        </a>
        <a className="x-admin-attention__cell" href="/admin/identity">
          <code className="x-admin-attention__name">main_site_boundary_events</code>
          <strong className="x-admin-attention__figure">1</strong>
          <span className="x-admin-attention__note">reported, not yet applied</span>
          <span className="x-admin-attention__go">Open owning page <span aria-hidden="true">→</span></span>
        </a>
        <div className="x-admin-attention__cell" data-state="unavailable">
          <code className="x-admin-attention__name">wedged_deletion_or_erasure</code>
          <span className="x-admin-attention__note">Unavailable — the rest of the hub still serves.</span>
        </div>
        <a className="x-admin-attention__cell" href="/admin/daily">
          <code className="x-admin-attention__name">daily_challenge_schedule_gap</code>
          <span className="x-admin-attention__note">no gap registered</span>
          <span className="x-admin-attention__go">Open owning page <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </AdminPage>
  </AdminFrame>
</div>
    )
  },
  {
    key: "refused",
    label: "Refused — non-staff see the refusal surface",
    render: () => (
<div className="x-adminframe-stage">
  <AdminFrame
    access="refused"
    sections={SECTIONS}
    home={HUB}
    crumb={crumb}
    refusalAction={<a className="x-btn x-btn--secondary" href="/">Return to Labs</a>}
  />
</div>
    )
  },
  {
    key: "page-only",
    label: "AdminPage — kicker / title / lead / actions anatomy",
    render: () => (
<AdminPage
  kicker="People"
  title="Users"
  lead="Find a person, inspect the support picture, then enter a focused action workflow."
  actions={<a className="x-btn x-btn--quiet" href="/admin/users">All users</a>}
>
  <p>Content.</p>
</AdminPage>
    )
  }
];
